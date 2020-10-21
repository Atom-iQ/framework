import {
  CreatedChildrenManager,
  CreatedFragmentChild,
  Dictionary,
  KeyedChild
} from '../../../shared/types'

type UpdateKeyedChild = (
  currentKeyedElement: KeyedChild,
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  createdChildren: CreatedChildrenManager,
  getFnName?: 'get' | 'getFragment',
  removeFnName?: 'remove' | 'removeFragment'
) => void

export const updateKeyedChild: UpdateKeyedChild = (
  currentKeyedElement,
  oldKeyElementMap,
  createdFragment,
  childIndex,
  createdChildren,
  getFnName = 'get',
  removeFnName = 'remove'
) => {
  const key: string | number = currentKeyedElement.child.key
  const hasOldElementInCreatedChildren =
    createdChildren[getFnName](currentKeyedElement.index) &&
    !createdFragment.fragmentChildKeys[createdChildren[getFnName](currentKeyedElement.index).key]

  if (hasOldElementInCreatedChildren) {
    createdChildren[removeFnName](currentKeyedElement.index)
  }

  createdFragment.fragmentChildKeys = {
    ...createdFragment.fragmentChildKeys,
    [key]: childIndex
  }
  delete oldKeyElementMap[key]
}
