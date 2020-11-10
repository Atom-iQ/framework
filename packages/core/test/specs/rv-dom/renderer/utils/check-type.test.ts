import * as ELEMENTS from '../../../../__mocks__/elements'
import * as COMPONENTS from '../../../../__mocks__/components'
import {
  createDomElement,
  createTextNode,
  isComponent,
  isControlledFormElement,
  isElement,
  isFragment,
  isHtmlElement,
  isRvdElement,
  isSvgElement
} from '../../../../../src/reactive-virtual-dom/renderer/utils'
import {
  createChildrenManager,
  createEmptyFragment,
  setCreatedChild
} from '../../../../../src/reactive-virtual-dom/renderer/children-manager'
import { RvdChildrenManager } from '../../../../../src/shared/types'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

const mockObservable = new Observable<string>(observer => observer.next('test'))

/* eslint-disable max-len */
describe('Check-type utils', () => {
  test('isRvdElement should return true for Rvd Elements, Fragments and Components', () => {
    expect(isRvdElement(ELEMENTS.CLASSNAME)).toBeTruthy()
    expect(isRvdElement(ELEMENTS.KEYED_FRAGMENT)).toBeTruthy()
    expect(isRvdElement(COMPONENTS.COMPONENT_ELEMENT)).toBeTruthy()
  })

  test('isRvdElement should return false for values other than Rvd Elements, Fragments and Components', () => {
    expect(isRvdElement('I am child')).toBeFalsy()
    expect(isRvdElement(123)).toBeFalsy()
    expect(isRvdElement(['bad value'])).toBeFalsy()
  })

  test('isComponent should return true for Rvd Components', () => {
    expect(isComponent(COMPONENTS.COMPONENT_ELEMENT)).toBeTruthy()
  })

  test('isComponent should return false for Rvd Elements and Fragments', () => {
    expect(isComponent(ELEMENTS.CLASSNAME)).toBeFalsy()
    expect(isComponent(ELEMENTS.KEYED_FRAGMENT)).toBeFalsy()
  })

  test('isFragment should return true for Rvd Fragments', () => {
    expect(isFragment(ELEMENTS.KEYED_FRAGMENT)).toBeTruthy()
    expect(isFragment(ELEMENTS.NON_KEYED_FRAGMENT_ONE_CHILD)).toBeTruthy()
  })

  test('isFragment should return false for Rvd Elements and Components', () => {
    expect(isFragment(ELEMENTS.CLASSNAME)).toBeFalsy()
    expect(isFragment(COMPONENTS.COMPONENT_ELEMENT)).toBeFalsy()
  })

  test('isElement should return true for Rvd Elements (HTML and SVG)', () => {
    expect(isElement(ELEMENTS.CLASSNAME)).toBeTruthy()
    expect(isElement(ELEMENTS.SVG)).toBeTruthy()
  })

  test('isElement should return false for Rvd Fragments and Components', () => {
    expect(isElement(ELEMENTS.NON_KEYED_FRAGMENT_ONE_CHILD)).toBeFalsy()
    expect(isElement(COMPONENTS.COMPONENT_ELEMENT)).toBeFalsy()
  })

  test('isHtmlElement should return true for Rvd HTML Elements', () => {
    expect(isHtmlElement(ELEMENTS.CLASSNAME)).toBeTruthy()
  })

  test('isHtmlElement should return false for Rvd SVG Elements', () => {
    expect(isHtmlElement(ELEMENTS.SVG)).toBeFalsy()
  })

  test('isSvgElement should return true for Rvd SVG Elements', () => {
    expect(isSvgElement(ELEMENTS.SVG)).toBeTruthy()
  })

  test('isSvgElement should return false for Rvd HTML Elements', () => {
    expect(isSvgElement(ELEMENTS.CLASSNAME)).toBeFalsy()
  })

  test('isSvgElement should return false for Rvd HTML Elements', () => {
    expect(isSvgElement(ELEMENTS.CLASSNAME)).toBeFalsy()
  })

  test('isControlledFormElement should return true for Controlled Form Elements', () => {
    expect(
      isControlledFormElement(
        ELEMENTS.CONTROLLED_INPUT_CHECKED({ checked: map(Boolean)(mockObservable) })
      )
    ).toBeTruthy()
    expect(
      isControlledFormElement(
        ELEMENTS.CONTROLLED_INPUT_CHECKED({ checked: true, onChange$: event$ => event$ })
      )
    ).toBeTruthy()
    expect(
      isControlledFormElement(ELEMENTS.CONTROLLED_INPUT_CHECKED({ onChange$: event$ => event$ }))
    ).toBeTruthy()

    expect(
      isControlledFormElement(ELEMENTS.CONTROLLED_INPUT_TEXT({ value: mockObservable }))
    ).toBeTruthy()
    expect(
      isControlledFormElement(ELEMENTS.CONTROLLED_INPUT_TEXT({ onInput$: event$ => event$ }))
    ).toBeTruthy()
    expect(
      isControlledFormElement(
        ELEMENTS.CONTROLLED_INPUT_TEXT({ value: 'test', onInput$: event$ => event$ })
      )
    ).toBeTruthy()

    expect(
      isControlledFormElement(ELEMENTS.CONTROLLED_TEXTAREA({ onInput$: event$ => event$ }))
    ).toBeTruthy()
    expect(
      isControlledFormElement(
        ELEMENTS.CONTROLLED_TEXTAREA({ value: 'test', onInput$: event$ => event$ })
      )
    ).toBeTruthy()

    expect(
      isControlledFormElement(ELEMENTS.CONTROLLED_TEXTAREA({ value: mockObservable }))
    ).toBeTruthy()

    expect(
      isControlledFormElement(ELEMENTS.CONTROLLED_SELECT({ value: mockObservable }))
    ).toBeTruthy()
    expect(
      isControlledFormElement(
        ELEMENTS.CONTROLLED_SELECT({ value: 'test', onChange$: event$ => event$ })
      )
    ).toBeTruthy()
    expect(
      isControlledFormElement(ELEMENTS.CONTROLLED_SELECT({ onChange$: event$ => event$ }))
    ).toBeTruthy()
  })

  test('isControlledFormElement should return false for not Controlled Form Elements', () => {
    expect(isControlledFormElement(ELEMENTS.UNCONTROLLED_INPUT)).toBeFalsy()
    expect(isControlledFormElement(ELEMENTS.UNCONTROLLED_SELECT)).toBeFalsy()
    expect(isControlledFormElement(ELEMENTS.UNCONTROLLED_TEXTAREA)).toBeFalsy()
    expect(isControlledFormElement(ELEMENTS.CLASSNAME)).toBeFalsy()
    expect(isControlledFormElement(ELEMENTS.CLASSNAME_MANY_PROPS_AND_MANY_CHILDREN)).toBeFalsy()
  })
})
