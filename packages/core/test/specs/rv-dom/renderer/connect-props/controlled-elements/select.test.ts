/* eslint-disable max-len */
// /* eslint-disable max-len */
// import * as ELEMENTS from '../../../../../__mocks__/elements'
// import { createState } from '../../../../../../src/component/state'
// import { createDomElement } from '../../../../../../src/reactive-virtual-dom/renderer/utils'
// import { Subscription } from 'rxjs'
// import { controlSelect } from '../../../../../../src/reactive-virtual-dom/renderer/connect-props/controlled-elements/select'
// import { initEventDelegation } from '../../../../../../src/events/event-delegation'
//
// const appendSelectOptions = select =>
//   Array.from({ length: 5 }).forEach((_, i) => {
//     const option = createDomElement('option', false) as HTMLOptionElement
//     option.value = 'option-' + i
//     select.appendChild(option)
//   })
//
// describe('Controlled select', () => {
//   let sub: Subscription
//   let subSpy: jest.SpyInstance
//   let domSelect: HTMLSelectElement
//
//   beforeEach(() => {
//     sub = new Subscription()
//     subSpy = jest.spyOn(sub, 'add')
//     domSelect = createDomElement('select', false) as HTMLSelectElement
//     const parentElement = createDomElement('div', false)
//     parentElement.appendChild(domSelect)
//     initEventDelegation(parentElement)
//   })
//
//   test('controlSelect should connect controlled Observable value', () => {
//     const [value, nextValue] = createState('option-0')
//     const rvdSelect = ELEMENTS.CONTROLLED_SELECT({ value })
//
//     appendSelectOptions(domSelect)
//     controlSelect(rvdSelect, domSelect, sub, () => {
//       return null
//     })
//
//     expect(domSelect.options[0].selected).toBeTruthy()
//     nextValue('option-3')
//     expect(domSelect.options[0].selected).toBeFalsy()
//     expect(domSelect.options[3].selected).toBeTruthy()
//     expect(subSpy).toBeCalledTimes(1)
//   })
//
//   test('controlSelect should connect controlled Observable value and classic handler', () => {
//     const [value, nextValue] = createState('option-0')
//     const rvdSelect = ELEMENTS.CONTROLLED_SELECT({ value, onChange: jest.fn() })
//     appendSelectOptions(domSelect)
//     controlSelect(rvdSelect, domSelect, sub, () => {
//       return null
//     })
//
//     expect(domSelect.options[0].selected).toBeTruthy()
//     nextValue('option-3')
//     expect(domSelect.options[0].selected).toBeFalsy()
//     expect(domSelect.options[3].selected).toBeTruthy()
//     expect(subSpy).toBeCalledTimes(2)
//   })
//
//   test('controlSelect should connect controlled Observable value prop (multiple select)', () => {
//     const [value, nextValue] = createState(['option-0'])
//     const rvdSelect = ELEMENTS.CONTROLLED_SELECT({ value, multiple: true })
//     appendSelectOptions(domSelect)
//     controlSelect(rvdSelect, domSelect, sub, () => {
//       return null
//     })
//
//     expect(domSelect.options[0].selected).toBeTruthy()
//     nextValue(['option-1', 'option-3'])
//     expect(domSelect.options[0].selected).toBeFalsy()
//     expect(domSelect.options[1].selected).toBeTruthy()
//     expect(domSelect.options[3].selected).toBeTruthy()
//     expect(subSpy).toBeCalledTimes(1)
//   })
//
//   test('controlSelect should set static multiple prop when it`s true', () => {
//     const [value] = createState(null)
//     const rvdSelect = ELEMENTS.CONTROLLED_SELECT({ value, multiple: true })
//     expect(domSelect.multiple).toBeFalsy()
//     controlSelect(rvdSelect, domSelect, sub, () => {
//       return null
//     })
//
//     expect(domSelect.multiple).toBeTruthy()
//     expect(subSpy).toBeCalledTimes(1)
//   })
//
//   test('controlSelect should not set static multiple prop when it`s false', () => {
//     const [value] = createState(null)
//     const rvdSelect = ELEMENTS.CONTROLLED_SELECT({ value, multiple: false })
//     expect(domSelect.multiple).toBeFalsy()
//     controlSelect(rvdSelect, domSelect, sub, () => {
//       return null
//     })
//
//     expect(domSelect.multiple).toBeFalsy()
//     expect(subSpy).toBeCalledTimes(1)
//   })
//
//   test('controlSelect should connect Observable multiple prop', () => {
//     const [value] = createState(null)
//     const [multiple] = createState(true)
//     const rvdSelect = ELEMENTS.CONTROLLED_SELECT({ value, multiple })
//     expect(domSelect.multiple).toBeFalsy()
//     controlSelect(rvdSelect, domSelect, sub, () => {
//       return null
//     })
//
//     expect(domSelect.multiple).toBeTruthy()
//     expect(subSpy).toBeCalledTimes(2)
//   })
//
//   test('controlSelect should connect Observable selectedIndex prop', () => {
//     const [value] = createState(null)
//     const [selectedIndex, nextSelectedIndex] = createState(0)
//     const rvdSelect = ELEMENTS.CONTROLLED_SELECT({ value, selectedIndex })
//     appendSelectOptions(domSelect)
//     controlSelect(rvdSelect, domSelect, sub, () => {
//       return null
//     })
//
//     expect(domSelect.options[0].selected).toBeTruthy()
//
//     nextSelectedIndex(3)
//     expect(domSelect.options[0].selected).toBeFalsy()
//     expect(domSelect.options[3].selected).toBeTruthy()
//     expect(subSpy).toBeCalledTimes(2)
//   })
// })
