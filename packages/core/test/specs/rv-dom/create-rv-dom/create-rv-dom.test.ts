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
})
