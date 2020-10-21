import type {
  ClassicEventHandler,
  DOMElementPropName,
  InputHTMLAttributes,
  PropEntryCallback,
  RvdChangeEvent,
  RvdFormEvent,
  RvdHTML,
  RxEventHandler
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

type InputEvent = RvdChangeEvent<HTMLInputElement> | RvdFormEvent<HTMLInputElement>

const connectHandlers = (
  eventName: string,
  element: HTMLInputElement,
  subscription: Subscription,
  has: boolean,
  set: (element: HTMLInputElement) => (valueOrChecked: string | number | boolean) => void,
  rxHandler?: RxEventHandler<InputEvent>,
  classicHandler?: ClassicEventHandler<InputEvent>
) => {
  const event$ = fromEvent<InputEvent>(element, eventName)

  if (rxHandler) {
    const onNextChange = has ? () => void 0 : set(element)
    subscription.add(rxHandler(event$).subscribe(onNextChange))
  }

  if (classicHandler) {
    subscription.add(event$.subscribe(event => classicHandler(event)))
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
    connectHandlers(
      'change',
      element,
      subscription,
      hasChecked,
      setChecked,
      onChange$ as RxEventHandler<InputEvent>,
      onChange as ClassicEventHandler<InputEvent>
    )
  } else if (onInput || onInput$) {
    connectHandlers(
      'input',
      element,
      subscription,
      hasValue,
      setValue,
      onInput$ as RxEventHandler<InputEvent>,
      onInput as ClassicEventHandler<InputEvent>
    )
  }

  return subscription
}

export const controlInput = (
  rvdElement: RvdHTML['input'],
  element: HTMLInputElement,
  propsSubscription: Subscription,
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
    propsSubscription.add(
      type.subscribe(type => {
        const typeOrText = type || 'text'
        if (element.getAttribute('type') !== typeOrText) {
          element.setAttribute('type', typeOrText)
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
    element.setAttribute('type', type || 'text')
    if (hasHandlers(type)) {
      propsSubscription.add(handlers(type))
    }
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
      propsSubscription.add(
        first<string | number>()(defaultValue).subscribe(value => {
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
      value.subscribe(value => {
        if (!isNullOrUndef(value)) {
          setValue(element)(value)
        }
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
    restPropsCallback(propName as DOMElementPropName, restProps[propName])
  }
}
