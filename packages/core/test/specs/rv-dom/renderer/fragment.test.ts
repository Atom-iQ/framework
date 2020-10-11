import { renderRvdFragment } from '../../../../src/rv-dom/renderer/fragment'
import * as ELEMENTS from '../../../__mocks__/elements'
import { RvdChild } from '../../../../src/shared/types'

import { elementRenderingContextTestUtilsFactory } from '../../../utils'
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
    const renderCallback = jest.fn((child: RvdChild, index: string) => {
      expect(child).toEqual(ELEMENTS.getFragmentChild('class-1'))
      expect(index).toEqual(`${childIndex}.0`)
      renderChild(index)
    })

    createdChildren.createEmptyFragment(childIndex)

    renderRvdFragment(
      childIndex,
      parentElement,
      createdChildren,
      sub,
      renderCallback
    )(ELEMENTS.NON_KEYED_FRAGMENT_ONE_CHILD)

    expect(createdChildren.size()).toBe(1)

    renderRvdFragment(
      childIndex,
      parentElement,
      createdChildren,
      sub,
      renderCallback
    )(ELEMENTS.NON_KEYED_FRAGMENT_ONE_CHILD)

    expect(createdChildren.size()).toBe(1)
    expect(renderCallback).toBeCalledTimes(2)
  })

  test('Should render non-keyed fragment with multiple children, and on re-call, re-create children', () => {
    let elementIndex = 0
    const renderCallback = jest.fn((child: RvdChild, index: string) => {
      if (elementIndex === 2) {
        elementIndex = 0
      }
      expect(child).toEqual(ELEMENTS.getFragmentChild(`class-${elementIndex + 1}`))
      expect(index).toEqual(`${childIndex}.${elementIndex}`)
      renderChild(index)
      ++elementIndex
    })

    createdChildren.createEmptyFragment(childIndex)

    renderRvdFragment(
      childIndex,
      parentElement,
      createdChildren,
      sub,
      renderCallback
    )(ELEMENTS.NON_KEYED_FRAGMENT_MULTIPLE_CHILDREN)

    expect(createdChildren.size()).toBe(2)

    renderRvdFragment(
      childIndex,
      parentElement,
      createdChildren,
      sub,
      renderCallback
    )(ELEMENTS.NON_KEYED_FRAGMENT_MULTIPLE_CHILDREN)

    expect(createdChildren.size()).toBe(2)
    expect(renderCallback).toBeCalledTimes(4)
  })

  test('Should render keyed fragment with multiple children, and on re-call, with the same elements (no matter on order), should not re-create them', () => {
    let elementIndex = 0

    const renderCallback = jest.fn((child: RvdChild, index: string) => {
      if (elementIndex === 3) {
        elementIndex = 0
      }
      expect(child).toEqual(
        ELEMENTS.getFragmentChild(`class-${elementIndex + 1}`, String(elementIndex + 1))
      )
      expect(index).toEqual(`${childIndex}.${elementIndex}`)
      ++elementIndex
      renderChild(index)
    })

    createdChildren.createEmptyFragment(childIndex)

    renderRvdFragment(
      childIndex,
      parentElement,
      createdChildren,
      sub,
      renderCallback
    )(ELEMENTS.KEYED_FRAGMENT)

    expect(createdChildren.size()).toBe(3)

    renderRvdFragment(
      childIndex,
      parentElement,
      createdChildren,
      sub,
      renderCallback
    )(ELEMENTS.KEYED_FRAGMENT)
    expect(createdChildren.size()).toBe(3)

    renderRvdFragment(
      childIndex,
      parentElement,
      createdChildren,
      sub,
      renderCallback
    )(ELEMENTS.KEYED_FRAGMENT_CHANGED_ORDER)
    expect(createdChildren.size()).toBe(3)

    expect(renderCallback).toBeCalledTimes(3)
  })

  test('Should render keyed fragment with multiple children, and on re-call, with the new added elements, should create only new elements', () => {
    let elementIndex = 0

    const renderCallback = jest.fn((child: RvdChild, index: string) => {
      expect(child).toEqual(
        ELEMENTS.getFragmentChild(`class-${elementIndex + 1}`, String(elementIndex + 1))
      )
      expect(index).toEqual(`${childIndex}.${elementIndex}`)
      ++elementIndex
      renderChild(index)
    })

    createdChildren.createEmptyFragment(childIndex)

    renderRvdFragment(
      childIndex,
      parentElement,
      createdChildren,
      sub,
      renderCallback
    )(ELEMENTS.KEYED_FRAGMENT)
    expect(createdChildren.size()).toBe(3)

    renderRvdFragment(
      childIndex,
      parentElement,
      createdChildren,
      sub,
      renderCallback
    )(ELEMENTS.KEYED_FRAGMENT_ADDED_ITEMS)
    expect(createdChildren.size()).toBe(5)
    expect(renderCallback).toBeCalledTimes(5)
  })

  test('Should render keyed fragment with multiple children, and on re-call, with the some elements removed, should remove elements', () => {
    let elementIndex = 0

    const renderCallback = jest.fn((child: RvdChild, index: string) => {
      expect(child).toEqual(
        ELEMENTS.getFragmentChild(`class-${elementIndex + 1}`, String(elementIndex + 1))
      )
      expect(index).toEqual(`${childIndex}.${elementIndex}`)
      ++elementIndex
      renderChild(index)
    })

    createdChildren.createEmptyFragment(childIndex)

    renderRvdFragment(
      childIndex,
      parentElement,
      createdChildren,
      sub,
      renderCallback
    )(ELEMENTS.KEYED_FRAGMENT)
    expect(createdChildren.size()).toBe(3)

    renderRvdFragment(
      childIndex,
      parentElement,
      createdChildren,
      sub,
      renderCallback
    )(ELEMENTS.KEYED_FRAGMENT_ADDED_ITEMS)
    expect(createdChildren.size()).toBe(5)

    renderRvdFragment(
      childIndex,
      parentElement,
      createdChildren,
      sub,
      renderCallback
    )(ELEMENTS.KEYED_FRAGMENT_REMOVED_ITEMS)

    expect(createdChildren.size()).toBe(2)

    expect(renderCallback).toBeCalledTimes(5)
  })
})
