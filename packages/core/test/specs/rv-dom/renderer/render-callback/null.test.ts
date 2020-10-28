// TODO: Implement
import { CreatedChildrenManager } from '../../../../../src/shared/types'
import { renderChildInIndexPosition } from '../../../../../src/rv-dom/renderer/dom-renderer'
import { createDomElement } from '../../../../../src/rv-dom/renderer/utils'
import {
  createChildrenManager,
  createEmptyFragment,
  setCreatedChild
} from '../../../../../src/rv-dom/renderer/utils/children-manager'
import nullRenderCallback from '../../../../../src/rv-dom/renderer/render-callback/null'
/* eslint-disable max-len */
describe('Null render callback', () => {
  let manager: CreatedChildrenManager
  let parentElement: Element
  const childIndex = '2'

  const renderChild = index =>
    renderChildInIndexPosition(
      newChild => {
        setCreatedChild(manager, newChild.index, newChild)
      },
      createDomElement('div', false),
      index,
      parentElement,
      manager
    )

  beforeEach(() => {
    manager = createChildrenManager()
    parentElement = createDomElement('div', false)
  })

  test('nullRenderCallback should remove node on given position, when there is one element/text rendered on that position before', () => {
    renderChild('0')
    renderChild('1')
    renderChild('2')
    renderChild('3')
    renderChild('4')
    expect(parentElement.childNodes[2]).toEqual(createDomElement('div', false))
    nullRenderCallback(childIndex, parentElement, manager)()
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
    childFragment.fragmentChildIndexes = childFragment.fragmentChildIndexes.concat('2.0')
    ++childFragment.fragmentChildrenLength
    renderChild('2.1')
    childFragment.fragmentChildIndexes = childFragment.fragmentChildIndexes.concat('2.1')
    ++childFragment.fragmentChildrenLength
    renderChild('2.2')
    childFragment.fragmentChildIndexes = childFragment.fragmentChildIndexes.concat('2.2')
    ++childFragment.fragmentChildrenLength
    renderChild('2.3')
    childFragment.fragmentChildIndexes = childFragment.fragmentChildIndexes.concat('2.3')
    ++childFragment.fragmentChildrenLength

    expect(parentElement.childNodes[2]).toEqual(createDomElement('div', false))
    expect(parentElement.childNodes[3]).toEqual(createDomElement('div', false))
    expect(parentElement.childNodes[4]).toEqual(createDomElement('div', false))
    expect(parentElement.childNodes[5]).toEqual(createDomElement('div', false))
    nullRenderCallback(childIndex, parentElement, manager)()
    expect(parentElement.childNodes[2]).toBeUndefined()
    expect(parentElement.childNodes[3]).toBeUndefined()
    expect(parentElement.childNodes[4]).toBeUndefined()
    expect(parentElement.childNodes[5]).toBeUndefined()
    expect(parentElement.childNodes.length).toBe(2)
  })
})
