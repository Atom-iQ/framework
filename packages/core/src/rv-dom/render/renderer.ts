import {
  CreatedChildrenManager,
  CreatedFragmentChild,
  CreatedNodeChild,
  Dictionary,
  KeyedChild,
  RenderCallback,
  RenderChildFn,
  RenderElementChildrenFn,
  RenderStaticChildFn,
  RvdChild,
  RvdComponentElement,
  RvdComponentRenderer,
  RvdDOMElement,
  RvdElement,
  RvdFragmentElement,
  RvdNode,
  RxSub
} from '@@types'

import {
  childrenArrayToFragment,
  childTypeSwitch,
  connectElementProps,
  createDomElement,
  getFlattenFragmentChildren,
  isRvdElement,
  isSvgElement,
  renderTypeSwitch,
  unsubscribe
} from './utils'

import { _FRAGMENT } from '@@shared'
import { nestedFragmentMoveCallback } from './move-callback/fragment'
import {
  removeChildFromIndexPosition,
} from './dom-renderer'
import { removeExistingFragment } from './move-callback/utils'
import {
  staticTextRenderCallback,
  textRenderCallback
} from './render-callback/text'
import createComponent from './create-component'
import { isObservable, Subscription } from 'rxjs'
import { elementMoveCallback } from './move-callback/element'
import nullRenderCallback from './render-callback/null'

import createChildrenManager from './utils/children-manager'
import {
  renderElement,
  replaceElementForElement,
  replaceFragmentForElement
} from './render-callback/element'

/* -------------------------------------------------------------------------------------------
 *  Component render callbacks
 * ------------------------------------------------------------------------------------------- */


export const componentRenderCallback: RenderCallback = (
  childIndex,
  element,
  createdChildren,
  childrenSubscription
) => renderRvdComponent(childIndex, element, createdChildren, childrenSubscription)

/* -------------------------------------------------------------------------------------------
 *  Element render callbacks
 * ------------------------------------------------------------------------------------------- */

export const elementRenderCallback: RenderCallback = (
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
    childrenSubscription
  )
  renderTypeSwitch(
    replaceElementForElement(
      elementNode,
      childIndex,
      element,
      createdChildren,
      childrenSubscription
    ),
    replaceFragmentForElement(
      renderFn,
      elementNode,
      childIndex,
      element,
      createdChildren
    ),
    renderFn
  )(childIndex, createdChildren)

}

/**
 * One time render callback - if child isn't Observable, then it will not
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
    childrenSubscription
  )()
}


/* -------------------------------------------------------------------------------------------
 *  Fragment render callbacks
 * ------------------------------------------------------------------------------------------- */

const replaceElementForFragment = (
  child: RvdFragmentElement,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub
) => () => {
  removeChildFromIndexPosition(
    removedChild => {
      unsubscribe(removedChild)
      createdChildren.remove(removedChild.index)

      createdChildren.createEmptyFragment(childIndex)
      return renderRvdFragment(
        childIndex,
        element,
        createdChildren,
        childrenSubscription
      )(child)
    },
    childIndex,
    element,
    createdChildren
  )
}

const replaceFragmentForFragment = (
  child: RvdFragmentElement,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub
) => () => {
  return renderRvdFragment(
    childIndex,
    element,
    createdChildren,
    childrenSubscription
  )(child)
}

const renderFragment = (
  child: RvdFragmentElement,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub
) => () => {
  createdChildren.createEmptyFragment(childIndex)
  return renderRvdFragment(
    childIndex,
    element,
    createdChildren,
    childrenSubscription
  )(child)
}

const fragmentRenderCallback: RenderCallback = (
  childIndex,
  element,
  createdChildren,
  childrenSubscription
) => (child: RvdFragmentElement): void => {
  renderTypeSwitch(
    replaceElementForFragment(child, childIndex, element, createdChildren, childrenSubscription),
    replaceFragmentForFragment(child, childIndex, element, createdChildren, childrenSubscription),
    renderFragment(child, childIndex, element, createdChildren, childrenSubscription)
  )(childIndex, createdChildren)
}

const staticFragmentRenderCallback: RenderCallback = (
  childIndex,
  element,
  createdChildren,
  childrenSubscription
) => (child: RvdFragmentElement): void => {
  createdChildren.createEmptyFragment(childIndex)
  return renderRvdFragment(
    childIndex,
    element,
    createdChildren,
    childrenSubscription
  )(child)
}

const arrayRenderCallback: RenderCallback = (
  ...args: [string, Element, CreatedChildrenManager, RxSub]
) => (child: RvdChild[]): void => fragmentRenderCallback(
  ...args
)(childrenArrayToFragment(child))

const staticArrayRenderCallback: RenderCallback = (
  ...args: [string, Element, CreatedChildrenManager, RxSub]
) => (child: RvdChild[]): void => staticFragmentRenderCallback(
  ...args
)(childrenArrayToFragment(child))

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
) => childTypeSwitch<void>(
  null,
  staticTextRenderCallback(...args),
  staticArrayRenderCallback(...args),
  componentRenderCallback(...args),
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
) => (child: RvdChild, index: number): void => {
  const childIndex = String(index)
  if (isObservable(child)) {
    const childSub = child.subscribe(renderObservableChild(
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
  const createdChildren: CreatedChildrenManager = createChildrenManager()

  children.forEach(renderChild(element, createdChildren, childrenSubscription))

  return childrenSubscription
}

/* -------------------------------------------------------------------------------------------
 *  Fragment Rendering functions
 * ------------------------------------------------------------------------------------------- */

/**
 * TODO: MOVE TO SEPARATE FILE
 * @param createdChildren
 * @param createdFragment
 */
const loadPreviousKeyedElements = (
  createdChildren: CreatedChildrenManager,
  createdFragment: CreatedFragmentChild
): Dictionary<KeyedChild> => Object.keys(createdFragment.fragmentChildKeys)
  .reduce((newMap, key) => {
    const index = createdFragment.fragmentChildKeys[key]

    const child = createdChildren.get(index) || createdChildren.getFragment(index)
    const fragmentChildren = child.fragmentChildIndexes &&
      child.fragmentChildIndexes.reduce(
        getFlattenFragmentChildren(createdChildren), []
      ) as CreatedNodeChild[]

    newMap[key] = {
      index,
      child,
      fragmentChildren
    }

    return newMap
  }, {})

/**
 * TODO: Move to separate file
 * @param oldKeyElementMap
 * @param createdFragment
 * @param childIndex
 * @param key
 */
const skipRenderingKeyedChild = (
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  key: string | number
) => {
  createdFragment.fragmentChildKeys = {
    ...createdFragment.fragmentChildKeys,
    [key]: childIndex
  }

  delete oldKeyElementMap[key]
}

const skipMoveOrRenderKeyedChild = (
  oldKeyElementMap: Dictionary<KeyedChild>,
  createdFragment: CreatedFragmentChild,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub
) => (child: RvdElement): void => {
  const currentKeyedElement = oldKeyElementMap[child.key]
  if (currentKeyedElement) {
    // Same element, on the same position
    if (currentKeyedElement.index === childIndex) {
      return skipRenderingKeyedChild(oldKeyElementMap, createdFragment, childIndex, child.key)
    } else {
      // Move fragment child (nested)
      if (currentKeyedElement.child.element === _FRAGMENT) {
        nestedFragmentMoveCallback(
          child,
          currentKeyedElement,
          oldKeyElementMap,
          createdFragment,
          childIndex,
          element,
          createdChildren
        )
      } else {
        elementMoveCallback(
          child,
          currentKeyedElement,
          oldKeyElementMap,
          createdFragment,
          childIndex,
          element,
          createdChildren
        )
      }
    }
  } else {
    createdFragment.fragmentChildKeys = {
      ...createdFragment.fragmentChildKeys,
      [child.key]: childIndex
    }
    renderObservableChild(childIndex, element, createdChildren, childrenSubscription)(child)
  }
}


/* -------------------------------------------------------------------------------------------
 *  Main RvdElement rendering functions
 * ------------------------------------------------------------------------------------------- */

/**
 * Render Rvd DOM Element and return it with subscription to parent
 * @param rvdElement
 */
function renderRvdElement(
  rvdElement: RvdDOMElement
): RvdNode {
  const element = createDomElement(
    rvdElement.type,
    isSvgElement(rvdElement)
  )
  // TODO: Connect Element RvdProps Full Implementation
  const elementSubscription: RxSub = connectElementProps(rvdElement, element)


  if (rvdElement.children) {
    const childrenSubscription = renderChildren(rvdElement.children, element)
    elementSubscription.add(childrenSubscription)
  }

  return {
    dom: element,
    elementSubscription
  }
}

/**
 * Render Rvd Component and attach returned child(ren) to parent element
 * @param componentIndex
 * @param element
 * @param createdChildren
 * @param childrenSubscription
 */
function renderRvdComponent(
  componentIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub
): RvdComponentRenderer  {
  return (rvdComponentElement: RvdComponentElement) => {
    const componentChild = createComponent(rvdComponentElement)
    const key = rvdComponentElement.key || null
    if (isObservable(componentChild)) {
      const componentChildSub = componentChild.subscribe(observableChild => {
        if (key && isRvdElement(observableChild)) {
          if (observableChild.key) {
            if (observableChild.key !== key) {
              observableChild.key = `${key}.${observableChild.key}`
            }
          } else {
            observableChild.key = key
          }
        }

        return renderObservableChild(
          componentIndex,
          element,
          createdChildren,
          childrenSubscription
        )(observableChild)
      })
      childrenSubscription.add(componentChildSub)
    } else {
      return renderObservableChild(
        componentIndex, element, createdChildren, childrenSubscription
      )(componentChild)
    }
  }
}

function renderRvdFragment(
  fragmentIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub
): (rvdFragmentElement: RvdFragmentElement) => void  {
  return (rvdFragmentElement: RvdFragmentElement) => {
    const createdFragment = createdChildren.getFragment(fragmentIndex)
    const previousChildrenLength = createdFragment.fragmentChildrenLength
    const newChildrenLength = rvdFragmentElement.children.length

    const oldKeyElementMap = loadPreviousKeyedElements(createdChildren, createdFragment)
    createdFragment.fragmentChildKeys = {}

    if (previousChildrenLength > newChildrenLength) {
      const toRemoveCount = previousChildrenLength - newChildrenLength
      Array.from({ length: toRemoveCount }, (_, i) => i + newChildrenLength).forEach(index => {
        const childIndex = `${fragmentIndex}.${index}`
        if (createdChildren.has(childIndex)) {
          removeChildFromIndexPosition(
            removedChild => {
              if (!removedChild.key || !oldKeyElementMap[removedChild.key]) {
                unsubscribe(removedChild)
              }

              createdChildren.remove(removedChild.index)
            },
            childIndex,
            element,
            createdChildren
          )
        } else if (createdChildren.hasFragment(childIndex)) {
          removeExistingFragment(
            oldKeyElementMap, childIndex, element, createdChildren
          )(createdChildren.getFragment(childIndex))
        }
      })
    }

    rvdFragmentElement.children.forEach((child, index) => {

      const childIndex = `${fragmentIndex}.${index}`

      if (isObservable(child)) {
        const childSub = child.subscribe(observableChild => {
          if (isRvdElement(observableChild) && observableChild.key) {
            skipMoveOrRenderKeyedChild(
              oldKeyElementMap,
              createdFragment,
              childIndex,
              element,
              createdChildren,
              childrenSubscription
            )(observableChild)
          } else {
            renderObservableChild(
              childIndex, element, createdChildren, childrenSubscription
            )(observableChild)
          }
        })
        childrenSubscription.add(childSub)
      } else {
        if (isRvdElement(child) && child.key) {
          skipMoveOrRenderKeyedChild(
            oldKeyElementMap,
            createdFragment,
            childIndex,
            element,
            createdChildren,
            childrenSubscription
          )(child)
        } else {
          renderObservableChild(childIndex, element, createdChildren, childrenSubscription)(child)
        }
      }
    })
  }
}

