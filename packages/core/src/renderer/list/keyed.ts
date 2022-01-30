import { StateSubject, Subscription } from '@atom-iq/rx'

import type {
  RvdGroupNode,
  RvdKeyedListNode,
  RvdParent,
  RvdDomNode,
  RvdNode,
  RvdListDataType,
  RvdListKeyBy
} from 'types'
import { RvdNodeFlags } from 'shared/flags'
import { isFunction } from 'shared'

import { renderDomChild } from '../dom-renderer'
import { isRvdDomNode, removeExistingGroup } from '../utils'

/**
 * Get Key
 *
 * Get key for list item, based on passed keyBy argument
 * @param item
 * @param keyBy
 */
export function getKey<T extends RvdListDataType = unknown>(
  item: T,
  keyBy: RvdListKeyBy<T>
): string | number {
  return isFunction(keyBy) ? keyBy(item) : keyBy === '' ? item : item[keyBy as string]
}

/**
 * Init Data for Hydrate
 *
 * Reduce and emit initial data dictionary, during hydrate - to
 * keep correct hydrate order (not needed in normal render).
 * @param dataSubject
 * @param dataArray
 * @param keyBy
 */
export function initDataForHydrate<T extends RvdListDataType = unknown>(
  dataSubject: StateSubject<Record<string | number, T>>,
  dataArray: T[],
  keyBy: RvdListKeyBy<T>
): void {
  dataSubject.next(
    dataArray.reduce<Record<string | number, T>>((acc, dataItem) => {
      acc[getKey(dataItem, keyBy)] = dataItem
      return acc
    }, {})
  )
}

/**
 * Reorder keyed list items
 *
 * Reorder, switch, move and remove keyed list items (dom nodes and virtual container nodes),
 * based on 3-way splice algorithm
 * @param node
 * @param existingNode
 * @param rvdList
 * @param dataArray
 * @param key
 * @param keyBy
 * @param keyedIndexes
 * @param toUnsubscribe
 * @param index
 */
export function reorderKeyedListItems<T extends RvdListDataType = unknown>(
  node: RvdNode,
  existingNode: RvdNode,
  rvdList: RvdKeyedListNode<T>,
  dataArray: T[],
  key: string | number,
  keyBy: RvdListKeyBy<T>,
  keyedIndexes: Record<string | number, number>,
  toUnsubscribe: Subscription[],
  index: number
): void {
  if (isRvdDomNode(node)) {
    if (isRvdDomNode(existingNode)) {
      switchElement<T>(existingNode, node, rvdList, index)
      keyedIndexes[key] = index

      moveOrRemoveElement<T>(
        existingNode,
        rvdList,
        dataArray,
        keyBy,
        keyedIndexes,
        toUnsubscribe,
        index,
        true
      )
    } else {
      switchToElement<T>(node, rvdList, index)
      keyedIndexes[key] = index

      moveOrRemoveGroup<T>(
        existingNode as RvdParent<RvdGroupNode>,
        rvdList,
        dataArray,
        keyBy,
        keyedIndexes,
        toUnsubscribe,
        index
      )
    }
  } else {
    if (isRvdDomNode(existingNode)) {
      switchToGroup<T>(node as RvdParent<RvdGroupNode>, rvdList, index)
      keyedIndexes[key] = index

      moveOrRemoveElement<T>(
        existingNode,
        rvdList,
        dataArray,
        keyBy,
        keyedIndexes,
        toUnsubscribe,
        index
      )
    } else {
      switchToGroup<T>(node as RvdParent<RvdGroupNode>, rvdList, index)
      keyedIndexes[key] = index

      moveOrRemoveGroup<T>(
        existingNode as RvdParent<RvdGroupNode>,
        rvdList,
        dataArray,
        keyBy,
        keyedIndexes,
        toUnsubscribe,
        index
      )
    }
  }
}

/**
 * Remove excessive keyed list children
 *
 * If there are more currently rendered elements, than new items in data array,
 * remove excessive elements
 * @param rvdList
 * @param dataArray
 * @param keyedIndexes
 * @param toUnsubscribe
 */
export function removeExcessiveKeyedListChildren<T extends RvdListDataType = unknown>(
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

function switchElement<T extends RvdListDataType = unknown>(
  existingChild: RvdDomNode,
  elementToMove: RvdDomNode,
  rvdList: RvdKeyedListNode<T>,
  index: number
): void {
  rvdList.children.splice(elementToMove.index, 1)
  elementToMove.index = index
  rvdList.dom.replaceChild(elementToMove.dom, existingChild.dom)
  rvdList.children[index] = elementToMove
}

function switchToElement<T extends RvdListDataType = unknown>(
  elementToMove: RvdDomNode,
  rvdList: RvdKeyedListNode<T>,
  index: number
): void {
  rvdList.children.splice(elementToMove.index, 1)
  elementToMove.index = index
  renderDomChild(elementToMove, rvdList)
  rvdList.children[index] = elementToMove
}

function switchToGroup<T extends RvdListDataType = unknown>(
  groupToMove: RvdParent<RvdGroupNode>,
  rvdList: RvdKeyedListNode<T>,
  index: number
): void {
  rvdList.children.splice(groupToMove.index, 1)
  moveGroup(groupToMove, rvdList, index)
  rvdList.children[index] = groupToMove
}

function moveOrRemoveElement<T extends RvdListDataType = unknown>(
  existingNode: RvdDomNode,
  rvdList: RvdKeyedListNode<T>,
  newData: T[],
  keyBy: RvdListKeyBy<T>,
  keyedIndexes: Record<string | number, number>,
  toUnsubscribe: Subscription[],
  currentIndex: number,
  elementReplaced = false
): void {
  const toIndex = findNextIndex(newData, existingNode.key, keyBy, currentIndex)

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

function moveOrRemoveGroup<T extends RvdListDataType = unknown>(
  existingNode: RvdParent<RvdGroupNode>,
  rvdList: RvdKeyedListNode<T>,
  newData: T[],
  keyBy: RvdListKeyBy<T>,
  keyedIndexes: Record<string | number, number>,
  toUnsubscribe: Subscription[],
  currentIndex: number
): void {
  const toIndex = findNextIndex(newData, existingNode.key, keyBy, currentIndex)

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

function moveElement<T extends RvdListDataType = unknown>(
  elementToMove: RvdDomNode,
  rvdList: RvdKeyedListNode<T>,
  index: number
): void {
  elementToMove.index = index
  renderDomChild(elementToMove, rvdList)
  rvdList.children.splice(index, 0, elementToMove)
}

function moveGroup(
  groupToMove: RvdParent<RvdGroupNode>,
  parentGroup: RvdParent<RvdGroupNode>,
  index: number
): void {
  groupToMove.index = index

  for (let i = 0; i < groupToMove.children.length; ++i) {
    const groupChild = groupToMove.children[i]

    if (groupChild) {
      if (isRvdDomNode(groupChild)) {
        renderDomChild(groupChild, parentGroup)
      } else {
        moveGroup(groupChild as RvdParent<RvdGroupNode>, groupToMove, i)
      }
    }
  }
}

function findNextIndex<T extends RvdListDataType = unknown>(
  arr: T[],
  key: string | number,
  keyBy: RvdListKeyBy<T>,
  startFrom: number
): number {
  for (let i = startFrom; i < arr.length; ++i) {
    if (getKey<T>(arr[i], keyBy) === key) return i
  }
  return -1
}
