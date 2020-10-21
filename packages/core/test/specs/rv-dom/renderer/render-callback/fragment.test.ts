import { RvdDOMElement } from '../../../../../src/shared/types'
import { renderTypeSwitch } from '../../../../../src/rv-dom/renderer/utils'
import {
  arrayRenderCallback,
  fragmentRenderCallback
} from '../../../../../src/rv-dom/renderer/render-callback/fragment'

import * as ELEMENTS from '../../../../__mocks__/elements'
import { renderRvdElement } from '../../../../../src/rv-dom/renderer/element'
import {
  renderElement,
  replaceElementForElement,
  replaceFragmentForElement
} from '../../../../../src/rv-dom/renderer/render-callback/element'
import {
  elementRenderingContextTestUtilsFactory,
  domDivEmpty,
  domDivClassName
} from '../../../../utils'

interface TestFragmentRenderCallbackOptions {
  type?: 'fragment' | 'array'
  isStatic?: boolean
  mode?: 'render' | 'replace' | 'replace-many'
}

type TestFragmentRenderCallback = (options?: TestFragmentRenderCallbackOptions) => () => void

const [initUtils] = elementRenderingContextTestUtilsFactory()

const onStart = initUtils(true)
const each = initUtils()

/* eslint-disable max-len */
describe('Fragment render callback', () => {
  let [
    { parentElement, createdChildren, sub, childIndex },
    { renderChild, renderChildren }
  ] = onStart()

  beforeEach(
    () =>
      ([
        { parentElement, createdChildren, sub, childIndex },
        { renderChild, renderChildren }
      ] = each())
  )

  const testFragmentRenderCallback: TestFragmentRenderCallback = options => () => {
    const { type = 'fragment', isStatic = true, mode = 'render' } = options || {}
    renderChildren('0', '1')
    if (mode === 'replace') {
      renderChild('2')
    } else if (mode === 'replace-many') {
      createdChildren.createEmptyFragment('2')
      const childFragment = createdChildren.getFragment('2')
      renderChildren('2.0', '2.1', '2.2', '2.3')
      childFragment.fragmentChildIndexes = childFragment.fragmentChildIndexes.concat(
        '2.0',
        '2.1',
        '2.2',
        '2.3'
      )
      childFragment.fragmentChildrenLength += 4
    }
    renderChildren('3', '4')

    const getCallback = (type: 'fragment' | 'array') =>
      type === 'fragment'
        ? {
            callback: fragmentRenderCallback,
            callbackArg: ELEMENTS.KEYED_FRAGMENT
          }
        : {
            callback: arrayRenderCallback,
            callbackArg: ELEMENTS.KEYED_CHILDREN_ARRAY
          }

    const renderCallback = jest.fn((child: RvdDOMElement, index) => {
      const elementNode = renderRvdElement(child, {})
      const fragment = createdChildren.getFragment(childIndex)
      fragment.fragmentChildIndexes = fragment.fragmentChildIndexes.concat(index)
      ++fragment.fragmentChildrenLength

      const renderFn = renderElement(elementNode, index, parentElement, createdChildren, sub, child)
      renderTypeSwitch(
        replaceElementForElement(elementNode, index, parentElement, createdChildren, sub, child),
        replaceFragmentForElement(renderFn, index, parentElement, createdChildren),
        renderFn
      )(index, createdChildren)
    })

    const renderedChildren = [1, 2, 3].map(number => domDivClassName(`class-${number}`))

    if (mode !== 'render') {
      for (let i = 2; i <= 4; i++) {
        expect(parentElement.childNodes[i]).toEqual(domDivEmpty())
      }

      if (mode === 'replace') {
        expect(parentElement.childNodes.length).toBe(5)
      } else {
        expect(parentElement.childNodes[5]).toEqual(domDivEmpty())
        expect(parentElement.childNodes.length).toBe(8)
      }
    }

    const { callback, callbackArg } = getCallback(type)

    callback(
      childIndex,
      parentElement,
      createdChildren,
      sub,
      {},
      isStatic,
      renderCallback
    )(callbackArg)

    expect(parentElement.childNodes[2]).toEqual(renderedChildren[0])
    expect(parentElement.childNodes[3]).toEqual(renderedChildren[1])
    expect(parentElement.childNodes[4]).toEqual(renderedChildren[2])
    expect(parentElement.childNodes.length).toBe(7)
    expect(renderCallback).toBeCalledTimes(3)
  }

  test(
    'staticFragmentRenderCallback should render fragment children on given (sub) positions',
    testFragmentRenderCallback()
  )

  test(
    'staticArrayRenderCallback should transform static array to static fragment, and render it`s children on given (sub) positions',
    testFragmentRenderCallback({ type: 'array' })
  )

  test(
    'fragmentRenderCallback should render fragment children on given (sub) positions, when there`s no child(ren) on fragment position',
    testFragmentRenderCallback({ isStatic: false })
  )

  test(
    'arrayRenderCallback should transform array to fragment, and render it`s children on given (sub) positions, when there`s no child(ren) on array position',
    testFragmentRenderCallback({ type: 'array', isStatic: false })
  )

  test(
    'fragmentRenderCallback should replace element on given position for fragment children, when there`s single Element/Text rendered',
    testFragmentRenderCallback({ isStatic: false, mode: 'replace' })
  )

  test(
    'arrayRenderCallback should transform array to fragment, and replace element on given position for fragment children, when there`s single Element/Text rendered',
    testFragmentRenderCallback({ type: 'array', isStatic: false, mode: 'replace' })
  )

  test(
    'fragmentRenderCallback should replace multiple elements (from fragment) on given positions for fragment children, when there`s more than on Element/Text rendered',
    testFragmentRenderCallback({ isStatic: false, mode: 'replace-many' })
  )

  test(
    'arrayRenderCallback should transform array to fragment, and replace multiple elements (from fragment) on given positions for fragment children, when there`s more than on Element/Text rendered',
    testFragmentRenderCallback({ type: 'array', isStatic: false, mode: 'replace-many' })
  )
})
