import { handleSyntheticEvent } from 'events/event-delegation'

import { isObservable, first, observer } from '@atom-iq/rx'
import type {
  RvdDOMPropName,
  InputHTMLAttributes,
  RvdHTML,
  RvdChangeEventHandler,
  RvdContext
} from 'types'
import { isNullOrUndef } from 'shared'

import { isCheckedType } from '../../utils'
import { connectProp } from '../connect-prop'

export function controlInput(rvdElement: RvdHTML['input'], context: RvdContext): void {
  const props: InputHTMLAttributes<HTMLInputElement> = rvdElement.props
  const element = rvdElement.dom as HTMLInputElement

  const { type, value, defaultValue, checked, multiple, onChange, onInput, ...restProps } = props

  const hasHandlers = (type: string) => (isCheckedType(type) ? !!onChange : !!onInput)

  const handlers = type =>
    connectInputHandlers(
      element,
      {
        onChange,
        onInput
      },
      type,
      context
    )

  if (isObservable(type)) {
    let previousType: string = null
    rvdElement.sub.add(
      type.subscribe(
        observer((type: string) => {
          type = type || 'text'
          if (previousType !== type) {
            element.setAttribute('type', (previousType = type))
            if (hasHandlers(type)) {
              handlers(type)
            }
          }
        })
      )
    )
  } else {
    const typeOrText = type || 'text'
    element.setAttribute('type', typeOrText)
    if (hasHandlers(typeOrText)) {
      handlers(typeOrText)
    }
  }

  if (!isNullOrUndef(multiple)) {
    if (isObservable(multiple)) {
      rvdElement.sub.add(
        multiple.subscribe(
          observer((v: boolean) => {
            element.multiple = v
          })
        )
      )
    } else {
      element.multiple = multiple
    }
  }

  if (!isNullOrUndef(defaultValue) && !element.value && !element.defaultValue) {
    if (isObservable(defaultValue)) {
      rvdElement.sub.add(
        first<string | number>(defaultValue).subscribe(
          observer((value: string | number) => {
            if (!isNullOrUndef(value) && !element.value && !element.defaultValue) {
              setValue(element, true)(value)
            }
          })
        )
      )
    } else {
      setValue(element, true)(defaultValue)
    }
  }

  if (isObservable(value)) {
    rvdElement.sub.add(
      value.subscribe(
        observer((value: string | number) => {
          setValue(element)(isNullOrUndef(value) ? '' : value)
        })
      )
    )
  } else if (!isNullOrUndef(value)) {
    setValue(element)(value)
  }

  if (isObservable(checked)) {
    rvdElement.sub.add(checked.subscribe(observer(setChecked(element))))
  } else if (!isNullOrUndef(checked)) {
    setChecked(element)(checked)
  }

  for (const propName in restProps) {
    // noinspection JSUnfilteredForInLoop
    connectProp(propName as RvdDOMPropName, rvdElement, context)
  }
}

function connectInputHandlers(
  element: HTMLInputElement,
  { onChange, onInput }: InputHTMLAttributes<HTMLInputElement>,
  type: string,
  context: RvdContext
): void {
  if (isCheckedType(type)) {
    handleSyntheticEvent(element, 'click', e => e.stopPropagation(), context)
    handleSyntheticEvent(element, 'change', onChange as RvdChangeEventHandler, context)
  } else {
    handleSyntheticEvent(element, 'input', onInput as RvdChangeEventHandler, context)

    if (onChange) {
      handleSyntheticEvent(element, 'change', onChange as RvdChangeEventHandler, context)
    }
  }
}

function setChecked(element: HTMLInputElement) {
  return (checked: boolean) => {
    if (element.checked !== checked) {
      element.checked = checked
    }
  }
}

function setValue(element: HTMLInputElement, onlyDefault = false) {
  return (value: string | number) => {
    const newValue = value + ''
    if (onlyDefault) {
      element.defaultValue = newValue
    } else if (element.value !== newValue) {
      element.value = newValue
      element.defaultValue = newValue
    }
  }
}
