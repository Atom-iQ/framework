import {
  CreatedChildrenManager, CreatedFragmentChild, Dictionary, KeyedChild,
  RenderNewChildCallbackFn,
  RvdFragmentElement,
  RxSub
} from '@@types'
import {
  loadPreviousKeyedElements,
  renderFragmentChild,
  skipMoveOrRenderKeyedChild
} from './fragment-children'
import { removeChildFromIndexPosition } from './dom-renderer'
import { unsubscribe } from './utils'
import { removeExistingFragment } from './move-callback/utils'

const removeExcessiveChildren = (
  fragmentIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  rvdFragmentElement: RvdFragmentElement,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild
) => {
  const previousChildrenLength = createdFragment.fragmentChildrenLength
  const newChildrenLength = rvdFragmentElement.children.length

  if (previousChildrenLength > newChildrenLength) {
    const toRemoveCount = previousChildrenLength - newChildrenLength
    Array.from({ length: toRemoveCount }, (_, i) => i + newChildrenLength).forEach(index => {
      const childIndex = `${fragmentIndex}.${index}`
      if (createdChildren.has(childIndex)) {
        removeChildFromIndexPosition(
          removedChild => {
            if (!removedChild.key || !oldKeyElementMap[removedChild.key]) {
              unsubscribe(removedChild)
            }

            createdChildren.remove(removedChild.index)
          },
          childIndex,
          element,
          createdChildren
        )
      } else if (createdChildren.hasFragment(childIndex)) {
        removeExistingFragment(
          oldKeyElementMap, childIndex, element, createdChildren
        )(createdChildren.getFragment(childIndex))
      }
    })
  }
}

export function renderRvdFragment(
  fragmentIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub,
  renderNewCallback: RenderNewChildCallbackFn
): (rvdFragmentElement: RvdFragmentElement) => void  {
  return (rvdFragmentElement: RvdFragmentElement) => {
    const createdFragment = createdChildren.getFragment(fragmentIndex)


    const oldKeyElementMap = loadPreviousKeyedElements(createdChildren, createdFragment)
    createdFragment.fragmentChildKeys = {}

    removeExcessiveChildren(
      fragmentIndex,
      element,
      createdChildren,
      rvdFragmentElement,
      oldKeyElementMap,
      createdFragment
    )

    rvdFragmentElement.children.forEach(renderFragmentChild(
      fragmentIndex,
      childrenSubscription,
      skipMoveOrRenderKeyedChild(
        oldKeyElementMap,
        createdFragment,
        element,
        createdChildren,
        renderNewCallback
      ),
      renderNewCallback
    ))
  }
}
