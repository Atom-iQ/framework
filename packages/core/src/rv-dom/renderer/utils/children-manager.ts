import type {
  CreatedChildrenManager,
  CreatedNodeChild,
  CreatedFragmentChild
} from '../../../shared/types'

export const createChildrenManager: () => CreatedChildrenManager = () => ({
  childrenLength: 0,
  children: {},
  fragmentChildren: {}
})

export const setCreatedChild = (
  manager: CreatedChildrenManager,
  index: string,
  createdChild: CreatedNodeChild
): void => {
  if (!manager.children[index]) manager.childrenLength++
  manager.children[index] = createdChild
}

export const setCreatedFragment = (
  manager: CreatedChildrenManager,
  index: string,
  createdFragmentChild: CreatedFragmentChild
): void => {
  manager.fragmentChildren[index] = createdFragmentChild
}

export const createEmptyFragment = (manager: CreatedChildrenManager, index: string): void => {
  manager.fragmentChildren[index] = {
    index,
    element: null,
    fragmentChildIndexes: [],
    fragmentChildKeys: {},
    fragmentChildrenLength: 0
  }
}

export const removeCreatedChild = (manager: CreatedChildrenManager, index: string): void => {
  if (manager.children[index]) {
    --manager.childrenLength
    delete manager.children[index]
  }
}

export const removeCreatedFragment = (manager: CreatedChildrenManager, index: string): void => {
  if (manager.fragmentChildren[index]) delete manager.fragmentChildren[index]
}

export const createdChildrenSize = (manager: CreatedChildrenManager): number =>
  manager.childrenLength

export const getPreviousSibling = (
  manager: CreatedChildrenManager,
  index: string,
  checkSelf = false
): ChildNode => {
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
