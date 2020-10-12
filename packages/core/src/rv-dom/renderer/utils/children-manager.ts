import type {
  CreatedChildren,
  CreatedChild,
  CreatedChildrenManager,
  CreatedChildPositionInfo,
  CreatedFragmentChildren,
  CreatedNodeChild,
  CreatedFragmentChild
} from '../../../shared/types'
import { _FRAGMENT } from '../../../shared'

const loopCompare = (partsOfA: number[], partsOfB: number[]) => (
  length: number,
  equalResult?: 1 | -1
) => {
  if (equalResult) {
    for (let i = 0; i < length; i++) {
      if (partsOfA[i] !== partsOfB[i]) {
        return partsOfA[i] > partsOfB[i] ? 1 : -1
      } else if (i === length - 1) {
        return equalResult
      }
    }
  } else if (length === 1) {
    return partsOfA[0] > partsOfB[0] ? 1 : -1
  } else {
    for (let i = 0; i < length; i++) {
      if (partsOfA[i] !== partsOfB[i]) {
        return partsOfA[i] > partsOfB[i] ? 1 : -1
      }
    }
  }
}

/**
 * Compare function for sorting nested indexes
 * @param a
 * @param b
 * @returns {number}
 */
const nestedIndexesCompare = (a: string, b: string): number => {
  const partsOfA = a.split('.').map(Number)
  const partsOfB = b.split('.').map(Number)
  const compareFn = loopCompare(partsOfA, partsOfB)
  if (partsOfA.length === partsOfB.length) {
    return compareFn(partsOfA.length)
  } else if (partsOfA.length > partsOfB.length) {
    return compareFn(partsOfB.length, 1)
  } else {
    return compareFn(partsOfA.length, -1)
  }
}

/**
 * Utility class for keeping the order of rendered element children.
 * Class is internal for the ES Module, for external usage factory
 * function is exported and for typings {@link CreatedChildrenManager}
 * interface should be used
 *
 * TODO: ChildrenManager should be changed to special collection object, but instead
 * TODO: instance methods, there should be functional operators and collection should
 * TODO: be passed to operators
 */
class ChildrenManager implements CreatedChildrenManager {
  private indexes: string[] = []
  private children: CreatedChildren = {}

  private fragmentIndexes: string[] = []
  private fragmentChildren: CreatedFragmentChildren = {}

  has = (index: string): boolean => !!this.children[index]
  get = (key: string): CreatedNodeChild => this.children[key]
  hasFragment = (key: string): boolean => !!this.fragmentChildren[key]
  getFragment = (key: string): CreatedFragmentChild => this.fragmentChildren[key]
  find = (callback: (child: CreatedChild) => boolean) => Object.values(this.children).find(callback)
  filter = (callback: (child: CreatedChild) => boolean) =>
    Object.values(this.children).filter(callback)

  private setFnFactory = <T extends CreatedChild>(mode: 'add' | 'replace', isFragment = false) => (
    key: string,
    value: T
  ): boolean => {
    try {
      const isAddMode = mode === 'add'
      const hasKey = isFragment ? !!this.fragmentChildren[key] : !!this.children[key]
      const shouldSet = isAddMode ? !hasKey : hasKey

      if (shouldSet) {
        if (isFragment) {
          if (isAddMode || !this.fragmentIndexes.includes(key)) {
            this.fragmentIndexes = this.fragmentIndexes.concat(key)
          }

          this.fragmentChildren[key] = value as CreatedFragmentChild
        } else {
          if (isAddMode || !this.indexes.includes(key)) this.indexes = this.indexes.concat(key)

          this.children[key] = value as CreatedNodeChild
        }
        return true
      }
      return false
    } catch (e) {
      throw Error('Cannot add or replace created child')
    }
  }

  add = this.setFnFactory<CreatedNodeChild>('add')
  replace = this.setFnFactory<CreatedNodeChild>('replace')

  addFragment = this.setFnFactory<CreatedFragmentChild>('add', true)
  replaceFragment = this.setFnFactory<CreatedFragmentChild>('replace', true)

  createEmptyFragment = (index: string) =>
    this.addFragment(index, {
      index,
      element: _FRAGMENT,
      fragmentChildIndexes: [],
      fragmentChildKeys: {},
      fragmentChildrenLength: 0
    })

  remove = (key: string): boolean => this.has(key) && this.delete(key)
  removeFragment = (key: string): boolean => this.hasFragment(key) && this.delete(key, true)

  size = (): number => this.indexes.length

  empty = (): boolean => this.indexes.length === 0

  getFirstIndex = (): string => this.indexes[0]

  getFirstChild = (): CreatedNodeChild => this.children[this.indexes[0]]

  hasOneChild = (): boolean => this.indexes.length === 1

  private delete = (key: string, isFragment = false): boolean => {
    try {
      if (isFragment) {
        this.fragmentIndexes = this.fragmentIndexes.filter(index => index !== key)
        delete this.fragmentChildren[key]
      } else {
        this.indexes = this.indexes.filter(index => index !== key)
        delete this.children[key]
      }
      return true
    } catch (e) {
      throw Error('Cannot remove child from created children')
    }
  }

  private getChildOrNull = (exists: boolean, getSiblingIndex: () => string) => {
    if (!exists) {
      return null
    }
    return this.children[getSiblingIndex()]
  }

  getPositionInfoForNewChild = (index: string): CreatedChildPositionInfo => {
    const allSortedIndexes = ChildrenManager.sortIndexes(this.indexes.concat(index))
    const indexInArray = allSortedIndexes.indexOf(index)
    const isFirst = indexInArray === 0
    const isLast = indexInArray === allSortedIndexes.length - 1

    const firstChild = this.getChildOrNull(allSortedIndexes.length > 1, () =>
      isFirst ? allSortedIndexes[1] : allSortedIndexes[0]
    )

    const previousSibling = this.getChildOrNull(!isFirst, () => allSortedIndexes[indexInArray - 1])
    const nextSibling = this.getChildOrNull(!isLast, () => allSortedIndexes[indexInArray + 1])

    return {
      indexInArray,
      allSortedIndexes,
      isFirst,
      isLast,
      previousSibling,
      nextSibling,
      firstChild
    }
  }

  static sortIndexes = (indexes: string[]): string[] => indexes.sort(nestedIndexesCompare)
}

export const getSortedFragmentChildIndexes = (fragment: CreatedFragmentChild): string[] =>
  ChildrenManager.sortIndexes(fragment.fragmentChildIndexes)

/**
 * @func createdChildrenManager
 */
export default (): CreatedChildrenManager => new ChildrenManager()
