import { connectElementProps } from '../../../../src/rv-dom/renderer/element-props'
import * as ELEMENTS from '../../../__mocks__/elements'
import { createDomElement } from '../../../../src/rv-dom/renderer/utils'
import { CSSProperties, RvdMouseEvent, RxO } from '../../../../src/shared/types'
import { createState } from '../../../../src/component/state'
import { dispatchMouseEvent } from '../../../__mocks__/events'
import { tap } from 'rxjs/operators'

/* eslint-disable max-len */
describe('Connecting Element Props', () => {
  describe('connectElementProps should connect className prop', () => {
    test('set static className', () => {
      const rvdElement = ELEMENTS.CLASSNAME
      const element = createDomElement('div', false)
      connectElementProps(rvdElement, element)
      expect(element.className).toBe('mock-div')
    })

    test('connect (create Observer) Observable className', () => {
      const [className, nextClassName] = createState('mock-div')
      const rvdElement = ELEMENTS.OBSERVABLE_CLASSNAME(className)
      const element = createDomElement('div', false)
      connectElementProps(rvdElement, element)
      expect(element.className).toBe('mock-div')
      nextClassName('new-mock-div')
      expect(element.className).toBe('new-mock-div')
    })
  })

  describe('connectElementProps should connect DOM props', () => {
    test('set static props (attributes)', () => {
      const rvdElement = ELEMENTS.CLASSNAME_AND_PROPS
      const element = createDomElement('div', false)
      connectElementProps(rvdElement, element)
      expect(element.className).toBe('mock-div')
      expect(element.id).toBe('mock-div-id')
      expect(element.getAttribute('title')).toBe('mock-title-prop')
    })

    test('connect (create Observer) Observable props (attributes)', () => {
      const [id, nextId] = createState('mock-div-id')
      const [title, nextTitle] = createState('mock-title-prop')
      const rvdElement = ELEMENTS.CLASSNAME_AND_OBSERVABLE_PROPS({ id, title })
      const element = createDomElement('div', false)
      connectElementProps(rvdElement, element)
      expect(element.className).toBe('mock-div')
      expect(element.id).toBe('mock-div-id')
      expect(element.getAttribute('title')).toBe('mock-title-prop')
      nextId('new-mock-div-id')
      nextTitle('new-mock-title-prop')
      expect(element.id).toBe('new-mock-div-id')
      expect(element.getAttribute('title')).toBe('new-mock-title-prop')
    })
  })

  describe('connectElementProps should connect style prop', () => {
    test('set style from string', () => {
      const rvdElement = ELEMENTS.STYLE('background-color: red; font-size: 15px;')
      const element = createDomElement('div', false)
      connectElementProps(rvdElement, element)
      expect(element.style.backgroundColor).toBe('red')
      expect(element.style.fontSize).toBe('15px')
    })

    test('connect style from Observable string', () => {
      const [style, nextStyle] = createState('background-color: red; font-size: 15px;')
      const rvdElement = ELEMENTS.STYLE(style)
      const element = createDomElement('div', false)
      connectElementProps(rvdElement, element)
      expect(element.style.backgroundColor).toBe('red')
      expect(element.style.fontSize).toBe('15px')
      nextStyle('color: red;')
      expect(element.style.backgroundColor).toBe('')
      expect(element.style.fontSize).toBe('')
      expect(element.style.color).toBe('red')
    })

    test('connect style from object fields (static and Observable)', () => {
      const [backgroundColor, nextBackgroundColor] = createState('red')
      const rvdElement = ELEMENTS.STYLE({
        color: 'red',
        backgroundColor,
        fontSize: '15px'
      })
      const element = createDomElement('div', false)
      connectElementProps(rvdElement, element)
      expect(element.style.backgroundColor).toBe('red')
      expect(element.style.fontSize).toBe('15px')
      expect(element.style.color).toBe('red')
      nextBackgroundColor('black')
      expect(element.style.backgroundColor).toBe('black')
      expect(element.style.fontSize).toBe('15px')
      expect(element.style.color).toBe('red')
    })

    test('connect style from Observable object fields (static)', () => {
      const [style, nextStyle] = createState<CSSProperties>({
        backgroundColor: 'red',
        fontSize: '15px'
      })
      const rvdElement = ELEMENTS.STYLE(style)
      const element = createDomElement('div', false)
      connectElementProps(rvdElement, element)
      expect(element.style.backgroundColor).toBe('red')
      expect(element.style.fontSize).toBe('15px')
      expect(element.style.color).toBe('')
      nextStyle({ color: 'red' })
      expect(element.style.backgroundColor).toBe('red')
      expect(element.style.fontSize).toBe('15px')
      expect(element.style.color).toBe('red')
    })

    test('connect style from Observable object fields (static and Observable)', () => {
      const [backgroundColor, nextBackgroundColor] = createState('red')
      const [style, nextStyle] = createState<CSSProperties>({
        backgroundColor,
        fontSize: '15px'
      })
      const rvdElement = ELEMENTS.STYLE(style)
      const element = createDomElement('div', false)
      connectElementProps(rvdElement, element)
      expect(element.style.backgroundColor).toBe('red')
      expect(element.style.fontSize).toBe('15px')
      expect(element.style.color).toBe('')
      nextStyle({ color: 'red' })
      expect(element.style.backgroundColor).toBe('red')
      expect(element.style.fontSize).toBe('15px')
      expect(element.style.color).toBe('red')
      nextBackgroundColor('black')
      expect(element.style.backgroundColor).toBe('black')
      expect(element.style.fontSize).toBe('15px')
      expect(element.style.color).toBe('red')
    })
  })

  describe('connectElementProps should connect Event props', () => {
    test('connect classic event handler', done => {
      const rvdElement = ELEMENTS.EVENTS({
        onClick: (event: RvdMouseEvent<HTMLDivElement>) => {
          expect(event.element).toBe(element)
          done()
        }
      })
      const element = createDomElement('div', false)
      connectElementProps(rvdElement, element)
      dispatchMouseEvent(element)
    })

    test('connect reactive event handler', done => {
      const rvdElement = ELEMENTS.EVENTS({
        onClick$: (event$: RxO<RvdMouseEvent<HTMLDivElement>>) => {
          return tap((event: RvdMouseEvent<HTMLDivElement>) => {
            expect(event.element).toBe(element)
            done()
          })(event$)
        }
      })
      const element = createDomElement('div', false)
      connectElementProps(rvdElement, element)
      dispatchMouseEvent(element)
    })
  })
})
