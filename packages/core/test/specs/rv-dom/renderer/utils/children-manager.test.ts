import {
  createChildrenManager,
  createdChildrenSize,
  createEmptyFragment,
  removeCreatedChild,
  setCreatedChild,
  setCreatedFragment
} from '../../../../../src/rv-dom/renderer/utils/children-manager'
import { createDomElement } from '../../../../../src/rv-dom/renderer/utils'
/* eslint-disable max-len */
describe('Created children manager', () => {
  let createdChildren

  beforeEach(() => {
    createdChildren = createChildrenManager()
  })

  const emptyElement = index => ({ element: null, index })

  const add3Elements = () => {
    setCreatedChild(createdChildren, '0', emptyElement('0'))
    setCreatedChild(createdChildren, '1', emptyElement('1'))
    setCreatedChild(createdChildren, '2', emptyElement('2'))
  }

  test('setCreatedChild should add CreatedChild to children object and increase it`s size, when it wasn`t in created children before', () => {
    expect(createdChildrenSize(createdChildren)).toBe(0)
    add3Elements()
    expect(createdChildrenSize(createdChildren)).toBe(3)
  })

  test('setCreatedChild should replace CreatedChild object on given position', () => {
    add3Elements()
    expect(createdChildrenSize(createdChildren)).toBe(3)
    expect(createdChildren.children['2']).toEqual(emptyElement('2'))
    setCreatedChild(createdChildren, '2', { element: createDomElement('div', false), index: '2' })
    expect(createdChildren.children['2']).toEqual({
      element: createDomElement('div', false),
      index: '2'
    })
    expect(createdChildrenSize(createdChildren)).toBe(3)
  })

  test('createdChildrenSize should return number of elements in collection', () => {
    expect(createdChildrenSize(createdChildren)).toBe(0)
    add3Elements()
    expect(createdChildrenSize(createdChildren)).toBe(3)
  })

  test('removeCreatedChild should remove item and decrease size', () => {
    add3Elements()
    expect(createdChildrenSize(createdChildren)).toBe(3)
    removeCreatedChild(createdChildren, '0')
    removeCreatedChild(createdChildren, '1')
    expect(createdChildrenSize(createdChildren)).toBe(1)
  })

  const add3Fragments = () => {
    createEmptyFragment(createdChildren, '0')
    createEmptyFragment(createdChildren, '1')
    createEmptyFragment(createdChildren, '2')
  }

  const emptyFragment = index => ({
    index,
    element: null,
    fragmentChildIndexes: [],
    fragmentChildKeys: {},
    fragmentChildrenLength: 0
  })

  test('setCreatedFragment method should add CreatedFragmentChild to fragmentChildren object', () => {
    expect(createdChildren.fragmentChildren['0']).toBeFalsy()
    setCreatedFragment(createdChildren, '0', emptyFragment('0'))
    expect(createdChildren.fragmentChildren['0']).toBeTruthy()
  })

  test('createEmptyFragment should add empty CreatedFragmentChild to fragmentChildren object and it`s index to fragmentIndexes array', () => {
    expect(createdChildren.fragmentChildren['0']).toBeFalsy()
    createEmptyFragment(createdChildren, '0')
    expect(createdChildren.fragmentChildren['0']).toBeTruthy()
    expect(createdChildren.fragmentChildren['0']).toEqual(emptyFragment('0'))
  })

  test('remove method should throw error when child cannot be removed', () => {
    add3Elements()
    const result = jest.fn(() => createdChildren.remove('0'))
    ;(createdChildren as any)._size = undefined
    ;(createdChildren as any).children = undefined
    expect(result).toThrowError()
  })
})
