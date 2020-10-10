import { RenderCallback } from '../../../shared/types'
import { renderTypeSwitch, unsubscribe } from '../utils'
import { removeChildFromIndexPosition } from '../dom-renderer'
import { getSortedFragmentChildIndexes } from '../utils/children-manager'

const afterRemove = createdChildren => removedChild => {
  unsubscribe(removedChild)
  createdChildren.remove(removedChild.index)
}

const nullRenderCallback: RenderCallback = (childIndex, element, createdChildren) => (): void => {
  renderTypeSwitch(
    () => {
      removeChildFromIndexPosition(
        afterRemove(createdChildren),
        childIndex,
        element,
        createdChildren
      )
    },
    existingFragment => {
      getSortedFragmentChildIndexes(existingFragment).forEach(fragmentChildIndex => {
        removeChildFromIndexPosition(
          removedChild => {
            unsubscribe(removedChild)
            createdChildren.remove(fragmentChildIndex)
          },
          fragmentChildIndex,
          element,
          createdChildren
        )
      })

      unsubscribe(existingFragment)
      createdChildren.removeFragment(childIndex)
    }
  )(childIndex, createdChildren)
}

export default nullRenderCallback
