import createChildrenManager, {
  getSortedFragmentChildIndexes
} from '../../../../../src/rv-dom/renderer/utils/children-manager'
import { CreatedChildrenManager, RvdElement } from '../../../../../src/shared/types'
import { createDomElement } from '../../../../../src/rv-dom/renderer/utils'
import { _FRAGMENT } from '../../../../../src/shared'
/* eslint-disable max-len */
describe('Created children manager', () => {
  let createdChildren

  beforeEach(() => {
    createdChildren = createChildrenManager()
  })

  const emptyElement = index => ({ element: null, index })

  const add3Elements = () => {
    createdChildren.add('0', emptyElement('0'))
    createdChildren.add('1', emptyElement('1'))
    createdChildren.add('2', emptyElement('2'))
  }

  test('add method should add CreatedChild to children object and it`s index to indexes array', () => {
    expect(createdChildren.size()).toBe(0)
    add3Elements()
    expect(createdChildren.size()).toBe(3)
  })

  test('replace method should replace CreatedChild object on given position', () => {
    add3Elements()
    expect(createdChildren.size()).toBe(3)
    expect(createdChildren.get('2')).toEqual(emptyElement('2'))
    createdChildren.replace('2', { element: createDomElement('div', false), index: '2' })
    expect(createdChildren.get('2')).toEqual({
      element: createDomElement('div', false),
      index: '2'
    })
    expect(createdChildren.size()).toBe(3)
  })

  test('has method should return true if there is child on given position', () => {
    add3Elements()
    expect(createdChildren.has('2')).toBeTruthy()
    expect(createdChildren.has('4')).toBeFalsy()
  })

  test('get method should return child from given position', () => {
    add3Elements()
    expect(createdChildren.get('2')).toEqual(emptyElement('2'))
    expect(createdChildren.get('4')).toBeUndefined()
  })

  test('size method should return number of elements in collection', () => {
    expect(createdChildren.size()).toBe(0)
    add3Elements()
    expect(createdChildren.size()).toBe(3)
  })

  test('empty method should return true when collection is empty', () => {
    expect(createdChildren.empty()).toBeTruthy()
    add3Elements()
    expect(createdChildren.empty()).toBeFalsy()
  })

  test('getFirstIndex method should return index of first item', () => {
    add3Elements()
    expect(createdChildren.getFirstIndex()).toBe('0')
  })

  test('getFirstChild method should return element for first index', () => {
    add3Elements()
    expect(createdChildren.getFirstChild()).toEqual(emptyElement('0'))
  })

  test('hasOneChild method should return true when there`s only one item in collection', () => {
    expect(createdChildren.hasOneChild()).toBeFalsy()
    createdChildren.add('3', emptyElement('3'))
    expect(createdChildren.hasOneChild()).toBeTruthy()
    add3Elements()
    expect(createdChildren.hasOneChild()).toBeFalsy()
  })

  test('remove method should remove item and it`s index', () => {
    add3Elements()
    expect(createdChildren.size()).toBe(3)
    createdChildren.remove('0')
    createdChildren.remove('1')
    expect(createdChildren.size()).toBe(1)
  })

  const add3Fragments = () => {
    createdChildren.createEmptyFragment('0')
    createdChildren.createEmptyFragment('1')
    createdChildren.createEmptyFragment('2')
  }

  const emptyFragment = index => ({
    index,
    element: _FRAGMENT,
    fragmentChildIndexes: [],
    fragmentChildKeys: {},
    fragmentChildrenLength: 0
  })

  test('addFragment method should add CreatedFragmentChild to fragmentChildren object and it`s index to fragmentIndexes array', () => {
    expect(createdChildren.hasFragment('0')).toBeFalsy()
    createdChildren.addFragment('0', emptyFragment('0'))
    expect(createdChildren.hasFragment('0')).toBeTruthy()
  })

  test('replaceFragment method should replace CreatedFragmentChild object on given position', () => {
    add3Fragments()
    expect(createdChildren.getFragment('2')).toEqual(emptyFragment('2'))

    const changedFragment = {
      ...emptyFragment('2'),
      fragmentChildIndexes: ['2.0', '2.1'],
      fragmentChildrenLength: 2
    }
    createdChildren.replaceFragment('2', changedFragment)
    expect(createdChildren.getFragment('2')).toBe(changedFragment)
  })

  test('hasFragment method should return true if there is fragment child on given position', () => {
    add3Fragments()
    expect(createdChildren.hasFragment('2')).toBeTruthy()
    expect(createdChildren.hasFragment('4')).toBeFalsy()
  })

  test('getFragment method should return fragment child from given position', () => {
    add3Fragments()
    expect(createdChildren.getFragment('2')).toEqual(emptyFragment('2'))
    expect(createdChildren.getFragment('4')).toBeUndefined()
  })

  test('createEmptyFragment method should add empty CreatedFragmentChild to fragmentChildren object and it`s index to fragmentIndexes array', () => {
    expect(createdChildren.hasFragment('0')).toBeFalsy()
    createdChildren.createEmptyFragment('0')
    expect(createdChildren.hasFragment('0')).toBeTruthy()
    expect(createdChildren.getFragment('0')).toEqual(emptyFragment('0'))
  })

  test('getPositionInfoForNewChild method should return position info data for new inserted element index', () => {
    add3Elements()
    createdChildren.add('4', emptyElement('4'))
    createdChildren.add('5', emptyElement('5'))
    const positionData = createdChildren.getPositionInfoForNewChild('3')

    expect(positionData.indexInArray).toBe(3)
    expect(positionData.allSortedIndexes).toEqual(['0', '1', '2', '3', '4', '5'])
    expect(positionData.isFirst).toBeFalsy()
    expect(positionData.isLast).toBeFalsy()
    expect(positionData.previousSibling).toEqual(emptyElement('2'))
    expect(positionData.nextSibling).toEqual(emptyElement('4'))
    expect(positionData.firstChild).toEqual(emptyElement('0'))
  })

  test('getSortedFragmentChildIndexes function should sort fragment`s children indexes', () => {
    createdChildren.createEmptyFragment('0')
    const fragment = createdChildren.getFragment('0')
    fragment.fragmentChildIndexes = [
      '0.4',
      '0.3',
      '0.0',
      '0.1',
      '0.3.2',
      '0.5',
      '0.6',
      '0.3.1',
      '0.2',
      '0.3.0'
    ]
    fragment.fragmentChildrenLength = 10
    const expected = ['0.0', '0.1', '0.2', '0.3', '0.3.0', '0.3.1', '0.3.2', '0.4', '0.5', '0.6']
    expect(getSortedFragmentChildIndexes(fragment)).toEqual(expected)
  })

  test('add method should throw error when child cannot be added/replaced', () => {
    const result = jest.fn(() => createdChildren.add('0', emptyElement('0')))
    ;(createdChildren as any).indexes = null
    expect(result).toThrowError('Cannot add or replace created child')
  })

  test('add method should return false when child exists', () => {
    add3Elements()
    expect(createdChildren.add('0', emptyElement('0'))).toBeFalsy()
  })

  test('replace method should return false when child not exists', () => {
    add3Elements()
    expect(createdChildren.replace('4', emptyElement('4'))).toBeFalsy()
  })

  test('remove method should return false when children not exists', () => {
    expect(createdChildren.remove('0')).toBeFalsy()
  })

  test('remove method should throw error when child cannot be removed', () => {
    add3Elements()
    const result = jest.fn(() => createdChildren.remove('0'))
    ;(createdChildren as any).indexes = null
    expect(result).toThrowError('Cannot remove child from created children')
  })
})
