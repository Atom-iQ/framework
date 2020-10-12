import type { RvdHTML, RxO, RxSub, SelectHTMLAttributes } from '../../../../shared/types'
import { animationFrameScheduler, fromEvent, isObservable, scheduled } from 'rxjs'
import { concatAll } from 'rxjs/operators'
import { isNullOrUndef } from '../../../../shared'
import { PropEntryCallback } from '../../../../shared/types'

export type RvdSelectValue = string | number | string[] | number[]

export const controlSelect = (
  rvdElement: RvdHTML['select'],
  element: HTMLSelectElement,
  propsSubscription: RxSub,
  restPropsCallback: PropEntryCallback
) => {
  const props: SelectHTMLAttributes<HTMLSelectElement> = rvdElement.props
  const { multiple, value, onChange, onChange$, ...restProps } = props
  // const selectedIndex = props.selectedIndex

  let selectValue: RxO<RvdSelectValue>

  if (onChange || onChange$) {
    const event$ = fromEvent(element, 'change')

    if (onChange$) {
      const rxEvent$ = (onChange$ as Function)(event$)
      if (!isObservable(value)) {
        selectValue = concatAll<RvdSelectValue>()(
          scheduled([[value], rxEvent$], animationFrameScheduler)
        )
      } else {
        propsSubscription.add(rxEvent$.subscribe())
      }
    }

    if (onChange) {
      propsSubscription.add(event$.subscribe(event => (onChange as Function)(event)))
    }
  }

  if (!isNullOrUndef(multiple)) {
    if (isObservable(multiple)) {
      propsSubscription.add(
        multiple.subscribe(multiple => {
          element.multiple = multiple
        })
      )
    } else {
      element.multiple = multiple
    }
  }

  if (isObservable(value)) {
    selectValue = value
  }

  if (selectValue) rvdElement.selectValue = selectValue

  Object.entries(restProps).forEach(restPropsCallback)
}
