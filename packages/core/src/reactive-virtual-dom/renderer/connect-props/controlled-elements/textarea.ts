import { Observable } from 'rxjs'
import { take } from 'rxjs/operators'
import { isObservable } from '../../utils'

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
    (value as Observable<string | number>).subscribe((value: string | number) =>
      setValue(element, value)
    )
  )

  if (onInput) {
    rvdElement.sub.add(
      handleSyntheticEvent(element, 'input', onInput as RvdFormEventHandler, context)
    )
  }

  if (!isNullOrUndef(defaultValue) && !element.value && !element.defaultValue) {
    if (isObservable(defaultValue)) {
      rvdElement.sub.add(
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
