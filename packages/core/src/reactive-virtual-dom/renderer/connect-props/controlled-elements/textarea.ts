import {
  RvdDOMPropName,
  RvdFormEventHandler,
  RvdPropEntryCallback,
  RvdHTML,
  TextareaHTMLAttributes
} from 'types'
import { isObservable, Observable, Subscription } from 'rxjs'
import { isNullOrUndef } from 'shared'
import { take } from 'rxjs/operators'
import { handleSyntheticEvent } from 'red/event-delegation'

export function controlTextArea(
  rvdElement: RvdHTML['textarea'],
  element: HTMLTextAreaElement,
  propsSubscription: Subscription,
  restPropsCallback: RvdPropEntryCallback
): void {
  const props: TextareaHTMLAttributes<HTMLTextAreaElement> = rvdElement.props

  const { value, defaultValue, onInput, ...restProps } = props

  propsSubscription.add(
    (value as Observable<string | number>).subscribe((value: string | number) =>
      setValue(element, value)
    )
  )

  if (onInput) {
    propsSubscription.add(handleSyntheticEvent(element, 'input', onInput as RvdFormEventHandler))
  }

  if (!isNullOrUndef(defaultValue) && !element.value && !element.defaultValue) {
    if (isObservable(defaultValue)) {
      propsSubscription.add(
        take<string | number>(1)(defaultValue).subscribe((value: string | number) => {
          if (!isNullOrUndef(value) && !element.value && !element.defaultValue) {
            setValue(element, value)
          }
        })
      )
    } else {
      setValue(element, defaultValue)
    }
  }

  for (const propName in restProps) {
    // noinspection JSUnfilteredForInLoop
    restPropsCallback(propName as RvdDOMPropName, restProps[propName])
  }
}

function setValue(element: HTMLTextAreaElement, value: string | number) {
  const newValue = value + ''
  if (element.value !== newValue) {
    element.value = newValue
    element.defaultValue = newValue
  }
}
