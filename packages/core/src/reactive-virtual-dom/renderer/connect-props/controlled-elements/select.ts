import { Observable } from 'rxjs'
import { isObservable } from '../../utils'

import type {
  RvdChangeEventHandler,
  RvdHTML,
  SelectHTMLAttributes,
  RvdDOMPropName,
  RvdContext
} from 'types'
import { isArray, isNullOrUndef } from 'shared'
import { handleSyntheticEvent } from 'red/event-delegation'

import { connectProp } from '../connect-prop'

export type RvdSelectValue = string | number | Array<string | number>

export function controlSelect(rvdElement: RvdHTML['select'], context: RvdContext): void {
  const props: SelectHTMLAttributes<HTMLSelectElement> = rvdElement.props
  const element = rvdElement.dom as HTMLSelectElement
  const { multiple, value, selectedIndex, onChange, ...restProps } = props

  rvdElement.sub.add((value as Observable<RvdSelectValue>).subscribe(nextSelectValue(element)))

  if (onChange) {
    rvdElement.sub.add(
      handleSyntheticEvent(element, 'change', onChange as RvdChangeEventHandler, context)
    )
  }

  if (!isNullOrUndef(multiple)) {
    if (isObservable(multiple)) {
      rvdElement.sub.add(
        multiple.subscribe((multiple: boolean) => {
          element.multiple = multiple
        })
      )
    } else {
      if (multiple) {
        element.multiple = multiple
      }
    }
  }

  if (isObservable(selectedIndex)) {
    rvdElement.sub.add(
      selectedIndex.subscribe((selectedIndex: number) => {
        element.selectedIndex = selectedIndex
      })
    )
  }

  for (const propName in restProps) {
    // noinspection JSUnfilteredForInLoop
    connectProp(propName as RvdDOMPropName, rvdElement, context)
  }
}

function nextSelectValue(element: HTMLSelectElement) {
  return function updateSelectValue(value: RvdSelectValue) {
    const options = element.options
    if (options && options.length > 0) {
      if (element.multiple && isArray(value)) {
        for (let i = 0; i < options.length; i++) {
          if ((value as string[]).includes(options[i].value)) {
            if (!options[i].selected) {
              options[i].selected = true
            }
          } else if (options[i].selected) {
            options[i].selected = false
          }
        }
      } else {
        const finished = [false, false]
        for (let i = 0; i < options.length; i++) {
          if (finished[0] && finished[1]) return
          if (options[i].value === value + '') {
            if (!options[i].selected) {
              options[i].selected = true
              finished[0] = true
            }
          } else if (options[i].selected) {
            options[i].selected = false
            finished[1] = true
          }
        }
      }
    }
  }
}
