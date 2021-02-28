import type {
  RvdDOMPropName,
  InputHTMLAttributes,
  RvdPropEntryCallback,
  RvdHTML,
  RvdChangeEventHandler
} from 'types'
import { isObservable, Subscription } from 'rxjs'
import { take } from 'rxjs/operators'
import { isNullOrUndef } from 'shared'
import { isCheckedType } from '../../utils'
import { handleSyntheticEvent } from 'red/event-delegation'

export function controlInput(
  rvdElement: RvdHTML['input'],
  element: HTMLInputElement,
  propsSubscription: Subscription,
  restPropsCallback: RvdPropEntryCallback
): void {
  const props: InputHTMLAttributes<HTMLInputElement> = rvdElement.props

  const { type, value, defaultValue, checked, multiple, onChange, onInput, ...restProps } = props

  const hasHandlers = (type: string) => (isCheckedType(type) ? !!onChange : !!onInput)

  const handlers = type =>
    connectInputHandlers(
      element,
      {
        onChange,
        onInput
      },
      type
    )

  if (isObservable(type)) {
    let typeSubscription: Subscription
    let previousType: string = null
    propsSubscription.add(
      type.subscribe((type: string) => {
        type = type || 'text'
        if (previousType !== type) {
          element.setAttribute('type', (previousType = type))
          if (typeSubscription) {
            typeSubscription.unsubscribe()
          }
          if (hasHandlers(type)) {
            typeSubscription = handlers(type)
            propsSubscription.add(typeSubscription)
          }
        }
      })
    )
  } else {
    const typeOrText = type || 'text'
    element.setAttribute('type', typeOrText)
    if (hasHandlers(typeOrText)) {
      propsSubscription.add(handlers(typeOrText))
    }
  }

  if (!isNullOrUndef(multiple)) {
    if (isObservable(multiple)) {
      propsSubscription.add(
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
      propsSubscription.add(
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
    propsSubscription.add(
      value.subscribe(function (value: string | number) {
        setValue(element)(isNullOrUndef(value) ? '' : value)
      })
    )
  } else if (!isNullOrUndef(value)) {
    setValue(element)(value)
  }

  if (isObservable(checked)) {
    propsSubscription.add(checked.subscribe(setChecked(element)))
  } else if (!isNullOrUndef(checked)) {
    setChecked(element)(checked)
  }

  for (const propName in restProps) {
    // noinspection JSUnfilteredForInLoop
    restPropsCallback(propName as RvdDOMPropName, restProps[propName])
  }
}

function connectInputHandlers(
  element: HTMLInputElement,
  { onChange, onInput }: InputHTMLAttributes<HTMLInputElement>,
  type: string
): Subscription {
  const subscription = new Subscription()
  if (isCheckedType(type)) {
    subscription.add(handleSyntheticEvent(element, 'click', e => e.stopPropagation()))
    subscription.add(handleSyntheticEvent(element, 'change', onChange as RvdChangeEventHandler))
  } else {
    subscription.add(handleSyntheticEvent(element, 'input', onInput as RvdChangeEventHandler))

    if (onChange) {
      subscription.add(handleSyntheticEvent(element, 'change', onChange as RvdChangeEventHandler))
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
