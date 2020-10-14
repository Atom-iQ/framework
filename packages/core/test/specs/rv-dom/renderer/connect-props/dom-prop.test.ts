import {
  connectDOMProp,
  connectObservableDOMProp
} from '../../../../../src/rv-dom/renderer/connect-props/dom-prop'
import { Subscription } from 'rxjs'
import { createDomElement } from '../../../../../src/rv-dom/renderer/utils'
import { createState } from '../../../../../src/component/state'
import { DOMElementPropName } from '../../../../../src/shared/types'

/* eslint-disable max-len */
describe('Connecting Element Props', () => {
  test('connectDOMProp should set static prop (attribute)', () => {
    const element = createDomElement('div', false)
    connectDOMProp(element)('id', 'mock-div-id')
    connectDOMProp(element)('title', 'mock-title-prop')
    expect(element.id).toBe('mock-div-id')
    expect(element.getAttribute('title')).toBe('mock-title-prop')
  })

  test('connectObservableDOMProp connect (create Observer) Observable props (attributes)', () => {
    const [id, nextId] = createState('mock-div-id')
    const [title, nextTitle] = createState('mock-title-prop')
    const [hidden, nextHidden] = createState(true)
    const sub = new Subscription()
    const subSpy = jest.spyOn(sub, 'add')
    const element = createDomElement('div', false)
    connectObservableDOMProp(element, sub)('id', id)
    connectObservableDOMProp(element, sub)('title', title)
    connectObservableDOMProp(element, sub)('hidden' as DOMElementPropName, hidden)
    expect(subSpy).toBeCalled()
    expect(element.id).toBe('mock-div-id')
    expect(element.getAttribute('title')).toBe('mock-title-prop')
    expect(element.getAttribute('hidden')).toBeTruthy()
    nextId(null)
    nextTitle(null)
    nextHidden(null)
    expect(element.id).toBe('')
    expect(element.getAttribute('title')).toBeNull()
    expect(element.getAttribute('hidden')).toBeNull()
    nextId('new-mock-div-id')
    nextTitle('new-mock-title-prop')
    nextHidden(false)
    expect(element.id).toBe('new-mock-div-id')
    expect(element.getAttribute('title')).toBe('new-mock-title-prop')
    expect(element.getAttribute('hidden')).toBeNull()
  })
})
