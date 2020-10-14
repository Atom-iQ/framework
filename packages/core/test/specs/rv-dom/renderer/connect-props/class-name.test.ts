import * as ELEMENTS from '../../../../__mocks__/elements'
import { createDomElement } from '../../../../../src/rv-dom/renderer/utils'
import { createState } from '../../../../../src/component/state'
import { connectClassName } from '../../../../../src/rv-dom/renderer/connect-props/class-name'
import { Subscription } from 'rxjs'

/* eslint-disable max-len */
describe('Connecting Element ClassName', () => {
  test('connectClassName should set static className', () => {
    const rvdElement = ELEMENTS.CLASSNAME
    const element = createDomElement('div', false)
    connectClassName(rvdElement.className, false, element, new Subscription())
    expect(element.className).toBe('mock-div')
  })

  test('connectClassName should connect (create Observer) Observable className and add subscription to element subscriptions', () => {
    const [className, nextClassName] = createState('mock-div')
    const rvdElement = ELEMENTS.OBSERVABLE_CLASSNAME(className)
    const element = createDomElement('div', false)
    const sub = new Subscription()
    const subSpy = jest.spyOn(sub, 'add')
    connectClassName(rvdElement.className, false, element, sub)
    expect(element.className).toBe('mock-div')
    expect(subSpy).toBeCalled()
    nextClassName('new-mock-div')
    expect(element.className).toBe('new-mock-div')
    sub.unsubscribe()
    nextClassName('not-visible')
    expect(element.className).toBe('new-mock-div')
  })

  test('connectClassName should set static class attribute for SVG Element', () => {
    const rvdElement = ELEMENTS.SVG
    const element = createDomElement('circle', true)
    connectClassName(rvdElement.className, true, element, new Subscription())
    expect(element.getAttribute('class')).toBe('test-svg')
  })

  test('connectClassName should connect (create Observer) Observable class attribute and add subscription to element subscriptions for SVG Element', () => {
    const [className, nextClassName] = createState('test-svg')
    const rvdElement = ELEMENTS.SVG_OBSERVABLE_CLASS(className)
    const element = createDomElement('circle', true)
    const sub = new Subscription()
    const subSpy = jest.spyOn(sub, 'add')
    connectClassName(rvdElement.className, true, element, sub)
    expect(element.getAttribute('class')).toBe('test-svg')
    expect(subSpy).toBeCalled()
    nextClassName(null)
    expect(element.getAttribute('class')).toBeNull()
    nextClassName('new-test-svg')
    expect(element.getAttribute('class')).toBe('new-test-svg')
    sub.unsubscribe()
    nextClassName('not-visible')
    expect(element.getAttribute('class')).toBe('new-test-svg')
  })
})
