import { createDomElement, createDomTextNode } from 'renderer/utils'
import { RvdHTMLElementNodeType, RvdSVGElementNodeType } from 'types'

describe('Dom utils', () => {
  test('createDomElement should create HTML Element', () => {
    const tags: RvdHTMLElementNodeType[] = ['span', 'div', 'input', 'main', 'textarea']

    tags.forEach(tag => {
      expect(createDomElement(tag, false)).toEqual(document.createElement(tag))
    })
  })

  test('createDomElement should create SVG Element', () => {
    const tags: RvdSVGElementNodeType[] = ['circle', 'mask', 'line', 'image']

    tags.forEach(tag => {
      expect(createDomElement(tag, true)).toEqual(
        document.createElementNS('http://www.w3.org/2000/svg', tag)
      )
    })
  })

  test('createTextNode should create Text node', () => {
    const texts: string[] = ['txt1', 'txt2', 'txt3', 'txt4']

    texts.forEach(txt => {
      expect(createDomTextNode(txt)).toEqual(document.createTextNode(txt))
    })
  })
})
