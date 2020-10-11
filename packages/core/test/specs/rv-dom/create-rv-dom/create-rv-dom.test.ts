import { createRvDOM } from '../../../../src'
import * as ELEMENTS from '../../../__mocks__/elements'
import { Subscription } from 'rxjs'

describe('Create rvDOM function', () => {
  test('createRvDOM should return subscription', () => {
    const el = document.createElement('div')
    const expected = createRvDOM()(ELEMENTS.CLASSNAME, el) instanceof Subscription
    expect(expected).toBeTruthy()
  })

  test('createRvDOM should render rvDOM and attach it to root element', () => {
    const el = document.createElement('div')
    createRvDOM()(ELEMENTS.CLASSNAME, el)
    // Element is static, so rendering is synchronous
    const appended = el.querySelector('.mock-div')
    expect(appended).toBeDefined()
    expect(appended.tagName === 'div')
  })

  test('createRvDOM should throw an error if rootRvDOM is null or undefined', () => {
    const el = document.createElement('div')
    const result = jest.fn(() => createRvDOM()(null, el))
    expect(result).toThrowError('Root RvdElement cannot be undefined or null')
  })

  test('createRvDOM should throw an error if rootDOM is null or undefined', () => {
    const result = jest.fn(() => createRvDOM()(ELEMENTS.CLASSNAME, '#sTrAnGe_iD'))
    expect(result).toThrowError('Root DOM Element cannot be undefined or null')
  })
})
