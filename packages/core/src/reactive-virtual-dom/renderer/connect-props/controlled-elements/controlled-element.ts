import type {
  DOMFormElement,
  RvdPropEntryCallback,
  RvdControlledFormElement,
  RvdHTML
} from '../../../../shared/types'
// noinspection ES6PreferShortImport
import { RvdNodeFlags } from '../../../../shared/flags'
import { controlInput } from './input'
import { controlTextArea } from './textarea'
import { controlSelect } from './select'
import { Subscription } from 'rxjs'

export function connectControlledElement(
  rvdElement: RvdControlledFormElement,
  element: DOMFormElement,
  propsSubscription: Subscription,
  restPropsCallback: RvdPropEntryCallback
): void {
  switch (rvdElement.flag) {
    case RvdNodeFlags.InputElement:
      return controlInput(
        rvdElement as RvdHTML['input'],
        element as HTMLInputElement,
        propsSubscription,
        restPropsCallback
      )
    case RvdNodeFlags.TextareaElement:
      return controlTextArea(
        rvdElement as RvdHTML['textarea'],
        element as HTMLTextAreaElement,
        propsSubscription,
        restPropsCallback
      )
    case RvdNodeFlags.SelectElement:
      return controlSelect(
        rvdElement as RvdHTML['select'],
        element as HTMLSelectElement,
        propsSubscription,
        restPropsCallback
      )
  }
}
