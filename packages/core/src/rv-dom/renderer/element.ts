import type {
  CreatedChildrenManager,
  RenderCallback,
  RenderChildFn,
  RenderElementChildrenFn,
  RenderStaticChildFn,
  RvdChild,
  RvdConnectedNode,
  RvdDOMElement,
  RvdStaticChild,
  RxSub
} from '../../shared/types'
import { RvdChildFlags, RvdElementFlags } from '../../shared/flags'
import { isObservable, Subscription } from 'rxjs'

import createChildrenManager from './utils/children-manager'

import { childTypeSwitch, createDomElement, isSvgElement, renderTypeSwitch } from './utils'

import { staticTextRenderCallback, textRenderCallback } from './render-callback/text'

import nullRenderCallback from './render-callback/null'

import {
  renderElement,
  replaceElementForElement,
  replaceFragmentForElement
} from './render-callback/element'

import {
  arrayRenderCallback,
  fragmentRenderCallback,
  staticArrayRenderCallback,
  staticFragmentRenderCallback
} from './render-callback/fragment'

import { renderRvdComponent } from './component'
import { connectElementProps } from './connect-props/connect-props'
import { controlSelectChildren } from './connect-props/controlled-elements/select-children'

/* -------------------------------------------------------------------------------------------
 *  Element renderer callbacks
 * ------------------------------------------------------------------------------------------- */

const elementRenderCallback: RenderCallback = (
  childIndex,
  element,
  createdChildren,
  childrenSubscription
) => (child: RvdDOMElement): void => {
  const elementNode = renderRvdElement(child)
  const renderFn = renderElement(
    elementNode,
    childIndex,
    element,
    createdChildren,
    childrenSubscription,
    child.type === 'option',
    child.key
  )
  renderTypeSwitch(
    replaceElementForElement(
      elementNode,
      childIndex,
      element,
      createdChildren,
      childrenSubscription,
      child.type === 'option',
      child.key
    ),
    replaceFragmentForElement(renderFn, childIndex, element, createdChildren),
    renderFn
  )(childIndex, createdChildren)
}

/**
 * One time renderer callback - if child isn't Observable, then it will not
 * change in runtime, function will be called just once and it's sure that
 * no other node was rendered on that position
 * @param childIndex
 * @param element
 * @param createdChildren
 * @param childrenSubscription
 */
const staticElementRenderCallback: RenderCallback = (
  childIndex,
  element,
  createdChildren,
  childrenSubscription
) => (child: RvdDOMElement): void => {
  const elementNode = renderRvdElement(child)
  renderElement(
    elementNode,
    childIndex,
    element,
    createdChildren,
    childrenSubscription,
    child.type === 'option',
    child.key
  )()
}

/* -------------------------------------------------------------------------------------------
 *  Fragment renderer helper
 * ------------------------------------------------------------------------------------------- */

const renderDynamicChild = (
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub
) => (child: RvdStaticChild, childIndex: string) =>
  renderObservableChild(childIndex, element, createdChildren, childrenSubscription)(child)

/* -------------------------------------------------------------------------------------------
 *  Element Children Rendering functions
 * ------------------------------------------------------------------------------------------- */

/**
 * @params ...args - DOM Element, string child index, children map and children subscription
 * @returns Static child rendering function that is checking static child type and calling
 * specific callback for given child type
 */
const renderStaticChild: RenderStaticChildFn = (
  ...args: [string, Element, CreatedChildrenManager, RxSub]
) => {
  const [childIndex, element, createdChildren, childrenSubscription] = args

  const renderDynamic = renderDynamicChild(element, createdChildren, childrenSubscription)

  return childTypeSwitch<void>(
    null,
    staticTextRenderCallback(...args),
    staticArrayRenderCallback(...args, renderDynamic),
    renderRvdComponent(childIndex, childrenSubscription, renderDynamic),
    staticFragmentRenderCallback(...args, renderDynamic),
    staticElementRenderCallback(...args)
  )
}

/**
 * @params ...args - DOM Element, string child index, children map and children subscription
 * @returns Static child rendering function that is checking static child type and calling
 * specific callback for given child type
 */
const renderObservableChild = (...args: [string, Element, CreatedChildrenManager, RxSub]) => {
  const [childIndex, element, createdChildren, childrenSubscription] = args

  const renderDynamic = renderDynamicChild(element, createdChildren, childrenSubscription)

  return childTypeSwitch<void>(
    nullRenderCallback(...args),
    textRenderCallback(...args),
    arrayRenderCallback(...args, renderDynamic),
    renderRvdComponent(childIndex, childrenSubscription, renderDynamic),
    fragmentRenderCallback(...args, renderDynamic),
    elementRenderCallback(...args)
  )
}

/**
 * Closure with child element rendering function. Taking common params
 * for all children and returning function for single child rendering.
 * @param element - parent DOM Element
 * @param createdChildrenMap - extended CustomMap object, with nested indexes
 * sorting utility
 * @param childrenSubscription - parent subscription for all
 * children element subscriptions
 * @param isStatic
 * @returns Child rendering function, that is checking if child
 * is Observable. If yes, subscribing to it, calling static
 * child rendering function for every new emitted value and adding
 * subscription to childrenSubscription. If no, calling static
 * child rendering function just once
 */
const renderChild: RenderChildFn = (
  element,
  createdChildrenMap,
  childrenSubscription,
  isStatic: boolean
) => (child: RvdChild, index: number): void => {
  const childIndex = index + ''
  if (!isStatic && isObservable(child)) {
    childrenSubscription.add(
      child.subscribe(
        renderObservableChild(childIndex, element, createdChildrenMap, childrenSubscription)
      )
    )
  } else {
    renderStaticChild(
      childIndex,
      element,
      createdChildrenMap,
      childrenSubscription
    )(child as RvdStaticChild)
  }
}

/**
 * Main children rendering function - creates parent subscription for children
 * subscriptions and children map object for keeping information about all children
 * between renderer callbacks. Calling {@link renderChild} for every child
 * @param rvdElement
 * @param element - DOM Element of currently creating RvdConnectedNode, that will be
 * a parent for rendered elements from children array
 * @returns Subscription with aggregated children subscriptions,
 * that will be attached to main element subscription
 */
const renderChildren: RenderElementChildrenFn = (rvdElement, element) => {
  const { childFlags, children, elementFlag, selectValue } = rvdElement
  const childrenSubscription: RxSub = new Subscription()
  const createdChildren: CreatedChildrenManager = createChildrenManager()

  const isStatic = (childFlags & RvdChildFlags.HasOnlyStaticChildren) !== 0

  if (elementFlag === RvdElementFlags.SelectElement && selectValue) {
    childrenSubscription.add(controlSelectChildren(selectValue, createdChildren))
  }

  const render = renderChild(element, createdChildren, childrenSubscription, isStatic)

  if (childFlags & RvdChildFlags.HasSingleChild) {
    render(children, 0)
  } else {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;(children as RvdChild[]).forEach(render)
  }

  return childrenSubscription
}

/**
 * Render Rvd DOM Element and return it with subscription to parent
 * @param rvdElement
 */
export function renderRvdElement(rvdElement: RvdDOMElement): RvdConnectedNode {
  const isSvg = isSvgElement(rvdElement)
  const element = createDomElement(rvdElement.type, isSvg)

  const elementSubscription: RxSub = connectElementProps(rvdElement, isSvg, element)

  if (rvdElement.children) {
    const childrenSubscription = renderChildren(rvdElement, element)
    elementSubscription.add(childrenSubscription)
  }

  return {
    dom: element,
    elementSubscription
  }
}

/**
 * Function called at application start - called only once in createRvDOM. It's creating Root
 * Rendering Context, in where it's managing rendering of root element children. It's returning
 * root aggregated subscription.
 * @param rootRvdElement
 * @param rootDOMElement
 */
export function renderRootChild<P>(
  rootRvdElement: RvdStaticChild<P>,
  rootDOMElement: Element
): RxSub {
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
  const rootChildrenManager = createChildrenManager()

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
  renderStaticChild(
    rootChildIndex,
    rootDOMElement,
    rootChildrenManager,
    rootSubscription
  )(rootRvdElement)

  /**
   * Return root aggregated subscription outside
   */
  return rootSubscription
}
