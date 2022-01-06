import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'
import { isObservable } from '../../utils'

import type {
  RvdDOMPropName,
  InputHTMLAttributes,
  RvdHTML,
  RvdChangeEventHandler,
  RvdContext
} from 'types'
import { isNullOrUndef } from 'shared'
import { handleSyntheticEvent } from 'red/event-delegation'

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
    let typeSubscription: Subscription
    let previousType: string = null
    rvdElement.sub.add(
      type.subscribe((type: string) => {
        type = type || 'text'
        if (previousType !== type) {
          element.setAttribute('type', (previousType = type))
          if (typeSubscription) {
            typeSubscription.unsubscribe()
          }
          if (hasHandlers(type)) {
            typeSubscription = handlers(type)
            rvdElement.sub.add(typeSubscription)
          }
        }
      })
    )
  } else {
    const typeOrText = type || 'text'
    element.setAttribute('type', typeOrText)
    if (hasHandlers(typeOrText)) {
      rvdElement.sub.add(handlers(typeOrText))
    }
  }

  if (!isNullOrUndef(multiple)) {
    if (isObservable(multiple)) {
      rvdElement.sub.add(
        multiple.subscribe((v: boolean) => {
          element.multiple = v
        })
      )
    } else {
      element.multiple = multiple
    }
  }

  if (!isNullOrUndef(defaultValue) && !element.value && !element.defaultValue) {
    if (isObservable(defaultValue)) {
      rvdElement.sub.add(
        take<string | number>(1)(defaultValue).subscribe(function (value: string | number) {
          if (!isNullOrUndef(value) && !element.value && !element.defaultValue) {
            setValue(element, true)(value)
          }
        })
      )
    } else {
      setValue(element, true)(defaultValue)
    }
  }

  if (isObservable(value)) {
    rvdElement.sub.add(
      value.subscribe(function (value: string | number) {
        setValue(element)(isNullOrUndef(value) ? '' : value)
      })
    )
  } else if (!isNullOrUndef(value)) {
    setValue(element)(value)
  }

  if (isObservable(checked)) {
    rvdElement.sub.add(checked.subscribe(setChecked(element)))
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
): Subscription {
  const subscription = new Subscription()
  if (isCheckedType(type)) {
    subscription.add(handleSyntheticEvent(element, 'click', e => e.stopPropagation(), context))
    subscription.add(
      handleSyntheticEvent(element, 'change', onChange as RvdChangeEventHandler, context)
    )
  } else {
    subscription.add(
      handleSyntheticEvent(element, 'input', onInput as RvdChangeEventHandler, context)
    )

    if (onChange) {
      subscription.add(
        handleSyntheticEvent(element, 'change', onChange as RvdChangeEventHandler, context)
      )
    }
  }

  return subscription
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
