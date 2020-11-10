import {
  appendChild,
  createDomElement,
  createTextNode,
  insertBefore,
  removeChild,
  replaceChild
} from '../../../../../src/reactive-virtual-dom/renderer/utils'
import { RvdHTMLElementType, RvdSVGElementType } from '../../../../../src/shared/types'

describe('Dom utils', () => {
  test('createDomElement should create HTML Element', () => {
    const tags: RvdHTMLElementType[] = ['span', 'div', 'input', 'main', 'textarea']

    tags.forEach(tag => {
      expect(createDomElement(tag, false)).toEqual(document.createElement(tag))
    })
  })

  test('createDomElement should create SVG Element', () => {
    const tags: RvdSVGElementType[] = ['circle', 'mask', 'line', 'image']

    tags.forEach(tag => {
      expect(createDomElement(tag, true)).toEqual(
        document.createElementNS('http://www.w3.org/2000/svg', tag)
      )
    })
  })

  test('createTextNode should create Text node', () => {
    const texts: string[] = ['txt1', 'txt2', 'txt3', 'txt4']

    texts.forEach(txt => {
      expect(createTextNode(txt)).toEqual(document.createTextNode(txt))
    })
  })

  test('appendChild should append element as parent`s last child', () => {
    const parent = createDomElement('div', false)
    const child = createDomElement('div', false)

    appendChild(parent, child)

    expect(parent.lastChild).toBe(child)
  })

  test('insertBefore should insert element before specific parent`s child', () => {
    const parent = createDomElement('div', false)
    const sibling = createDomElement('div', false)
    const child = createDomElement('div', false)

    appendChild(parent, sibling)
    insertBefore(parent, child, sibling)

    expect(parent.firstChild).toBe(child)
    expect(parent.lastChild).toBe(sibling)
  })

  test('replaceChild should switch sibling elements within parent', () => {
    const parent = createDomElement('div', false)
    const sibling = createDomElement('div', false)
    const child = createDomElement('div', false)

    appendChild(parent, sibling)
    insertBefore(parent, child, sibling)
    expect(parent.firstChild).toBe(child)
    expect(parent.lastChild).toBe(sibling)

    replaceChild(parent, sibling, child)

    expect(parent.firstChild).toBe(sibling)
    expect(parent.lastChild).toBe(sibling)
  })

  test('removeChild should remove element`s child', () => {
    const parent = createDomElement('div', false)
    const child = createDomElement('div', false)

    appendChild(parent, child)

    expect(parent.lastChild).toBe(child)

    removeChild(parent, child)

    expect(parent.lastChild).toBeNull()
  })
})
