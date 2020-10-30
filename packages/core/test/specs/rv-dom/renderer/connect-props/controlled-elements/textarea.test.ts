/* eslint-disable max-len */
import * as ELEMENTS from '../../../../../__mocks__/elements'
import { createState } from '../../../../../../src/component/state'
import { createDomElement } from '../../../../../../src/rv-dom/renderer/utils'
import { RvdSyntheticEvent } from '../../../../../../src/shared/types'
import { Subscription } from 'rxjs'
import { map } from 'rxjs/operators'
import { dispatchInputEvent } from '../../../../../__mocks__/events'
import { controlTextArea } from '../../../../../../src/rv-dom/renderer/connect-props/controlled-elements/textarea'

describe('Controlled textarea', () => {
  let sub: Subscription
  let subSpy: jest.SpyInstance

  beforeEach(() => {
    sub = new Subscription()
    subSpy = jest.spyOn(sub, 'add')
  })

  test('controlTextArea should connect controlled Observable value', () => {
    const [value, nextValue] = createState('test')
    const rvdTextArea = ELEMENTS.CONTROLLED_TEXTAREA({ value })
    const domTextArea = createDomElement('input', false) as HTMLTextAreaElement
    controlTextArea(rvdTextArea, domTextArea, sub, () => {
      return null
    })

    expect(domTextArea.value).toBe('test')
    expect(domTextArea.defaultValue).toBe('test')
    nextValue('next-test')
    expect(domTextArea.value).toBe('next-test')
    expect(domTextArea.defaultValue).toBe('next-test')
    expect(subSpy).toBeCalledTimes(1)
  })

  test('controlTextArea should connect controlled Observable value and classic handler', () => {
    const [value, nextValue] = createState('test')
    const rvdTextArea = ELEMENTS.CONTROLLED_TEXTAREA({ value, onInput: jest.fn() })
    const domTextArea = createDomElement('input', false) as HTMLTextAreaElement
    controlTextArea(rvdTextArea, domTextArea, sub, () => {
      return null
    })

    expect(domTextArea.value).toBe('test')
    expect(domTextArea.defaultValue).toBe('test')
    nextValue('next-test')
    expect(domTextArea.value).toBe('next-test')
    expect(domTextArea.defaultValue).toBe('next-test')
    expect(subSpy).toBeCalledTimes(2)
  })

  test('controlTextArea should connect controlled reactive event handler', () => {
    const rvdTextArea = ELEMENTS.CONTROLLED_TEXTAREA({
      onInput$: map<RvdSyntheticEvent<HTMLTextAreaElement>, string>(event => {
        return event.target.value.toLowerCase()
      }),
      value: 'initial'
    })
    const domTextArea = createDomElement('input', false) as HTMLTextAreaElement
    controlTextArea(rvdTextArea, domTextArea, sub, () => {
      return null
    })
    expect(domTextArea.value).toBe('initial')
    domTextArea.value = 'TEST'
    dispatchInputEvent(domTextArea)

    expect(domTextArea.value).toBe('test')
    expect(domTextArea.defaultValue).toBe('test')
    domTextArea.value = 'NEXT-TEST'
    dispatchInputEvent(domTextArea)
    expect(domTextArea.value).toBe('next-test')
    expect(domTextArea.defaultValue).toBe('next-test')
    expect(subSpy).toBeCalledTimes(1)
  })

  test('controlTextArea should set static default value, when element has not set value or defaultValue', () => {
    const [value] = createState(null)
    const rvdTextArea = ELEMENTS.CONTROLLED_TEXTAREA({ value, defaultValue: 'default' })
    const domTextArea = createDomElement('input', false) as HTMLTextAreaElement
    expect(domTextArea.defaultValue).toBeFalsy()
    controlTextArea(rvdTextArea, domTextArea, sub, () => {
      return null
    })

    expect(domTextArea.defaultValue).toBe('default')
    expect(subSpy).toBeCalledTimes(1)
  })

  test('controlInput should connect Observable default value, when element has not set value or defaultValue', () => {
    const [value] = createState(null)
    const [defaultValue] = createState('default')
    const rvdTextArea = ELEMENTS.CONTROLLED_TEXTAREA({ value, defaultValue })
    const domTextArea = createDomElement('input', false) as HTMLTextAreaElement
    expect(domTextArea.defaultValue).toBeFalsy()
    controlTextArea(rvdTextArea, domTextArea, sub, () => {
      return null
    })

    expect(domTextArea.defaultValue).toBe('default')
    expect(subSpy).toBeCalledTimes(2)
  })
})
