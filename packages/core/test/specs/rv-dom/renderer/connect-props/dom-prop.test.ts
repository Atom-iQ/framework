import {
  connectDOMProp,
  connectObservableDOMProp
} from '../../../../../src/reactive-virtual-dom/renderer/connect-props/dom-prop'
import { Subscription } from 'rxjs'
import { createDomElement } from '../../../../../src/reactive-virtual-dom/renderer/utils'
import { createState } from '../../../../../src/component/state'
import { DOMElementPropName } from '../../../../../src/shared/types'

/* eslint-disable max-len */
describe('Connecting Element Props', () => {
  test('connectDOMProp should set static prop (attribute)', () => {
    const element = createDomElement('div', false)
    connectDOMProp('id', 'mock-div-id', element)
    connectDOMProp('title', 'mock-title-prop', element)
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
    connectObservableDOMProp('id', id, element, sub)
    connectObservableDOMProp('title', title, element, sub)
    connectObservableDOMProp('hidden' as DOMElementPropName, hidden, element, sub)
    expect(subSpy).toBeCalled()
    expect(element.id).toBe('mock-div-id')
    expect(element.getAttribute('title')).toBe('mock-title-prop')
    expect(element['hidden']).toBeTruthy()
    nextId(null)
    nextTitle(null)
    nextHidden(null)
    expect(element.id).toBe('')
    expect(element.getAttribute('title')).toBeNull()
    expect(element['hidden']).toBeFalsy()
    nextId('new-mock-div-id')
    nextTitle('new-mock-title-prop')
    nextHidden(false)
    expect(element.id).toBe('new-mock-div-id')
    expect(element.getAttribute('title')).toBe('new-mock-title-prop')
    expect(element['hidden']).toBeFalsy()
  })
})
