import { switchMap } from 'rxjs/operators'
import { isObservable, merge, Subscription } from 'rxjs'
import {
  CreatedChildrenManager,
  RenderCallback,
  RenderChildFn,
  RenderElementChildrenFn,
  RenderStaticChildFn,
  RvdChild,
  RvdComponentElement,
  RvdFragmentElement,
  RvdFragmentNode,
  RvdNode, RvdObservableChild,
  RvdObservableNode,
  RxSub
} from '@@types'
import {
  childrenArrayToFragment,
  childTypeSwitch,
  isRvdNode,
  syncObservable
} from '../utils'
import { renderChildInIndexPosition } from './dom-renderer'
import createChildrenManager from '../utils/children-manager'
import { staticTextRenderCallback, textRenderCallback } from './render-callback/text'
import nullRenderCallback from './render-callback/null'
import { renderRvdComponent } from '../render'
import { elementRenderCallback, staticElementRenderCallback } from './render-callback/element'
import {
  arrayRenderCallback,
  fragmentRenderCallback, staticArrayRenderCallback,
  staticFragmentRenderCallback
} from './render-callback/fragment'
import { componentRenderCallback, staticComponentRenderCallback } from './render-callback/component'



/**
 * @params ...args - DOM Element, string child index, children map and children subscription
 * @returns Static child rendering function that is checking static child type and calling
 * specific callback for given child type
 */
const renderStaticChild: RenderStaticChildFn = (
  ...args: [string, Element, CreatedChildrenManager, RxSub]
) => childTypeSwitch<void>(
  null,
  staticTextRenderCallback(...args),
  staticArrayRenderCallback(...args),
  staticComponentRenderCallback(...args),
  staticFragmentRenderCallback(...args),
  staticElementRenderCallback(...args)
)

/**
 * @params ...args - DOM Element, string child index, children map and children subscription
 * @returns Static child rendering function that is checking static child type and calling
 * specific callback for given child type
 */
const renderObservableChild = (
  ...args: [string, Element, CreatedChildrenManager, RxSub]
) => (observableChild: RvdObservableChild) => {
  const childSub = observableChild.subscribe(
    childTypeSwitch<void>(
      nullRenderCallback(...args),
      textRenderCallback(...args),
      arrayRenderCallback(...args),
      componentRenderCallback(...args),
      fragmentRenderCallback(...args),
      elementRenderCallback(...args)
    )
  )
  args[3].add(childSub)
}

/**
 * Closure with child element rendering function. Taking common params
 * for all children and returning function for single child rendering.
 * @param element - parent DOM Element
 * @param createdChildrenMap - extended CustomMap object, with nested indexes
 * sorting utility
 * @param childrenSubscription - parent subscription for all
 * children element subscriptions
 * @returns Child rendering function, that is checking if child
 * is Observable. If yes, subscribing to it, calling static
 * child rendering function for every new emitted value and adding
 * subscription to childrenSubscription. If no, calling static
 * child rendering function just once
 */
export const renderChild: RenderChildFn = (
  element,
  createdChildrenMap,
  childrenSubscription
) => (child: RvdChild, index: number) => {
  const childIndex = String(index)
  if (isObservable(child)) {
    // TODO: Optimize rendering separately for statics and observables
    renderObservableChild(
      childIndex,
      element,
      createdChildrenMap,
      childrenSubscription
    )(child)
  } else {
    renderStaticChild(
      childIndex,
      element,
      createdChildrenMap,
      childrenSubscription
    )(child)
  }
}

/**
 * Main children rendering function - creates parent subscription for children
 * subscriptions and children map object for keeping information about all children
 * between render callbacks. Calling {@link renderChild} for every child
 * @param children - An array of child elements
 * @param element - DOM Element of currently creating RvdNode, that will be
 * a parent for rendered elements from children array
 * @returns Subscription with aggregated children subscriptions,
 * that will be attached to main element subscription
 */
const renderChildren: RenderElementChildrenFn = (children, element) => {
  const childrenSubscription: RxSub = new Subscription()
  const createdChildren: CreatedChildrenManager = createChildrenManager()

  children.forEach(renderChild(element, createdChildren, childrenSubscription))

  return childrenSubscription
}

export default renderChildren

/*
created = {
  '3.0': 'div key=madzia',
  '3.1': 'div key=adas',
  '3.2': 'div key=love',
  '3.3': 'div key=not-love',
  '3.4': 'div key=conflict',
  '3.5': 'div key=wow',
  '3.6': 'div key=not-wow'
}

keys = {
  'madzia': '3.0',
  'adas': '3.5',
  'love': '3.2',
  'not-love': '3.1',
  'conflict': '3.4',
  'wow': '3.3',
  'not-wow': '3.6',
  'fuck': '3.2'
}

new = {
  // '3.0': 'div key=madzia',
  // '3.1': 'div key=not-love',
  // '3.2': 'div key=fuck',
  // '3.3': 'div key=wow',
  // '3.4': 'div key=conflict',
  // '3.5': 'div key=adas',
  '3.6': 'div key=not-wow'
}

newFragmentNode = {
  '3.0': skip,
  '3.1': move old '3.3' to '3.1',
  '3.2': render new on '3.2',
  '3.3': move old '3.5' to '3.3',
  '3.4': skip,
  '3.5': move old '3.1' to '3.5',
  '3.6': skip,
}

changes = {
 '3.1': '3.3',
 '3.3': '3.5',
 '3.5': '3.1'
}


let abc = parent.replaceChild('3.1', '3.3') // abc = 3.1
findPlaceFor(abc // 3.1) 3.5

{}



 */
