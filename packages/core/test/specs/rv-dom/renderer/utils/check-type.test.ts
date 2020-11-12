import * as ELEMENTS from '../../../../__mocks__/elements'
import * as COMPONENTS from '../../../../__mocks__/components'
import {
  isControlledFormElement,
  isRvdNode
} from '../../../../../src/reactive-virtual-dom/renderer/utils'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

const mockObservable = new Observable<string>(observer => observer.next('test'))

/* eslint-disable max-len */
describe('Check-type utils', () => {
  test('isRvdElement should return true for Rvd Elements, Fragments and Components', () => {
    expect(isRvdNode(ELEMENTS.CLASSNAME)).toBeTruthy()
    expect(isRvdNode(ELEMENTS.KEYED_FRAGMENT)).toBeTruthy()
    expect(isRvdNode(COMPONENTS.COMPONENT_ELEMENT)).toBeTruthy()
  })

  test('isRvdElement should return false for values other than Rvd Elements, Fragments and Components', () => {
    expect(isRvdNode('I am child')).toBeFalsy()
    expect(isRvdNode(123)).toBeFalsy()
    expect(isRvdNode(['bad value'])).toBeFalsy()
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
