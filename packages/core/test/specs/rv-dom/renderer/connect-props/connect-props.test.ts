// eslint-disable-next-line max-len
// import { connectElementProps } from '../../../../../src/reactive-virtual-dom/renderer/connect-props/connect-props'
// import * as ELEMENTS from '../../../../__mocks__/elements'
// import { createDomElement } from '../../../../../src/reactive-virtual-dom/renderer/utils'
// import { CSSProperties, RvdMouseEvent } from '../../../../../src/shared/types'
// import { createState } from '../../../../../src/component/state'
// import { dispatchMouseEvent } from '../../../../__mocks__/events'
// import { tap } from 'rxjs/operators'
// eslint-disable-next-line max-len
// import * as controlled from '../../../../../src/reactive-virtual-dom/renderer/connect-props/controlled-elements/controlled-element'
// import { Observable, Subscription } from 'rxjs'
// import { initEventDelegation } from '../../../../../src/events/event-delegation'
//
// /* eslint-disable max-len */
// describe('Connecting Element Props', () => {
//   describe('connectElementProps should connect DOM props', () => {
//     test('set static props (attributes)', () => {
//       const rvdElement = ELEMENTS.CLASSNAME_AND_PROPS
//       const element = createDomElement('div', false)
//       connectElementProps(rvdElement, false, element, new Subscription())
//       expect(element.id).toBe('mock-div-id')
//       expect(element.getAttribute('title')).toBe('mock-title-prop')
//     })
//
//     test('connect (create Observer) Observable props (attributes)', () => {
//       const [id, nextId] = createState('mock-div-id')
//       const [title, nextTitle] = createState('mock-title-prop')
//       const rvdElement = ELEMENTS.CLASSNAME_AND_OBSERVABLE_PROPS({ id, title })
//       const element = createDomElement('div', false)
//       connectElementProps(rvdElement, false, element, new Subscription())
//       expect(element.id).toBe('mock-div-id')
//       expect(element.getAttribute('title')).toBe('mock-title-prop')
//       nextId('new-mock-div-id')
//       nextTitle('new-mock-title-prop')
//       expect(element.id).toBe('new-mock-div-id')
//       expect(element.getAttribute('title')).toBe('new-mock-title-prop')
//     })
//   })
//
//   describe('connectElementProps should connect style prop', () => {
//     test('set style from string', () => {
//       const rvdElement = ELEMENTS.STYLE('background-color: red; font-size: 15px;')
//       const element = createDomElement('div', false)
//       connectElementProps(rvdElement, false, element, new Subscription())
//       expect(element.style.backgroundColor).toBe('red')
//       expect(element.style.fontSize).toBe('15px')
//     })
//
//     test('connect style from Observable string', () => {
//       const [style, nextStyle] = createState('background-color: red; font-size: 15px;')
//       const rvdElement = ELEMENTS.STYLE(style)
//       const element = createDomElement('div', false)
//       connectElementProps(rvdElement, false, element, new Subscription())
//       expect(element.style.backgroundColor).toBe('red')
//       expect(element.style.fontSize).toBe('15px')
//       nextStyle('color: red;')
//       expect(element.style.backgroundColor).toBe('')
//       expect(element.style.fontSize).toBe('')
//       expect(element.style.color).toBe('red')
//     })
//
//     test('connect style from object fields (static and Observable)', () => {
//       const [backgroundColor, nextBackgroundColor] = createState('red')
//       const rvdElement = ELEMENTS.STYLE({
//         color: 'red',
//         backgroundColor,
//         fontSize: '15px'
//       })
//       const element = createDomElement('div', false)
//       connectElementProps(rvdElement, false, element, new Subscription())
//       expect(element.style.backgroundColor).toBe('red')
//       expect(element.style.fontSize).toBe('15px')
//       expect(element.style.color).toBe('red')
//       nextBackgroundColor('black')
//       expect(element.style.backgroundColor).toBe('black')
//       expect(element.style.fontSize).toBe('15px')
//       expect(element.style.color).toBe('red')
//     })
//
//     test('connect style from Observable object fields (static)', () => {
//       const [style, nextStyle] = createState<CSSProperties>({
//         backgroundColor: 'red',
//         fontSize: '15px'
//       })
//       const rvdElement = ELEMENTS.STYLE(style)
//       const element = createDomElement('div', false)
//       connectElementProps(rvdElement, false, element, new Subscription())
//       expect(element.style.backgroundColor).toBe('red')
//       expect(element.style.fontSize).toBe('15px')
//       expect(element.style.color).toBe('')
//       nextStyle({ color: 'red' })
//       expect(element.style.backgroundColor).toBe('red')
//       expect(element.style.fontSize).toBe('15px')
//       expect(element.style.color).toBe('red')
//     })
//
//     test('connect style from Observable object fields (static and Observable)', () => {
//       const [backgroundColor, nextBackgroundColor] = createState('red')
//       const [style, nextStyle] = createState<CSSProperties>({
//         backgroundColor,
//         fontSize: '15px'
//       })
//       const rvdElement = ELEMENTS.STYLE(style)
//       const element = createDomElement('div', false)
//       connectElementProps(rvdElement, false, element, new Subscription())
//       expect(element.style.backgroundColor).toBe('red')
//       expect(element.style.fontSize).toBe('15px')
//       expect(element.style.color).toBe('')
//       nextStyle({ color: 'red' })
//       expect(element.style.backgroundColor).toBe('red')
//       expect(element.style.fontSize).toBe('15px')
//       expect(element.style.color).toBe('red')
//       nextBackgroundColor('black')
//       expect(element.style.backgroundColor).toBe('black')
//       expect(element.style.fontSize).toBe('15px')
//       expect(element.style.color).toBe('red')
//     })
//   })
//
//   describe('connectElementProps should connect Event props', () => {
//     test('connect classic event handler', done => {
//       const rvdElement = ELEMENTS.EVENTS({
//         onClick: (event: RvdMouseEvent<HTMLDivElement>) => {
//           expect(event.target).toBe(element)
//           done()
//         }
//       })
//       const element = createDomElement('div', false)
//       const parentElement = createDomElement('div', false)
//       parentElement.appendChild(element)
//       initEventDelegation(parentElement)
//       connectElementProps(rvdElement, false, element, new Subscription())
//       dispatchMouseEvent(element)
//     })
//   })
//
//   test('connectElementProps should connect Controlled Form Element', () => {
//     const connectSpy = jest.spyOn(controlled, 'connectControlledElement')
//     const rvdElement = ELEMENTS.CONTROLLED_INPUT_TEXT({
//       value: new Observable(o => o.next('test'))
//     })
//     const element = createDomElement('input', false) as HTMLInputElement
//     connectElementProps(rvdElement, false, element, new Subscription())
//     expect(connectSpy).toBeCalled()
//   })
// })
