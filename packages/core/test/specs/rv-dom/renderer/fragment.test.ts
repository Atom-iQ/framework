import { renderRvdFragment } from '../../../../src/reactive-virtual-dom/renderer/fragment'
import * as ELEMENTS from '../../../__mocks__/elements'
import { RvdCreatedFragment, RvdChild } from '../../../../src/shared/types'

import { elementRenderingContextTestUtilsFactory } from '../../../utils'
import { isRvdNode } from '../../../../src/reactive-virtual-dom/renderer/utils'
import { createEmptyFragment } from '../../../../src/reactive-virtual-dom/renderer/children-manager'
import { RvdNodeFlags } from '../../../../src/shared/flags'

const [initUtils] = elementRenderingContextTestUtilsFactory()

const onStart = initUtils(true)
const each = initUtils()

/* eslint-disable max-len */
describe('Fragment renderer - renderRvdFragment', () => {
  let [{ parentElement, createdChildren, sub, childIndex }, { renderChild }] = onStart()

  beforeEach(
    () => ([{ parentElement, createdChildren, sub, childIndex }, { renderChild }] = each())
  )

  // TODO: In next versions, treat is just as on Element
  test('Should render non-keyed fragment with one child and on re-call, re-create child', () => {
    const renderCallback = jest.fn(
      (child: RvdChild, index: string, context: {}, createdFragment?: RvdCreatedFragment) => {
        expect(child).toEqual(ELEMENTS.getFragmentChild('class-1'))
        expect(index).toEqual(`${childIndex}.0`)
        renderChild(index, createdFragment)
      }
    )

    createEmptyFragment(createdChildren, childIndex)

    renderRvdFragment(
      ELEMENTS.NON_KEYED_FRAGMENT_ONE_CHILD,
      childIndex,
      parentElement,
      createdChildren,
      sub,
      {},
      renderCallback
    )

    expect(renderCallback).toBeCalledTimes(1)

    expect(createdChildren.size).toBe(1)

    createdChildren.append = false

    renderRvdFragment(
      ELEMENTS.NON_KEYED_FRAGMENT_ONE_CHILD,
      childIndex,
      parentElement,
      createdChildren,
      sub,
      {},
      renderCallback
    )

    expect(createdChildren.size).toBe(1)
    expect(renderCallback).toBeCalledTimes(2)
  })

  test('Should render non-keyed fragment with multiple children, and on re-call, re-create children', () => {
    let elementIndex = 0
    const renderCallback = jest.fn(
      (child: RvdChild, index: string, context: {}, createdFragment?: RvdCreatedFragment) => {
        if (elementIndex === 2) {
          elementIndex = 0
        }
        expect(child).toEqual(ELEMENTS.getFragmentChild(`class-${elementIndex + 1}`))
        expect(index).toEqual(`${childIndex}.${elementIndex}`)
        renderChild(index, createdFragment)
        ++elementIndex
      }
    )

    createEmptyFragment(createdChildren, childIndex)

    renderRvdFragment(
      ELEMENTS.NON_KEYED_FRAGMENT_MULTIPLE_CHILDREN,
      childIndex,
      parentElement,
      createdChildren,
      sub,
      {},
      renderCallback
    )

    expect(createdChildren.size).toBe(2)
    createdChildren.append = false

    renderRvdFragment(
      ELEMENTS.NON_KEYED_FRAGMENT_MULTIPLE_CHILDREN,
      childIndex,
      parentElement,
      createdChildren,
      sub,
      {},
      renderCallback
    )

    expect(createdChildren.size).toBe(2)
    expect(renderCallback).toBeCalledTimes(4)
  })

  test('Should render keyed fragment with multiple children, and on re-call, with the same elements (no matter on order), should not re-create them', () => {
    let elementIndex = 0

    const renderCallback = jest.fn(
      (child: RvdChild, index: string, context: {}, createdFragment?: RvdCreatedFragment) => {
        if (elementIndex === 3) {
          elementIndex = 0
        }
        expect(child).toEqual(
          ELEMENTS.getFragmentChild(`class-${elementIndex + 1}`, String(elementIndex + 1))
        )
        expect(index).toEqual(`${childIndex}.${elementIndex}`)
        ++elementIndex
        renderChild(index, createdFragment)
      }
    )

    createEmptyFragment(createdChildren, childIndex)

    renderRvdFragment(
      ELEMENTS.KEYED_FRAGMENT,
      childIndex,
      parentElement,
      createdChildren,
      sub,
      {},
      renderCallback
    )

    expect(createdChildren.size).toBe(3)

    createdChildren.append = false

    renderRvdFragment(
      ELEMENTS.KEYED_FRAGMENT,
      childIndex,
      parentElement,
      createdChildren,
      sub,
      {},
      renderCallback
    )
    expect(createdChildren.size).toBe(3)

    renderRvdFragment(
      ELEMENTS.KEYED_FRAGMENT_CHANGED_ORDER,
      childIndex,
      parentElement,
      createdChildren,
      sub,
      {},
      renderCallback
    )
    expect(createdChildren.size).toBe(3)

    expect(renderCallback).toBeCalledTimes(3)
  })

  test('Should render keyed fragment with multiple children, and on re-call, with the new added elements, should create only new elements', () => {
    let elementIndex = 0

    const renderCallback = jest.fn(
      (child: RvdChild, index: string, context: {}, createdFragment?: RvdCreatedFragment) => {
        expect(child).toEqual(
          ELEMENTS.getFragmentChild(`class-${elementIndex + 1}`, String(elementIndex + 1))
        )
        expect(index).toEqual(`${childIndex}.${elementIndex}`)
        ++elementIndex
        renderChild(index, createdFragment)
      }
    )

    createEmptyFragment(createdChildren, childIndex)

    renderRvdFragment(
      ELEMENTS.KEYED_FRAGMENT,
      childIndex,
      parentElement,
      createdChildren,
      sub,
      {},
      renderCallback
    )
    expect(createdChildren.size).toBe(3)

    createdChildren.append = false

    renderRvdFragment(
      ELEMENTS.KEYED_FRAGMENT_ADDED_ITEMS,
      childIndex,
      parentElement,
      createdChildren,
      sub,
      {},
      renderCallback
    )
    expect(createdChildren.size).toBe(5)
    expect(renderCallback).toBeCalledTimes(5)
  })

  test('Should render keyed fragment with multiple children, and on re-call, with the some elements removed, should remove elements', () => {
    let elementIndex = 0

    const renderCallback = jest.fn(
      (child: RvdChild, index: string, context: {}, createdFragment?: RvdCreatedFragment) => {
        if (isRvdNode(child) && RvdNodeFlags.AnyFragment & child.flag) {
          expect(child).toEqual(ELEMENTS.NON_KEYED_FRAGMENT_WITH_KEY)
          createEmptyFragment(createdChildren, index, createdFragment)
        } else {
          expect(child).toEqual(
            ELEMENTS.getFragmentChild(`class-${elementIndex + 1}`, String(elementIndex + 1))
          )
          renderChild(index, createdFragment)
        }

        expect(index).toEqual(`${childIndex}.${elementIndex}`)
        ++elementIndex
      }
    )

    createEmptyFragment(createdChildren, childIndex)

    renderRvdFragment(
      ELEMENTS.KEYED_FRAGMENT,
      childIndex,
      parentElement,
      createdChildren,
      sub,
      {},
      renderCallback
    )
    expect(createdChildren.size).toBe(3)

    createdChildren.append = false

    renderRvdFragment(
      ELEMENTS.KEYED_FRAGMENT_ADDED_ITEMS_FRAGMENT,
      childIndex,
      parentElement,
      createdChildren,
      sub,
      {},
      renderCallback
    )
    expect(createdChildren.size).toBe(5)

    renderRvdFragment(
      ELEMENTS.KEYED_FRAGMENT_REMOVED_ITEMS,
      childIndex,
      parentElement,
      createdChildren,
      sub,
      {},
      renderCallback
    )

    expect(createdChildren.size).toBe(2)

    expect(renderCallback).toBeCalledTimes(6)
  })

  test('Should render fragment with multiple keyed and non-keyed children, and on re-call, with elements removed, should remove excessive elements', () => {
    let elementIndex = 0

    const renderCallback = jest.fn(
      (child: RvdChild, index: string, context: {}, createdFragment?: RvdCreatedFragment) => {
        if (elementIndex === 4) {
          elementIndex = 0
        }
        expect(child).toEqual(
          index === '2.2' || index === '2.3'
            ? ELEMENTS.getFragmentChild(`class-${elementIndex + 1}`)
            : ELEMENTS.getFragmentChild(`class-${elementIndex + 1}`, String(elementIndex + 1))
        )
        expect(index).toEqual(`${childIndex}.${elementIndex}`)
        ++elementIndex
        renderChild(index, createdFragment)
      }
    )

    createEmptyFragment(createdChildren, childIndex)

    renderRvdFragment(
      ELEMENTS.MIXED_FRAGMENT,
      childIndex,
      parentElement,
      createdChildren,
      sub,
      {},
      renderCallback
    )

    expect(createdChildren.size).toBe(4)

    createdChildren.append = false

    renderRvdFragment(
      ELEMENTS.KEYED_FRAGMENT_REMOVED_ITEMS,
      childIndex,
      parentElement,
      createdChildren,
      sub,
      {},
      renderCallback
    )
    expect(createdChildren.size).toBe(2)

    expect(renderCallback).toBeCalledTimes(4)
  })
})
