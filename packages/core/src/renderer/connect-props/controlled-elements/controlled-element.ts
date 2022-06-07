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
    case RvdNodeFlags.Input:
      return controlInput(rvdElement as RvdHTML['input'], context)
    case RvdNodeFlags.Textarea:
      return controlTextArea(rvdElement as RvdHTML['textarea'], context)
    case RvdNodeFlags.Select:
      return controlSelect(rvdElement as RvdHTML['select'], context)
  }
}
