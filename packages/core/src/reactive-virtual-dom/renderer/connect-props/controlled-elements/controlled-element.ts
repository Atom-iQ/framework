import type {
  DOMFormElement,
  PropEntryCallback,
  RvdControlledFormElement,
  RvdHTML
} from '../../../../shared/types'
// noinspection ES6PreferShortImport
import { RvdElementFlags } from '../../../../shared/flags'
import { controlInput } from './input'
import { controlTextArea } from './textarea'
import { controlSelect } from './select'
import { Subscription } from 'rxjs'

export function connectControlledElement(
  rvdElement: RvdControlledFormElement,
  element: DOMFormElement,
  propsSubscription: Subscription,
  restPropsCallback: PropEntryCallback
): void {
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
