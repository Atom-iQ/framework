import type {
  RvdComponentNode,
  RenderNewChildCallbackFn,
  RvdStaticChild,
  RvdContext,
  CreatedFragmentChild
} from '../../shared/types'
import { isObservable, Subscription } from 'rxjs'
import { isRvdNode } from './utils'
import { applyComponentMiddlewares, applyMiddlewares } from '../../middlewares/middlewares-manager'
import { isNullOrUndef } from '../../shared'

/**
 * Render Rvd Component and attach returned child(ren) to parent element
 * @param rvdComponentElement
 * @param componentIndex
 * @param parentChildrenSubscription
 * @param context
 * @param renderNewCallback
 * @param createdFragment
 */
export function renderRvdComponent(
  rvdComponentElement: RvdComponentNode,
  componentIndex: string,
  parentChildrenSubscription: Subscription,
  context: RvdContext,
  renderNewCallback: RenderNewChildCallbackFn,
  createdFragment?: CreatedFragmentChild
): void {
  rvdComponentElement = applyMiddlewares(
    'componentPreRender',
    rvdComponentElement,
    componentIndex,
    parentChildrenSubscription
  ) as RvdComponentNode

  const middlewareResult = applyComponentMiddlewares(
    rvdComponentElement,
    context,
    parentChildrenSubscription
  )

  const componentChild = rvdComponentElement.type(rvdComponentElement.props, middlewareResult.props)

  const renderChild = function (child: RvdStaticChild) {
    child = applyMiddlewares(
      'componentChildRender',
      child,
      rvdComponentElement,
      parentChildrenSubscription
    )
    renderNewCallback(
      getChildWithParsedKeys(child, rvdComponentElement.key),
      componentIndex,
      middlewareResult.context,
      createdFragment
    )
  }

  if (isObservable(componentChild)) {
    parentChildrenSubscription.add(componentChild.subscribe(renderChild))
  } else {
    renderChild(componentChild)
  }
}

function getChildWithParsedKeys(
  child: RvdStaticChild,
  componentKey: string | number
): RvdStaticChild {
  if (!isNullOrUndef(componentKey) && isRvdNode(child)) {
    if (!isNullOrUndef(child.key)) {
      if (child.key !== componentKey) {
        child.key = componentKey + '.' + child.key
      }
    } else {
      child.key = componentKey
    }
  }

  return child
}
