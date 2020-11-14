import { RvdChildrenManager } from '../../../../../src/shared/types'
import { renderChildInIndexPosition } from '../../../../../src/reactive-virtual-dom/renderer/dom-renderer'
import {
  createDomElement,
  createTextNode
} from '../../../../../src/reactive-virtual-dom/renderer/utils'
import {
  createChildrenManager,
  createEmptyFragment,
  setCreatedChild
} from '../../../../../src/reactive-virtual-dom/renderer/children-manager'
import { textRenderCallback } from '../../../../../src/reactive-virtual-dom/renderer/render-callback/text'
import { Subscription } from 'rxjs'
/* eslint-disable max-len */
describe('Text render callback', () => {
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

  test('static textRenderCallback should render Text node on given position', () => {
    renderChild('0')
    renderChild('1')
    renderChild('3')
    renderChild('4')
    textRenderCallback(
      'test',
      childIndex,
      parentElement,
      manager,
      new Subscription(),
      undefined,
      true
    )
    expect(parentElement.childNodes[2]).toEqual(createTextNode('test'))
  })

  test('textRenderCallback should render Text node on given position, when there is nothing rendered on that position before', () => {
    renderChild('0')
    renderChild('1')
    renderChild('3')
    renderChild('4')
    textRenderCallback('test', childIndex, parentElement, manager, new Subscription())
    expect(parentElement.childNodes[2]).toEqual(createTextNode('test'))
  })

  test('textRenderCallback should replace node on given position for Text node, when there is one element/text rendered on that position before', () => {
    renderChild('0')
    renderChild('1')
    renderChild('2')
    renderChild('3')
    renderChild('4')
    expect(parentElement.childNodes[2]).toEqual(createDomElement('div', false))
    textRenderCallback('test', childIndex, parentElement, manager, new Subscription())
    expect(parentElement.childNodes[2]).toEqual(createTextNode('test'))
  })

  test('textRenderCallback should replace nodes from fragment on given position for Text node, when there is many elements/texts rendered on that position before', () => {
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
    textRenderCallback('test', childIndex, parentElement, manager, new Subscription())
    expect(parentElement.childNodes[2]).toEqual(createTextNode('test'))
    expect(parentElement.childNodes[3]).toBeUndefined()
    expect(parentElement.childNodes[4]).toBeUndefined()
    expect(parentElement.childNodes[5]).toBeUndefined()
  })
})
