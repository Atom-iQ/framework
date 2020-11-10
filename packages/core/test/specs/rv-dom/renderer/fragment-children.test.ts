import {
  CreatedFragmentChild,
  CreatedNodeChild,
  Dictionary,
  KeyedChild
} from '../../../../src/shared/types'
import { Subscription } from 'rxjs'
import {
  loadPreviousKeyedElements,
  skipMoveOrRenderKeyedChild,
  refreshFragmentChildKey
} from '../../../../src/reactive-virtual-dom/renderer/fragment-children'
import * as ELEMENTS from '../../../__mocks__/elements'
import { createDomElement } from '../../../../src/reactive-virtual-dom/renderer/utils'
import {
  createChildrenManager,
  setCreatedChild,
  setCreatedFragment,
  turnOffAppendMode
} from '../../../../src/reactive-virtual-dom/renderer/children-manager'
import { createRvdElement } from '../../../../src/reactive-virtual-dom/create-element'
import { RvdElementFlags } from '../../../../src/shared/flags'

describe('Fragment children renderer', () => {
  let sub: Subscription
  let subSpy: jest.SpyInstance

  beforeEach(() => {
    sub = new Subscription()
    subSpy = jest.spyOn(sub, 'add')
  })

  // eslint-disable-next-line max-len
  test('refreshFragmentChildKey should add keyed child to new keyed children', () => {
    const keyedMap: Dictionary<KeyedChild> = {
      testKey: {
        index: '0.0',
        child: {
          index: '0.0',
          element: createDomElement('div', false),
          key: 'testKey'
        }
      }
    }

    const createdFragment: CreatedFragmentChild = {
      element: null,
      fragmentChildIndexes: [],
      fragmentChildrenLength: 0,
      index: '0',
      fragmentChildKeys: {},
      isInFragmentAppendMode: true
    }

    refreshFragmentChildKey(keyedMap, createdFragment, '0.0', 'testKey')

    expect(createdFragment.fragmentChildKeys).toEqual({ testKey: '0.0' })
    expect(keyedMap.testKey).toBeUndefined()
  })

  // eslint-disable-next-line max-len
  test('skipMoveOrRenderKeyedChild should skip rendering keyed child, when new child with same key is on the same position', () => {
    const element = createDomElement('div', false)

    const keyedMap: Dictionary<KeyedChild> = {
      testKey: {
        index: '0.0',
        child: {
          index: '0.0',
          element: createDomElement('div', false),
          key: 'testKey',
          type: 'div'
        }
      }
    }

    const createdFragment: CreatedFragmentChild = {
      element: null,
      fragmentChildIndexes: ['0.0'],
      fragmentChildrenLength: 1,
      index: '0',
      fragmentChildKeys: {},
      isInFragmentAppendMode: false
    }

    const createdChildren = createChildrenManager()

    turnOffAppendMode(createdChildren)

    setCreatedFragment(createdChildren, '0', createdFragment)

    const rvdElement = createRvdElement(
      RvdElementFlags.HtmlElement,
      'div',
      'test',
      null,
      null,
      null,
      'testKey'
    )

    skipMoveOrRenderKeyedChild(
      rvdElement,
      '0.0',
      keyedMap,
      createdFragment,
      element,
      createdChildren,
      jest.fn()
    )

    expect(createdFragment.fragmentChildKeys).toEqual({ testKey: '0.0' })
    expect(keyedMap.testKey).toBeUndefined()
  })

  // eslint-disable-next-line max-len
  test('skipMoveOrRenderKeyedChild should move keyed child, when new child with same key is on different position', () => {
    const element = createDomElement('div', false)

    const createdChild: CreatedNodeChild = {
      index: '0.0',
      element: createDomElement('div', false),
      key: 'testKey',
      type: 'div'
    }

    const keyedMap: Dictionary<KeyedChild> = {
      testKey: {
        index: '0.0',
        child: createdChild
      }
    }

    const createdFragment: CreatedFragmentChild = {
      element: null,
      fragmentChildIndexes: ['0.0'],
      fragmentChildrenLength: 1,
      index: '0',
      fragmentChildKeys: {},
      isInFragmentAppendMode: false
    }

    const createdChildren = createChildrenManager()
    turnOffAppendMode(createdChildren)

    setCreatedFragment(createdChildren, '0', createdFragment)
    setCreatedChild(createdChildren, '0.0', createdChild)

    const rvdElement = createRvdElement(
      RvdElementFlags.HtmlElement,
      'div',
      'test',
      null,
      null,
      null,
      'testKey'
    )

    skipMoveOrRenderKeyedChild(
      rvdElement,
      '0.1',
      keyedMap,
      createdFragment,
      element,
      createdChildren,
      jest.fn()
    )

    expect(createdFragment.fragmentChildKeys).toEqual({ testKey: '0.1' })
    expect(keyedMap.testKey).toBeUndefined()
    expect(createdChildren.children['0.0']).toBeUndefined()
    expect(createdChildren.children['0.1']).toEqual({
      ...createdChild,
      index: '0.1'
    })
  })
  // eslint-disable-next-line max-len
  test('skipMoveOrRenderKeyedChild should move keyed fragment, when new fragment with same key is on different position', () => {
    const element = createDomElement('div', false)

    const childFragment: CreatedFragmentChild = {
      element: null,
      fragmentChildIndexes: [],
      fragmentChildrenLength: 1,
      index: '0.0',
      fragmentChildKeys: {},
      key: 'testKey',
      isInFragmentAppendMode: false
    }

    const keyedMap: Dictionary<KeyedChild> = {
      testKey: {
        index: '0.0',
        child: childFragment,
        fragmentChildren: []
      }
    }

    const createdFragment: CreatedFragmentChild = {
      element: null,
      fragmentChildIndexes: ['0.0'],
      fragmentChildrenLength: 1,
      index: '0',
      fragmentChildKeys: {},
      isInFragmentAppendMode: false
    }

    const createdChildren = createChildrenManager()
    turnOffAppendMode(createdChildren)

    setCreatedFragment(createdChildren, '0', createdFragment)
    setCreatedFragment(createdChildren, '0.0', childFragment)

    const rvdElement = ELEMENTS.NON_KEYED_FRAGMENT_WITH_KEY

    skipMoveOrRenderKeyedChild(
      rvdElement,
      '0.1',
      keyedMap,
      createdFragment,
      element,
      createdChildren,
      jest.fn()
    )

    expect(createdFragment.fragmentChildKeys).toEqual({ testKey: '0.1' })
    expect(keyedMap.testKey).toBeUndefined()
    expect(createdChildren.fragmentChildren['0.0']).toBeUndefined()
    expect(createdChildren.fragmentChildren['0.1']).toEqual({
      ...childFragment,
      index: '0.1'
    })
  })

  // eslint-disable-next-line max-len
  test('skipMoveOrRenderKeyedChild should call renderNewCallback when keyed element is not saved', () => {
    const element = createDomElement('div', false)

    const keyedMap: Dictionary<KeyedChild> = {}

    const createdFragment: CreatedFragmentChild = {
      element: null,
      fragmentChildIndexes: ['0.0'],
      fragmentChildrenLength: 1,
      index: '0',
      fragmentChildKeys: {},
      isInFragmentAppendMode: false
    }

    const createdChildren = createChildrenManager()
    turnOffAppendMode(createdChildren)

    setCreatedFragment(createdChildren, '0', createdFragment)

    const rvdElement = createRvdElement(
      RvdElementFlags.HtmlElement,
      'div',
      'test',
      null,
      null,
      null,
      'testKey'
    )

    const renderNewCallback = jest.fn()

    skipMoveOrRenderKeyedChild(
      rvdElement,
      '0.0',
      keyedMap,
      createdFragment,
      element,
      createdChildren,
      renderNewCallback
    )

    expect(createdFragment.fragmentChildKeys).toEqual({ testKey: '0.0' })
    expect(keyedMap.testKey).toBeUndefined()
    expect(renderNewCallback).toBeCalledWith(rvdElement, '0.0')
  })

  // eslint-disable-next-line max-len
  test('skipMoveOrRenderKeyedChild should call renderNewCallback when keyed element has different type', () => {
    const element = createDomElement('div', false)

    const existingChild: CreatedNodeChild = {
      element: createDomElement('span', false),
      index: '0.0',
      type: 'span',
      key: 'testKey'
    }

    const keyedMap: Dictionary<KeyedChild> = {
      testKey: {
        index: '0.0',
        child: existingChild
      }
    }

    const createdFragment: CreatedFragmentChild = {
      element: null,
      fragmentChildIndexes: [],
      fragmentChildrenLength: 1,
      index: '0',
      fragmentChildKeys: {
        testKey: '0.0'
      },
      isInFragmentAppendMode: false
    }

    const createdChildren = createChildrenManager()
    turnOffAppendMode(createdChildren)

    setCreatedFragment(createdChildren, '0', createdFragment)
    setCreatedChild(createdChildren, '0.0', existingChild, createdFragment)

    const rvdElement = createRvdElement(
      RvdElementFlags.HtmlElement,
      'div',
      'test',
      null,
      null,
      null,
      'testKey'
    )

    const renderNewCallback = jest.fn()

    skipMoveOrRenderKeyedChild(
      rvdElement,
      '0.0',
      keyedMap,
      createdFragment,
      element,
      createdChildren,
      renderNewCallback
    )

    expect(createdFragment.fragmentChildKeys).toEqual({ testKey: '0.0' })
    expect(keyedMap.testKey).toBeUndefined()
    expect(renderNewCallback).toBeCalledWith(rvdElement, '0.0')
  })

  // eslint-disable-next-line max-len
  test('loadPreviousKeyedElements unsubscribe left keyed elements and load actual keyed elements', () => {
    const oldChildSub = new Subscription()
    const oldChildSubSpy = jest.spyOn(oldChildSub, 'unsubscribe')
    const oldCreatedChild = {
      index: '0.0',
      element: createDomElement('div', false),
      key: 'testKey',
      subscription: oldChildSub
    }

    const oldFragmentChildSub = new Subscription()
    const oldFragmentChildSubSpy = jest.spyOn(oldChildSub, 'unsubscribe')
    const oldFragmentChild = {
      index: '0.1.0',
      element: createDomElement('div', false),
      key: 'fragmentChild',
      subscription: oldFragmentChildSub
    }

    const oldFragmentSub = new Subscription()
    const oldFragmentSubSpy = jest.spyOn(oldChildSub, 'unsubscribe')

    const oldCreatedFragment: CreatedFragmentChild = {
      element: null,
      fragmentChildIndexes: ['0.1.0'],
      fragmentChildrenLength: 1,
      index: '0.1',
      fragmentChildKeys: {
        fragmentChild: '0.1.0'
      },
      key: 'fragment',
      subscription: oldFragmentSub,
      isInFragmentAppendMode: false
    }

    const keyedMap: Dictionary<KeyedChild> = {
      testKey: {
        index: '0.0',
        child: oldCreatedChild
      },
      fragment: {
        index: '0.1',
        child: oldCreatedFragment,
        fragmentChildren: [oldFragmentChild]
      }
    }

    const getChild = (index: string, key: string) => ({
      index,
      key,
      element: createDomElement('div', false)
    })

    const createdFragment: CreatedFragmentChild = {
      element: null,
      fragmentChildIndexes: ['0.0', '0.1', '0.2', '0.3'],
      fragmentChildrenLength: 4,
      index: '0',
      fragmentChildKeys: {
        'key-0': '0.0',
        'key-1': '0.1',
        'key-2': '0.2',
        'key-3': '0.3',
        'key-4': '0.4'
      },
      oldKeyElementMap: keyedMap,
      isInFragmentAppendMode: false
    }

    const createdChildren = createChildrenManager()
    turnOffAppendMode(createdChildren)

    setCreatedFragment(createdChildren, '0', createdFragment)
    setCreatedChild(createdChildren, '0.0', getChild('0.0', 'key-0'))
    setCreatedChild(createdChildren, '0.1', getChild('0.1', 'key-1'))
    setCreatedChild(createdChildren, '0.2', getChild('0.2', 'key-2'))
    setCreatedChild(createdChildren, '0.3', getChild('0.3', 'key-3'))
    setCreatedChild(createdChildren, '0.4.0', getChild('0.4.0', 'fragment-key-0'))

    const newFragmentChild: CreatedFragmentChild = {
      element: null,
      fragmentChildIndexes: ['0.4.0'],
      fragmentChildrenLength: 1,
      index: '0.4',
      fragmentChildKeys: {
        'fragment-key-0': '0.4.0'
      },
      isInFragmentAppendMode: false
    }

    setCreatedFragment(createdChildren, '0.4', newFragmentChild)

    const keyElementMap = loadPreviousKeyedElements(createdChildren, createdFragment)

    const expected = {
      'key-0': {
        index: '0.0',
        child: getChild('0.0', 'key-0')
      },
      'key-1': {
        index: '0.1',
        child: getChild('0.1', 'key-1')
      },
      'key-2': {
        index: '0.2',
        child: getChild('0.2', 'key-2')
      },
      'key-3': {
        index: '0.3',
        child: getChild('0.3', 'key-3')
      },
      'key-4': {
        index: '0.4',
        child: newFragmentChild,
        fragmentChildren: [getChild('0.4.0', 'fragment-key-0')]
      }
    }
    expect(keyElementMap).toEqual(expected)
    expect(oldChildSubSpy).toBeCalled()
    expect(oldFragmentChildSubSpy).toBeCalled()
    expect(oldFragmentSubSpy).toBeCalled()
  })
})
