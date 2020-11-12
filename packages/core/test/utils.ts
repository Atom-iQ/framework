import {
  RvdChildrenManager,
  HTMLAttributes,
  RvdHTMLElementNode,
  CreatedFragmentChild
} from '../src/shared/types'
import { renderChildInIndexPosition } from '../src/reactive-virtual-dom/renderer/dom-renderer'
import { createDomElement } from '../src/reactive-virtual-dom/renderer/utils'
import {
  createChildrenManager,
  setCreatedChild
} from '../src/reactive-virtual-dom/renderer/children-manager'
import { Subscription } from 'rxjs'

type RenderChildFn = (index: string, parentFragment?: CreatedFragmentChild) => void
type RenderChildrenFn = (...args: (string | CreatedFragmentChild)[]) => void
type RenderChildFactory = (
  parentElement: Element,
  createdChildren: RvdChildrenManager
) => RenderChildFn
type RenderChildrenFactory = (renderChild: RenderChildFn) => RenderChildrenFn

interface ERCTestUtilsContextMock {
  parentElement?: Element
  createdChildren?: RvdChildrenManager
  sub?: Subscription
  childIndex?: string
}

interface ERCTestUtilsRenderFunctionsMock {
  renderChild?: RenderChildFn
  renderChildren?: RenderChildrenFn
}

type ERCTestUtilsContextManager = [ERCTestUtilsContextMock, ERCTestUtilsRenderFunctionsMock]

interface ERCTestUtilsInitPartial {
  (childIndex?: string): ERCTestUtilsContextManager
}

interface ERCTestUtilsInit {
  (isDeclaration?: boolean): ERCTestUtilsInitPartial
}

interface ERCTestUtilsFactories {
  renderChildFactory?: RenderChildFactory
  renderChildrenFactory?: RenderChildrenFactory
}

type ERCTestUtilsBase = [ERCTestUtilsInit, ERCTestUtilsFactories]

type ERCTestUtilsFactory = () => ERCTestUtilsBase
/**
 * ERCTU - Element Rendering Context Test Utils
 * Common utils for generating mock rvDOM and DOM for testing, as well
 * as the mock of the real Element Rendering Context functions
 */
export const elementRenderingContextTestUtilsFactory: ERCTestUtilsFactory = () => {
  const renderChildFactory = (parentElement, createdChildren) => (index, parentFragment?) => {
    const element = createDomElement('div', false)
    renderChildInIndexPosition(element, index, parentElement, createdChildren)

    setCreatedChild(
      createdChildren,
      index,
      {
        index,
        element,
        type: 'div'
      },
      parentFragment
    )
  }

  const renderChildrenFactory = renderChild => (...args) => {
    const parentFragment = typeof args[args.length - 1] === 'string' ? undefined : args.pop()
    args.forEach(i => renderChild(i, parentFragment))
  }

  const init: ERCTestUtilsInit = (isDeclaration = false) => (childIndex = '2') => {
    const undefinedOnInit = isDeclaration && undefined
    const createdChildren = undefinedOnInit || createChildrenManager()
    const parentElement = undefinedOnInit || createDomElement('div', false)
    const sub = undefinedOnInit || new Subscription()
    const renderChild = undefinedOnInit || renderChildFactory(parentElement, createdChildren)
    const renderChildren = undefinedOnInit || renderChildrenFactory(renderChild)

    return [
      { parentElement, createdChildren, sub, childIndex },
      { renderChild, renderChildren }
    ]
  }

  return [init, { renderChildFactory, renderChildrenFactory }]
}

export const domDivEmpty = (): HTMLDivElement => createDomElement('div', false) as HTMLDivElement

export type RvdTestDivElement = RvdHTMLElementNode<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export const domDivClassName = (className: string): HTMLDivElement => {
  const el = createDomElement('div', false) as HTMLDivElement
  el.className = className
  return el
}

export const domDivClassNameProps = (rvdElement: RvdTestDivElement): HTMLDivElement => {
  const divElement = createDomElement('div', false) as HTMLDivElement
  divElement.className = rvdElement.className as string
  divElement.id = rvdElement.props.id as string
  divElement.setAttribute('title', rvdElement.props.title as string)
  return divElement
}
