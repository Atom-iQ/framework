import type { RvdHTML, RxO, RxSub, SelectHTMLAttributes } from '../../../../shared/types'
import { fromEvent, isObservable } from 'rxjs'
import { isArray, isNullOrUndef } from '../../../../shared'
import { PropEntryCallback } from '../../../../shared/types'

export type RvdSelectValue = string | number | Array<string | number>

export const controlSelect = (
  rvdElement: RvdHTML['select'],
  element: HTMLSelectElement,
  propsSubscription: RxSub,
  restPropsCallback: PropEntryCallback
): void => {
  const props: SelectHTMLAttributes<HTMLSelectElement> = rvdElement.props
  const { multiple, value, selectedIndex, onChange, onChange$, ...restProps } = props

  let selectValue: RxO<RvdSelectValue>

  if (onChange || onChange$) {
    const event$ = fromEvent(element, 'change')

    if (onChange$) {
      const rxEvent$ = (onChange$ as Function)(event$)
      if (!isObservable(value)) {
        selectValue = rxEvent$
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
      if (multiple) {
        element.multiple = multiple
      }
    }
  }

  if (isObservable(value)) {
    selectValue = value
  }

  if (isObservable(selectedIndex)) {
    propsSubscription.add(
      selectedIndex.subscribe(selectedIndex => {
        element.selectedIndex = selectedIndex
      })
    )
  }

  if (selectValue) {
    propsSubscription.add(
      selectValue.subscribe(value => {
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
      })
    )
  }

  Object.entries(restProps).forEach(restPropsCallback)
}
