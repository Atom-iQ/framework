import { RvdCreatedFragment, RvdCreatedNode } from '../../../../src/shared/types'
import { skipMoveOrRenderKeyedChild } from '../../../../src/reactive-virtual-dom/renderer/fragment-children'
import * as ELEMENTS from '../../../__mocks__/elements'
import { createDomElement } from '../../../../src/reactive-virtual-dom/renderer/utils'
import {
  createChildrenManager,
  setCreatedChild,
  setCreatedFragment
} from '../../../../src/reactive-virtual-dom/renderer/children-manager'
import { RvdNodeFlags } from '../../../../src/shared/flags'
import { createRvdElement } from '../../../utils'

describe('Fragment children renderer', () => {
  // eslint-disable-next-line max-len
  test('skipMoveOrRenderKeyedChild should skip rendering keyed child, when new child with same key is on the same position', () => {
    const element = createDomElement('div', false)

    const createdFragment: RvdCreatedFragment = {
      indexes: ['0.0'],
      size: 1,
      index: '0',
      keys: {},
      oldKeys: {
        testKey: '0.0'
      },
      append: false
    }

    const createdChildren = createChildrenManager()

    createdChildren.append = false

    setCreatedChild(createdChildren, '0.0', {
      index: '0.0',
      element: createDomElement('div', false),
      key: 'testKey',
      type: 'div'
    })

    setCreatedFragment(createdChildren, '0', createdFragment)

    const rvdElement = createRvdElement(
      RvdNodeFlags.HtmlElement,
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
      createdFragment,
      element,
      createdChildren,
      {},
      jest.fn()
    )

    expect(createdFragment.keys).toEqual({ testKey: '0.0' })
    expect(createdFragment.oldKeys.testKey).toBeUndefined()
  })

  // eslint-disable-next-line max-len
  test('skipMoveOrRenderKeyedChild should move keyed child, when new child with the same key is on different position', () => {
    const element = createDomElement('div', false)

    const createdChild: RvdCreatedNode = {
      index: '0.0',
      element: createDomElement('div', false),
      key: 'testKey',
      type: 'div'
    }

    const createdFragment: RvdCreatedFragment = {
      indexes: ['0.0'],
      size: 1,
      index: '0',
      keys: {},
      oldKeys: {
        testKey: '0.0'
      },
      append: false
    }

    const createdChildren = createChildrenManager()
    createdChildren.append = false

    setCreatedFragment(createdChildren, '0', createdFragment)
    setCreatedChild(createdChildren, '0.0', createdChild)

    const rvdElement = createRvdElement(
      RvdNodeFlags.HtmlElement,
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
      createdFragment,
      element,
      createdChildren,
      {},
      jest.fn()
    )

    expect(createdFragment.keys).toEqual({ testKey: '0.1' })
    expect(createdFragment.oldKeys.testKey).toBeUndefined()
    expect(createdChildren.children['0.0']).toBeUndefined()
    expect(createdChildren.children['0.1']).toEqual({
      ...createdChild,
      index: '0.1'
    })
  })
  // eslint-disable-next-line max-len
  test('skipMoveOrRenderKeyedChild should move keyed fragment, when new fragment with same key is on different position', () => {
    const element = createDomElement('div', false)

    const childFragment: RvdCreatedFragment = {
      indexes: [],
      size: 1,
      index: '0.0',
      keys: {},
      key: 'testKey',
      append: false
    }

    const createdFragment: RvdCreatedFragment = {
      indexes: ['0.0'],
      size: 1,
      index: '0',
      keys: {},
      oldKeys: {
        testKey: '0.0'
      },
      append: false
    }

    const createdChildren = createChildrenManager()
    createdChildren.append = false

    setCreatedFragment(createdChildren, '0', createdFragment)
    setCreatedFragment(createdChildren, '0.0', childFragment)

    const rvdElement = ELEMENTS.NON_KEYED_FRAGMENT_WITH_KEY

    skipMoveOrRenderKeyedChild(
      rvdElement,
      '0.1',
      createdFragment,
      element,
      createdChildren,
      {},
      jest.fn()
    )

    expect(createdFragment.keys).toEqual({ testKey: '0.1' })
    expect(createdFragment.oldKeys.testKey).toBeUndefined()
    expect(createdChildren.fragmentChildren['0.0']).toBeUndefined()
    expect(createdChildren.fragmentChildren['0.1']).toEqual({
      ...childFragment,
      index: '0.1'
    })
  })

  // eslint-disable-next-line max-len
  test('skipMoveOrRenderKeyedChild should call renderNewCallback when keyed element is not saved', () => {
    const element = createDomElement('div', false)

    const createdFragment: RvdCreatedFragment = {
      indexes: ['0.0'],
      size: 1,
      index: '0',
      keys: {},
      oldKeys: {},
      append: false
    }

    const createdChildren = createChildrenManager()
    createdChildren.append = false

    setCreatedFragment(createdChildren, '0', createdFragment)

    const rvdElement = createRvdElement(
      RvdNodeFlags.HtmlElement,
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
      createdFragment,
      element,
      createdChildren,
      {},
      renderNewCallback
    )

    expect(createdFragment.keys).toEqual({ testKey: '0.0' })
    expect(createdFragment.oldKeys.testKey).toBeUndefined()
    expect(renderNewCallback).toBeCalledWith(rvdElement, '0.0', {}, createdFragment)
  })

  // eslint-disable-next-line max-len
  test('skipMoveOrRenderKeyedChild should call renderNewCallback when keyed element has different type', () => {
    const element = createDomElement('div', false)

    const existingChild: RvdCreatedNode = {
      element: createDomElement('span', false),
      index: '0.0',
      type: 'span',
      key: 'testKey'
    }

    const createdFragment: RvdCreatedFragment = {
      indexes: [],
      size: 1,
      index: '0',
      keys: {},
      oldKeys: {
        testKey: '0.0'
      },
      append: false
    }

    const createdChildren = createChildrenManager()
    createdChildren.append = false

    setCreatedFragment(createdChildren, '0', createdFragment)
    setCreatedChild(createdChildren, '0.0', existingChild, createdFragment)

    const rvdElement = createRvdElement(
      RvdNodeFlags.HtmlElement,
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
      createdFragment,
      element,
      createdChildren,
      {},
      renderNewCallback
    )

    expect(createdFragment.keys).toEqual({ testKey: '0.0' })
    expect(createdFragment.oldKeys.testKey).toBeUndefined()
    expect(renderNewCallback).toBeCalledWith(rvdElement, '0.0', {}, createdFragment)
  })

  // eslint-disable-next-line max-len
  test('TODO: reload keys', () => {
    expect(true).toBeTruthy()
  })
})
