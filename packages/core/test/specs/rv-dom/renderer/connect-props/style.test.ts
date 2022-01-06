/* eslint-disable max-len */
// import { createDomElement } from '../../../../../src/reactive-virtual-dom/renderer/utils'
// import { CSSProperties } from '../../../../../src/shared/types'
// import { createState } from '../../../../../src/component/state'
// import { connectStyleProp } from '../../../../../src/reactive-virtual-dom/renderer/connect-props/style'
// import { Subscription } from 'rxjs'
//
// const styleString = 'background-color: red; font-size: 15px;'
//
// /* eslint-disable max-len */
// describe('Connecting Element Props', () => {
//   let sub: Subscription
//   let subSpy: jest.SpyInstance
//
//   beforeEach(() => {
//     sub = new Subscription()
//     subSpy = jest.spyOn(sub, 'add')
//   })
//
//   test('connectStyleProp should set style from string (not adding Subscription)', () => {
//     const element = createDomElement('div', false)
//     connectStyleProp(styleString, element, sub)
//     expect(element.style.backgroundColor).toBe('red')
//     expect(element.style.fontSize).toBe('15px')
//     expect(subSpy).not.toBeCalled()
//   })
//
//   test('connectStyleProp should connect style from Observable string (adding Subscription)', () => {
//     const [style, nextStyle] = createState(styleString)
//     const element = createDomElement('div', false)
//     connectStyleProp(style, element, sub)
//     expect(element.style.backgroundColor).toBe('red')
//     expect(element.style.fontSize).toBe('15px')
//     nextStyle('color: red;')
//     expect(element.style.backgroundColor).toBe('')
//     expect(element.style.fontSize).toBe('')
//     expect(element.style.color).toBe('red')
//     expect(subSpy).toBeCalledTimes(1)
//   })
//
//   test('connectStyleProp should connect style from object fields (static and Observable, adding subscription for Observable)', () => {
//     const [backgroundColor, nextBackgroundColor] = createState('red')
//     const styleObject = {
//       color: 'red',
//       backgroundColor,
//       fontSize: '15px'
//     }
//     const element = createDomElement('div', false)
//     connectStyleProp(styleObject, element, sub)
//     expect(element.style.backgroundColor).toBe('red')
//     expect(element.style.fontSize).toBe('15px')
//     expect(element.style.color).toBe('red')
//     nextBackgroundColor('black')
//     expect(element.style.backgroundColor).toBe('black')
//     expect(element.style.fontSize).toBe('15px')
//     expect(element.style.color).toBe('red')
//     expect(subSpy).toBeCalledTimes(1)
//   })
//
//   test('connectStyleProp should connect style from Observable object fields (static, adding one subscription)', () => {
//     const [style, nextStyle] = createState<CSSProperties>({
//       backgroundColor: 'red',
//       fontSize: '15px'
//     })
//
//     const element = createDomElement('div', false)
//     connectStyleProp(style, element, sub)
//     expect(element.style.backgroundColor).toBe('red')
//     expect(element.style.fontSize).toBe('15px')
//     expect(element.style.color).toBe('')
//     nextStyle({ color: 'red' })
//     expect(element.style.backgroundColor).toBe('red')
//     expect(element.style.fontSize).toBe('15px')
//     expect(element.style.color).toBe('red')
//     expect(subSpy).toBeCalledTimes(1)
//   })
//
//   test('connect style from Observable object fields (static and Observable, adding subscription for prop and Observable field)', () => {
//     const [backgroundColor, nextBackgroundColor] = createState('red')
//     const [style, nextStyle] = createState<CSSProperties>({
//       backgroundColor,
//       'font-size': '15px'
//     })
//
//     const element = createDomElement('div', false)
//     connectStyleProp(style, element, sub)
//     expect(element.style.backgroundColor).toBe('red')
//     expect(element.style.fontSize).toBe('15px')
//     expect(element.style.color).toBe('')
//     nextStyle({ color: 'red' })
//     expect(element.style.backgroundColor).toBe('red')
//     expect(element.style.fontSize).toBe('15px')
//     expect(element.style.color).toBe('red')
//     nextBackgroundColor('black')
//     expect(element.style.backgroundColor).toBe('black')
//     expect(element.style.fontSize).toBe('15px')
//     expect(element.style.color).toBe('red')
//     nextStyle(null)
//     expect(element.style.backgroundColor).toBe('')
//     expect(element.style.fontSize).toBe('')
//     expect(element.style.color).toBe('')
//     expect(subSpy).toBeCalledTimes(2)
//   })
//
//   test('connect style shouldn`t do anything for static null value', () => {
//     const element = createDomElement('div', false)
//     expect(element.style.backgroundColor).toBe('')
//     expect(element.style.fontSize).toBe('')
//     expect(element.style.color).toBe('')
//     connectStyleProp(null, element, sub)
//     expect(element.style.backgroundColor).toBe('')
//     expect(element.style.fontSize).toBe('')
//     expect(element.style.color).toBe('')
//     expect(subSpy).not.toBeCalled()
//   })
// })
