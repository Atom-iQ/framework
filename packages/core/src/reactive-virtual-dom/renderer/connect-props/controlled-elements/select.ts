import type {
  ChangeEventHandler,
  ReactiveChangeEventHandler,
  RedChangeEvent,
  RvdHTML,
  SelectHTMLAttributes
} from '../../../../shared/types'
import { isObservable, Observable, Subject, Subscription } from 'rxjs'
import { isArray, isNullOrUndef } from '../../../../shared'
import { RvdDOMPropName, RvdPropEntryCallback, RedEvent } from '../../../../shared/types'
import { handleSyntheticEvent } from '../../../../reactive-event-delegation/event-delegation'
import { filter, tap } from 'rxjs/operators'

export type RvdSelectValue = string | number | Array<string | number>

export const controlSelect = (
  rvdElement: RvdHTML['select'],
  element: HTMLSelectElement,
  propsSubscription: Subscription,
  restPropsCallback: RvdPropEntryCallback
): void => {
  const props: SelectHTMLAttributes<HTMLSelectElement> = rvdElement.props
  const { multiple, value, selectedIndex, onChange, onChange$, ...restProps } = props

  const hasControlledValue = isObservable(value)

  const eventSubject =
    !hasControlledValue && onChange$ && new Subject<RedChangeEvent<HTMLSelectElement>>()

  if (onChange || onChange$) {
    propsSubscription.add(
      handleSyntheticEvent(element, 'change', {
        fn: onChange as ChangeEventHandler,
        rx: hasControlledValue
          ? (onChange$ as ReactiveChangeEventHandler)
          : tap<RedChangeEvent<HTMLSelectElement>>(event => eventSubject.next(event))
      })
    )
  }

  if (!isNullOrUndef(multiple)) {
    if (isObservable(multiple)) {
      propsSubscription.add(
        multiple.subscribe(function (multiple: boolean) {
          element.multiple = multiple
        })
      )
    } else {
      if (multiple) {
        element.multiple = multiple
      }
    }
  }

  if (hasControlledValue) {
    propsSubscription.add((value as Observable<RvdSelectValue>).subscribe(nextSelectValue(element)))
  } else if (eventSubject) {
    propsSubscription.add(
      (onChange$ as Function)(
        filter<RedEvent>(e => e.currentTarget === e.target)(eventSubject.asObservable())
      ).subscribe(nextSelectValue(element))
    )
  }

  if (isObservable(selectedIndex)) {
    propsSubscription.add(
      selectedIndex.subscribe(function (selectedIndex: number) {
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
