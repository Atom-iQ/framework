import { Subscription } from '@atom-iq/rx'

import type { RvdElementNode, RvdKeyedListNode } from 'types'
import { renderDomChild } from '../dom-renderer'
import { RvdComponentNode, RvdFragmentNode, RvdListNode } from 'types'
import { RvdNodeFlags } from 'shared/flags'
import { removeExistingGroup } from 'rvd/renderer/utils'

function moveElement<T extends Object | string | number = unknown>(
  elementToMove: RvdElementNode,
  rvdList: RvdKeyedListNode<T>,
  childIndex: number
): void {
  elementToMove.index = childIndex
  renderDomChild(elementToMove, rvdList)
  rvdList.rvd.splice(childIndex, 0, elementToMove)
}

export function switchElement<T extends Object | string | number = unknown>(
  existingChild: RvdElementNode,
  elementToMove: RvdElementNode,
  rvdList: RvdKeyedListNode<T>,
  childIndex: number
): void {
  rvdList.rvd.splice(elementToMove.index, 1)
  elementToMove.index = childIndex
  rvdList.dom.replaceChild(elementToMove.dom, existingChild.dom)
  rvdList.rvd[childIndex] = elementToMove
}

export function switchToElement<T extends Object | string | number = unknown>(
  elementToMove: RvdElementNode,
  rvdList: RvdKeyedListNode<T>,
  childIndex: number
): void {
  rvdList.rvd.splice(elementToMove.index, 1)
  elementToMove.index = childIndex
  renderDomChild(elementToMove, rvdList)
  rvdList.rvd[childIndex] = elementToMove
}

export function switchToGroup<T extends Object | string | number = unknown>(
  groupToMove: RvdListNode,
  rvdList: RvdKeyedListNode<T>,
  childIndex: number
): void {
  rvdList.rvd.splice(groupToMove.index, 1)
  moveGroup(groupToMove, rvdList, childIndex)
  rvdList.rvd[childIndex] = groupToMove
}

function moveGroup<T extends Object | string | number = unknown>(
  groupToMove: RvdFragmentNode | RvdComponentNode | RvdListNode,
  rvdList: RvdKeyedListNode<T>,
  childIndex: number
): void {
  groupToMove.index = childIndex

  for (let i = 0; i < groupToMove.rvd.length; ++i) {
    const fragmentChild = groupToMove.rvd[i]

    if (fragmentChild) {
      if (RvdNodeFlags.ElementOrText & fragmentChild.flag) {
        renderDomChild(fragmentChild as RvdElementNode, rvdList)
      } else {
        moveGroup(fragmentChild as RvdFragmentNode, groupToMove as RvdKeyedListNode<unknown>, i)
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
  existingNode: RvdListNode,
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
    rvdList.rvd.splice(toIndex, 0, existingNode)
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
  if (dataArray.length < rvdList.rvd.length) {
    for (let i = dataArray.length; i < rvdList.rvd.length; ++i) {
      const existingNode = rvdList.rvd[i]
      if (existingNode) {
        if (RvdNodeFlags.ElementOrText & existingNode.flag) {
          rvdList.dom.removeChild(existingNode.dom)
        } else {
          removeExistingGroup(existingNode as RvdFragmentNode, rvdList)
        }
        toUnsubscribe.push(existingNode.sub)
        delete keyedIndexes[existingNode.key]
      }
    }
    rvdList.rvd.length = dataArray.length
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
