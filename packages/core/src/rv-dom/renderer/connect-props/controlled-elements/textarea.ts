import {
  DOMElementPropName,
  InputHTMLAttributes,
  PropEntryCallback,
  RvdHTML,
  TextareaHTMLAttributes
} from '../../../../shared/types'
import { fromEvent, isObservable, Subscription } from 'rxjs'
import { isNullOrUndef } from '../../../../shared'
import { first } from 'rxjs/operators'

const setValue = (element: HTMLTextAreaElement) => (value: string | number) => {
  const newValue = value + ''
  if (element.value !== newValue) {
    element.value = newValue
    element.defaultValue = newValue
  }
}

const connectTextAreaHandlers = (
  element: HTMLTextAreaElement,
  { onInput, onInput$ }: InputHTMLAttributes<HTMLTextAreaElement>,
  hasValue: boolean,
  subscription: Subscription
) => {
  if (onInput || onInput$) {
    const event$ = fromEvent(element, 'input')

    if (onInput$) {
      subscription.add(
        (onInput$ as Function)(event$).subscribe(event => {
          if (!hasValue) {
            setValue(element)(event)
          }
        })
      )
    }

    if (onInput) {
      subscription.add(event$.subscribe(event => (onInput as Function)(event)))
    }
  }
}

export const controlTextArea = (
  rvdElement: RvdHTML['textarea'],
  element: HTMLTextAreaElement,
  propsSubscription: Subscription,
  restPropsCallback: PropEntryCallback
): void => {
  const props: TextareaHTMLAttributes<HTMLTextAreaElement> = rvdElement.props

  const { value, defaultValue, onInput, onInput$, ...restProps } = props

  connectTextAreaHandlers(
    element,
    {
      onInput,
      onInput$
    },
    isObservable(value),
    propsSubscription
  )

  if (!isNullOrUndef(defaultValue) && !element.value && !element.defaultValue) {
    if (isObservable(defaultValue)) {
      propsSubscription.add(
        first<string | number>()(defaultValue).subscribe(value => {
          if (!isNullOrUndef(value) && !element.value && !element.defaultValue) {
            setValue(element)(value)
          }
        })
      )
    } else {
      setValue(element)(defaultValue)
    }
  }

  if (isObservable(value)) {
    propsSubscription.add(
      value.subscribe(value => {
        if (!isNullOrUndef(value)) {
          setValue(element)(value)
        }
      })
    )
  } else if (!isNullOrUndef(value)) {
    setValue(element)(value)
  }

  for (const propName in restProps) {
    restPropsCallback(propName as DOMElementPropName, restProps[propName])
  }
}
