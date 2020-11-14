import { Subscription } from 'rxjs'
import { createState } from '../../../../../../src/component/state'
import * as ELEMENTS from '../../../../../__mocks__/elements'
import { createDomElement } from '../../../../../../src/reactive-virtual-dom/renderer/utils'
// eslint-disable-next-line max-len
import * as input from '../../../../../../src/reactive-virtual-dom/renderer/connect-props/controlled-elements/input'
// eslint-disable-next-line max-len
import * as select from '../../../../../../src/reactive-virtual-dom/renderer/connect-props/controlled-elements/select'
// eslint-disable-next-line max-len
import * as textarea from '../../../../../../src/reactive-virtual-dom/renderer/connect-props/controlled-elements/textarea'
// eslint-disable-next-line max-len
import { connectControlledElement } from '../../../../../../src/reactive-virtual-dom/renderer/connect-props/controlled-elements/controlled-element'

describe('Controlled form elements', () => {
  test('connectControlledElement should call controlInput for input', () => {
    const [value] = createState('test')
    const rvdElement = ELEMENTS.CONTROLLED_INPUT_TEXT({ value })
    const domElement = createDomElement('input', false) as HTMLInputElement
    const controlInputSpy = jest.spyOn(input, 'controlInput')
    connectControlledElement(rvdElement, domElement, new Subscription(), () => null)
    expect(controlInputSpy).toBeCalled()
  })
  test('connectControlledElement should call controlSelect for select', () => {
    const [value] = createState('test')
    const rvdElement = ELEMENTS.CONTROLLED_SELECT({ value })
    const domElement = createDomElement('select', false) as HTMLSelectElement
    const controlSelectSpy = jest.spyOn(select, 'controlSelect')
    connectControlledElement(rvdElement, domElement, new Subscription(), () => null)
    expect(controlSelectSpy).toBeCalled()
  })
  test('connectControlledElement should call controlTextArea for textarea', () => {
    const [value] = createState('test')
    const rvdElement = ELEMENTS.CONTROLLED_TEXTAREA({ value })
    const domElement = createDomElement('textarea', false) as HTMLTextAreaElement
    const controlTextAreaSpy = jest.spyOn(textarea, 'controlTextArea')
    connectControlledElement(rvdElement, domElement, new Subscription(), () => null)
    expect(controlTextAreaSpy).toBeCalled()
  })
})
