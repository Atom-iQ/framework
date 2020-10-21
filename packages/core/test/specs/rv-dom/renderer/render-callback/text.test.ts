import { CreatedChildrenManager } from '../../../../../src/shared/types'
import { renderChildInIndexPosition } from '../../../../../src/rv-dom/renderer/dom-renderer'
import { createDomElement, createTextNode } from '../../../../../src/rv-dom/renderer/utils'
import createChildrenManager from '../../../../../src/rv-dom/renderer/utils/children-manager'
import { textRenderCallback } from '../../../../../src/rv-dom/renderer/render-callback/text'
import { Subscription } from 'rxjs'
/* eslint-disable max-len */
describe('Text render callback', () => {
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

  test('static textRenderCallback should render Text node on given position', () => {
    renderChild('0')
    renderChild('1')
    renderChild('3')
    renderChild('4')
    textRenderCallback(
      childIndex,
      parentElement,
      createdChildren,
      new Subscription(),
      undefined,
      true
    )('test')
    expect(parentElement.childNodes[2]).toEqual(createTextNode('test'))
  })

  test('textRenderCallback should render Text node on given position, when there is nothing rendered on that position before', () => {
    renderChild('0')
    renderChild('1')
    renderChild('3')
    renderChild('4')
    textRenderCallback(childIndex, parentElement, createdChildren)('test')
    expect(parentElement.childNodes[2]).toEqual(createTextNode('test'))
  })

  test('textRenderCallback should replace node on given position for Text node, when there is one element/text rendered on that position before', () => {
    renderChild('0')
    renderChild('1')
    renderChild('2')
    renderChild('3')
    renderChild('4')
    expect(parentElement.childNodes[2]).toEqual(createDomElement('div', false))
    textRenderCallback(childIndex, parentElement, createdChildren)('test')
    expect(parentElement.childNodes[2]).toEqual(createTextNode('test'))
  })

  test('textRenderCallback should replace nodes from fragment on given position for Text node, when there is many elements/texts rendered on that position before', () => {
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
    textRenderCallback(childIndex, parentElement, createdChildren)('test')
    expect(parentElement.childNodes[2]).toEqual(createTextNode('test'))
    expect(parentElement.childNodes[3]).toBeUndefined()
    expect(parentElement.childNodes[4]).toBeUndefined()
    expect(parentElement.childNodes[5]).toBeUndefined()
  })
})
