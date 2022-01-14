import { Subscription } from '@atom-iq/rx'

import type { RvdElementNode, RvdKeyedListNode } from 'types'
import { renderDomChild } from '../dom-renderer'
import { RvdComponentNode, RvdFragmentNode, RvdListNode } from 'types'
import { RvdNodeFlags } from 'shared/flags'
import { removeExistingGroup } from 'rvd/renderer/utils'

function moveElement(
  elementToMove: RvdElementNode,
  rvdList: RvdKeyedListNode<unknown>,
  childIndex: number
): void {
  elementToMove.index = childIndex
  renderDomChild(elementToMove, rvdList)
  rvdList.rvd.splice(childIndex, 0, elementToMove)
}

export function switchElement(
  existingChild: RvdElementNode,
  elementToMove: RvdElementNode,
  rvdList: RvdKeyedListNode<unknown>,
  childIndex: number
): void {
  rvdList.rvd.splice(elementToMove.index, 1)
  elementToMove.index = childIndex
  rvdList.dom.replaceChild(elementToMove.dom, existingChild.dom)
  rvdList.rvd[childIndex] = elementToMove
}

export function switchToElement(
  elementToMove: RvdElementNode,
  rvdList: RvdKeyedListNode<unknown>,
  childIndex: number
): void {
  rvdList.rvd.splice(elementToMove.index, 1)
  elementToMove.index = childIndex
  renderDomChild(elementToMove, rvdList)
  rvdList.rvd[childIndex] = elementToMove
}

export function switchToGroup(
  groupToMove: RvdListNode<unknown>,
  rvdList: RvdKeyedListNode<unknown>,
  childIndex: number
): void {
  rvdList.rvd.splice(groupToMove.index, 1)
  moveGroup(groupToMove, rvdList, childIndex)
  rvdList.rvd[childIndex] = groupToMove
}

function moveGroup(
  groupToMove: RvdFragmentNode | RvdComponentNode | RvdListNode<unknown>,
  rvdList: RvdKeyedListNode<unknown>,
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

export function moveOrRemoveElement(
  existingNode: RvdElementNode,
  rvdList: RvdKeyedListNode<unknown>,
  newData: unknown[],
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

export function moveOrRemoveGroup(
  existingNode: RvdListNode<unknown>,
  rvdList: RvdKeyedListNode<unknown>,
  newData: unknown[],
  keyProp: string,
  keyedIndexes: Record<string | number, number>,
  toUnsubscribe: Subscription[],
  currentIndex: number
): void {
  const toIndex = findNextIndex(newData, existingNode.key, keyProp, currentIndex)

  if (toIndex >= 0) {
    moveGroup(existingNode as RvdListNode<unknown>, rvdList, toIndex)
    rvdList.rvd.splice(toIndex, 0, existingNode)
    keyedIndexes[existingNode.key] = toIndex
  } else {
    // Remove
    removeExistingGroup(existingNode as RvdListNode<unknown>, rvdList)
    toUnsubscribe.push(existingNode.sub)
    delete keyedIndexes[existingNode.key]
  }
}

export function removeExcessiveChildren(
  rvdList: RvdKeyedListNode<unknown>,
  dataArray: unknown[],
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

export function findNextIndex(
  arr: unknown[],
  key: string | number,
  keyProp: string,
  currentIndex: number
): number {
  for (let i = currentIndex; i < arr.length; ++i) {
    if (arr[i][keyProp] === key) return i
  }
  return -1
}
