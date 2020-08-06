export type CustomMapEntry<T> = [string, T]

export interface CustomMap<T> {
  /**
   * An IterableIterator implementation for CustomMap
   */
  [Symbol.iterator]: () => IterableIterator<CustomMapEntry<T>>
  /**
   * Check if item with given key exists in CustomMap
   * @param key
   */
  has: (key: string) => boolean
  /**
   * Get one item from the CustomMap
   * @param key
   */
  get: (key: string) => T
  /**
   * Add one item to the CustomMap. If the item already exists, it doesn't
   * replace it with a new one (for that case use {@link replace}).
   * @param key
   * @param value
   * @returns true if added, false if not (item already exists or error)
   */
  add: (key: string, value: T) => boolean
  /**
   * Replace one item in the CustomMap with the new value. If the item doesn't exist,
   * it doesn't add a new one (for that case use {@link add})
   * @param key
   * @param value
   * @returns true if replaced, false if not (item doesn't exist or error)
   */
  replace: (key: string, value: T) => boolean
  /**
   * Remove one item from CustomMap
   * @param key
   * @param value
   * @returns true if removed, false if not (item doesn't exist or error)
   */
  remove: (key: string) => boolean
  /**
   * Remove all items from CustomMap
   */
  removeAll: () => boolean
  /**
   * Get all items (values) as an array
   */
  getAll: () => T[]
  /**
   * Get all item keys as an array
   */
  getKeys: () => string[]
  /**
   * Get all items as an array of [key, value] tuples
   */
  toEntriesArray?: () => CustomMapEntry<T>[]
  /**
   * Get number of all items in CustomMap
   */
  size: () => number
  /**
   * Check if CustomMap is empty
   */
  empty: () => boolean
}
