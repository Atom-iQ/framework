import {
  CreatedChildrenManager,
  HTMLAttributes,
  RvdDOMElement,
  RvdHTMLElement,
  RxSub
} from '../src/shared/types'
import { renderChildInIndexPosition } from '../src/rv-dom/renderer/dom-renderer'
import { createDomElement } from '../src/rv-dom/renderer/utils'
import createChildrenManager from '../src/rv-dom/renderer/utils/children-manager'
import { Subscription } from 'rxjs'
import * as ELEMENTS from './__mocks__/elements'

type RenderChildFn = (index: string) => void
type RenderChildrenFn = (...indexes: string[]) => void
type RenderChildFactory = (
  parentElement: Element,
  createdChildren: CreatedChildrenManager
) => RenderChildFn
type RenderChildrenFactory = (renderChild: RenderChildFn) => RenderChildrenFn

interface ERCTestUtilsContextMock {
  parentElement?: Element
  createdChildren?: CreatedChildrenManager
  sub?: RxSub
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
  const renderChildFactory = (parentElement, createdChildren) => index =>
    renderChildInIndexPosition(
      newChild => {
        if (createdChildren.has(newChild.index)) {
          createdChildren.replace(newChild.index, newChild)
        } else {
          createdChildren.add(newChild.index, newChild)
        }
      },
      createDomElement('div', false),
      index,
      parentElement,
      createdChildren
    )

  const renderChildrenFactory = renderChild => (...indexes) => {
    indexes.forEach(renderChild)
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

export type RvdTestDivElement = RvdHTMLElement<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

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
