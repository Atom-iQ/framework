import type {
  DOMFormElement,
  PropEntryCallback,
  RvdControlledFormElement,
  RvdHTML,
  RxSub
} from '../../../../shared/types'
import { RvdElementFlags } from '../../../../shared/flags'
import { controlInput } from './input'
import { controlTextArea } from './textarea'
import { controlSelect } from './select'

export const connectControlledElement = (
  rvdElement: RvdControlledFormElement,
  element: DOMFormElement,
  propsSubscription: RxSub,
  restPropsCallback: PropEntryCallback
) => {
  switch (rvdElement.elementFlag) {
    case RvdElementFlags.InputElement:
      return controlInput(
        rvdElement as RvdHTML['input'],
        element as HTMLInputElement,
        propsSubscription,
        restPropsCallback
      )
    case RvdElementFlags.TextareaElement:
      return controlTextArea(
        rvdElement as RvdHTML['textarea'],
        element as HTMLTextAreaElement,
        propsSubscription,
        restPropsCallback
      )
    case RvdElementFlags.SelectElement:
      return controlSelect(
        rvdElement as RvdHTML['select'],
        element as HTMLSelectElement,
        propsSubscription,
        restPropsCallback
      )
  }
}
