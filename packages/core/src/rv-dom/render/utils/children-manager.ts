import {
  CreatedChildren,
  CreatedChild,
  CreatedChildrenManager,
  CustomMapEntry,
  CreatedChildPositionInfo,
  CreatedFragmentChildren,
  CreatedNodeChild,
  CreatedFragmentChild
} from '@@types'
import { isIndexFirstInArray, isIndexLastInArray, sortNestedIndexes } from '@@shared'

/**
 * Utility class for keeping the order of rendered element children.
 * Class is internal for the ES Module, for external usage factory
 * function is exported and for typings {@link CreatedChildrenManager}
 * interface should be used
 */
class ChildrenManager implements CreatedChildrenManager {
  /**
   * Object.prototype.toString() implementation
   */
  get [Symbol.toStringTag](): string {
    return JSON.stringify(this.indexes)
  }
  /**
   * Get iterator for Children Map
   */
  [Symbol.iterator] = (): IterableIterator<CustomMapEntry<CreatedNodeChild>> => {
    return this.toEntriesArray()[Symbol.iterator]()
  }

  private indexes: string[] = []
  private children: CreatedChildren = {}

  private fragmentIndexes: string[] = []
  private fragmentChildren: CreatedFragmentChildren = {}

  has = (key: string): boolean => !!this.children[key]
  get = (key: string): CreatedNodeChild => this.children[key]
  hasFragment = (key: string): boolean => !!this.fragmentChildren[key]
  getFragment = (key: string): CreatedFragmentChild => this.fragmentChildren[key]

  private setFnFactory = <T extends CreatedChild>(mode: 'add' | 'replace', isFragment = false) =>
    (key: string, value: T): boolean => {
      try {
        const isAddMode = mode === 'add'
        const hasKey = isFragment ? !!this.fragmentChildren[key] : !!this.children[key]
        const shouldSet = isAddMode ? !hasKey : hasKey

        if (shouldSet) {
          if (isFragment) {
            if (isAddMode) this.fragmentIndexes = this.fragmentIndexes.concat(key)

            this.fragmentChildren[key] = value as CreatedFragmentChild
          } else {
            if (isAddMode) this.indexes = this.indexes.concat(key)

            this.children[key] = value as CreatedNodeChild
          }
          return true
        }
        return false
      } catch (e) {
        return false
      }
    }

  add = this.setFnFactory<CreatedNodeChild>('add')
  replace = this.setFnFactory<CreatedNodeChild>('replace')

  addFragment = this.setFnFactory<CreatedFragmentChild>('add', true)
  replaceFragment = this.setFnFactory<CreatedFragmentChild>('replace', true)

  remove = (key: string): boolean => this.has(key) && this.delete(key)
  removeFragment = (key: string): boolean => this.hasFragment(key) && this.delete(key, true)

  size = (): number => this.indexes.length

  empty = (): boolean => this.indexes.length === 0

  getAll = (): CreatedNodeChild[] => this.indexes.map(index => this.children[index])

  getKeys = (): string[] => this.indexes

  removeAll = (): boolean => {
    this.indexes = []
    this.children = {}
    return true
  }

  toEntriesArray = (): CustomMapEntry<CreatedNodeChild>[] => this.indexes.map(this.mapToEntry)

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
      return false
    }
  }

  private mapToEntry = (index: string): CustomMapEntry<CreatedNodeChild> =>
    ([index, this.children[index]])

  private getChildOrNull = (exists: boolean, getSiblingIndex: () => string) => {
    if (!exists) {
      return null
    }
    return this.children[getSiblingIndex()]
  }

  getPositionInfoForNewChild = (index: string): CreatedChildPositionInfo => {
    const allSortedIndexes = ChildrenManager.sortIndexes(this.indexes.concat(index))
    const indexInArray = allSortedIndexes.indexOf(index)
    const isFirst = isIndexFirstInArray(indexInArray)
    const isLast = isIndexLastInArray(indexInArray, allSortedIndexes)

    const firstChild = this.getChildOrNull(
      !isFirst,
      () => allSortedIndexes[0]
    )

    const previousSibling = this.getChildOrNull(
      !isFirst,
      () => allSortedIndexes[indexInArray - 1]
    )
    const nextSibling = this.getChildOrNull(
      !isLast,
      () => allSortedIndexes[indexInArray + 1]
    )

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

  static sortIndexes = (indexes: string[]): string[] => sortNestedIndexes(indexes)
}

export const getSortedFragmentChildIndexes = (fragment: CreatedFragmentChild): string[] =>
  ChildrenManager.sortIndexes(fragment.fragmentChildIndexes)

/**
 * @func createdChildrenManager
 */
export default (): CreatedChildrenManager => (new ChildrenManager())
