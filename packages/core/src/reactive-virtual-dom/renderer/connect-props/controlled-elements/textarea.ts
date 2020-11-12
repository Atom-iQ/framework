import {
  DOMElementPropName,
  FormEventHandler,
  InputHTMLAttributes,
  PropEntryCallback,
  ReactiveFormEventHandler,
  RedEvent,
  RvdHTML,
  TextareaHTMLAttributes
} from '../../../../shared/types'
import { isObservable, Subject, Subscription } from 'rxjs'
import { isNullOrUndef } from '../../../../shared'
import { filter, first, tap } from 'rxjs/operators'
import { handleSyntheticEvent } from '../../../../reactive-event-delegation/event-delegation'

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
    const eventSubject = !hasValue && onInput$ && new Subject<RedEvent>()
    subscription.add(
      handleSyntheticEvent(element, 'input', {
        fn: onInput as FormEventHandler,
        rx: hasValue
          ? (onInput$ as ReactiveFormEventHandler)
          : tap<RedEvent>(event => eventSubject.next(event))
      })
    )

    if (eventSubject) {
      subscription.add(
        (onInput$ as Function)(
          filter<RedEvent>(e => e.currentTarget === e.target)(eventSubject.asObservable())
        ).subscribe(setValue(element))
      )
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
        first<string | number>()(defaultValue).subscribe(function (value: string | number) {
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
      value.subscribe(function (value: string | number) {
        if (!isNullOrUndef(value)) {
          setValue(element)(value)
        }
      })
    )
  } else if (!isNullOrUndef(value)) {
    setValue(element)(value)
  }

  for (const propName in restProps) {
    // noinspection JSUnfilteredForInLoop
    restPropsCallback(propName as DOMElementPropName, restProps[propName])
  }
}
