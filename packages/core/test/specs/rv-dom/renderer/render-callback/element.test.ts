import {
  replaceElementForElement,
  replaceFragmentForElement,
  renderElement
} from '../../../../../src/rv-dom/renderer/render-callback/element'
import * as ELEMENTS from '../../../../__mocks__/elements'
import { renderRvdElement } from '../../../../../src/rv-dom/renderer/element'
import {
  domDivClassNameProps,
  domDivEmpty,
  elementRenderingContextTestUtilsFactory,
  RvdTestDivElement
} from '../../../../utils'

const [initUtils] = elementRenderingContextTestUtilsFactory()

const onStart = initUtils(true)
const each = initUtils()

/* eslint-disable max-len */
describe('Element render callback', () => {
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

  test('replaceElementForElement, should replace child on given position by new child, and "switch" Subscriptions', () => {
    renderChildren('0', '1', '2', '3')
    expect(parentElement.childNodes[2]).toEqual(domDivEmpty())

    const subSpy = jest.spyOn(sub, 'add')
    const rvdElement = ELEMENTS.CLASSNAME_AND_PROPS
    const newElementNode = renderRvdElement(rvdElement, {})
    replaceElementForElement(
      newElementNode,
      childIndex,
      parentElement,
      createdChildren,
      sub,
      rvdElement
    )(createdChildren.get(childIndex))

    const expected = domDivClassNameProps(ELEMENTS.CLASSNAME_AND_PROPS as RvdTestDivElement)
    expect(parentElement.childNodes[2]).toEqual(expected)
    expect(parentElement.childNodes[2]).toBe(newElementNode.element)
    expect(subSpy).toBeCalledWith(newElementNode.elementSubscription)
  })

  test('replaceElementForElement, should replace child on given position by new child, and not add new Element subscription, when it has not got it', () => {
    renderChildren('0', '1', '2', '3')
    expect(parentElement.childNodes[2]).toEqual(domDivEmpty())

    const subSpy = jest.spyOn(sub, 'add')
    const rvdElement = ELEMENTS.CLASSNAME_AND_PROPS
    const newElementNode = renderRvdElement(rvdElement, {})
    newElementNode.elementSubscription.unsubscribe()
    delete newElementNode.elementSubscription
    replaceElementForElement(
      newElementNode,
      childIndex,
      parentElement,
      createdChildren,
      sub,
      rvdElement
    )(createdChildren.get(childIndex))

    const expected = domDivClassNameProps(ELEMENTS.CLASSNAME_AND_PROPS as RvdTestDivElement)
    expect(parentElement.childNodes[2]).toEqual(expected)
    expect(parentElement.childNodes[2]).toBe(newElementNode.element)
    expect(subSpy).not.toBeCalledWith(newElementNode.elementSubscription)
  })

  test('replaceFragmentForElement, should replace many children from fragment on given position for new element child, and "switch" Subscriptions', () => {
    renderChildren('0', '1')
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
    renderChild('3')
    renderChild('4')

    for (let i = 2; i <= 5; i++) {
      expect(parentElement.childNodes[i]).toEqual(domDivEmpty())
    }
    expect(parentElement.childNodes.length).toBe(8)

    const subSpy = jest.spyOn(sub, 'add')
    const rvdElement = ELEMENTS.CLASSNAME_AND_PROPS
    const newElementNode = renderRvdElement(rvdElement, {})
    replaceFragmentForElement(
      renderElement(newElementNode, childIndex, parentElement, createdChildren, sub, rvdElement),
      childIndex,
      parentElement,
      createdChildren
    )(createdChildren.getFragment(childIndex))

    const expected = domDivClassNameProps(ELEMENTS.CLASSNAME_AND_PROPS as RvdTestDivElement)
    expect(parentElement.childNodes[2]).toEqual(expected)
    expect(parentElement.childNodes[2]).toBe(newElementNode.element)
    expect(parentElement.childNodes.length).toBe(5)
    expect(subSpy).toBeCalledWith(newElementNode.elementSubscription)
  })

  test('renderElement, should render new element child on given position, when it`s empty, and add Subscription to parent', () => {
    renderChildren('0', '1', '3')
    expect(parentElement.childNodes[2]).toEqual(domDivEmpty())
    expect(parentElement.childNodes.length).toBe(3)

    const subSpy = jest.spyOn(sub, 'add')
    const rvdElement = ELEMENTS.CLASSNAME_AND_PROPS
    const newElementNode = renderRvdElement(rvdElement, {})
    renderElement(newElementNode, childIndex, parentElement, createdChildren, sub, rvdElement)()

    const expected = domDivClassNameProps(ELEMENTS.CLASSNAME_AND_PROPS as RvdTestDivElement)
    expect(parentElement.childNodes[2]).toEqual(expected)
    expect(parentElement.childNodes[2]).toBe(newElementNode.element)
    expect(parentElement.childNodes.length).toBe(4)
    expect(subSpy).toBeCalledWith(newElementNode.elementSubscription)
  })

  test('renderElement, should render new element child on given position, when it`s empty, and add not Subscription to parent, when it has not subscription', () => {
    renderChildren('0', '1', '3')
    expect(parentElement.childNodes[2]).toEqual(domDivEmpty())
    expect(parentElement.childNodes.length).toBe(3)

    const subSpy = jest.spyOn(sub, 'add')

    const rvdElement = ELEMENTS.CLASSNAME_AND_PROPS

    const newElementNode = renderRvdElement(rvdElement, {})
    newElementNode.elementSubscription.unsubscribe()
    delete newElementNode.elementSubscription
    renderElement(newElementNode, childIndex, parentElement, createdChildren, sub, rvdElement)()

    const expected = domDivClassNameProps(ELEMENTS.CLASSNAME_AND_PROPS as RvdTestDivElement)
    expect(parentElement.childNodes[2]).toEqual(expected)
    expect(parentElement.childNodes[2]).toBe(newElementNode.element)
    expect(parentElement.childNodes.length).toBe(4)
    expect(subSpy).not.toBeCalledWith(newElementNode.elementSubscription)
  })
})
