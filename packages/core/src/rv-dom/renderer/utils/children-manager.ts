import type {
  RvdChildrenManager,
  CreatedNodeChild,
  CreatedFragmentChild
} from '../../../shared/types'
import { arrayEvery, arrayLast } from '../../../shared'

export function createChildrenManager(): RvdChildrenManager {
  return {
    childrenLength: 0,
    children: {},
    fragmentChildren: {},
    isInAppendMode: true
  }
}

export function turnOffAppendMode(manager: RvdChildrenManager): void {
  manager.isInAppendMode = false
}

export function turnOffFragmentAppendMode(createdFragment: CreatedFragmentChild): void {
  createdFragment.isInFragmentAppendMode = false
}

export function setCreatedChild(
  manager: RvdChildrenManager,
  index: string,
  createdChild: CreatedNodeChild
): void {
  if (!manager.children[index]) manager.childrenLength++
  manager.children[index] = createdChild
}

export function setCreatedFragment(
  manager: RvdChildrenManager,
  index: string,
  createdFragmentChild: CreatedFragmentChild
): void {
  manager.fragmentChildren[index] = createdFragmentChild
}

export function createEmptyFragment(manager: RvdChildrenManager, index: string): void {
  manager.fragmentChildren[index] = {
    index,
    element: null,
    fragmentChildIndexes: [],
    fragmentChildKeys: {},
    fragmentChildrenLength: 0,
    isInFragmentAppendMode: true
  }
}

export function removeCreatedChild(manager: RvdChildrenManager, index: string): void {
  if (manager.children[index]) {
    --manager.childrenLength
    delete manager.children[index]
  }
}

export function removeCreatedFragment(manager: RvdChildrenManager, index: string): void {
  if (manager.fragmentChildren[index]) delete manager.fragmentChildren[index]
}

export function createdChildrenSize(manager: RvdChildrenManager): number {
  return manager.childrenLength
}

export function getPreviousSibling(
  manager: RvdChildrenManager,
  index: string,
  checkSelf = false
): ChildNode {
  const getPreviousSiblingFromFragment = previousIndex => {
    const fragment = manager.fragmentChildren[previousIndex]
    const fragmentLastChildIndex = `${previousIndex}.${fragment.fragmentChildrenLength - 1}`
    return getPreviousSibling(manager, fragmentLastChildIndex, true)
  }

  if (index.includes('.')) {
    const indexParts = index.split('.')
    const lastIndexPart = Number(indexParts.pop())
    const parentIndex = indexParts.join('.')
    const previousIndex = `${parentIndex}.${checkSelf ? lastIndexPart : lastIndexPart - 1}`

    if (!checkSelf && lastIndexPart === 0) {
      return getPreviousSibling(manager, parentIndex)
    } else if (manager.children[previousIndex]) {
      return manager.children[previousIndex].element
    } else if (manager.fragmentChildren[previousIndex]) {
      return getPreviousSiblingFromFragment(previousIndex)
    } else {
      for (let i = checkSelf ? lastIndexPart - 1 : lastIndexPart - 2; i >= 0; --i) {
        const previousIndex = `${parentIndex}.${i}`
        if (manager.children[previousIndex]) {
          return manager.children[previousIndex].element
        } else if (manager.fragmentChildren[previousIndex]) {
          return getPreviousSiblingFromFragment(previousIndex)
        } else if (i === 0) {
          return getPreviousSibling(manager, parentIndex)
        }
      }
    }
  } else {
    const previousIndex = Number(index) - 1
    if (manager.children[previousIndex]) {
      return manager.children[previousIndex].element
    } else if (manager.fragmentChildren[previousIndex]) {
      return getPreviousSiblingFromFragment(previousIndex)
    } else {
      for (let i = previousIndex - 1; i >= 0; --i) {
        const previousIndex = i + ''
        if (manager.children[previousIndex]) {
          return manager.children[previousIndex].element
        } else if (manager.fragmentChildren[previousIndex]) {
          return getPreviousSiblingFromFragment(previousIndex)
        }
      }
    }
  }

  return null
}

export function setFragmentAppendModeData(
  createdFragment: CreatedFragmentChild,
  fragmentIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager
): void {
  if (createdChildrenSize(manager) === 0) {
    createdFragment.nextSibling = null
    createdFragment.fragmentAppend = true
  } else {
    if (fragmentIndex.includes('.')) {
      const indexParts = fragmentIndex.split('.')
      if (arrayEvery(indexParts, p => p === '0')) {
        createdFragment.nextSibling = parentElement.firstChild as Element | Text
        createdFragment.fragmentAppend = false
      } else {
        if (indexParts.pop() === '0') {
          const previousSibling = getPreviousSibling(manager, indexParts.join('.'), true)
          if (previousSibling.nextSibling) {
            createdFragment.nextSibling = previousSibling.nextSibling as Element | Text
            createdFragment.fragmentAppend = false
          } else {
            createdFragment.nextSibling = null
            createdFragment.fragmentAppend = true
          }
        } else {
          arrayLast(indexParts)
          const previousSibling = getPreviousSibling(
            manager,
            indexParts
              .map((indexPart, i) =>
                i === indexParts.length - 1 ? Number(indexPart) - 1 : indexPart
              )
              .join('.')
          )
          if (previousSibling.nextSibling) {
            createdFragment.nextSibling = previousSibling.nextSibling as Element | Text
            createdFragment.fragmentAppend = false
          } else {
            createdFragment.nextSibling = null
            createdFragment.fragmentAppend = true
          }
        }
      }
    } else {
      if (fragmentIndex === '0') {
        createdFragment.nextSibling = parentElement.firstChild as Element | Text
        createdFragment.fragmentAppend = false
      } else {
        const previousSibling = getPreviousSibling(manager, fragmentIndex)
        if (previousSibling.nextSibling) {
          createdFragment.nextSibling = previousSibling.nextSibling as Element | Text
          createdFragment.fragmentAppend = false
        } else {
          createdFragment.nextSibling = null
          createdFragment.fragmentAppend = true
        }
      }
    }
  }
}
