import { Observable, observer } from '@atom-iq/rx'
import { first, isObservable } from '@atom-iq/rx'

import {
  RvdDOMPropName,
  RvdFormEventHandler,
  RvdHTML,
  TextareaHTMLAttributes,
  RvdContext
} from 'types'
import { isNullOrUndef } from 'shared'
import { handleSyntheticEvent } from 'red/event-delegation'

import { connectProp } from '../connect-prop'

export function controlTextArea(rvdElement: RvdHTML['textarea'], context: RvdContext): void {
  const props: TextareaHTMLAttributes<HTMLTextAreaElement> = rvdElement.props
  const element = rvdElement.dom as HTMLTextAreaElement
  const { value, defaultValue, onInput, ...restProps } = props

  rvdElement.sub.add(
    (value as Observable<string | number>).subscribe(observer(v => setValue(element, v)))
  )

  if (onInput) {
    handleSyntheticEvent(element, 'input', onInput as RvdFormEventHandler, context)
  }

  if (!isNullOrUndef(defaultValue) && !element.value && !element.defaultValue) {
    if (isObservable(defaultValue)) {
      rvdElement.sub.add(
        first<string | number>(defaultValue).subscribe(
          observer(
            v =>
              !isNullOrUndef(value) &&
              !element.value &&
              !element.defaultValue &&
              setValue(element, v)
          )
        )
      )
    } else {
      setValue(element, defaultValue)
    }
  }

  for (const propName in restProps) {
    // noinspection JSUnfilteredForInLoop
    connectProp(propName as RvdDOMPropName, rvdElement, context)
  }
}

function setValue(element: HTMLTextAreaElement, value: string | number) {
  const newValue = value + ''
  if (element.value !== newValue) {
    element.value = newValue
    element.defaultValue = newValue
  }
}
