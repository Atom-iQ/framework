import type { RenderCallback } from '../../../shared/types'
import { renderTypeSwitch, unsubscribe } from '../utils'
import { removeChildFromIndexPosition, removeExistingFragment } from '../dom-renderer'

const nullRenderCallback: RenderCallback = (childIndex, element, createdChildren) => (): void => {
  renderTypeSwitch(existingChild => {
    removeChildFromIndexPosition(
      () => {
        unsubscribe(existingChild)
        createdChildren.remove(existingChild.index)
      },
      element,
      existingChild.element
    )
  }, removeExistingFragment(null, childIndex, element, createdChildren))(
    childIndex,
    createdChildren
  )
}

export default nullRenderCallback
