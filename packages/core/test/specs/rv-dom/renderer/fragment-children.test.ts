import {
  CreatedFragmentChild,
  CreatedNodeChild,
  Dictionary,
  KeyedChild,
  RvdChild,
  RvdStaticChild,
  RxSub
} from '../../../../src/shared/types'
import { Observable, Subscription } from 'rxjs'
import {
  loadPreviousKeyedElements,
  renderFragmentChild,
  renderNonKeyedStaticFragmentChild,
  skipMoveOrRenderKeyedChild,
  refreshFragmentChildKey
} from '../../../../src/rv-dom/renderer/fragment-children'
import * as ELEMENTS from '../../../__mocks__/elements'
import { createDomElement } from '../../../../src/rv-dom/renderer/utils'
import createChildrenManager from '../../../../src/rv-dom/renderer/utils/children-manager'
import { createRvdElement } from '../../../../src/rv-dom/create-element'
import { RvdElementFlags } from '../../../../src/shared/flags'

const observableElement = element =>
  new Observable<RvdStaticChild>(observer => observer.next(element))

describe('Fragment children renderer', () => {
  let sub: RxSub
  let subSpy: jest.SpyInstance

  beforeEach(() => {
    sub = new Subscription()
    subSpy = jest.spyOn(sub, 'add')
  })

  test('renderFragmentChild should call non-keyed callback for static non-keyed elements', () => {
    const keyedCallback = jest.fn()
    const nonKeyedCallback = jest.fn()

    const children = [
      ELEMENTS.CLASSNAME,
      ELEMENTS.EMPTY,
      ELEMENTS.NON_KEYED_FRAGMENT_ONE_CHILD,
      ELEMENTS.KEYED_FRAGMENT,
      'Text'
    ]

    children.forEach(renderFragmentChild('0', sub, true, keyedCallback, nonKeyedCallback))

    children.forEach(renderFragmentChild('1', sub, false, keyedCallback, nonKeyedCallback))

    expect(subSpy).not.toBeCalled()
    expect(keyedCallback).not.toBeCalled()
    expect(nonKeyedCallback).toBeCalledTimes(10)
  })

  test('renderFragmentChild should call non-keyed callback for non-keyed elements', () => {
    const keyedCallback = jest.fn()
    const nonKeyedCallback = jest.fn()

    const children: RvdChild[] = [
      ELEMENTS.CLASSNAME,
      ELEMENTS.EMPTY,
      observableElement(ELEMENTS.CLASSNAME),
      observableElement(ELEMENTS.EMPTY),
      'Text'
    ]

    children.forEach(renderFragmentChild('0', sub, false, keyedCallback, nonKeyedCallback))

    expect(subSpy).toBeCalledTimes(2)
    expect(keyedCallback).not.toBeCalled()
    expect(nonKeyedCallback).toBeCalledTimes(5)
  })

  test('renderFragmentChild should call keyed callback for static keyed elements', () => {
    const keyedCallback = jest.fn()
    const nonKeyedCallback = jest.fn()

    const children = [
      ELEMENTS.CLASSNAME_KEY('a'),
      ELEMENTS.CLASSNAME_KEY('b'),
      ELEMENTS.CLASSNAME_KEY('c'),
      ELEMENTS.CLASSNAME_KEY('d'),
      'Text'
    ]

    children.forEach(renderFragmentChild('0', sub, true, keyedCallback, nonKeyedCallback))

    children.forEach(renderFragmentChild('1', sub, false, keyedCallback, nonKeyedCallback))

    expect(subSpy).not.toBeCalled()
    expect(keyedCallback).toBeCalledTimes(8)
    expect(nonKeyedCallback).toBeCalledTimes(2)
  })

  test('renderFragmentChild should call keyed callback for keyed elements', () => {
    const keyedCallback = jest.fn()
    const nonKeyedCallback = jest.fn()

    const children: RvdChild[] = [
      observableElement(ELEMENTS.CLASSNAME_KEY('a')),
      observableElement(ELEMENTS.CLASSNAME_KEY('b')),
      observableElement(ELEMENTS.CLASSNAME_KEY('c')),
      observableElement(ELEMENTS.CLASSNAME_KEY('d')),
      'Text'
    ]

    children.forEach(renderFragmentChild('0', sub, false, keyedCallback, nonKeyedCallback))

    expect(subSpy).toBeCalledTimes(4)
    expect(keyedCallback).toBeCalledTimes(4)
    expect(nonKeyedCallback).toBeCalledTimes(1)
  })

  test('renderNonKeyedStaticFragmentChild should call render callback with child index', () => {
    const renderCallback = jest.fn()

    const children = [
      ELEMENTS.CLASSNAME,
      ELEMENTS.EMPTY,
      ELEMENTS.NON_KEYED_FRAGMENT_ONE_CHILD,
      ELEMENTS.KEYED_FRAGMENT,
      'Text'
    ]

    children.forEach(renderNonKeyedStaticFragmentChild('0', renderCallback))
    expect(renderCallback).toBeCalledTimes(5)
  })

  test('refreshFragmentChildKey add keyed child to new keyed children', () => {
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
      element: '_F_',
      fragmentChildIndexes: [],
      fragmentChildrenLength: 0,
      index: '0',
      fragmentChildKeys: {}
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
      element: '_F_',
      fragmentChildIndexes: ['0.0'],
      fragmentChildrenLength: 1,
      index: '0',
      fragmentChildKeys: {}
    }

    const createdChildren = createChildrenManager()

    createdChildren.addFragment('0', createdFragment)

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
      keyedMap,
      createdFragment,
      element,
      createdChildren,
      jest.fn()
    )(rvdElement, '0.0')

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
      element: '_F_',
      fragmentChildIndexes: ['0.0'],
      fragmentChildrenLength: 1,
      index: '0',
      fragmentChildKeys: {}
    }

    const createdChildren = createChildrenManager()

    createdChildren.addFragment('0', createdFragment)
    createdChildren.add('0.0', createdChild)

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
      keyedMap,
      createdFragment,
      element,
      createdChildren,
      jest.fn()
    )(rvdElement, '0.1')

    expect(createdFragment.fragmentChildKeys).toEqual({ testKey: '0.1' })
    expect(keyedMap.testKey).toBeUndefined()
    expect(createdChildren.get('0.0')).toBeUndefined()
    expect(createdChildren.get('0.1')).toEqual({
      ...createdChild,
      index: '0.1'
    })
  })
  // eslint-disable-next-line max-len
  test('skipMoveOrRenderKeyedChild should move keyed fragment, when new fragment with same key is on different position', () => {
    const element = createDomElement('div', false)

    const childFragment: CreatedFragmentChild = {
      element: '_F_',
      fragmentChildIndexes: [],
      fragmentChildrenLength: 1,
      index: '0.0',
      fragmentChildKeys: {},
      key: 'testKey'
    }

    const keyedMap: Dictionary<KeyedChild> = {
      testKey: {
        index: '0.0',
        child: childFragment,
        fragmentChildren: []
      }
    }

    const createdFragment: CreatedFragmentChild = {
      element: '_F_',
      fragmentChildIndexes: ['0.0'],
      fragmentChildrenLength: 1,
      index: '0',
      fragmentChildKeys: {}
    }

    const createdChildren = createChildrenManager()

    createdChildren.addFragment('0', createdFragment)
    createdChildren.addFragment('0.0', childFragment)

    const rvdElement = ELEMENTS.NON_KEYED_FRAGMENT_WITH_KEY

    skipMoveOrRenderKeyedChild(
      keyedMap,
      createdFragment,
      element,
      createdChildren,
      jest.fn()
    )(rvdElement, '0.1')

    expect(createdFragment.fragmentChildKeys).toEqual({ testKey: '0.1' })
    expect(keyedMap.testKey).toBeUndefined()
    expect(createdChildren.getFragment('0.0')).toBeUndefined()
    expect(createdChildren.getFragment('0.1')).toEqual({
      ...childFragment,
      index: '0.1'
    })
  })

  // eslint-disable-next-line max-len
  test('skipMoveOrRenderKeyedChild should call renderNewCallback when keyed element is not saved', () => {
    const element = createDomElement('div', false)

    const keyedMap: Dictionary<KeyedChild> = {}

    const createdFragment: CreatedFragmentChild = {
      element: '_F_',
      fragmentChildIndexes: ['0.0'],
      fragmentChildrenLength: 1,
      index: '0',
      fragmentChildKeys: {}
    }

    const createdChildren = createChildrenManager()

    createdChildren.addFragment('0', createdFragment)

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
      keyedMap,
      createdFragment,
      element,
      createdChildren,
      renderNewCallback
    )(rvdElement, '0.0')

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
      element: '_F_',
      fragmentChildIndexes: ['0.0'],
      fragmentChildrenLength: 1,
      index: '0',
      fragmentChildKeys: {
        testKey: '0.0'
      }
    }

    const createdChildren = createChildrenManager()

    createdChildren.addFragment('0', createdFragment)
    createdChildren.add('0.0', existingChild)

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
      keyedMap,
      createdFragment,
      element,
      createdChildren,
      renderNewCallback
    )(rvdElement, '0.0')

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
      element: '_F_',
      fragmentChildIndexes: ['0.1.0'],
      fragmentChildrenLength: 1,
      index: '0.1',
      fragmentChildKeys: {
        fragmentChild: '0.1.0'
      },
      key: 'fragment',
      subscription: oldFragmentSub
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
      element: '_F_',
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
      oldKeyElementMap: keyedMap
    }

    const createdChildren = createChildrenManager()

    createdChildren.addFragment('0', createdFragment)
    createdChildren.add('0.0', getChild('0.0', 'key-0'))
    createdChildren.add('0.1', getChild('0.1', 'key-1'))
    createdChildren.add('0.2', getChild('0.2', 'key-2'))
    createdChildren.add('0.3', getChild('0.3', 'key-3'))
    createdChildren.add('0.4.0', getChild('0.4.0', 'fragment-key-0'))
    const newFragmentChild: CreatedFragmentChild = {
      element: '_F_',
      fragmentChildIndexes: ['0.4.0'],
      fragmentChildrenLength: 1,
      index: '0.4',
      fragmentChildKeys: {
        'fragment-key-0': '0.4.0'
      }
    }

    createdChildren.addFragment('0.4', newFragmentChild)

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
