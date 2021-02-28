import type {
  RvdChangeEventHandler,
  RvdHTML,
  SelectHTMLAttributes,
  RvdDOMPropName,
  RvdPropEntryCallback
} from '../../../../shared/types'
import { isObservable, Observable, Subscription } from 'rxjs'
import { isArray, isNullOrUndef } from '../../../../shared'
import { handleSyntheticEvent } from '../../../../reactive-event-delegation/event-delegation'

export type RvdSelectValue = string | number | Array<string | number>

export function controlSelect(
  rvdElement: RvdHTML['select'],
  element: HTMLSelectElement,
  propsSubscription: Subscription,
  restPropsCallback: RvdPropEntryCallback
): void {
  const props: SelectHTMLAttributes<HTMLSelectElement> = rvdElement.props
  const { multiple, value, selectedIndex, onChange, ...restProps } = props

  propsSubscription.add((value as Observable<RvdSelectValue>).subscribe(nextSelectValue(element)))

  if (onChange) {
    propsSubscription.add(
      handleSyntheticEvent(element, 'change', onChange as RvdChangeEventHandler)
    )
  }

  if (!isNullOrUndef(multiple)) {
    if (isObservable(multiple)) {
      propsSubscription.add(
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
    propsSubscription.add(
      selectedIndex.subscribe((selectedIndex: number) => {
        element.selectedIndex = selectedIndex
      })
    )
  }

  for (const propName in restProps) {
    // noinspection JSUnfilteredForInLoop
    restPropsCallback(propName as RvdDOMPropName, restProps[propName])
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
