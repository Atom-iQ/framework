/* eslint-disable max-len */
import * as ELEMENTS from '../../../../../__mocks__/elements'
import { createState } from '../../../../../../src/component/state'
import { appendChild, createDomElement } from '../../../../../../src/rv-dom/renderer/utils'
import { RvdEvent, RxSub } from '../../../../../../src/shared/types'
import { Subscription } from 'rxjs'
import { map, scan, tap } from 'rxjs/operators'
import { dispatchChangeEvent } from '../../../../../__mocks__/events'
import { controlSelect } from '../../../../../../src/rv-dom/renderer/connect-props/controlled-elements/select'

const appendSelectOptions = select =>
  Array.from({ length: 5 }).forEach((_, i) => {
    const option = createDomElement('option', false) as HTMLOptionElement
    option.value = 'option-' + i
    appendChild(select, option)
  })

describe('Controlled select', () => {
  let sub: RxSub
  let subSpy: jest.SpyInstance

  beforeEach(() => {
    sub = new Subscription()
    subSpy = jest.spyOn(sub, 'add')
  })

  test('controlSelect should connect controlled Observable value', () => {
    const [value, nextValue] = createState('option-0')
    const rvdSelect = ELEMENTS.CONTROLLED_SELECT({ value })
    const domSelect = createDomElement('select', false) as HTMLSelectElement
    appendSelectOptions(domSelect)
    controlSelect(rvdSelect, domSelect, sub, () => {
      return null
    })

    expect(domSelect.options[0].selected).toBeTruthy()
    nextValue('option-3')
    expect(domSelect.options[0].selected).toBeFalsy()
    expect(domSelect.options[3].selected).toBeTruthy()
    expect(subSpy).toBeCalledTimes(1)
  })

  test('controlSelect should connect controlled Observable value and classic handler', () => {
    const [value, nextValue] = createState('option-0')
    const rvdSelect = ELEMENTS.CONTROLLED_SELECT({ value, onChange: jest.fn() })
    const domSelect = createDomElement('select', false) as HTMLSelectElement
    appendSelectOptions(domSelect)
    controlSelect(rvdSelect, domSelect, sub, () => {
      return null
    })

    expect(domSelect.options[0].selected).toBeTruthy()
    nextValue('option-3')
    expect(domSelect.options[0].selected).toBeFalsy()
    expect(domSelect.options[3].selected).toBeTruthy()
    expect(subSpy).toBeCalledTimes(2)
  })

  test('controlSelect should connect controlled Observable value prop (multiple select)', () => {
    const [value, nextValue] = createState(['option-0'])
    const rvdSelect = ELEMENTS.CONTROLLED_SELECT({ value, multiple: true })
    const domSelect = createDomElement('select', false) as HTMLSelectElement
    appendSelectOptions(domSelect)
    controlSelect(rvdSelect, domSelect, sub, () => {
      return null
    })

    expect(domSelect.options[0].selected).toBeTruthy()
    nextValue(['option-1', 'option-3'])
    expect(domSelect.options[0].selected).toBeFalsy()
    expect(domSelect.options[1].selected).toBeTruthy()
    expect(domSelect.options[3].selected).toBeTruthy()
    expect(subSpy).toBeCalledTimes(1)
  })

  test('controlSelect should connect controlled reactive event handler', () => {
    const rvdSelect = ELEMENTS.CONTROLLED_SELECT({
      onChange$: map<RvdEvent<HTMLSelectElement>, string>(event => {
        return event.target.value || 'option-0'
      })
    })
    const domSelect = createDomElement('select', false) as HTMLSelectElement
    appendSelectOptions(domSelect)
    controlSelect(rvdSelect, domSelect, sub, () => {
      return null
    })
    dispatchChangeEvent(domSelect)
    expect(domSelect.options[0].selected).toBeTruthy()
    domSelect.value = 'option-3'
    dispatchChangeEvent(domSelect)
    expect(domSelect.options[0].selected).toBeFalsy()
    expect(domSelect.options[3].selected).toBeTruthy()

    expect(subSpy).toBeCalledTimes(1)
  })

  test('controlSelect should connect controlled reactive event handler and Observable value', () => {
    const [value, nextValue] = createState('option-0')
    const rvdSelect = ELEMENTS.CONTROLLED_SELECT({
      onChange$: tap<RvdEvent<HTMLSelectElement>>(event => {
        nextValue(event.target.value)
      }),
      value
    })
    const domSelect = createDomElement('select', false) as HTMLSelectElement
    appendSelectOptions(domSelect)
    controlSelect(rvdSelect, domSelect, sub, () => {
      return null
    })
    dispatchChangeEvent(domSelect)
    expect(domSelect.options[0].selected).toBeTruthy()
    domSelect.value = 'option-3'
    dispatchChangeEvent(domSelect)
    expect(domSelect.options[0].selected).toBeFalsy()
    expect(domSelect.options[3].selected).toBeTruthy()

    expect(subSpy).toBeCalledTimes(2)
  })

  test('controlSelect should connect controlled reactive event handler (multiple select)', () => {
    const rvdSelect = ELEMENTS.CONTROLLED_SELECT({
      onChange$: scan<RvdEvent<HTMLSelectElement>, string[]>((value, event) => {
        return value.includes(event.target.value)
          ? value.filter(v => v !== event.target.value)
          : value.concat(event.target.value)
      }, []),
      multiple: true
    })
    const domSelect = createDomElement('select', false) as HTMLSelectElement
    appendSelectOptions(domSelect)
    controlSelect(rvdSelect, domSelect, sub, () => {
      return null
    })
    dispatchChangeEvent(domSelect)
    expect(domSelect.options[0].selected).toBeTruthy()
    domSelect.value = 'option-3'
    dispatchChangeEvent(domSelect)
    expect(domSelect.options[0].selected).toBeTruthy()
    expect(domSelect.options[3].selected).toBeTruthy()
    domSelect.value = 'option-3'
    dispatchChangeEvent(domSelect)
    expect(domSelect.options[0].selected).toBeTruthy()
    expect(domSelect.options[3].selected).toBeFalsy()

    expect(subSpy).toBeCalledTimes(1)
  })

  test('controlSelect should set static multiple prop when it`s true', () => {
    const [value] = createState(null)
    const rvdSelect = ELEMENTS.CONTROLLED_SELECT({ value, multiple: true })
    const domSelect = createDomElement('select', false) as HTMLSelectElement
    expect(domSelect.multiple).toBeFalsy()
    controlSelect(rvdSelect, domSelect, sub, () => {
      return null
    })

    expect(domSelect.multiple).toBeTruthy()
    expect(subSpy).toBeCalledTimes(1)
  })

  test('controlSelect should not set static multiple prop when it`s false', () => {
    const [value] = createState(null)
    const rvdSelect = ELEMENTS.CONTROLLED_SELECT({ value, multiple: false })
    const domSelect = createDomElement('select', false) as HTMLSelectElement
    expect(domSelect.multiple).toBeFalsy()
    controlSelect(rvdSelect, domSelect, sub, () => {
      return null
    })

    expect(domSelect.multiple).toBeFalsy()
    expect(subSpy).toBeCalledTimes(1)
  })

  test('controlSelect should connect Observable multiple prop', () => {
    const [value] = createState(null)
    const [multiple] = createState(true)
    const rvdSelect = ELEMENTS.CONTROLLED_SELECT({ value, multiple })
    const domSelect = createDomElement('select', false) as HTMLSelectElement
    expect(domSelect.multiple).toBeFalsy()
    controlSelect(rvdSelect, domSelect, sub, () => {
      return null
    })

    expect(domSelect.multiple).toBeTruthy()
    expect(subSpy).toBeCalledTimes(2)
  })

  test('controlSelect should connect Observable selectedIndex prop', () => {
    const [value] = createState(null)
    const [selectedIndex, nextSelectedIndex] = createState(0)
    const rvdSelect = ELEMENTS.CONTROLLED_SELECT({ value, selectedIndex })
    const domSelect = createDomElement('select', false) as HTMLSelectElement
    appendSelectOptions(domSelect)
    controlSelect(rvdSelect, domSelect, sub, () => {
      return null
    })

    expect(domSelect.options[0].selected).toBeTruthy()

    nextSelectedIndex(3)
    expect(domSelect.options[0].selected).toBeFalsy()
    expect(domSelect.options[3].selected).toBeTruthy()
    expect(subSpy).toBeCalledTimes(2)
  })

  test('controlSelect should just call restPropsCallback, when controlled prop are not provided (not possible in real app)', () => {
    const rvdSelect = ELEMENTS.CONTROLLED_SELECT({ title: 'abc' })
    const domSelect = createDomElement('select', false) as HTMLSelectElement
    appendSelectOptions(domSelect)
    const restPropsCallback = jest.fn()
    controlSelect(rvdSelect, domSelect, sub, restPropsCallback)

    expect(subSpy).not.toBeCalled()
    expect(restPropsCallback).toBeCalled()
  })
})
