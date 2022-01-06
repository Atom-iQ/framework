/* eslint-disable max-len */
// /* eslint-disable max-len */
// import * as ELEMENTS from '../../../../../__mocks__/elements'
// import { createState } from '../../../../../../src/component/state'
// import { createDomElement } from '../../../../../../src/reactive-virtual-dom/renderer/utils'
// import { RvdEvent } from '../../../../../../src/shared/types'
// import { Subscription } from 'rxjs'
// import { delay, map } from 'rxjs/operators'
// import { dispatchInputEvent } from '../../../../../__mocks__/events'
// import { controlTextArea } from '../../../../../../src/reactive-virtual-dom/renderer/connect-props/controlled-elements/textarea'
// import { initEventDelegation } from '../../../../../../src/reactive-event-delegation/event-delegation'
//
// describe('Controlled textarea', () => {
//   let sub: Subscription
//   let subSpy: jest.SpyInstance
//   let domTextArea: HTMLTextAreaElement
//
//   beforeEach(() => {
//     sub = new Subscription()
//     subSpy = jest.spyOn(sub, 'add')
//     domTextArea = createDomElement('input', false) as HTMLTextAreaElement
//     const parentElement = createDomElement('div', false)
//     parentElement.appendChild(domTextArea)
//     initEventDelegation(parentElement)
//   })
//
//   test('controlTextArea should connect controlled Observable value', () => {
//     const [value, nextValue] = createState('test')
//     const rvdTextArea = ELEMENTS.CONTROLLED_TEXTAREA({ value })
//
//     controlTextArea(rvdTextArea, domTextArea, sub, () => {
//       return null
//     })
//
//     expect(domTextArea.value).toBe('test')
//     expect(domTextArea.defaultValue).toBe('test')
//     nextValue('next-test')
//     expect(domTextArea.value).toBe('next-test')
//     expect(domTextArea.defaultValue).toBe('next-test')
//     expect(subSpy).toBeCalledTimes(1)
//   })
//
//   test('controlTextArea should connect controlled Observable value and classic handler', () => {
//     const [value, nextValue] = createState('test')
//     const rvdTextArea = ELEMENTS.CONTROLLED_TEXTAREA({ value, onInput: jest.fn() })
//
//     controlTextArea(rvdTextArea, domTextArea, sub, () => {
//       return null
//     })
//
//     expect(domTextArea.value).toBe('test')
//     expect(domTextArea.defaultValue).toBe('test')
//     nextValue('next-test')
//     expect(domTextArea.value).toBe('next-test')
//     expect(domTextArea.defaultValue).toBe('next-test')
//     expect(subSpy).toBeCalledTimes(2)
//   })
//
//   test('controlTextArea should set static default value, when element has not set value or defaultValue', () => {
//     const [value] = createState(null)
//     const rvdTextArea = ELEMENTS.CONTROLLED_TEXTAREA({
//       value: delay<string | number>(100)(value),
//       defaultValue: 'default'
//     })
//
//     expect(domTextArea.defaultValue).toBeFalsy()
//     controlTextArea(rvdTextArea, domTextArea, sub, () => {
//       return null
//     })
//
//     expect(domTextArea.defaultValue).toBe('default')
//     expect(subSpy).toBeCalledTimes(1)
//   })
//
//   test('controlInput should connect Observable default value, when element has not set value or defaultValue', () => {
//     const [value] = createState(null)
//     const [defaultValue] = createState('default')
//     const rvdTextArea = ELEMENTS.CONTROLLED_TEXTAREA({
//       value: delay<string | number>(100)(value),
//       defaultValue
//     })
//
//     expect(domTextArea.defaultValue).toBeFalsy()
//     controlTextArea(rvdTextArea, domTextArea, sub, () => {
//       return null
//     })
//
//     expect(domTextArea.defaultValue).toBe('default')
//     expect(subSpy).toBeCalledTimes(2)
//   })
// })
