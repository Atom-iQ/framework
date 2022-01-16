import { Subscription } from '@atom-iq/rx'

import type { RvdElementNode, RvdGroupNode, RvdListNode, RvdKeyedListNode, RvdParent } from 'types'
import { RvdNodeFlags } from 'shared/flags'

import { renderDomChild } from '../dom-renderer'
import { removeExistingGroup } from '../utils'

function moveElement<T extends Object | string | number = unknown>(
  elementToMove: RvdElementNode,
  rvdList: RvdKeyedListNode<T>,
  index: number
): void {
  elementToMove.index = index
  renderDomChild(elementToMove, rvdList)
  rvdList.children.splice(index, 0, elementToMove)
}

export function switchElement<T extends Object | string | number = unknown>(
  existingChild: RvdElementNode,
  elementToMove: RvdElementNode,
  rvdList: RvdKeyedListNode<T>,
  index: number
): void {
  rvdList.children.splice(elementToMove.index, 1)
  elementToMove.index = index
  rvdList.dom.replaceChild(elementToMove.dom, existingChild.dom)
  rvdList.children[index] = elementToMove
}

export function switchToElement<T extends Object | string | number = unknown>(
  elementToMove: RvdElementNode,
  rvdList: RvdKeyedListNode<T>,
  index: number
): void {
  rvdList.children.splice(elementToMove.index, 1)
  elementToMove.index = index
  renderDomChild(elementToMove, rvdList)
  rvdList.children[index] = elementToMove
}

export function switchToGroup<T extends Object | string | number = unknown>(
  groupToMove: RvdListNode,
  rvdList: RvdKeyedListNode<T>,
  index: number
): void {
  rvdList.children.splice(groupToMove.index, 1)
  moveGroup(groupToMove, rvdList, index)
  rvdList.children[index] = groupToMove
}

function moveGroup(
  groupToMove: RvdParent<RvdGroupNode>,
  parentGroup: RvdParent<RvdGroupNode>,
  index: number
): void {
  groupToMove.index = index

  for (let i = 0; i < groupToMove.children.length; ++i) {
    const fragmentChild = groupToMove.children[i]

    if (fragmentChild) {
      if (RvdNodeFlags.DomNode & fragmentChild.flag) {
        renderDomChild(fragmentChild as RvdElementNode, parentGroup)
      } else {
        moveGroup(fragmentChild as RvdParent<RvdGroupNode>, groupToMove, i)
      }
    }
  }
}

export function moveOrRemoveElement<T extends Object | string | number = unknown>(
  existingNode: RvdElementNode,
  rvdList: RvdKeyedListNode<T>,
  newData: T[],
  keyProp: string,
  keyedIndexes: Record<string | number, number>,
  toUnsubscribe: Subscription[],
  currentIndex: number,
  elementReplaced = false
): void {
  const toIndex = findNextIndex(newData, existingNode.key, keyProp, currentIndex)

  if (toIndex >= 0) {
    moveElement(existingNode, rvdList, toIndex)
    keyedIndexes[existingNode.key] = toIndex
  } else {
    // Remove
    if (!elementReplaced) rvdList.dom.removeChild(existingNode.dom)
    toUnsubscribe.push(existingNode.sub)
    delete keyedIndexes[existingNode.key]
  }
}

export function moveOrRemoveGroup<T extends Object | string | number = unknown>(
  existingNode: RvdParent<RvdGroupNode>,
  rvdList: RvdKeyedListNode<T>,
  newData: T[],
  keyProp: string,
  keyedIndexes: Record<string | number, number>,
  toUnsubscribe: Subscription[],
  currentIndex: number
): void {
  const toIndex = findNextIndex(newData, existingNode.key, keyProp, currentIndex)

  if (toIndex >= 0) {
    moveGroup(existingNode, rvdList, toIndex)
    rvdList.children.splice(toIndex, 0, existingNode)
    keyedIndexes[existingNode.key] = toIndex
  } else {
    // Remove
    removeExistingGroup(existingNode, rvdList)
    toUnsubscribe.push(existingNode.sub)
    delete keyedIndexes[existingNode.key]
  }
}

export function removeExcessiveChildren<T extends Object | string | number = unknown>(
  rvdList: RvdKeyedListNode<T>,
  dataArray: T[],
  keyedIndexes: Record<string | number, number>,
  toUnsubscribe: Subscription[]
): void {
  if (dataArray.length < rvdList.children.length) {
    for (let i = dataArray.length; i < rvdList.children.length; ++i) {
      const existingNode = rvdList.children[i]
      if (existingNode) {
        if (RvdNodeFlags.DomNode & existingNode.flag) {
          rvdList.dom.removeChild(existingNode.dom)
        } else {
          removeExistingGroup(existingNode as RvdParent<RvdGroupNode>, rvdList)
        }
        toUnsubscribe.push(existingNode.sub)
        delete keyedIndexes[existingNode.key]
      }
    }
    rvdList.children.length = dataArray.length
  }
}

export function findNextIndex<T extends Object | string | number = unknown>(
  arr: T[],
  key: string | number,
  keyProp: string,
  currentIndex: number
): number {
  for (let i = currentIndex; i < arr.length; ++i) {
    if (arr[i][keyProp] === key) return i
  }
  return -1
}
