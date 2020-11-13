// TODO: Implement
import { RvdChildrenManager } from '../../../../../src/shared/types'
import { renderChildInIndexPosition } from '../../../../../src/reactive-virtual-dom/renderer/dom-renderer'
import { createDomElement } from '../../../../../src/reactive-virtual-dom/renderer/utils'
import {
  createChildrenManager,
  createEmptyFragment,
  setCreatedChild
} from '../../../../../src/reactive-virtual-dom/renderer/children-manager'
import { nullRenderCallback } from '../../../../../src/reactive-virtual-dom/renderer/render-callback/null'
/* eslint-disable max-len */
describe('Null render callback', () => {
  let manager: RvdChildrenManager
  let parentElement: Element
  const childIndex = '2'

  const renderChild = index => {
    const element = createDomElement('div', false)
    renderChildInIndexPosition(element, index, parentElement, manager)
    setCreatedChild(manager, index, {
      index,
      element,
      type: 'div'
    })
  }

  beforeEach(() => {
    manager = createChildrenManager()
    manager.append = false
    parentElement = createDomElement('div', false)
  })

  test('nullRenderCallback should remove node on given position, when there is one element/text rendered on that position before', () => {
    renderChild('0')
    renderChild('1')
    renderChild('2')
    renderChild('3')
    renderChild('4')
    expect(parentElement.childNodes[2]).toEqual(createDomElement('div', false))
    nullRenderCallback(childIndex, parentElement, manager)
    // index 3 moved to position 2
    expect(parentElement.childNodes[2]).toEqual(createDomElement('div', false))
    expect(parentElement.childNodes[5]).toBeUndefined()
    expect(parentElement.childNodes.length).toBe(4)
  })

  test('nullRenderCallback should remove nodes from fragment on given position, when there is many elements/texts rendered on that position before', () => {
    renderChild('0')
    renderChild('1')
    createEmptyFragment(manager, '2')
    const childFragment = manager.fragmentChildren['2']
    renderChild('2.0')
    childFragment.indexes = childFragment.indexes.concat('2.0')
    ++childFragment.size
    renderChild('2.1')
    childFragment.indexes = childFragment.indexes.concat('2.1')
    ++childFragment.size
    renderChild('2.2')
    childFragment.indexes = childFragment.indexes.concat('2.2')
    ++childFragment.size
    renderChild('2.3')
    childFragment.indexes = childFragment.indexes.concat('2.3')
    ++childFragment.size

    expect(parentElement.childNodes[2]).toEqual(createDomElement('div', false))
    expect(parentElement.childNodes[3]).toEqual(createDomElement('div', false))
    expect(parentElement.childNodes[4]).toEqual(createDomElement('div', false))
    expect(parentElement.childNodes[5]).toEqual(createDomElement('div', false))
    nullRenderCallback(childIndex, parentElement, manager)
    expect(parentElement.childNodes[2]).toBeUndefined()
    expect(parentElement.childNodes[3]).toBeUndefined()
    expect(parentElement.childNodes[4]).toBeUndefined()
    expect(parentElement.childNodes[5]).toBeUndefined()
    expect(parentElement.childNodes.length).toBe(2)
  })
})
