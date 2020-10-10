// TODO: Implement
import { CreatedChildrenManager } from '../../../../../src/shared/types'
import { renderChildInIndexPosition } from '../../../../../src/rv-dom/renderer/dom-renderer'
import { createDomElement, createTextNode } from '../../../../../src/rv-dom/renderer/utils'
import createChildrenManager from '../../../../../src/rv-dom/renderer/utils/children-manager'
import {
  staticTextRenderCallback,
  textRenderCallback
} from '../../../../../src/rv-dom/renderer/render-callback/text'
import nullRenderCallback from '../../../../../src/rv-dom/renderer/render-callback/null'
/* eslint-disable max-len */
describe('Null render callback', () => {
  let createdChildren: CreatedChildrenManager
  let parentElement: Element
  const childIndex = '2'

  const renderChild = index =>
    renderChildInIndexPosition(
      newChild => {
        if (createdChildren.has(newChild.index)) {
          createdChildren.replace(newChild.index, newChild)
        } else {
          createdChildren.add(newChild.index, newChild)
        }
      },
      createDomElement('div', false),
      index,
      parentElement,
      createdChildren
    )

  beforeEach(() => {
    createdChildren = createChildrenManager()
    parentElement = createDomElement('div', false)
  })

  test('nullRenderCallback should remove node on given position, when there is one element/text rendered on that position before', () => {
    renderChild('0')
    renderChild('1')
    renderChild('2')
    renderChild('3')
    renderChild('4')
    expect(parentElement.childNodes[2]).toEqual(createDomElement('div', false))
    nullRenderCallback(childIndex, parentElement, createdChildren)()
    // index 3 moved to position 2
    expect(parentElement.childNodes[2]).toEqual(createDomElement('div', false))
    expect(parentElement.childNodes[5]).toBeUndefined()
    expect(parentElement.childNodes.length).toBe(4)
  })

  test('nullRenderCallback should remove nodes from fragment on given position, when there is many elements/texts rendered on that position before', () => {
    renderChild('0')
    renderChild('1')
    createdChildren.createEmptyFragment('2')
    const childFragment = createdChildren.getFragment('2')
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
    nullRenderCallback(childIndex, parentElement, createdChildren)()
    expect(parentElement.childNodes[2]).toBeUndefined()
    expect(parentElement.childNodes[3]).toBeUndefined()
    expect(parentElement.childNodes[4]).toBeUndefined()
    expect(parentElement.childNodes[5]).toBeUndefined()
    expect(parentElement.childNodes.length).toBe(2)
  })
})
