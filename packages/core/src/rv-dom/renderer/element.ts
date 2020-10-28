import type {
  CreatedChildrenManager,
  RenderCallback,
  RenderChildFn,
  RenderElementChildrenFn,
  RvdChild,
  RvdConnectedNode,
  RvdDOMElement,
  RvdStaticChild
} from '../../shared/types'
import { RvdChildFlags } from '../../shared/flags'
import { isObservable, Subscription } from 'rxjs'

import { createChildrenManager } from './utils/children-manager'

import { childTypeSwitch, createDomElement, isSvgElement, renderTypeSwitch } from './utils'

import { textRenderCallback } from './render-callback/text'

import nullRenderCallback from './render-callback/null'

import {
  renderElement,
  replaceElementForElement,
  replaceFragmentForElement
} from './render-callback/element'

import { arrayRenderCallback, fragmentRenderCallback } from './render-callback/fragment'

import { renderRvdComponent } from './component'
import { connectElementProps } from './connect-props/connect-props'
import { applyMiddlewares } from '../../middlewares/middlewares-manager'
import { connectClassName } from './connect-props/class-name'
import { RvdContext } from '../../shared/types'
import { arrayLoop } from '../../shared'

/* -------------------------------------------------------------------------------------------
 *  Element renderer callbacks
 * ------------------------------------------------------------------------------------------- */

const elementRenderCallback: RenderCallback = (
  childIndex,
  parentElement,
  manager,
  childrenSubscription,
  context,
  isStatic = false
) => (child: RvdDOMElement): void => {
  child = applyMiddlewares(
    'elementPreRender',
    child,
    parentElement,
    manager,
    childIndex,
    childrenSubscription
  )

  const elementNode = renderRvdElement(child, context)
  const renderFn = renderElement(
    elementNode,
    childIndex,
    parentElement,
    manager,
    childrenSubscription,
    child
  )

  if (isStatic) {
    renderFn()
  } else {
    renderTypeSwitch(
      replaceElementForElement(
        elementNode,
        childIndex,
        parentElement,
        manager,
        childrenSubscription,
        child
      ),
      replaceFragmentForElement(renderFn, childIndex, parentElement, manager),
      renderFn
    )(childIndex, manager)
  }
}

/* -------------------------------------------------------------------------------------------
 *  Element Children Rendering functions
 * ------------------------------------------------------------------------------------------- */

/**
 * @params ...args - DOM Element, string child index, children map and children subscription
 * @returns Static child rendering function that is checking static child type and calling
 * specific callback for given child type
 */
const renderChildCallback = (
  childIndex: string,
  element: Element,
  manager: CreatedChildrenManager,
  childrenSubscription: Subscription,
  context: RvdContext,
  isStatic = false
) => {
  const renderDynamic = (
    child: RvdStaticChild,
    dynamicChildIndex: string,
    dynamicChildContext: RvdContext
  ) =>
    renderChildCallback(
      dynamicChildIndex,
      element,
      manager,
      childrenSubscription,
      dynamicChildContext
    )(child)

  return childTypeSwitch<void>(
    isStatic ? null : nullRenderCallback(childIndex, element, manager),
    textRenderCallback(childIndex, element, manager, childrenSubscription, undefined, isStatic),
    arrayRenderCallback(
      childIndex,
      element,
      manager,
      childrenSubscription,
      context,
      isStatic,
      renderDynamic
    ),
    renderRvdComponent(childIndex, childrenSubscription, context, renderDynamic),
    fragmentRenderCallback(
      childIndex,
      element,
      manager,
      childrenSubscription,
      context,
      isStatic,
      renderDynamic
    ),
    elementRenderCallback(childIndex, element, manager, childrenSubscription, context, isStatic)
  )
}

/**
 * Closure with child element rendering function. Taking common params
 * for all children and returning function for single child rendering.
 * @param element - parent DOM Element
 * @param manager
 * @param childrenSubscription - parent subscription for all
 * children element subscriptions
 * @param context
 * @param isStatic
 * @returns Child rendering function, that is checking if child
 * is Observable. If yes, subscribing to it, calling static
 * child rendering function for every new emitted value and adding
 * subscription to childrenSubscription. If no, calling static
 * child rendering function just once
 */
const renderChild: RenderChildFn = (
  element,
  manager,
  childrenSubscription,
  context: RvdContext,
  isStatic: boolean
) => (child: RvdChild, index: number): void => {
  const render = renderChildCallback(
    index + '',
    element,
    manager,
    childrenSubscription,
    context,
    isStatic
  )

  if (!isStatic && isObservable(child)) {
    childrenSubscription.add(child.subscribe(render))
  } else {
    render(child as RvdStaticChild)
  }
}

/**
 * Main children rendering function - creates parent subscription for children
 * subscriptions and children map object for keeping information about all children
 * between renderer callbacks. Calling {@link renderChild} for every child
 * @param rvdElement
 * @param element - DOM Element of currently creating RvdConnectedNode, that will be
 * a parent for rendered elements from children array
 * @param context
 * @returns Subscription with aggregated children subscriptions,
 * that will be attached to main element subscription
 */
const renderChildren: RenderElementChildrenFn = (rvdElement, element, context: RvdContext) => {
  const childrenSubscription: Subscription = new Subscription()
  const manager: CreatedChildrenManager = createChildrenManager()

  const isStatic = (rvdElement.childFlags & RvdChildFlags.HasOnlyStaticChildren) !== 0
  const render = renderChild(element, manager, childrenSubscription, context, isStatic)

  if (rvdElement.childFlags & RvdChildFlags.HasSingleChild) {
    render(rvdElement.children, 0)
  } else {
    arrayLoop(rvdElement.children as RvdChild[], render)
  }
  applyMiddlewares('elementPostConnect', rvdElement, element, manager, childrenSubscription)
  return childrenSubscription
}

/**
 * Render Rvd DOM Element and return it with subscription to parent
 * @param rvdElement
 * @param context
 */
export function renderRvdElement(rvdElement: RvdDOMElement, context: RvdContext): RvdConnectedNode {
  const isSvg = isSvgElement(rvdElement)
  const element = createDomElement(rvdElement.type, isSvg)
  const elementSubscription = new Subscription()

  rvdElement = applyMiddlewares('elementPreConnect', rvdElement, element, elementSubscription)

  if (rvdElement.className) {
    elementSubscription.add(connectClassName(rvdElement.className, isSvg, element))
  }

  if (rvdElement.props) {
    elementSubscription.add(connectElementProps(rvdElement, isSvg, element))
  }

  if (rvdElement.children) {
    elementSubscription.add(renderChildren(rvdElement, element, context))
  }

  return {
    element,
    elementSubscription
  }
}

/**
 * Function called at application start - called only once in createRvDOM. It's creating Root
 * Rendering Context, in where it's managing rendering of root element children. It's returning
 * root aggregated subscription.
 * @param rootRvdElement
 * @param rootDOMElement
 * @param context
 */
export function renderRootChild<P>(
  rootRvdElement: RvdStaticChild<P>,
  rootDOMElement: Element,
  context: RvdContext
): Subscription {
  /**
   * Root RvDOM Subscription - aggregating all application subscriptions
   * NOTE - Subscriptions in RvDOM:
   *    Subscriptions are aggregated on the element level (Element rendering context).
   *    Every element's aggregated subscription could have subscriptions for element's
   *    observable props and aggregated subscriptions from children elements. Thanks
   *    to it, when the top level element is removed from DOM, all nested elements
   *    subscriptions are unsubscribed automatically.
   *
   * Root Subscription exists on the root DOM Element's level - Root Rendering Context.
   *
   * Root Rendering Context is the only one rendering context, where element (root DOM Element)
   * is coming from outside of RvDOM Renderer - therefore root Element is only partially controlled
   * by RvDOM Renderer - it's created and rendered outside (it's attributes are also attached
   * outside), before a start of RvDOM, but it's children rendering is controlled inside renderer.
   *
   * So Root Subscription contains only aggregated children subscriptions and don't contain
   * props subscriptions.
   */
  const rootSubscription = new Subscription()

  /**
   * Root Children Manager - children manager for Root Rendering Context - managing
   * rendering root element child or children (when root RvdElement is Fragment or
   * fragment or array returned from component, etc.)
   */
  const rootManager = createChildrenManager()

  /**
   * Root Child Index - in Root Rendering Context, given RvdElement will always be considered
   * as one and only child of root DOM Element, so it always has '0' as index (in current version).
   * TODO: Some next version - allow attaching RvDOM to element with rendered children - render
   * TODO: root RvdElement as last child (compute rootChildIndex instead of hardcode)
   */
  const rootChildIndex = '0'

  /**
   * Call render static child function, passing Root DOM Element as parent element
   */
  renderChildCallback(
    rootChildIndex,
    rootDOMElement,
    rootManager,
    rootSubscription,
    context,
    true
  )(rootRvdElement)

  /**
   * Return root aggregated subscription outside
   */
  return rootSubscription
}
