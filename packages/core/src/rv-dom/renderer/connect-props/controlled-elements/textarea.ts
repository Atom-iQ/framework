import {
  RvdChangeEvent,
  DOMFormElement,
  RvdFormEvent,
  InputHTMLAttributes,
  PropEntryCallback,
  RvdControlledFormElement,
  RvdHTML,
  RxO,
  RxSub,
  TextareaHTMLAttributes
} from '../../../../shared/types'
import { RvdElementFlags } from '../../../../shared/flags'
import { fromEvent, isObservable, Subscription } from 'rxjs'
import { isNullOrUndef, isStringOrNumber } from '../../../../shared'
import { first, map, takeUntil } from 'rxjs/operators'
import { isCheckedType } from '../../utils'

const connectTextAreaHandlers = (
  element: HTMLTextAreaElement,
  { onChange, onChange$, onInput, onInput$ }: InputHTMLAttributes<HTMLTextAreaElement>,
  hasValue: boolean,
  subscription: RxSub
) => {
  if (onChange || onChange$) {
    const event$ = fromEvent(element, 'change')

    if (onChange$) {
      subscription.add((onChange$ as Function)(event$).subscribe())
    }

    if (onChange) {
      subscription.add(event$.subscribe(event => (onChange as Function)(event)))
    }
  }

  if (onInput || onInput$) {
    const event$ = fromEvent(element, 'input')

    if (onInput$) {
      subscription.add(
        (onInput$ as Function)(event$).subscribe(event => {
          if (!hasValue) {
            if (!isStringOrNumber(event)) {
              throw Error(
                `When value prop is not set, Observable mapped from Reactive Event
                should be string or number`
              )
            }

            const newValue = event + ''
            if (element.value !== newValue) {
              element.value = newValue
              element.defaultValue = newValue
            }
          }
        })
      )
    }

    if (onInput) {
      subscription.add(event$.subscribe(event => (onInput as Function)(event)))
    }
  }
}

const setValue = (element: HTMLTextAreaElement) => (value: string | number) => {
  const newValue = value + ''
  if (element.value !== newValue) {
    element.value = newValue
    element.defaultValue = newValue
  }
}

export const controlTextArea = (
  rvdElement: RvdHTML['textarea'],
  element: HTMLTextAreaElement,
  propsSubscription: RxSub,
  restPropsCallback: PropEntryCallback
): void => {
  const props: TextareaHTMLAttributes<HTMLTextAreaElement> = rvdElement.props

  const { value, defaultValue, onChange, onChange$, onInput, onInput$, ...restProps } = props

  const handlerProps = {
    onChange,
    onChange$,
    onInput,
    onInput$
  }

  connectTextAreaHandlers(element, handlerProps, isObservable(value), propsSubscription)

  if (!isNullOrUndef(defaultValue) && !element.value && !element.defaultValue) {
    if (isObservable(defaultValue)) {
      first()(defaultValue).subscribe(setValue(element))
    } else {
      setValue(element)(defaultValue)
    }
  }

  if (isObservable(value)) {
    propsSubscription.add(value.subscribe(setValue(element)))
  } else if (!isNullOrUndef(value)) {
    setValue(element)(value)
  }

  Object.entries(restProps).forEach(restPropsCallback)
}
