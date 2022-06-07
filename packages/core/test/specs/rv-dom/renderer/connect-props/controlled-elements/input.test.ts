/* eslint-disable max-len */
// /* eslint-disable max-len */
// import * as ELEMENTS from '../../../../../__mocks__/elements'
// import { createState } from '../../../../../../src/component/state'
// import { createDomElement } from '../../../../../../src/reactive-virtual-dom/renderer/utils'
// import { RvdChangeEvent, RvdEvent } from '../../../../../../src/shared/types'
// import { Subscription } from 'rxjs'
// import { controlInput } from '../../../../../../src/reactive-virtual-dom/renderer/connect-props/controlled-elements/input'
// import { delay, map } from 'rxjs/operators'
// import { dispatchChangeEvent, dispatchInputEvent } from '../../../../../__mocks__/events'
// import { initEventDelegation } from '../../../../../../src/events/event-delegation'
//
// describe('Controlled input', () => {
//   let sub: Subscription
//   let subSpy: jest.SpyInstance
//   let domInput: HTMLInputElement
//
//   beforeEach(() => {
//     sub = new Subscription()
//     subSpy = jest.spyOn(sub, 'add')
//     domInput = createDomElement('input', false) as HTMLInputElement
//     const parentElement = createDomElement('div', false)
//     parentElement.appendChild(domInput)
//     initEventDelegation(parentElement)
//   })
//
//   test('controlInput should connect controlled Observable value (text input)', () => {
//     const [value, nextValue] = createState('test')
//     const rvdInput = ELEMENTS.CONTROLLED_INPUT_TEXT({ value })
//     controlInput(rvdInput, domInput, sub, () => {
//       return null
//     })
//
//     expect(domInput.getAttribute('type')).toBe('text')
//     expect(domInput.value).toBe('test')
//     expect(domInput.defaultValue).toBe('test')
//     nextValue('next-test')
//     expect(domInput.value).toBe('next-test')
//     expect(domInput.defaultValue).toBe('next-test')
//     nextValue('next-test')
//     expect(domInput.value).toBe('next-test')
//     expect(domInput.defaultValue).toBe('next-test')
//     expect(subSpy).toBeCalledTimes(1)
//   })
//
//   test('controlInput should connect controlled Observable checked prop (checkbox/radio input)', () => {
//     const [checked, nextChecked] = createState(false)
//     const rvdInput = ELEMENTS.CONTROLLED_INPUT_CHECKED({ checked })
//     controlInput(rvdInput, domInput, sub, () => {
//       return null
//     })
//
//     expect(domInput.getAttribute('type')).toBe('checkbox')
//     expect(domInput.checked).toBeFalsy()
//     nextChecked(true)
//     expect(domInput.checked).toBeTruthy()
//     expect(subSpy).toBeCalledTimes(1)
//   })
//
//   test('controlInput should connect controlled Observable value (text input)  and classic handler', () => {
//     const [value, nextValue] = createState('test')
//     const rvdInput = ELEMENTS.CONTROLLED_INPUT_TEXT({ type: 'text', value, onInput: jest.fn() })
//     controlInput(rvdInput, domInput, sub, () => {
//       return null
//     })
//
//     expect(domInput.getAttribute('type')).toBe('text')
//     expect(domInput.value).toBe('test')
//     expect(domInput.defaultValue).toBe('test')
//     nextValue('next-test')
//     expect(domInput.value).toBe('next-test')
//     expect(domInput.defaultValue).toBe('next-test')
//     nextValue('next-test')
//     expect(domInput.value).toBe('next-test')
//     expect(domInput.defaultValue).toBe('next-test')
//     expect(subSpy).toBeCalledTimes(2)
//   })
//
//   test('controlInput should connect controlled Observable checked prop (checkbox/radio input) and classic handler', () => {
//     const [checked, nextChecked] = createState(false)
//     const rvdInput = ELEMENTS.CONTROLLED_INPUT_CHECKED({ checked, onChange: jest.fn() })
//
//     controlInput(rvdInput, domInput, sub, () => {
//       return null
//     })
//
//     expect(domInput.getAttribute('type')).toBe('checkbox')
//     expect(domInput.checked).toBeFalsy()
//     nextChecked(true)
//     expect(domInput.checked).toBeTruthy()
//     expect(subSpy).toBeCalledTimes(2)
//   })
//
// eslint-disable-next-line max-len
//   test('controlInput should set static default value, when element has not set value or defaultValue', () => {
//     const [value] = createState(null)
//     const rvdInput = ELEMENTS.CONTROLLED_INPUT_TEXT({
//       value: delay<string>(500)(value),
//       defaultValue: 'default'
//     })
//
//     expect(domInput.defaultValue).toBeFalsy()
//     controlInput(rvdInput, domInput, sub, () => {
//       return null
//     })
//
//     expect(domInput.getAttribute('type')).toBe('text')
//     expect(domInput.defaultValue).toBe('default')
//     expect(subSpy).toBeCalledTimes(1)
//   })
//
//   test('controlInput should not connect Observable default value, when element has not set value', done => {
//     const [value] = createState('test')
//     const [defaultValue] = createState('default')
//     const rvdInput = ELEMENTS.CONTROLLED_INPUT_TEXT({
//       value,
//       defaultValue: delay<string>(200)(defaultValue)
//     })
//
//     expect(domInput.defaultValue).toBeFalsy()
//     controlInput(rvdInput, domInput, sub, () => {
//       return null
//     })
//     setTimeout(() => {
//       expect(domInput.defaultValue).toBe('test')
//       expect(subSpy).toBeCalledTimes(2)
//       done()
//     }, 500)
//   })
//
//   test('controlInput should connect Observable default value, when element has not set value or defaultValue', () => {
//     const [value] = createState(null)
//     const [defaultValue] = createState('default')
//     const rvdInput = ELEMENTS.CONTROLLED_INPUT_TEXT({
//       value: delay<string>(500)(value),
//       defaultValue
//     })
//
//     expect(domInput.defaultValue).toBeFalsy()
//     controlInput(rvdInput, domInput, sub, () => {
//       return null
//     })
//
//     expect(domInput.getAttribute('type')).toBe('text')
//     expect(domInput.defaultValue).toBe('default')
//     expect(subSpy).toBeCalledTimes(2)
//   })
//
//   test('controlInput should set static multiple prop', () => {
//     const [value] = createState(null)
//     const rvdInput = ELEMENTS.CONTROLLED_INPUT_TEXT({ value, multiple: true })
//
//     expect(domInput.multiple).toBeFalsy()
//     controlInput(rvdInput, domInput, sub, () => {
//       return null
//     })
//
//     expect(domInput.getAttribute('type')).toBe('text')
//     expect(domInput.multiple).toBeTruthy()
//     expect(subSpy).toBeCalledTimes(1)
//   })
//
//   test('controlInput should connect Observable multiple prop', () => {
//     const [value] = createState(null)
//     const [multiple] = createState(true)
//     const rvdInput = ELEMENTS.CONTROLLED_INPUT_TEXT({ value, multiple })
//
//     expect(domInput.multiple).toBeFalsy()
//     controlInput(rvdInput, domInput, sub, () => {
//       return null
//     })
//
//     expect(domInput.getAttribute('type')).toBe('text')
//     expect(domInput.multiple).toBeTruthy()
//     expect(subSpy).toBeCalledTimes(2)
//   })
//
//   test('controlInput should connect Observable type prop', () => {
//     const [value] = createState('test')
//     const [type, nextType] = createState('text')
//     const rvdInput = ELEMENTS.CONTROLLED_INPUT_TEXT({
//       value,
//       type
//     })
//
//     controlInput(rvdInput, domInput, sub, () => {
//       return null
//     })
//
//     expect(domInput.getAttribute('type')).toBe('text')
//     expect(subSpy).toBeCalledTimes(2)
//     nextType('checkbox')
//     expect(domInput.getAttribute('type')).toBe('checkbox')
//     expect(subSpy).toBeCalledTimes(2)
//     nextType('checkbox')
//     expect(subSpy).toBeCalledTimes(2)
//   })
//
//   test('controlInput should connect Observable type prop and switch handlers, when type is changed from text type to checked type', () => {
//     const [value] = createState('test')
//     const [type, nextType] = createState('text')
//     const rvdInput = ELEMENTS.CONTROLLED_INPUT_TEXT({
//       value,
//       type,
//       onChange: event => event,
//       onInput: event => event
//     })
//
//     controlInput(rvdInput, domInput, sub, () => {
//       return null
//     })
//
//     expect(domInput.getAttribute('type')).toBe('text')
//     expect(subSpy).toBeCalledTimes(3)
//     nextType('checkbox')
//     expect(domInput.getAttribute('type')).toBe('checkbox')
//     expect(subSpy).toBeCalledTimes(4)
//     nextType('checkbox')
//     expect(subSpy).toBeCalledTimes(4)
//   })
// })
