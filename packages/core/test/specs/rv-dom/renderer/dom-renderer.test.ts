import {
  createChildrenManager,
  createEmptyFragment,
  setCreatedChild
} from '../../../../src/rv-dom/renderer/utils/children-manager'
import { CreatedChildrenManager, RvdDOMElement } from '../../../../src/shared/types'
import { createDomElement } from '../../../../src/rv-dom/renderer/utils'
import {
  removeExistingFragment,
  renderChildInIndexPosition
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

  const renderChild = (index: string, fragmentIndex?: string) =>
    renderChildInIndexPosition(
      newChild => {
        setCreatedChild(createdChildren, newChild.index, newChild)
        if (fragmentIndex) {
          if (!createdChildren.fragmentChildren[fragmentIndex]) {
            createEmptyFragment(createdChildren, fragmentIndex)
          }
          const fragment = createdChildren.fragmentChildren[fragmentIndex]
          fragment.fragmentChildIndexes.push(index)
          fragment.fragmentChildrenLength++
        }
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
    createEmptyFragment(createdChildren, '1')
    createEmptyFragment(createdChildren, '1.0')
    createdChildren.fragmentChildren['1'].fragmentChildIndexes.push('1.0')
    ++createdChildren.fragmentChildren['1'].fragmentChildrenLength
    createdChildren.fragmentChildren['1.0'].fragmentChildrenLength = 5
    renderChild('1.0.3', '1.0')

    renderChildInIndexPosition(
      newChild => {
        expect(newChild).toEqual({ index: childIndex, element: childElement })
        expect(parentElement.lastChild).toBe(childElement)
        console.log(createdChildren)
        done()
      },
      childElement,
      childIndex,
      parentElement,
      createdChildren
    )
  })

  test('renderChildInIndexPosition should render Element/Text as a first child, if more than one child is rendered, but current element has lowest index', done => {
    createEmptyFragment(createdChildren, '3')
    createEmptyFragment(createdChildren, '3.0')
    createdChildren.fragmentChildren['3'].fragmentChildIndexes.push('3.0')
    ++createdChildren.fragmentChildren['3'].fragmentChildrenLength
    createdChildren.fragmentChildren['3.0'].fragmentChildrenLength = 3
    renderChild('3.0.1', '3.0')
    createEmptyFragment(createdChildren, '4')
    createEmptyFragment(createdChildren, '4.2')
    createdChildren.fragmentChildren['4'].fragmentChildrenLength = 3
    createdChildren.fragmentChildren['4'].fragmentChildIndexes.push('4.2')
    createdChildren.fragmentChildren['4.2'].fragmentChildrenLength = 5
    renderChild('4.2.5', '4.2')
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
    renderChild('0.0', '0')
    renderChild('1.5', '1')
    createdChildren.fragmentChildren['1'].fragmentChildrenLength = 6
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
    renderChild('3.0', '3')
    renderChild('3.1', '3')
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

  test('removeExistingFragment should remove non-keyed fragment from DOM and rvDOM', () => {
    const createdChildren: CreatedChildrenManager = createChildrenManager()
    const parentElement = createDomElement('div', false)
    const sub = new Subscription()

    createEmptyFragment(createdChildren, '0')
    const fragment = createdChildren.fragmentChildren['0']

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
    expect(createdChildren.fragmentChildren['0']).toBeUndefined()
  })

  test('removeExistingFragment should remove keyed fragment from DOM and rvDOM', () => {
    const createdChildren: CreatedChildrenManager = createChildrenManager()
    const parentElement = createDomElement('div', false)
    const sub = new Subscription()

    createEmptyFragment(createdChildren, '0')
    const fragment = createdChildren.fragmentChildren['0']

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
    expect(createdChildren.fragmentChildren['0']).toBeUndefined()
  })
})
