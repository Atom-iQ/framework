import { RenderCallback } from '../../../shared/types'
import { renderTypeSwitch, unsubscribe } from '../utils'
import { removeChildFromIndexPosition } from '../dom-renderer'

const afterRemove = createdChildren => removedChild => {
  unsubscribe(removedChild)
  createdChildren.remove(removedChild.index)
}

const nullRenderCallback: RenderCallback = (
  childIndex,
  element,
  createdChildren
) => (): void => {
  renderTypeSwitch(
    () => {
      removeChildFromIndexPosition(
        afterRemove(createdChildren),
        childIndex,
        element,
        createdChildren
      )
    },
    fragment => {
      fragment.fragmentChildIndexes.forEach(index => removeChildFromIndexPosition(
        afterRemove(createdChildren),
        index,
        element,
        createdChildren
      ))

      unsubscribe(fragment)
      createdChildren.removeFragment(childIndex)
    }
  )
}

export default nullRenderCallback
