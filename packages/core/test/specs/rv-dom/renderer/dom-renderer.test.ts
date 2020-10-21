import createChildrenManager from '../../../../src/rv-dom/renderer/utils/children-manager'
import { CreatedChildrenManager, RvdDOMElement } from '../../../../src/shared/types'
import { createDomElement } from '../../../../src/rv-dom/renderer/utils'
import {
  removeChildFromIndexPosition,
  removeExistingFragment,
  renderChildInIndexPosition,
  replaceChildOnIndexPosition
} from '../../../../src/rv-dom/renderer/dom-renderer'
import { Subscription } from 'rxjs'
import { renderRvdElement } from '../../../../src/rv-dom/renderer/element'
import { renderElement } from '../../../../src/rv-dom/renderer/render-callback/element'
import { renderRvdFragment } from '../../../../src/rv-dom/renderer/fragment'
import { KEYED_FRAGMENT, NON_KEYED_FRAGMENT_MULTIPLE_CHILDREN } from '../../../__mocks__/elements'

/* eslint-disable max-len */
describe('Dom renderer', () => {
  let createdChildren: CreatedChildrenManager
  let parentElement: Element
  let childElement: Element
  const childIndex = '2'

  const renderChild = index =>
    renderChildInIndexPosition(
      newChild => {
        createdChildren.add(newChild.index, newChild)
      },
      createDomElement('div', false),
      index,
      parentElement,
      createdChildren
    )

  beforeEach(() => {
    createdChildren = createChildrenManager()
    parentElement = createDomElement('div', false)
    childElement = createDomElement('div', false)
    childElement.className = 'child'
  })

  test('renderChildInIndexPosition should render Element/Text as a first child, if other children are not rendered', done => {
    renderChildInIndexPosition(
      newChild => {
        expect(newChild).toEqual({ index: childIndex, element: childElement })
        expect(parentElement.firstChild).toBe(childElement)
        done()
      },
      childElement,
      childIndex,
      parentElement,
      createdChildren
    )
  })

  test('renderChildInIndexPosition should render Element/Text as a first child, if one child is rendered, but has higher index', done => {
    renderChild('3')
    renderChildInIndexPosition(
      newChild => {
        expect(newChild).toEqual({ index: childIndex, element: childElement })
        expect(parentElement.firstChild).toBe(childElement)
        done()
      },
      childElement,
      childIndex,
      parentElement,
      createdChildren
    )
  })

  test('renderChildInIndexPosition should render Element/Text as a last child, if one child is rendered and has lower index', done => {
    renderChild('1.0.3')
    renderChildInIndexPosition(
      newChild => {
        expect(newChild).toEqual({ index: childIndex, element: childElement })
        expect(parentElement.lastChild).toBe(childElement)
        done()
      },
      childElement,
      childIndex,
      parentElement,
      createdChildren
    )
  })

  test('renderChildInIndexPosition should render Element/Text as a first child, if more than one child is rendered, but current element has lowest index', done => {
    renderChild('3')
    renderChild('3.0.1')
    renderChild('4')
    renderChild('4.2.5')
    renderChildInIndexPosition(
      newChild => {
        expect(newChild).toEqual({ index: childIndex, element: childElement })
        expect(parentElement.firstChild).toBe(childElement)
        done()
      },
      childElement,
      childIndex,
      parentElement,
      createdChildren
    )
  })

  test('renderChildInIndexPosition should render Element/Text as a last child, if more than one child is rendered, and current element has highest index', done => {
    renderChild('0')
    renderChild('0.0.1')
    renderChild('1')
    renderChild('1.5')
    renderChildInIndexPosition(
      newChild => {
        expect(newChild).toEqual({ index: childIndex, element: childElement })
        expect(parentElement.lastChild).toBe(childElement)
        done()
      },
      childElement,
      childIndex,
      parentElement,
      createdChildren
    )
  })

  test('renderChildInIndexPosition should render Element/Text in correct order, when there are more than ona children rendered and current element is somewhere in the middle', done => {
    renderChild('0')
    renderChild('1')
    renderChild('3.0')
    renderChild('3.1')
    renderChildInIndexPosition(
      newChild => {
        expect(newChild).toEqual({ index: childIndex, element: childElement })
        expect(parentElement.children[2]).toBe(childElement)
        done()
      },
      childElement,
      childIndex,
      parentElement,
      createdChildren
    )
  })

  test('replaceChildOnIndexPosition should replace current element on given index, for new child', done => {
    renderChild('0')
    renderChild('1')
    renderChild('2')
    expect(parentElement.lastChild).not.toBe(childElement)
    replaceChildOnIndexPosition(
      newChild => {
        expect(newChild).toEqual({ index: childIndex, element: childElement })
        expect(parentElement.lastChild).toBe(childElement)
        done()
      },
      childElement,
      parentElement,
      createdChildren.get(childIndex)
    )
  })

  test('replaceChildOnIndexPosition should throw error when DOM operation failed', () => {
    renderChild('0')
    renderChild('1')
    renderChild('2')
    expect(parentElement.lastChild).not.toBe(childElement)
    const successCallback = jest.fn()
    const op = jest.fn(() =>
      replaceChildOnIndexPosition(
        successCallback,
        childElement,
        createDomElement('div', false),
        createdChildren.get(childIndex)
      )
    )
    expect(op).toThrowError()
    expect(successCallback).not.toBeCalled()
  })

  test('removeChildFromIndexPosition should remove element from given index position', done => {
    renderChild('0')
    renderChild('1')
    renderChild('2')
    expect(parentElement.children[2]).toBeDefined()
    removeChildFromIndexPosition(
      () => {
        expect(parentElement.children[2]).toBeUndefined()
        done()
      },
      parentElement,
      createdChildren.get(childIndex).element
    )
  })

  test('removeChildFromIndexPosition should throw error when DOM operation failed', () => {
    renderChild('0')
    renderChild('1')
    renderChild('2')
    expect(parentElement.children[2]).toBeDefined()
    const successCallback = jest.fn()
    const op = jest.fn(() =>
      removeChildFromIndexPosition(successCallback, parentElement, createDomElement('div', false))
    )
    expect(op).toThrowError()
    expect(successCallback).not.toBeCalled()
  })

  test('removeExistingFragment should remove non-keyed fragment from DOM and rvDOM', () => {
    const createdChildren: CreatedChildrenManager = createChildrenManager()
    const parentElement = createDomElement('div', false)
    const sub = new Subscription()

    createdChildren.createEmptyFragment('0')
    const fragment = createdChildren.getFragment('0')

    const renderChild = (child: RvdDOMElement, index) => {
      const elementNode = renderRvdElement(child, {})
      fragment.fragmentChildIndexes = fragment.fragmentChildIndexes.concat(index)
      ++fragment.fragmentChildrenLength
      renderElement(elementNode, index, parentElement, createdChildren, sub, child)()
    }

    renderRvdFragment(
      '0',
      parentElement,
      createdChildren,
      sub,
      {},
      renderChild
    )(NON_KEYED_FRAGMENT_MULTIPLE_CHILDREN)

    const createElementWithClassName = className => {
      const el = createDomElement('div', false) as HTMLElement
      el.className = className
      return el
    }

    const renderedChildren = [
      createElementWithClassName('class-1'),
      createElementWithClassName('class-2')
    ]

    expect(parentElement.firstChild).toEqual(renderedChildren[0])
    expect(parentElement.lastChild).toEqual(renderedChildren[1])
    expect(fragment.fragmentChildrenLength).toBe(2)

    removeExistingFragment({}, '0', parentElement, createdChildren)(fragment)

    expect(parentElement.firstChild).toEqual(null)
    expect(parentElement.lastChild).toEqual(null)
    expect(createdChildren.getFragment('0')).toBeUndefined()
  })

  test('removeExistingFragment should remove keyed fragment from DOM and rvDOM', () => {
    const createdChildren: CreatedChildrenManager = createChildrenManager()
    const parentElement = createDomElement('div', false)
    const sub = new Subscription()

    createdChildren.createEmptyFragment('0')
    const fragment = createdChildren.getFragment('0')

    const renderChild = (child: RvdDOMElement, index) => {
      const elementNode = renderRvdElement(child, {})
      fragment.fragmentChildIndexes = fragment.fragmentChildIndexes.concat(index)
      ++fragment.fragmentChildrenLength
      renderElement(elementNode, index, parentElement, createdChildren, sub, child)()
    }

    renderRvdFragment('0', parentElement, createdChildren, sub, {}, renderChild)(KEYED_FRAGMENT)

    const createElementWithClassName = className => {
      const el = createDomElement('div', false) as HTMLElement
      el.className = className
      return el
    }

    const renderedChildren = [
      createElementWithClassName('class-1'),
      createElementWithClassName('class-2'),
      createElementWithClassName('class-3')
    ]

    expect(parentElement.firstChild).toEqual(renderedChildren[0])
    expect(parentElement.children[1]).toEqual(renderedChildren[1])
    expect(parentElement.lastChild).toEqual(renderedChildren[2])
    expect(fragment.fragmentChildrenLength).toBe(3)

    removeExistingFragment(fragment.oldKeyElementMap, '0', parentElement, createdChildren)(fragment)

    expect(parentElement.firstChild).toEqual(null)
    expect(parentElement.lastChild).toEqual(null)
    expect(createdChildren.getFragment('0')).toBeUndefined()
  })
})
