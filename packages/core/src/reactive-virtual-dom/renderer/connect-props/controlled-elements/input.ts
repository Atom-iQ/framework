import type {
  DOMElementPropName,
  InputHTMLAttributes,
  PropEntryCallback,
  RvdHTML,
  ReactiveChangeEventHandler,
  ChangeEventHandler,
  ReactiveFormEventHandler,
  FormEventHandler,
  RedEvent
} from '../../../../shared/types'
import { isObservable, Subject, Subscription } from 'rxjs'
import { filter, first, tap } from 'rxjs/operators'
import { isNullOrUndef } from '../../../../shared'
import { isCheckedType } from '../../utils'
import { handleSyntheticEvent } from '../../../../reactive-event-delegation/event-delegation'
import { SyntheticEventHandlers } from '../../../../shared/types/rv-dom/event-delegation'

export function controlInput(
  rvdElement: RvdHTML['input'],
  element: HTMLInputElement,
  propsSubscription: Subscription,
  restPropsCallback: PropEntryCallback
): void {
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

  const hasHandlers = (type: string) =>
    isCheckedType(type) ? !!(onChange || onChange$) : !!(onInput || onInput$)

  const handlers = type =>
    connectInputHandlers(
      element,
      {
        onChange,
        onChange$,
        onInput,
        onInput$
      },
      type,
      isObservable(checked),
      isObservable(value)
    )

  if (isObservable(type)) {
    let typeSubscription: Subscription
    let previousType: string = null
    propsSubscription.add(
      type.subscribe(function (type: string) {
        type = type || 'text'
        if (previousType !== type) {
          element.setAttribute('type', type)
          previousType = type
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
        multiple.subscribe(function (v: boolean) {
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
        first<string | number>()(defaultValue).subscribe(function (value: string | number) {
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
    restPropsCallback(propName as DOMElementPropName, restProps[propName])
  }
}

function connectInputHandlers(
  element: HTMLInputElement,
  { onChange, onChange$, onInput, onInput$ }: InputHTMLAttributes<HTMLInputElement>,
  type: string,
  hasChecked: boolean,
  hasValue: boolean
): Subscription {
  const subscription = new Subscription()
  if (isCheckedType(type)) {
    subscription.add(handleSyntheticEvent(element, 'click', { fn: e => e.stopPropagation() }))
    connectHandlers('change', element, subscription, hasChecked, setChecked, {
      fn: onChange as ChangeEventHandler,
      rx: onChange$ as ReactiveChangeEventHandler
    })
  } else {
    connectHandlers('input', element, subscription, hasValue, setValue, {
      fn: onInput as FormEventHandler,
      rx: onInput$ as ReactiveFormEventHandler
    })

    if (onChange || onChange$) {
      connectHandlers('change', element, subscription, true, null, {
        fn: onChange as ChangeEventHandler,
        rx: onChange$ as ReactiveChangeEventHandler
      })
    }
  }

  return subscription
}

function connectHandlers(
  eventName: 'change' | 'input',
  element: HTMLInputElement,
  subscription: Subscription,
  has: boolean,
  set: (element: HTMLInputElement) => (valueOrChecked: string | number | boolean) => void,
  handlers: SyntheticEventHandlers
) {
  const eventSubject = !has && handlers.rx && new Subject<RedEvent>()
  subscription.add(
    handleSyntheticEvent(
      element,
      eventName,
      has
        ? handlers
        : {
            fn: handlers.fn,
            rx: tap<RedEvent>(event => eventSubject.next(event))
          }
    )
  )

  if (eventSubject) {
    subscription.add(
      (handlers.rx as Function)(
        filter<RedEvent>(e => e.currentTarget === e.target)(eventSubject.asObservable())
      ).subscribe(set(element))
    )
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
