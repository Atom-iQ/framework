import { initAtomiQ } from '../../../src'
import * as ELEMENTS from '../../__mocks__/elements'
import { Subscription } from 'rxjs'

describe('initAtomiQ function', () => {
  test('initAtomiQ should return subscription', () => {
    const el = document.createElement('div')
    const expected = initAtomiQ()(ELEMENTS.CLASSNAME, el) instanceof Subscription
    expect(expected).toBeTruthy()
  })

  test('initAtomiQ should render rvDOM and attach it to root element', () => {
    const el = document.createElement('div')
    initAtomiQ()(ELEMENTS.CLASSNAME, el)
    // Element is static, so rendering is synchronous
    const appended = el.querySelector('.mock-div')
    expect(appended).toBeDefined()
    expect(appended.tagName === 'div')
  })

  test('initAtomiQ should throw an error if rootRvDOM is null or undefined', () => {
    const el = document.createElement('div')
    const result = jest.fn(() => initAtomiQ()(null, el))
    expect(result).toThrowError('Root RvdElement cannot be undefined or null')
  })

  test('initAtomiQ should throw an error if rootDOM is null or undefined', () => {
    const result = jest.fn(() =>
      initAtomiQ()(ELEMENTS.CLASSNAME, document.querySelector('#sTrAnGe_iD'))
    )
    expect(result).toThrowError('Root DOM Element cannot be undefined or null')
  })
})
