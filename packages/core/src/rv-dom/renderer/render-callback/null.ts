import type { RenderCallback } from '../../../shared/types'
import { removeChild, renderTypeSwitch, unsubscribe } from '../utils'
import { removeExistingFragment } from '../dom-renderer'
import { removeCreatedChild } from '../utils/children-manager'

const nullRenderCallback: RenderCallback = (childIndex, parentElement, manager) => (): void => {
  renderTypeSwitch(existingChild => {
    removeChild(parentElement, existingChild.element)
    unsubscribe(existingChild)
    removeCreatedChild(manager, existingChild.index)
  }, removeExistingFragment(null, childIndex, parentElement, manager))(childIndex, manager)
}

export default nullRenderCallback
