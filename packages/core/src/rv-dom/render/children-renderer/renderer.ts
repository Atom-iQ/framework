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
  RvdDOMElement,
  RvdFragmentElement,
  RvdFragmentNode,
  RvdNode,
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
import createChildrenMap from '../utils/children-manager'
import textRenderCallback from './render-callback/text'
import nullRenderCallback from './render-callback/null'
import { renderRvdComponent, renderRvdElement, renderRvdFragment } from '../render'


const switchNestedFragments = (baseIndex: string) => (fragmentNode: RvdFragmentNode) => {
  const obs: RvdObservableNode[] = Object.entries(fragmentNode)
    .map(([index, fragmentChild]) => {
      return switchMap((child: RvdFragmentNode | RvdNode) => {
        if (isRvdNode(child)) {
          return syncObservable({ ...child, indexInFragment: `${baseIndex}.${index}` })
        } else {
          return switchNestedFragments(`${baseIndex}.${index}`)(child)
        }
      })(fragmentChild)
    })
  return merge(...obs)
}


const arrayRenderCallback: RenderCallback = (
  ...args: [string, Element, CreatedChildrenManager, RxSub]
) => (child: RvdChild[]) => fragmentRenderCallback(
  ...args
)(childrenArrayToFragment(child))

const componentRenderCallback: RenderCallback = (
  childIndex,
  element,
  createdChildrenMap,
  childrenSubscription
) => (child: RvdComponentElement) => {
  const childSub = renderRvdComponent(child).subscribe()
  childrenSubscription.add(childSub)
}

const fragmentRenderCallback: RenderCallback = (
  childIndex,
  element,
  createdChildren,
  childrenSubscription
) => (child: RvdFragmentElement) => {
  const childSub = switchMap(
    switchNestedFragments(childIndex)
  )(renderRvdFragment(child)).subscribe((fragmentChild: RvdNode) => {
    renderChildInIndexPosition(
      newChild => createdChildren.add(fragmentChild.indexInFragment, {
        ...newChild,
        fromFragment: true
      }),
      fragmentChild.dom,
      fragmentChild.indexInFragment,
      element,
      createdChildren
    )
  })

  childrenSubscription.add(childSub)
}

const elementRenderCallback: RenderCallback = (
  childIndex,
  element,
  createdChildren,
  childrenSubscription
) => (child: RvdDOMElement) => {
  renderRvdElement(child).subscribe(
    elementNode => {
      const childElementSubscription = elementNode.elementSubscription
      if (childElementSubscription) {
        childrenSubscription.add(childElementSubscription)
      }

      renderChildInIndexPosition(
        newChild => createdChildren.add(childIndex, {
          ...newChild,
          subscription: childElementSubscription
        }),
        elementNode.dom,
        childIndex,
        element,
        createdChildren
      )
    }
  )
}

/**
 * Closure with static child rendering function. The name could be confusing as it is also
 * used in subscription to Observable children. But Observable children are Observables
 * that are emitting static children, so technically it's always used to render static child.
 * Taking common params for child position (that will be the same for all emissions of Observable
 * child) and returning static child rendering function for concrete child (will be invoked
 * one time for static child and for every new child emitted be Observable child)
 * @params ...args - DOM Element, string child index, children map and children subscription
 * @returns Static child rendering function that is checking static child type and calling
 * specific callback for given child type
 */
const renderStaticChild: RenderStaticChildFn = (
  ...args: [string, Element, CreatedChildrenManager, RxSub]
) => childTypeSwitch<void>(
  nullRenderCallback(...args),
  textRenderCallback(...args),
  arrayRenderCallback(...args),
  componentRenderCallback(...args),
  fragmentRenderCallback(...args),
  elementRenderCallback(...args)
)

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
const renderChild: RenderChildFn = (
  element,
  createdChildrenMap,
  childrenSubscription
) => (child, index) => {
  const childIndex = String(index)
  if (isObservable(child)) {
    const childSub = child.subscribe(renderStaticChild(
      childIndex,
      element,
      createdChildrenMap,
      childrenSubscription
    ))
    childrenSubscription.add(childSub)
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
  const createdChildrenMap: CreatedChildrenManager = createChildrenMap()

  children.forEach(renderChild(element, createdChildrenMap, childrenSubscription))

  return childrenSubscription
}

export default renderChildren
