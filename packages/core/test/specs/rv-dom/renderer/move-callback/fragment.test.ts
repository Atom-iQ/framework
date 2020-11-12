import { fragmentMoveCallback } from '../../../../../src/reactive-virtual-dom/renderer/move-callback/fragment'
import { elementRenderingContextTestUtilsFactory } from '../../../../utils'
import { CreatedFragmentChild } from '../../../../../src/shared/types'
import { loadPreviousKeyedElements } from '../../../../../src/reactive-virtual-dom/renderer/fragment-children'
import { elementMoveCallback } from '../../../../../src/reactive-virtual-dom/renderer/move-callback/element'
import { Subscription } from 'rxjs'
import {
  createEmptyFragment,
  setCreatedChild
} from '../../../../../src/reactive-virtual-dom/renderer/children-manager'

const [initUtils] = elementRenderingContextTestUtilsFactory()

const onStart = initUtils(true)
const each = initUtils()

/* eslint-disable max-len */
describe('Fragment move callback', () => {
  let [
    { parentElement, createdChildren, sub, childIndex },
    { renderChild, renderChildren }
  ] = onStart()

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;[{ parentElement, createdChildren, sub, childIndex }, { renderChild, renderChildren }] = each(
      ''
    )
    createdChildren.isInAppendMode = false
  })

  const mockKeyedFragment = (...indexes: string[]) => (fragment: CreatedFragmentChild) =>
    [...indexes].forEach(childIndex => {
      renderChild(childIndex, fragment)
      fragment.fragmentChildrenLength += 1
      const child = createdChildren.children[childIndex]
      const key = `key-${childIndex.substring(2)}`
      ;(child.element as HTMLElement).className = `class-${childIndex.substring(2)}`
      setCreatedChild(createdChildren, childIndex, {
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

  test('fragmentMoveCallback should move fragment children to selected position, when there isn`t anything rendered there', () => {
    createEmptyFragment(createdChildren, '0')
    const createdFragment = createdChildren.fragmentChildren['0']

    // Render fragment children and add keys
    mockKeyedFragment('0.0', '0.2', '0.3', '0.5')(createdFragment)
    createdFragment.isInFragmentAppendMode = false

    // Create and render nested fragment on position '0.1'
    createEmptyFragment(createdChildren, '0.1')
    const childFragment = createdChildren.fragmentChildren['0.1']
    childFragment.key = 'key-1'
    createdFragment.fragmentChildKeys = {
      ...createdFragment.fragmentChildKeys,
      [childFragment.key]: '0.1'
    }
    mockKeyedFragment('0.1.0', '0.1.1', '0.1.2', '0.1.3')(childFragment)
    childFragment.isInFragmentAppendMode = false
    // Check current children, nodes to move are from second to fifth
    checkChildrenClasses([
      'class-0',
      'class-1.0',
      'class-1.1',
      'class-1.2',
      'class-1.3',
      'class-2',
      'class-3',
      'class-5'
    ])
    expect(parentElement.childNodes.length).toBe(8)

    // Start moving fragment from '0.1.x' (key-1) to '0.4.x' (no-element)
    const oldKeyElementMap = loadPreviousKeyedElements(createdChildren, createdFragment)
    createdFragment.fragmentChildKeys = {}
    const key = 'key-1'
    const childIndex = '0.4'
    const currentKeyedElement = oldKeyElementMap[key]

    fragmentMoveCallback(
      currentKeyedElement,
      oldKeyElementMap,
      createdFragment,
      childIndex,
      parentElement,
      createdChildren
    )
    checkChildrenClasses([
      'class-0',
      'class-2',
      'class-3',
      'class-1.0',
      'class-1.1',
      'class-1.2',
      'class-1.3',
      'class-5'
    ])
    expect(parentElement.childNodes.length).toBe(8)
  })

  test('fragmentMoveCallback should remove previous fragment children (from DOM, we have saved them in keyed elements), and then move fragment children to previously Fragment`s position, when there is many Elements/Texts rendered there', () => {
    createEmptyFragment(createdChildren, '0')
    const createdFragment = createdChildren.fragmentChildren['0']

    // Render fragment children and add keys
    mockKeyedFragment('0.0', '0.2', '0.3', '0.5')(createdFragment)
    createdFragment.isInFragmentAppendMode = false
    // Create and render nested fragment on position '0.1'
    createEmptyFragment(createdChildren, '0.1')
    const childFragment = createdChildren.fragmentChildren['0.1']
    childFragment.key = 'key-1'
    createdFragment.fragmentChildKeys = {
      ...createdFragment.fragmentChildKeys,
      [childFragment.key]: '0.1'
    }
    mockKeyedFragment('0.1.0', '0.1.1', '0.1.2')(childFragment)
    childFragment.isInFragmentAppendMode = false
    // Create and render nested fragment on position '0.4'
    createEmptyFragment(createdChildren, '0.4')
    const toReplaceFragment = createdChildren.fragmentChildren['0.4']
    toReplaceFragment.key = 'key-4'
    createdFragment.fragmentChildKeys = {
      ...createdFragment.fragmentChildKeys,
      [toReplaceFragment.key]: '0.4'
    }
    mockKeyedFragment('0.4.0', '0.4.1', '0.4.2', '0.4.3')(toReplaceFragment)
    toReplaceFragment.isInFragmentAppendMode = false

    // Check current children, node to move is second child
    checkChildrenClasses([
      'class-0',
      'class-1.0',
      'class-1.1',
      'class-1.2',
      'class-2',
      'class-3',
      'class-4.0',
      'class-4.1',
      'class-4.2',
      'class-4.3',
      'class-5'
    ])
    expect(parentElement.childNodes.length).toBe(11)

    // Start moving from '0.1' (key-1) to '0.4' - Fragment (key-4)
    const oldKeyElementMap = loadPreviousKeyedElements(createdChildren, createdFragment)
    createdFragment.fragmentChildKeys = {}
    const key = 'key-1'
    const childIndex = '0.4'
    const currentKeyedElement = oldKeyElementMap[key]
    fragmentMoveCallback(
      currentKeyedElement,
      oldKeyElementMap,
      createdFragment,
      childIndex,
      parentElement,
      createdChildren
    )
    // Check current children, node to move is second child
    checkChildrenClasses([
      'class-0',
      'class-2',
      'class-3',
      'class-1.0',
      'class-1.1',
      'class-1.2',
      'class-5'
    ])
    expect(parentElement.childNodes.length).toBe(7)

    const newKey = 'key-4'
    const newChildIndex = '0.1'
    const keyedElement = oldKeyElementMap[newKey]
    fragmentMoveCallback(
      keyedElement,
      oldKeyElementMap,
      createdFragment,
      newChildIndex,
      parentElement,
      createdChildren
    )
    // Check current children, node to move is second child
    checkChildrenClasses([
      'class-0',
      'class-4.0',
      'class-4.1',
      'class-4.2',
      'class-4.3',
      'class-2',
      'class-3',
      'class-1.0',
      'class-1.1',
      'class-1.2',
      'class-5'
    ])
    expect(parentElement.childNodes.length).toBe(11)
  })

  test('fragmentMoveCallback should remove element on selected position and render fragment elements, when there is one Element there', () => {
    createEmptyFragment(createdChildren, '0')
    const createdFragment = createdChildren.fragmentChildren['0']

    // Render fragment children and add keys
    mockKeyedFragment('0.0', '0.2', '0.3', '0.4', '0.5')(createdFragment)
    createdFragment.isInFragmentAppendMode = false
    // Create and render nested fragment on position '0.1'
    createEmptyFragment(createdChildren, '0.1')
    const childFragment = createdChildren.fragmentChildren['0.1']
    childFragment.key = 'key-1'
    createdFragment.fragmentChildKeys = {
      ...createdFragment.fragmentChildKeys,
      [childFragment.key]: '0.1'
    }
    mockKeyedFragment('0.1.0', '0.1.1', '0.1.2', '0.1.3')(childFragment)
    childFragment.isInFragmentAppendMode = false
    // Check current children, nodes to move are from second to fifth
    checkChildrenClasses([
      'class-0',
      'class-1.0',
      'class-1.1',
      'class-1.2',
      'class-1.3',
      'class-2',
      'class-3',
      'class-4',
      'class-5'
    ])
    expect(parentElement.childNodes.length).toBe(9)

    // Start moving from '0.1' (key-1) to '0.4' (key-4)
    const oldKeyElementMap = loadPreviousKeyedElements(createdChildren, createdFragment)
    createdFragment.fragmentChildKeys = {}
    const key = 'key-1'
    const childIndex = '0.4'
    const currentKeyedElement = oldKeyElementMap[key]
    fragmentMoveCallback(
      currentKeyedElement,
      oldKeyElementMap,
      createdFragment,
      childIndex,
      parentElement,
      createdChildren
    )
    checkChildrenClasses([
      'class-0',
      'class-2',
      'class-3',
      'class-1.0',
      'class-1.1',
      'class-1.2',
      'class-1.3',
      'class-5'
    ])
    expect(parentElement.childNodes.length).toBe(8)

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

    checkChildrenClasses([
      'class-0',
      'class-4',
      'class-2',
      'class-3',
      'class-1.0',
      'class-1.1',
      'class-1.2',
      'class-1.3',
      'class-5'
    ])
    expect(parentElement.childNodes.length).toBe(9)
  })

  test('fragmentMoveCallback should remove element on selected position and unsubscribe if it has not key, and render fragment elements, when there is one Element there', () => {
    createEmptyFragment(createdChildren, '0')
    const createdFragment = createdChildren.fragmentChildren['0']

    // Render fragment children and add keys
    mockKeyedFragment('0.0', '0.2', '0.3', '0.4', '0.5')(createdFragment)
    createdFragment.isInFragmentAppendMode = false
    // Create and render nested fragment on position '0.1'
    createEmptyFragment(createdChildren, '0.1')
    const childFragment = createdChildren.fragmentChildren['0.1']
    childFragment.key = 'key-1'
    createdFragment.fragmentChildKeys = {
      ...createdFragment.fragmentChildKeys,
      [childFragment.key]: '0.1'
    }
    mockKeyedFragment('0.1.0', '0.1.1', '0.1.2', '0.1.3')(childFragment)
    childFragment.isInFragmentAppendMode = false
    // Check current children, nodes to move are from second to fifth
    checkChildrenClasses([
      'class-0',
      'class-1.0',
      'class-1.1',
      'class-1.2',
      'class-1.3',
      'class-2',
      'class-3',
      'class-4',
      'class-5'
    ])
    expect(parentElement.childNodes.length).toBe(9)

    const toReplace = createdChildren.children['0.4']
    toReplace.key = null

    const toReplaceSub = new Subscription()
    toReplace.subscription = toReplaceSub
    const unsubSpy = jest.spyOn(toReplaceSub, 'unsubscribe')

    // Start moving from '0.1' (key-1) to '0.4' (key-4)
    const oldKeyElementMap = loadPreviousKeyedElements(createdChildren, createdFragment)
    createdFragment.fragmentChildKeys = {}
    const key = 'key-1'
    const childIndex = '0.4'
    const currentKeyedElement = oldKeyElementMap[key]
    fragmentMoveCallback(
      currentKeyedElement,
      oldKeyElementMap,
      createdFragment,
      childIndex,
      parentElement,
      createdChildren
    )
    checkChildrenClasses([
      'class-0',
      'class-2',
      'class-3',
      'class-1.0',
      'class-1.1',
      'class-1.2',
      'class-1.3',
      'class-5'
    ])
    expect(parentElement.childNodes.length).toBe(8)
    expect(unsubSpy).toBeCalled()
  })
})
