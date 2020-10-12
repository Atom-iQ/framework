import type {
  InputHTMLAttributes,
  PropEntryCallback,
  RvdHTML,
  RxSub
} from '../../../../shared/types'
import { fromEvent, isObservable, Subscription } from 'rxjs'
import { isNullOrUndef } from '../../../../shared'
import { first } from 'rxjs/operators'
import { isCheckedType } from '../../utils'

const setChecked = (element: HTMLInputElement) => (checked: boolean) => {
  if (element.checked !== checked) {
    element.checked = checked
  }
}

const setValue = (element: HTMLInputElement, onlyDefault = false) => (value: string | number) => {
  const newValue = value + ''
  if (onlyDefault) {
    element.defaultValue = newValue
  } else if (element.value !== newValue) {
    element.value = newValue
    element.defaultValue = newValue
  }
}

const connectInputHandlers = (
  element: HTMLInputElement,
  { onChange, onChange$, onInput, onInput$ }: InputHTMLAttributes<HTMLInputElement>,
  type: string,
  hasChecked: boolean,
  hasValue: boolean
) => {
  const subscription = new Subscription()
  if (isCheckedType(type) && (onChange || onChange$)) {
    subscription.add(fromEvent(element, 'click').subscribe(event => event.stopPropagation()))
    const event$ = fromEvent(element, 'change')

    if (onChange$) {
      const onNextChange = hasChecked ? () => void 0 : setChecked(element)
      subscription.add((onChange$ as Function)(event$).subscribe(onNextChange))
    }

    if (onChange) {
      subscription.add(event$.subscribe(event => (onChange as Function)(event)))
    }
  } else if (onInput || onInput$) {
    const event$ = fromEvent(element, 'input')

    if (onInput$) {
      const onNextInput = hasValue ? () => void 0 : setValue(element)
      subscription.add((onInput$ as Function)(event$).subscribe(onNextInput))
    }

    if (onInput) {
      subscription.add(event$.subscribe(event => (onInput as Function)(event)))
    }
  }

  return subscription
}

export const controlInput = (
  rvdElement: RvdHTML['input'],
  element: HTMLInputElement,
  propsSubscription: RxSub,
  restPropsCallback: PropEntryCallback
): void => {
  const props: InputHTMLAttributes<HTMLInputElement> = rvdElement.props

  const {
    type,
    value,
    defaultValue,
    checked,
    multiple,
    onChange,
    onChange$,
    onInput,
    onInput$,
    ...restProps
  } = props

  const handlerProps = {
    onChange,
    onChange$,
    onInput,
    onInput$
  }

  if (isObservable(type)) {
    let typeSubscription: RxSub
    propsSubscription.add(
      type.subscribe(type => {
        const typeOrText = type || 'text'
        if (element.getAttribute('type') !== typeOrText) {
          element.setAttribute('type', typeOrText)
          if (typeSubscription) {
            typeSubscription.unsubscribe()
          }
          typeSubscription = connectInputHandlers(
            element,
            handlerProps,
            type,
            isObservable(checked),
            isObservable(value)
          )
          propsSubscription.add(typeSubscription)
        }
      })
    )
  } else {
    element.setAttribute('type', type || 'text')
    propsSubscription.add(
      connectInputHandlers(element, handlerProps, type, isObservable(checked), isObservable(value))
    )
  }

  if (!isNullOrUndef(multiple)) {
    if (isObservable(multiple)) {
      propsSubscription.add(
        multiple.subscribe(v => {
          element.multiple = v
        })
      )
    } else {
      element.multiple = multiple
    }
  }

  if (!isNullOrUndef(defaultValue) && !element.value && !element.defaultValue) {
    if (isObservable(defaultValue)) {
      propsSubscription.add(first()(defaultValue).subscribe(setValue(element, true)))
    } else {
      setValue(element, true)(defaultValue)
    }
  }

  if (isObservable(value)) {
    propsSubscription.add(value.subscribe(setValue(element)))
  } else if (!isNullOrUndef(value)) {
    setValue(element)(value)
  }

  if (isObservable(checked)) {
    propsSubscription.add(checked.subscribe(setChecked(element)))
  } else if (!isNullOrUndef(checked)) {
    setChecked(element)(checked)
  }

  Object.entries(restProps).forEach(restPropsCallback)
}
