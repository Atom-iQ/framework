import type { RvdChildrenManager, RvdCreatedFragment, RvdCreatedNode } from 'types'
import { arrayEvery } from 'shared'

export function createChildrenManager(): RvdChildrenManager {
  return {
    size: 0,
    children: {},
    fragmentChildren: {},
    removedFragments: {},
    removedNodes: {},
    append: true
  }
}

export function setCreatedChild(
  manager: RvdChildrenManager,
  index: string,
  createdChild: RvdCreatedNode,
  parentFragment?: RvdCreatedFragment
): void {
  if (!manager.children[index]) ++manager.size
  manager.children[index] = createdChild
  if (parentFragment) parentFragment.indexes.push(index)
}

export function setCreatedFragment(
  manager: RvdChildrenManager,
  index: string,
  createdFragmentChild: RvdCreatedFragment,
  parentFragment?: RvdCreatedFragment
): void {
  manager.fragmentChildren[index] = createdFragmentChild
  if (parentFragment) parentFragment.indexes.push(index)
}

export function createEmptyFragment(
  manager: RvdChildrenManager,
  index: string,
  parentFragment?: RvdCreatedFragment
): void {
  manager.fragmentChildren[index] = {
    index,
    indexes: [],
    size: 0,
    append: true
  }
  if (parentFragment) parentFragment.indexes.push(index)
}

export function removeCreatedChild(
  manager: RvdChildrenManager,
  index: string,
  parentFragment?: RvdCreatedFragment
): void {
  if (manager.children[index]) {
    --manager.size
    delete manager.children[index]
  }
  if (parentFragment) {
    parentFragment.indexes.splice(parentFragment.indexes.indexOf(index), 1)
  }
}

export function removeCreatedFragment(
  manager: RvdChildrenManager,
  index: string,
  parentFragment?: RvdCreatedFragment
): void {
  if (manager.fragmentChildren[index]) delete manager.fragmentChildren[index]
  if (parentFragment) {
    parentFragment.indexes.splice(parentFragment.indexes.indexOf(index), 1)
  }
}

export function getPreviousSibling(
  manager: RvdChildrenManager,
  index: string,
  checkSelf = false
): ChildNode {
  const getPreviousSiblingFromFragment = previousIndex => {
    const fragment = manager.fragmentChildren[previousIndex]
    const fragmentLastChildIndex = `${previousIndex}.${fragment.size - 1}`
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
  createdFragment: RvdCreatedFragment,
  fragmentIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager
): void {
  if (manager.size === 0) {
    createdFragment.nextSibling = null
  } else {
    if (fragmentIndex.includes('.')) {
      const indexParts = fragmentIndex.split('.')
      if (arrayEvery(indexParts, p => p === '0')) {
        createdFragment.nextSibling = parentElement.firstChild as Element | Text
      } else {
        const last = indexParts.pop()
        if (last === '0') {
          const previousSibling = getPreviousSibling(manager, indexParts.join('.'), true)
          createdFragment.nextSibling =
            previousSibling && (previousSibling.nextSibling as Element | Text)
        } else {
          const previousSibling = getPreviousSibling(
            manager,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            indexParts.join('.') + '.' + ((last as any) - 1)
          )
          createdFragment.nextSibling =
            previousSibling && (previousSibling.nextSibling as Element | Text)
        }
      }
    } else {
      if (fragmentIndex === '0') {
        createdFragment.nextSibling = parentElement.firstChild as Element | Text
      } else {
        const previousSibling = getPreviousSibling(manager, fragmentIndex)
        createdFragment.nextSibling =
          previousSibling && (previousSibling.nextSibling as Element | Text)
      }
    }
  }
}
