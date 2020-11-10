import {
  replaceElementForElement,
  renderElement
} from '../../../../../src/reactive-virtual-dom/renderer/render-callback/element'
import * as ELEMENTS from '../../../../__mocks__/elements'
import { renderRvdElement } from '../../../../../src/reactive-virtual-dom/renderer/element'
import {
  domDivClassNameProps,
  domDivEmpty,
  elementRenderingContextTestUtilsFactory,
  RvdTestDivElement
} from '../../../../utils'
import {
  createEmptyFragment,
  turnOffAppendMode
} from '../../../../../src/reactive-virtual-dom/renderer/children-manager'

const [initUtils] = elementRenderingContextTestUtilsFactory()

const onStart = initUtils(true)
const each = initUtils()

/* eslint-disable max-len */
describe('Element render callback', () => {
  let [
    { parentElement, createdChildren, sub, childIndex },
    { renderChild, renderChildren }
  ] = onStart()

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;[{ parentElement, createdChildren, sub, childIndex }, { renderChild, renderChildren }] = each()
    turnOffAppendMode(createdChildren)
  })

  test('replaceElementForElement, should replace child on given position by new child, and "switch" Subscriptions', done => {
    renderChildren('0', '1', '2', '3')
    expect(parentElement.childNodes[2]).toEqual(domDivEmpty())

    const subSpy = jest.spyOn(sub, 'add')
    const rvdElement = ELEMENTS.CLASSNAME_AND_PROPS
    const renderCallback = (element, elementSubscription) => {
      replaceElementForElement(
        createdChildren.children[childIndex],
        element,
        elementSubscription,
        childIndex,
        parentElement,
        createdChildren,
        sub,
        rvdElement
      )

      // Props are connected after calling render callback
      setTimeout(() => {
        const expected = domDivClassNameProps(ELEMENTS.CLASSNAME_AND_PROPS as RvdTestDivElement)
        expect(parentElement.childNodes[2]).toEqual(expected)
        expect(parentElement.childNodes[2]).toBe(element)
        expect(subSpy).toBeCalledWith(elementSubscription)
        done()
      })
    }
    renderRvdElement(rvdElement, {}, renderCallback)
  })

  test('replaceElementForElement, should replace child on given position by new child, and not add new Element subscription, when it has not got it', done => {
    renderChildren('0', '1', '2', '3')
    expect(parentElement.childNodes[2]).toEqual(domDivEmpty())

    const subSpy = jest.spyOn(sub, 'add')
    const rvdElement = ELEMENTS.CLASSNAME_AND_PROPS
    const renderCallback = (element, elementSubscription) => {
      elementSubscription.unsubscribe()
      replaceElementForElement(
        createdChildren.children[childIndex],
        element,
        elementSubscription,
        childIndex,
        parentElement,
        createdChildren,
        sub,
        rvdElement
      )

      // Props are connected after calling render callback
      setTimeout(() => {
        const expected = domDivClassNameProps(ELEMENTS.CLASSNAME_AND_PROPS as RvdTestDivElement)
        expect(parentElement.childNodes[2]).toEqual(expected)
        expect(parentElement.childNodes[2]).toBe(element)
        done()
      })
    }
    renderRvdElement(rvdElement, {}, renderCallback)
  })

  test('renderElement, should render new element child on given position, when it`s empty, and add Subscription to parent', done => {
    renderChildren('0', '1', '3')
    expect(parentElement.childNodes[2]).toEqual(domDivEmpty())
    expect(parentElement.childNodes.length).toBe(3)

    const subSpy = jest.spyOn(sub, 'add')
    const rvdElement = ELEMENTS.CLASSNAME_AND_PROPS
    const renderCallback = (element, elementSubscription) => {
      renderElement(
        element,
        elementSubscription,
        childIndex,
        parentElement,
        createdChildren,
        sub,
        rvdElement
      )()

      // Props are connected after calling render callback
      setTimeout(() => {
        const expected = domDivClassNameProps(ELEMENTS.CLASSNAME_AND_PROPS as RvdTestDivElement)
        expect(parentElement.childNodes[2]).toEqual(expected)
        expect(parentElement.childNodes[2]).toBe(element)
        expect(parentElement.childNodes.length).toBe(4)
        expect(subSpy).toBeCalledWith(elementSubscription)
        done()
      })
    }
    renderRvdElement(rvdElement, {}, renderCallback)
  })

  test('renderElement, should render new element child on given position, when it`s empty', done => {
    renderChildren('0', '1', '3')
    expect(parentElement.childNodes[2]).toEqual(domDivEmpty())
    expect(parentElement.childNodes.length).toBe(3)

    const subSpy = jest.spyOn(sub, 'add')

    const rvdElement = ELEMENTS.CLASSNAME_AND_PROPS

    const renderCallback = (element, elementSubscription) => {
      elementSubscription.unsubscribe()
      renderElement(
        element,
        elementSubscription,
        childIndex,
        parentElement,
        createdChildren,
        sub,
        rvdElement
      )()

      // Props are connected after calling render callback
      setTimeout(() => {
        const expected = domDivClassNameProps(ELEMENTS.CLASSNAME_AND_PROPS as RvdTestDivElement)
        // expect(parentElement.childNodes[2]).toEqual(expected)
        expect(parentElement.childNodes[2]).toBe(element)
        expect(parentElement.childNodes.length).toBe(4)
        done()
      })
    }
    renderRvdElement(rvdElement, {}, renderCallback)
  })
})
