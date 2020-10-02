import {
  RvdChild,
  RvdComponentElement,
  CreatedChildrenManager,
  RxSub,
  RenderNewChildCallbackFn,
  RvdComponentRenderer,
  RvdStaticChild
} from '../../shared/types'
import { isObservable } from 'rxjs'
import { isRvdElement } from './utils'

const createComponent = (rvdComponent: RvdComponentElement): RvdChild | RvdChild[] => {
  return rvdComponent.type(rvdComponent.props)
}

const getChildWithParsedKeys = (
  child: RvdStaticChild,
  componentKey: string | number
): RvdStaticChild => {
  if (componentKey && isRvdElement(child)) {
    if (child.key) {
      if (child.key !== componentKey) {
        child.key = `${componentKey}.${child.key}`
      }
    } else {
      child.key = componentKey
    }
  }

  return child
}

/**
 * Render Rvd Component and attach returned child(ren) to parent element
 * @param componentIndex
 * @param element
 * @param createdChildren
 * @param childrenSubscription
 * @param renderNewCallback
 */
export function renderRvdComponent(
  componentIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub,
  renderNewCallback: RenderNewChildCallbackFn
): RvdComponentRenderer {
  return (rvdComponentElement: RvdComponentElement) => {
    const componentChild = createComponent(rvdComponentElement)
    const key = rvdComponentElement.key || null
    if (isObservable(componentChild)) {
      const componentChildSub = componentChild.subscribe(observableChild =>
        renderNewCallback(getChildWithParsedKeys(observableChild, key), componentIndex)
      )
      childrenSubscription.add(componentChildSub)
    } else {
      return renderNewCallback(getChildWithParsedKeys(componentChild, key), componentIndex)
    }
  }
}
