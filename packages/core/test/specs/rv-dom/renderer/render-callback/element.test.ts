import {
  replaceElementForElement,
  replaceFragmentForElement,
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
        element,
        elementSubscription,
        childIndex,
        parentElement,
        createdChildren,
        sub,
        rvdElement
      )(createdChildren.children[childIndex])

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
        element,
        elementSubscription,
        childIndex,
        parentElement,
        createdChildren,
        sub,
        rvdElement
      )(createdChildren.children[childIndex])

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

  test('replaceFragmentForElement, should replace many children from fragment on given position for new element child, and "switch" Subscriptions', done => {
    renderChildren('0', '1')
    createEmptyFragment(createdChildren, '2')
    const childFragment = createdChildren.fragmentChildren['2']
    renderChildren('2.0', '2.1', '2.2', '2.3')
    childFragment.fragmentChildIndexes = childFragment.fragmentChildIndexes.concat(
      '2.0',
      '2.1',
      '2.2',
      '2.3'
    )
    childFragment.fragmentChildrenLength += 4
    renderChild('3')
    renderChild('4')

    for (let i = 2; i <= 5; i++) {
      expect(parentElement.childNodes[i]).toEqual(domDivEmpty())
    }
    expect(parentElement.childNodes.length).toBe(8)

    const subSpy = jest.spyOn(sub, 'add')
    const rvdElement = ELEMENTS.CLASSNAME_AND_PROPS
    const renderCallback = (element, elementSubscription) => {
      replaceFragmentForElement(
        renderElement(
          element,
          elementSubscription,
          childIndex,
          parentElement,
          createdChildren,
          sub,
          rvdElement
        ),
        childIndex,
        parentElement,
        createdChildren
      )(createdChildren.fragmentChildren[childIndex])

      // Props are connected after calling render callback
      setTimeout(() => {
        const expected = domDivClassNameProps(ELEMENTS.CLASSNAME_AND_PROPS as RvdTestDivElement)
        expect(parentElement.childNodes[2]).toEqual(expected)
        expect(parentElement.childNodes[2]).toBe(element)
        expect(parentElement.childNodes.length).toBe(5)
        expect(subSpy).toBeCalledWith(elementSubscription)
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
