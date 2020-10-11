import { elementMoveCallback } from '../../../../../src/rv-dom/renderer/move-callback/element'
import { elementRenderingContextTestUtilsFactory } from '../../../../utils'
import { CreatedFragmentChild } from '../../../../../src/shared/types'
import { loadPreviousKeyedElements } from '../../../../../src/rv-dom/renderer/fragment-children'

const [initUtils] = elementRenderingContextTestUtilsFactory()

const onStart = initUtils(true)
const each = initUtils()

/* eslint-disable max-len */
describe('Element move', () => {
  let [
    { parentElement, createdChildren, sub, childIndex },
    { renderChild, renderChildren }
  ] = onStart()

  beforeEach(
    () =>
      ([
        { parentElement, createdChildren, sub, childIndex },
        { renderChild, renderChildren }
      ] = each(''))
  )

  const mockKeyedFragment = (...indexes: string[]) => (fragment: CreatedFragmentChild) =>
    [...indexes].forEach(childIndex => {
      renderChild(childIndex)
      fragment.fragmentChildIndexes = fragment.fragmentChildIndexes.concat(childIndex)
      fragment.fragmentChildrenLength += 1
      const child = createdChildren.get(childIndex)
      const key = `key-${childIndex.substring(2)}`
      ;(child.element as HTMLElement).className = `class-${childIndex.substring(2)}`
      createdChildren.replace(childIndex, {
        ...child,
        key
      })
      fragment.fragmentChildKeys = {
        ...fragment.fragmentChildKeys,
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
    createdChildren.createEmptyFragment('0')
    const createdFragment = createdChildren.getFragment('0')

    // Render fragment children and add keys
    mockKeyedFragment('0.0', '0.1', '0.2', '0.3', '0.5')(createdFragment)

    // Check current children, node to move is second child
    checkChildrenClasses(['class-0', 'class-1', 'class-2', 'class-3', 'class-5'])
    expect(parentElement.childNodes.length).toBe(5)

    // Start moving from '0.1' (key-1) to '0.4' (no-element)
    const oldKeyElementMap = loadPreviousKeyedElements(createdChildren, createdFragment)
    createdFragment.fragmentChildKeys = {}
    const key = 'key-1'
    const childIndex = '0.4'
    const currentKeyedElement = oldKeyElementMap[key]
    elementMoveCallback(
      currentKeyedElement,
      oldKeyElementMap,
      createdFragment,
      childIndex,
      parentElement,
      createdChildren
    )
    checkChildrenClasses(['class-0', 'class-2', 'class-3', 'class-1', 'class-5'])
    expect(parentElement.childNodes.length).toBe(5)
  })

  test('elementMoveCallback should remove fragment children, and then move element to previously Fragment`s position, when there is many Elements/Texts rendered there', () => {
    createdChildren.createEmptyFragment('0')
    const createdFragment = createdChildren.getFragment('0')

    // Render fragment children and add keys
    mockKeyedFragment('0.0', '0.1', '0.2', '0.3', '0.5')(createdFragment)
    // Create and render nested fragment on position '0.4'
    createdChildren.createEmptyFragment('0.4')
    const childFragment = createdChildren.getFragment('0.4')
    childFragment.key = 'key-4'
    mockKeyedFragment('0.4.0', '0.4.1', '0.4.2', '0.4.3')(childFragment)

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
    const oldKeyElementMap = loadPreviousKeyedElements(createdChildren, createdFragment)
    createdFragment.fragmentChildKeys = {}
    const key = 'key-1'
    const childIndex = '0.4'
    const currentKeyedElement = oldKeyElementMap[key]
    elementMoveCallback(
      currentKeyedElement,
      oldKeyElementMap,
      createdFragment,
      childIndex,
      parentElement,
      createdChildren
    )
    checkChildrenClasses(['class-0', 'class-2', 'class-3', 'class-1', 'class-5'])
    expect(parentElement.childNodes.length).toBe(5)
  })

  test('elementMoveCallback should "switch" (replace) element on selected position, when there is one Element there', () => {
    createdChildren.createEmptyFragment('0')
    const createdFragment = createdChildren.getFragment('0')

    // Render fragment children and add keys
    mockKeyedFragment('0.0', '0.1', '0.2', '0.3', '0.4', '0.5')(createdFragment)

    // Check current children, node to move is second child
    checkChildrenClasses(['class-0', 'class-1', 'class-2', 'class-3', 'class-4', 'class-5'])
    expect(parentElement.childNodes.length).toBe(6)

    // Start moving from '0.1' (key-1) to '0.4' (key-4)
    const oldKeyElementMap = loadPreviousKeyedElements(createdChildren, createdFragment)
    createdFragment.fragmentChildKeys = {}
    const key = 'key-1'
    const childIndex = '0.4'
    const currentKeyedElement = oldKeyElementMap[key]
    elementMoveCallback(
      currentKeyedElement,
      oldKeyElementMap,
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
    const newCurrentKeyedElement = oldKeyElementMap[newKey]
    elementMoveCallback(
      newCurrentKeyedElement,
      oldKeyElementMap,
      createdFragment,
      newChildIndex,
      parentElement,
      createdChildren
    )

    checkChildrenClasses(['class-0', 'class-4', 'class-2', 'class-3', 'class-1', 'class-5'])
    expect(parentElement.childNodes.length).toBe(6)
  })
})
