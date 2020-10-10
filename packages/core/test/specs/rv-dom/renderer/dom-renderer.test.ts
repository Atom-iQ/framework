import createChildrenManager from '../../../../src/rv-dom/renderer/utils/children-manager'
import { CreatedChildrenManager } from '../../../../src/shared/types'
import { createDomElement } from '../../../../src/rv-dom/renderer/utils'
import {
  removeChildFromIndexPosition,
  renderChildInIndexPosition,
  replaceChildOnIndexPosition
} from '../../../../src/rv-dom/renderer/dom-renderer'

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
      childIndex,
      parentElement,
      createdChildren
    )
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
      childIndex,
      parentElement,
      createdChildren
    )
  })
})
