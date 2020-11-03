import * as ELEMENTS from '../../../../__mocks__/elements'
import * as COMPONENTS from '../../../../__mocks__/components'
import {
  childTypeSwitch,
  createDomElement,
  createTextNode,
  isComponent,
  isControlledFormElement,
  isElement,
  isFragment,
  isHtmlElement,
  isRvdElement,
  isSvgElement,
  renderTypeSwitch
} from '../../../../../src/rv-dom/renderer/utils'
import {
  createChildrenManager,
  createEmptyFragment,
  setCreatedChild
} from '../../../../../src/rv-dom/renderer/utils/children-manager'
import { RvdChildrenManager, RvdElement } from '../../../../../src/shared/types'
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

  describe('childTypeSwitch should call proper callback based on child value', () => {
    test('should call nullCallback, when it`s passed and child is null, undefined or boolean', () => {
      const nullCallback = jest.fn()
      const otherCallback = jest.fn()
      const switchFn = childTypeSwitch(
        nullCallback,
        otherCallback,
        otherCallback,
        otherCallback,
        otherCallback,
        otherCallback
      )
      switchFn(null)
      switchFn(undefined)
      switchFn(true)
      switchFn(false)
      expect(nullCallback).toBeCalledTimes(4)
      expect(otherCallback).not.toBeCalled()
    })

    test('should call textCallback, when child is string or number', () => {
      const textCallback = jest.fn()
      const otherCallback = jest.fn()
      const switchFn = childTypeSwitch(
        otherCallback,
        textCallback,
        otherCallback,
        otherCallback,
        otherCallback,
        otherCallback
      )
      switchFn('text')
      switchFn(123)
      switchFn(0)
      expect(textCallback).toBeCalledTimes(3)
      expect(otherCallback).not.toBeCalled()
    })

    test('should call arrayCallback, when child is an array', () => {
      const arrayCallback = jest.fn()
      const otherCallback = jest.fn()
      const switchFn = childTypeSwitch(
        otherCallback,
        otherCallback,
        arrayCallback,
        otherCallback,
        otherCallback,
        otherCallback
      )
      switchFn([])
      switchFn(['abc', 'def'])
      expect(arrayCallback).toBeCalledTimes(2)
      expect(otherCallback).not.toBeCalled()
    })

    test('should call componentCallback, when child is RvdComponent', () => {
      const componentCallback = jest.fn()
      const otherCallback = jest.fn()
      const switchFn = childTypeSwitch(
        otherCallback,
        otherCallback,
        otherCallback,
        componentCallback,
        otherCallback,
        otherCallback
      )
      switchFn(COMPONENTS.COMPONENT_ELEMENT)
      expect(componentCallback).toBeCalledTimes(1)
      expect(otherCallback).not.toBeCalled()
    })

    test('should call fragmentCallback, when child is RvdFragment', () => {
      const fragmentCallback = jest.fn()
      const otherCallback = jest.fn()
      const switchFn = childTypeSwitch(
        otherCallback,
        otherCallback,
        otherCallback,
        otherCallback,
        fragmentCallback,
        otherCallback
      )
      switchFn(ELEMENTS.KEYED_FRAGMENT)
      switchFn(ELEMENTS.NON_KEYED_FRAGMENT_MULTIPLE_CHILDREN)
      expect(fragmentCallback).toBeCalledTimes(2)
      expect(otherCallback).not.toBeCalled()
    })

    test('should call elementCallback, when child is RvdElement', () => {
      const elementCallback = jest.fn()
      const otherCallback = jest.fn()
      const switchFn = childTypeSwitch(
        otherCallback,
        otherCallback,
        otherCallback,
        otherCallback,
        otherCallback,
        elementCallback
      )
      switchFn(ELEMENTS.CLASSNAME)
      switchFn(ELEMENTS.SVG)
      switchFn(ELEMENTS.CLASSNAME_PROPS_AND_ONE_CHILD)
      expect(elementCallback).toBeCalledTimes(3)
      expect(otherCallback).not.toBeCalled()
    })

    test('should throw Error, when child is Object that is not RvdElement compatible', () => {
      const otherCallback = jest.fn()
      const switchFn = childTypeSwitch(
        otherCallback,
        otherCallback,
        otherCallback,
        otherCallback,
        otherCallback,
        otherCallback
      )
      const result = jest.fn(() =>
        switchFn(({
          color: 'abc'
        } as unknown) as RvdElement)
      )
      expect(result).toThrowError('Wrong Child type')
      expect(otherCallback).not.toBeCalled()
    })

    test('should throw Error, when child is Object that is wrong RvdElement (wrong flag)', () => {
      const otherCallback = jest.fn()
      const switchFn = childTypeSwitch(
        otherCallback,
        otherCallback,
        otherCallback,
        otherCallback,
        otherCallback,
        otherCallback
      )
      const result = jest.fn(() =>
        switchFn(({
          type: 'strange',
          elementFlag: 256
        } as unknown) as RvdElement)
      )
      expect(result).toThrowError('RvdElement has unknown type')
      expect(otherCallback).not.toBeCalled()
    })
  })

  describe('renderTypeSwitch should call proper callback based existing children on given index', () => {
    let createdChildren: RvdChildrenManager

    beforeEach(() => {
      createdChildren = createChildrenManager()
    })

    test('should call hasOneCallback, when single element or text is existing on given index', () => {
      const hasOneCallback = jest.fn()
      const otherCallback = jest.fn()
      setCreatedChild(createdChildren, '0', { element: createDomElement('div', null), index: '0' })
      setCreatedChild(createdChildren, '1', {
        element: createTextNode('Text'),
        index: '1',
        isText: true
      })
      const switchFn = renderTypeSwitch(hasOneCallback, otherCallback, otherCallback)
      switchFn('0', createdChildren)
      switchFn('1', createdChildren)

      expect(hasOneCallback).toBeCalledTimes(2)
      expect(otherCallback).not.toBeCalled()
    })

    test('should call hasFragmentCallback, when fragment element is existing on given index', () => {
      const hasFragmentCallback = jest.fn()
      const otherCallback = jest.fn()
      createEmptyFragment(createdChildren, '0')
      renderTypeSwitch(otherCallback, hasFragmentCallback, otherCallback)('0', createdChildren)

      expect(hasFragmentCallback).toBeCalledTimes(1)
      expect(otherCallback).not.toBeCalled()
    })

    test('should call hasNothingCallback, when there is nothing on given index', () => {
      const hasNothingCallback = jest.fn()
      const otherCallback = jest.fn()
      const switchFn = renderTypeSwitch(otherCallback, otherCallback, hasNothingCallback)
      switchFn('0', createdChildren)
      switchFn('1', createdChildren)

      expect(hasNothingCallback).toBeCalledTimes(2)
      expect(otherCallback).not.toBeCalled()
    })
  })
})
