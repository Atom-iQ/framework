import type { RvdControlledFormElement, RvdHTML, RvdContext } from 'types'
import { RvdNodeFlags } from 'shared/flags'

import { controlInput } from './input'
import { controlTextArea } from './textarea'
import { controlSelect } from './select'

export function connectControlledElement(
  rvdElement: RvdControlledFormElement,
  context: RvdContext
): void {
  switch (rvdElement.flag) {
    case RvdNodeFlags.InputElement:
      return controlInput(rvdElement as RvdHTML['input'], context)
    case RvdNodeFlags.TextareaElement:
      return controlTextArea(rvdElement as RvdHTML['textarea'], context)
    case RvdNodeFlags.SelectElement:
      return controlSelect(rvdElement as RvdHTML['select'], context)
  }
}
