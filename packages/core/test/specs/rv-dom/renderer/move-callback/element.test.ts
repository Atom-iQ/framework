import { elementMoveCallback } from '../../../../../src/reactive-virtual-dom/renderer/move-callback/element'
import { elementRenderingContextTestUtilsFactory } from '../../../../utils'
import { RvdCreatedFragment } from '../../../../../src/shared/types'
import { reloadKeys } from '../../../../../src/reactive-virtual-dom/renderer/fragment-children'
import {
  createEmptyFragment,
  setCreatedChild
} from '../../../../../src/reactive-virtual-dom/renderer/children-manager'

const [initUtils] = elementRenderingContextTestUtilsFactory()

const onStart = initUtils(true)
const each = initUtils()

/* eslint-disable max-len */
describe('Element move', () => {
  let [{ parentElement, createdChildren }, { renderChild }] = onStart()

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;[{ parentElement, createdChildren }, { renderChild }] = each('')
    createdChildren.append = false
  })

  const mockKeyedFragment = (...indexes: string[]) => (fragment: RvdCreatedFragment) =>
    [...indexes].forEach(childIndex => {
      renderChild(childIndex)
      fragment.indexes = fragment.indexes.concat(childIndex)
      fragment.size += 1
      const child = createdChildren.children[childIndex]
      const key = `key-${childIndex.substring(2)}`
      ;(child.element as HTMLElement).className = `class-${childIndex.substring(2)}`
      setCreatedChild(createdChildren, childIndex, {
        ...child,
        key
      })
      fragment.keys = {
        ...fragment.keys,
        [key]: childIndex
      }
    })

  const getHtmlElementFromNode = (i: number) => {
    return parentElement.childNodes[i] as HTMLElement
  }

  const checkChildrenClasses = (classes: string[]) => {
    classes.forEach((className, i) => {
      expect(getHtmlElementFromNode(i).className).toBe(className)
    })
  }

  test('elementMoveCallback should move element to selected position, when there isn`t anything rendered there', () => {
    createEmptyFragment(createdChildren, '0')
    const createdFragment = createdChildren.fragmentChildren['0']

    // Render fragment children and add keys
    mockKeyedFragment('0.0', '0.1', '0.2', '0.3', '0.5')(createdFragment)
    createdFragment.append = false
    // Check current children, node to move is second child
    checkChildrenClasses(['class-0', 'class-1', 'class-2', 'class-3', 'class-5'])
    expect(parentElement.childNodes.length).toBe(5)

    // Start moving from '0.1' (key-1) to '0.4' (no-element)
    reloadKeys(createdChildren, createdFragment)
    createdFragment.keys = {}
    const key = 'key-1'
    const childIndex = '0.4'
    const currentKeyedElement =
      createdChildren.removedNodes[createdFragment.oldKeys[key]] ||
      createdChildren.children[createdFragment.oldKeys[key]]
    elementMoveCallback(
      currentKeyedElement,
      createdFragment,
      childIndex,
      parentElement,
      createdChildren
    )
    checkChildrenClasses(['class-0', 'class-2', 'class-3', 'class-1', 'class-5'])
    expect(parentElement.childNodes.length).toBe(5)
  })

  test('elementMoveCallback should remove fragment children, and then move element to previously Fragment`s position, when there is many Elements/Texts rendered there', () => {
    createEmptyFragment(createdChildren, '0')
    const createdFragment = createdChildren.fragmentChildren['0']

    // Render fragment children and add keys
    mockKeyedFragment('0.0', '0.1', '0.2', '0.3', '0.5')(createdFragment)
    createdFragment.append = false
    // Create and render nested fragment on position '0.4'
    createEmptyFragment(createdChildren, '0.4')
    const childFragment = createdChildren.fragmentChildren['0.4']
    childFragment.key = 'key-4'
    mockKeyedFragment('0.4.0', '0.4.1', '0.4.2', '0.4.3')(childFragment)
    childFragment.append = false

    // Check current children, node to move is second child
    checkChildrenClasses([
      'class-0',
      'class-1',
      'class-2',
      'class-3',
      'class-4.0',
      'class-4.1',
      'class-4.2',
      'class-4.3',
      'class-5'
    ])
    expect(parentElement.childNodes.length).toBe(9)

    // Start moving from '0.1' (key-1) to '0.4' - Fragment (key-4)
    reloadKeys(createdChildren, createdFragment)
    createdFragment.keys = {}
    const key = 'key-1'
    const childIndex = '0.4'
    const currentKeyedElement =
      createdChildren.removedNodes[createdFragment.oldKeys[key]] ||
      createdChildren.children[createdFragment.oldKeys[key]]
    elementMoveCallback(
      currentKeyedElement,
      createdFragment,
      childIndex,
      parentElement,
      createdChildren
    )
    checkChildrenClasses(['class-0', 'class-2', 'class-3', 'class-1', 'class-5'])
    expect(parentElement.childNodes.length).toBe(5)
  })

  test('elementMoveCallback should "switch" (replace) element on selected position, when there is one Element there', () => {
    createEmptyFragment(createdChildren, '0')
    const createdFragment = createdChildren.fragmentChildren['0']

    // Render fragment children and add keys
    mockKeyedFragment('0.0', '0.1', '0.2', '0.3', '0.4', '0.5')(createdFragment)
    createdFragment.append = false

    // Check current children, node to move is second child
    checkChildrenClasses(['class-0', 'class-1', 'class-2', 'class-3', 'class-4', 'class-5'])
    expect(parentElement.childNodes.length).toBe(6)

    // Start moving from '0.1' (key-1) to '0.4' (key-4)
    reloadKeys(createdChildren, createdFragment)
    createdFragment.keys = {}
    const key = 'key-1'
    const childIndex = '0.4'
    const currentKeyedElement =
      createdChildren.removedNodes[createdFragment.oldKeys[key]] ||
      createdChildren.children[createdFragment.oldKeys[key]]
    elementMoveCallback(
      currentKeyedElement,
      createdFragment,
      childIndex,
      parentElement,
      createdChildren
    )
    checkChildrenClasses(['class-0', 'class-2', 'class-3', 'class-1', 'class-5'])
    expect(parentElement.childNodes.length).toBe(5)

    // Additionaly move element that was on '0.4' position to '0.1'
    const newKey = 'key-4'
    const newChildIndex = '0.1'
    const newCurrentKeyedElement =
      createdChildren.removedNodes[createdFragment.oldKeys[newKey]] ||
      createdChildren.children[createdFragment.oldKeys[newKey]]
    elementMoveCallback(
      newCurrentKeyedElement,
      createdFragment,
      newChildIndex,
      parentElement,
      createdChildren
    )

    checkChildrenClasses(['class-0', 'class-4', 'class-2', 'class-3', 'class-1', 'class-5'])
    expect(parentElement.childNodes.length).toBe(6)
  })
})
