import { getRootDomElement } from '../../../../src/rv-dom/create-rv-dom/utils'

describe('Create rvDOM utils', () => {
  test("getRootDomElement should return element, when it's given as argument", () => {
    const el = document.createElement('div')
    expect(getRootDomElement(el)).toEqual(el)
  })

  test("getRootDomElement should return found element, when it's argument is query selector", () => {
    const el = document.createElement('div')
    el.className = 'root'
    document.body.appendChild(el)
    expect(getRootDomElement('.root')).toEqual(el)
  })

  test("getRootDomElement should return document body, when it hasn't argument", () => {
    expect(getRootDomElement()).toEqual(window.document.body)
  })
})
