import type {
  RvdChild,
  RvdComponentElement,
  RenderNewChildCallbackFn,
  RvdComponentRenderer,
  RvdStaticChild,
  RvdContext,
  CreatedFragmentChild
} from '../../shared/types'
import { isObservable, Subscription } from 'rxjs'
import { isRvdElement } from './utils'
import { applyComponentMiddlewares, applyMiddlewares } from '../../middlewares/middlewares-manager'

const createComponent = (
  rvdComponent: RvdComponentElement,
  middlewareProps?: { [alias: string]: Function }
): RvdChild | RvdChild[] => {
  return rvdComponent.type(rvdComponent.props, middlewareProps)
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
 * @param parentChildrenSubscription
 * @param context
 * @param renderNewCallback
 * @param createdFragment
 */
export function renderRvdComponent(
  componentIndex: string,
  parentChildrenSubscription: Subscription,
  context: RvdContext,
  renderNewCallback: RenderNewChildCallbackFn,
  createdFragment?: CreatedFragmentChild
): RvdComponentRenderer {
  return (rvdComponentElement: RvdComponentElement) => {
    rvdComponentElement = applyMiddlewares(
      'componentPreRender',
      rvdComponentElement,
      componentIndex,
      parentChildrenSubscription
    ) as RvdComponentElement

    const { middlewareProps, context: newContext } = applyComponentMiddlewares(
      rvdComponentElement,
      context,
      parentChildrenSubscription
    )

    const componentChild = createComponent(rvdComponentElement, middlewareProps)
    const key = rvdComponentElement.key || null

    const renderChild = child => {
      child = applyMiddlewares(
        'componentChildRender',
        child,
        rvdComponentElement,
        parentChildrenSubscription
      )
      renderNewCallback(
        getChildWithParsedKeys(child, key),
        componentIndex,
        newContext,
        createdFragment
      )
    }

    if (isObservable(componentChild)) {
      parentChildrenSubscription.add(componentChild.subscribe(renderChild))
    } else {
      renderChild(componentChild)
    }
  }
}
