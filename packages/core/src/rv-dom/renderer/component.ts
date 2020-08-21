import {
  RvdComponentProps,
  RvdChild,
  RvdComponentElement,
  CreatedChildrenManager,
  RxSub, RenderNewChildCallbackFn, RvdComponentRenderer, RvdStaticChild
} from '../../shared/types'
import { isObservable } from 'rxjs'
import { isRvdElement } from './utils'

const getComponentProps = (
  rvdComponent: RvdComponentElement
): RvdComponentProps => {
  const componentProps = rvdComponent.props
  if (rvdComponent.children) {
    componentProps.children = rvdComponent.children
  }
  return componentProps
}

const createComponent = (
  rvdComponent: RvdComponentElement
): RvdChild | RvdChild[] => {
  console.log('COMPONENT DEBUG: ', rvdComponent)
  return rvdComponent._component(getComponentProps(rvdComponent))
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
): RvdComponentRenderer  {
  return (rvdComponentElement: RvdComponentElement) => {
    const componentChild = createComponent(rvdComponentElement)
    console.log('COMPONENT CHILD DEBUG: ', componentChild)
    const key = rvdComponentElement.key || null
    if (isObservable(componentChild)) {
      const componentChildSub = componentChild.subscribe(
        observableChild => renderNewCallback(
          getChildWithParsedKeys(observableChild, key),
          componentIndex
        )
      )
      childrenSubscription.add(componentChildSub)
    } else {
      return renderNewCallback(getChildWithParsedKeys(componentChild, key), componentIndex)
    }
  }
}
