import type {
  RvdChildrenManager,
  RvdChild,
  RvdDOMElement,
  RvdStaticChild,
  CreatedFragmentChild,
  RenderElementCallbackFn
} from '../../shared/types'
// noinspection ES6PreferShortImport
import { RvdChildFlags } from '../../shared/flags'
import { isObservable, Subscription } from 'rxjs'

import { createChildrenManager, turnOffAppendMode } from './children-manager'

import {
  childrenArrayToFragment,
  createDomElement,
  isComponent,
  isElement,
  isFragment,
  isRvdElement,
  isSvgElement,
  rvdObserver
} from './utils'

import { textRenderCallback } from './render-callback/text'

import { nullRenderCallback } from './render-callback/null'

import { renderElement, replaceElementForElement } from './render-callback/element'

import { fragmentRenderCallback } from './render-callback/fragment'

import { renderRvdComponent } from './component'
import { connectElementProps } from './connect-props/connect-props'
import { applyMiddlewares } from '../../middlewares/middlewares-manager'
import { RvdContext } from '../../shared/types'
import { isArray, isBoolean, isNullOrUndef, isString, isStringOrNumber } from '../../shared'
import { removeExistingFragment, setClassName } from './dom-renderer'

/**
 * Render Rvd DOM Element and return it with subscription to parent
 * @param rvdElement
 * @param context
 * @param renderCallback
 */
export function renderRvdElement(
  rvdElement: RvdDOMElement,
  context: RvdContext,
  renderCallback: RenderElementCallbackFn
): void {
  const isSvg = isSvgElement(rvdElement)
  const element = createDomElement(rvdElement.type, isSvg)
  const elementSubscription = new Subscription()

  rvdElement = applyMiddlewares('elementPreConnect', rvdElement, element, elementSubscription)

  if (rvdElement.className) {
    if (isObservable(rvdElement.className)) {
      elementSubscription.add(
        rvdElement.className.subscribe(
          rvdObserver(function (className: string): void {
            setClassName(isSvg, element, className)
          })
        )
      )
    } else {
      setClassName(isSvg, element, rvdElement.className)
    }
  }

  if (rvdElement.children) {
    const manager: RvdChildrenManager = createChildrenManager()

    const isStatic = (rvdElement.childFlags & RvdChildFlags.HasOnlyStaticChildren) !== 0
    if (rvdElement.childFlags & RvdChildFlags.HasSingleChild) {
      if (isString(rvdElement.children)) {
        // if Element has single, static text child, it shouldn't use createdChildren abstraction
        element.textContent = rvdElement.children
      } else {
        renderChild(
          rvdElement.children,
          '0',
          element,
          manager,
          elementSubscription,
          context,
          isStatic
        )
      }
    } else {
      for (let i = 0, l = (rvdElement.children as RvdChild[]).length; i < l; ++i) {
        renderChild(
          rvdElement.children[i],
          i + '',
          element,
          manager,
          elementSubscription,
          context,
          isStatic
        )
      }
    }
    turnOffAppendMode(manager)
  }

  // Render before connecting props
  renderCallback(element, elementSubscription)

  if (rvdElement.props) {
    connectElementProps(rvdElement, isSvg, element, elementSubscription)
  }
}

/**
 * Function called at application start - called only once in rvdRenderer. It's creating Root
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
    rootRvdElement,
    rootChildIndex,
    rootDOMElement,
    rootManager,
    rootSubscription,
    context,
    true
  )

  /**
   * Return root aggregated subscription outside
   */
  return rootSubscription
}

/**
 * Closure with child element rendering function. Taking common params
 * for all children and returning function for single child rendering.
 * @param child
 * @param childIndex
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
function renderChild(
  child: RvdChild,
  childIndex: string,
  element: Element,
  manager: RvdChildrenManager,
  childrenSubscription: Subscription,
  context: RvdContext,
  isStatic: boolean
) {
  function render(child: RvdStaticChild) {
    renderChildCallback(
      child,
      childIndex,
      element,
      manager,
      childrenSubscription,
      context,
      isStatic
    )
  }

  if (!isStatic && isObservable(child)) {
    childrenSubscription.add(child.subscribe(rvdObserver(render)))
  } else {
    render(child as RvdStaticChild)
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
function renderChildCallback(
  child: RvdStaticChild,
  childIndex: string,
  element: Element,
  manager: RvdChildrenManager,
  childrenSubscription: Subscription,
  context: RvdContext,
  isStatic = false,
  createdFragment?: CreatedFragmentChild
): void {
  function renderDynamic(
    child: RvdStaticChild,
    dynamicChildIndex: string,
    dynamicChildContext?: RvdContext,
    createdFragment?: CreatedFragmentChild
  ) {
    renderChildCallback(
      child,
      dynamicChildIndex,
      element,
      manager,
      childrenSubscription,
      dynamicChildContext,
      false,
      createdFragment
    )
  }

  if (isRvdElement(child)) {
    if (isElement(child)) {
      return elementRenderCallback(
        child,
        childIndex,
        element,
        manager,
        childrenSubscription,
        context,
        isStatic,
        createdFragment
      )
    }
    if (isFragment(child)) {
      return fragmentRenderCallback(
        child,
        childIndex,
        element,
        manager,
        childrenSubscription,
        context,
        isStatic,
        renderDynamic,
        createdFragment
      )
    }
    if (isComponent(child)) {
      return renderRvdComponent(
        child,
        childIndex,
        childrenSubscription,
        context,
        renderDynamic,
        createdFragment
      )
    }
    throw Error('RvdElement has unknown type')
  }
  if (isArray(child)) {
    return fragmentRenderCallback(
      childrenArrayToFragment(child),
      childIndex,
      element,
      manager,
      childrenSubscription,
      context,
      isStatic,
      renderDynamic,
      createdFragment
    )
  }
  if (isStringOrNumber(child)) {
    return textRenderCallback(
      child,
      childIndex,
      element,
      manager,
      childrenSubscription,
      undefined,
      isStatic,
      createdFragment
    )
  }
  if (!isStatic && (isNullOrUndef(child) || isBoolean(child))) {
    return nullRenderCallback(childIndex, element, manager, createdFragment)
  }
  throw Error('Wrong Child type')
}

/* -------------------------------------------------------------------------------------------
 *  Element renderer callback
 * ------------------------------------------------------------------------------------------- */

function elementRenderCallback(
  child: RvdDOMElement,
  childIndex: string,
  parentElement: Element,
  manager: RvdChildrenManager,
  childrenSubscription: Subscription,
  context?: RvdContext,
  isStatic = false,
  parentFragment?: CreatedFragmentChild
) {
  child = applyMiddlewares(
    'elementPreRender',
    child,
    parentElement,
    manager,
    childIndex,
    childrenSubscription
  )

  if (
    isStatic ||
    manager.isInAppendMode ||
    (parentFragment && parentFragment.isInFragmentAppendMode)
  ) {
    renderRvdElement(child, context, function (childElement, childElementSubscription) {
      renderElement(
        childElement,
        childElementSubscription,
        childIndex,
        parentElement,
        manager,
        childrenSubscription,
        child,
        parentFragment
      )()
    })
  } else {
    renderRvdElement(child, context, function (childElement, childElementSubscription) {
      const render = renderElement(
        childElement,
        childElementSubscription,
        childIndex,
        parentElement,
        manager,
        childrenSubscription,
        child,
        parentFragment
      )

      if (childIndex in manager.children) {
        replaceElementForElement(
          manager.children[childIndex],
          childElement,
          childElementSubscription,
          childIndex,
          parentElement,
          manager,
          childrenSubscription,
          child
        )
      } else if (childIndex in manager.fragmentChildren) {
        removeExistingFragment(
          manager.fragmentChildren[childIndex],
          null,
          childIndex,
          parentElement,
          manager,
          parentFragment
        )
        render()
      } else {
        render()
      }
    })
  }
}
