import {
  asyncScheduler,
  keyedListItem,
  nonKeyedListItem,
  ParentSubscription,
  isObservable,
  observer,
  Subscription,
  stateSubject,
  groupSub
} from '@atom-iq/rx'
import type {
  RvdChild,
  RvdComponentNode,
  RvdContext,
  RvdElementNode,
  RvdFragmentNode,
  RvdKeyedListNode,
  RvdListDataType,
  RvdListNode,
  RvdNonKeyedListNode,
  RvdObservableChild,
  RvdParent,
  RvdStaticChild
} from 'types'
import { isArray, isBoolean, isNullOrUndef, isStringOrNumber } from 'shared'
import { RvdListType, RvdNodeFlags } from 'shared/flags'

import { hookContext, hookOnInit, updateHooksManager } from '../hooks/manager'

import { renderDomElement, renderText, renderNull, hydrateText } from './render'
import { setClassName, connectObservableClassName } from './connect-props/class-name'
import { connectElementProps } from './connect-props/connect-props'
import {
  getKey,
  initDataForHydrate,
  removeExcessiveKeyedListChildren,
  reorderKeyedListItems
} from './list/keyed'
import { removeNonKeyedListChildren } from './list/non-keyed'
import {
  childrenArrayToFragment,
  hydrateSingleStaticTextChild,
  initRvdGroupNode,
  isRvdNode,
  removeExcessiveDomInHydrate,
  removeExistingNode,
  setListNextSibling,
  unsubscribeAsync,
  createDomElement,
  findDomElement
} from './utils'

/* -------------------------------------------------------------------------------------------
 *  Reactive Virtual DOM Child Node Renderer
 * ------------------------------------------------------------------------------------------- */

/**
 * Render Reactive Virtual DOM Static Child
 *
 * Render or hydrate new Reactive Virtual DOM node.
 * Check type of input RVD static child and call proper renderer function
 * @param child
 * @param index
 * @param parent
 * @param context
 */
export function renderRvdStaticChild(
  child: RvdStaticChild,
  index: number,
  parent: RvdParent,
  context: RvdContext
): void {
  // Check child node type and call proper render function
  if (isRvdNode(child)) {
    child.index = index
    // Child is element node
    if (RvdNodeFlags.Element & child.flag) {
      return context.$.hydrate
        ? hydrateRvdElement(child as RvdElementNode, parent, context)
        : renderRvdElement(child as RvdElementNode, parent, context)
    }
    // Child is fragment node
    if (child.flag === RvdNodeFlags.Fragment) {
      return renderRvdFragment(child as RvdFragmentNode, parent, context)
    }
    // Child is component node
    if (child.flag === RvdNodeFlags.Component) {
      return renderRvdComponent(child as RvdComponentNode, parent, context)
    }
    // Child is list node
    if (child.flag === RvdNodeFlags.List) {
      if (child.type === RvdListType.NonKeyed) {
        return renderRvdNonKeyedList(child as RvdNonKeyedListNode<unknown>, parent, context)
      }
      if (child.type === RvdListType.Keyed) {
        return renderRvdKeyedList(
          child as RvdKeyedListNode<unknown>,
          parent,
          context,
          context.$.hydrate
        )
      }
    }
    // Child is not recognized node
    throw Error('RvdNode has unknown type')
  }
  // Child is array
  if (isArray(child)) {
    return renderRvdFragment(
      childrenArrayToFragment(child, index), // convert array to fragment node
      parent,
      context
    )
  }
  // Child is string or number
  if (isStringOrNumber(child)) {
    return context.$.hydrate
      ? hydrateText(child, index, parent, context)
      : renderText(child, index, parent, context)
  }
  // Child is null, undefined or boolean
  if (isNullOrUndef(child) || isBoolean(child)) {
    return renderNull(index, parent)
  }
  // Child is wrong type
  throw Error('Wrong Child type')
}

/**
 * Render Reactive Virtual DOM Child
 *
 * Check if input RVD child is Observable, subscribe to it and render child on every
 * emission (if it's changed).
 * Otherwise, render static child.
 * @param child
 * @param index
 * @param parent
 * @param context
 */
function renderRvdChild(child: RvdChild, index: number, parent: RvdParent, context: RvdContext) {
  if (isObservable(child)) {
    let prev: RvdStaticChild = undefined
    parent.sub.add(
      child.subscribe(
        observer(c => c != prev && renderRvdStaticChild((prev = c), index, parent, context))
      )
    )
  } else renderRvdStaticChild(child, index, parent, context)
}

/* -------------------------------------------------------------------------------------------
 *  Reactive Virtual DOM Element Renderer
 * ------------------------------------------------------------------------------------------- */

/**
 * Render Reactive Virtual DOM Element
 *
 * Render and connect new RVD Element node - create new DOM element, render its children,
 * append and connect it to parent RVD and DOM, and connect its props.
 * @param rvdElement
 * @param parent
 * @param context
 */
function renderRvdElement(
  rvdElement: RvdElementNode,
  parent: RvdParent,
  context: RvdContext
): void {
  // 1. Apply middleware - if it returns false, stop rendering
  const middleware = context.$.element

  if (middleware) {
    rvdElement = middleware(rvdElement, context, parent) as RvdElementNode
    if (!rvdElement) return
  }

  // 2. Create DOM Element
  const isSvg = rvdElement.flag === RvdNodeFlags.SvgElement
  const dom = (rvdElement.dom = createDomElement(rvdElement.type, isSvg))
  const sub = (rvdElement.sub = groupSub())
  const { className, children } = rvdElement

  // 3. Add css class to element
  if (isObservable(className)) {
    connectObservableClassName(className, rvdElement, sub, dom, isSvg)
  } else if (className) {
    setClassName(isSvg, dom, className)
  }

  // 4. Render children
  if (!isNullOrUndef(children)) {
    if (isArray(children)) {
      // Render array of children
      renderRvdElementChildren(children, rvdElement as RvdParent, context)
    } else if (isObservable(children)) {
      // Render single observable child
      renderRvdElementSingleObservableChild(
        children,
        rvdElement as RvdParent<RvdElementNode>,
        dom,
        sub,
        context
      )
    } else if (isStringOrNumber(children)) {
      // if Element has single, static text child, it shouldn't use createdChildren abstraction
      dom.textContent = children + ''
    } else {
      rvdElement.children = new Array(1)
      renderRvdStaticChild(children, 0, rvdElement as RvdParent, context)
    }
  }

  // 5. Render Element in DOM and connect it to parent RVD
  renderDomElement(rvdElement, parent)

  // 6. Connect Element Props
  if (rvdElement.props) {
    connectElementProps(rvdElement, context)
  }
}

/**
 * Hydrate Reactive Virtual DOM Element
 *
 * Connect existing DOM element to new RVD Element node - find DOM element, hydrate its children,
 * connect it to parent RVD, and connect its props.
 * @param rvdElement
 * @param parent
 * @param context
 */
function hydrateRvdElement(
  rvdElement: RvdElementNode,
  parent: RvdParent,
  context: RvdContext
): void {
  // 1. Apply middleware - if it returns false, stop rendering
  const middleware = context.$.element

  if (middleware) {
    rvdElement = middleware(rvdElement, context, parent) as RvdElementNode
    if (!rvdElement) return
  }

  // 2. Find DOM Element
  const dom = (rvdElement.dom = findDomElement(parent, rvdElement.index))

  // If there's no DOM Element in current position (wrong markup from SSR), render new one
  if (!dom) return renderRvdElement(rvdElement, parent, context)
  // If there's DOM Element in current position, but has different type than Rvd Node on that
  // position, remove it from DOM and render new Rvd Element
  if (dom.tagName !== rvdElement.type) {
    parent.dom.removeChild(dom)
    return renderRvdElement(rvdElement, parent, context)
  }

  const isSvg = rvdElement.flag === RvdNodeFlags.SvgElement
  const sub = (rvdElement.sub = groupSub())
  const className = rvdElement.className
  const children = rvdElement.children

  // 3. Connect observable className or fix static className, if it's different than from SSR
  if (isObservable(className)) {
    connectObservableClassName(className, rvdElement, sub, dom, isSvg, true)
  } else if (className !== dom.className) {
    setClassName(isSvg, dom, className)
  }

  // 4. Render or hydrate children (if rendered DOM doesn't match Rvd, fix it)
  if (!isNullOrUndef(children)) {
    let isSingleObservableOrTextChild = false
    if (isArray(children)) {
      // Render or hydrate array of children
      renderRvdElementChildren(children, rvdElement as RvdParent, context)
    } else if (isObservable(children)) {
      // Render or hydrate single observable child
      renderRvdElementSingleObservableChild(
        children,
        rvdElement as RvdParent<RvdElementNode>,
        dom,
        sub,
        context,
        true
      )
      isSingleObservableOrTextChild = true
    } else if (isStringOrNumber(children)) {
      // Hydrate single static text child - don't use RVD children abstraction
      hydrateSingleStaticTextChild(children + '', dom)
      isSingleObservableOrTextChild = true
    } else {
      // Render or hydrate single static child
      rvdElement.children = new Array(1)
      renderRvdStaticChild(children, 0, rvdElement as RvdParent, context)
    }

    // If DOM Element has more children (from SSR) than Rvd Element, remove excessive DOM elements
    removeExcessiveDomInHydrate(rvdElement as RvdParent, isSingleObservableOrTextChild, dom)
  } else if (dom.firstChild) {
    // If Rvd element has no children, but DOM element has, clear DOM children
    dom.textContent = ''
  }

  // 5. Connect Element to parent RVD
  parent.sub.add(sub)
  if (parent.type !== RvdListType.Keyed) {
    // Add element node to parent rvd (children)
    parent.children[rvdElement.index] = rvdElement
  }

  // 6. Connect Element Props
  if (rvdElement.props) {
    connectElementProps(rvdElement, context)
  }
}

/**
 * Render Reactive Virtual DOM Element Children
 *
 * Render RVD Element children array. Iterate over children array elements and call
 * child renderer for every element.
 * @param children
 * @param rvdElement
 * @param context
 */
function renderRvdElementChildren(
  children: RvdChild[],
  rvdElement: RvdParent,
  context: RvdContext
) {
  const childrenLength = children.length
  rvdElement.children = new Array(childrenLength)
  for (let i = 0; i < childrenLength; ++i) {
    renderRvdChild(children[i], i, rvdElement, context)
  }
}

/**
 * Render Reactive Virtual DOM Element Single Observable Child
 *
 * Subscribe to RVD Element single child observable and render child on every emission.
 * If it's text child, use dedicated optimization and don't use RVD children abstraction
 * @param child
 * @param rvdElement
 * @param dom
 * @param sub
 * @param context
 * @param hydrate
 */
function renderRvdElementSingleObservableChild(
  child: RvdObservableChild,
  rvdElement: RvdParent<RvdElementNode>,
  dom: HTMLElement | SVGElement,
  sub: ParentSubscription,
  context: RvdContext,
  hydrate = false
) {
  const rvd = (rvdElement.children = new Array(1))
  let prev: RvdStaticChild =
    hydrate && dom.firstChild.nodeType === Node.TEXT_NODE ? dom.firstChild.nodeValue : undefined

  sub.add(
    child.subscribe(
      observer(v => {
        if (v != prev) {
          if (isStringOrNumber(v) && !rvd[0]) {
            if (dom.firstChild) {
              dom.firstChild.nodeValue = (prev = v) + ''
            } else {
              dom.textContent = (prev = v) + ''
            }
          } else {
            renderRvdStaticChild((prev = v), 0, rvdElement as RvdParent, context)
          }
        }
      })
    )
  )
}

/* -------------------------------------------------------------------------------------------
 *  Component renderer
 * ------------------------------------------------------------------------------------------- */

/**
 * Render Reactive Virtual DOM Component
 *
 * Render and connect RVD Component. Initialize component (call component function) with its props
 * and middlewares, connect it to parent RVD and render returned child
 * @param rvdComponent
 * @param parent
 * @param context
 */
export function renderRvdComponent(
  rvdComponent: RvdComponentNode,
  parent: RvdParent,
  context: RvdContext
): void {
  const middleware = context.$.component

  if (middleware) {
    rvdComponent = middleware(rvdComponent, context, parent) as RvdComponentNode
    if (!rvdComponent) return
  }

  removeExistingNode(rvdComponent.index, parent)

  initRvdGroupNode(rvdComponent, parent)

  rvdComponent.children = new Array(1) as RvdComponentNode['children']

  updateHooksManager(rvdComponent, context)

  const componentChild = rvdComponent.type(rvdComponent.props)

  renderRvdComponentChild(componentChild, 0, rvdComponent as RvdParent, hookContext(), hookOnInit())
}

/**
 * Render Reactive Virtual DOM Child
 *
 * Check if input RVD child is Observable, subscribe to it and render child on every
 * emission (if it's changed).
 * Otherwise, render static child.
 * @param child
 * @param index
 * @param parent
 * @param context
 * @param init
 */
function renderRvdComponentChild(
  child: RvdChild,
  index: number,
  parent: RvdParent,
  context: RvdContext,
  init: (() => void) | null
) {
  if (isObservable(child)) {
    let prev: RvdStaticChild = undefined
    parent.sub.add(
      child.subscribe(
        observer(c => {
          c != prev && renderRvdStaticChild((prev = c), index, parent, context)
          if (init) {
            init()
            init = null
          }
        })
      )
    )
  } else {
    renderRvdStaticChild(child, index, parent, context)
    init()
  }
}

/* -------------------------------------------------------------------------------------------
 *  Fragment renderer
 * ------------------------------------------------------------------------------------------- */

/**
 * Reactive Virtual DOM Fragment Renderer
 *
 * Render and connect RVD Fragment (or array child, converted to fragment). Initialize fragment,
 * iterate over its children and render each child. If there's a virtual node group or dom element
 * currently rendered on fragment's position, remove it and render new one
 * @param rvdFragment
 * @param parent
 * @param context
 */
export function renderRvdFragment(
  rvdFragment: RvdFragmentNode,
  parent: RvdParent,
  context: RvdContext
): void {
  removeExistingNode(rvdFragment.index, parent)

  const { children } = rvdFragment

  initRvdGroupNode(rvdFragment, parent)

  const size = children.length
  rvdFragment.children = new Array(size)

  for (let i = 0; i < size; ++i) {
    renderRvdChild(children[i], i, rvdFragment as RvdParent, context)
  }
}

/* -------------------------------------------------------------------------------------------
 *  List renderer
 * ------------------------------------------------------------------------------------------- */

/**
 * Reactive Virtual DOM Keyed List Renderer
 *
 * Render and connect RVD keyed list node.
 * On initial run, render and connect new child for every item from data array, save indexes
 * of rendered items and track them by key.
 * On data array update, reorder/move/add/remove elements, basing on saved keys
 * @param rvdList
 * @param parent
 * @param context
 * @param hydrate
 */
export function renderRvdKeyedList<T extends RvdListDataType = unknown>(
  rvdList: RvdKeyedListNode<T>,
  parent: RvdParent,
  context: RvdContext,
  hydrate: boolean
): void {
  removeExistingNode(rvdList.index, parent)

  initRvdGroupNode(rvdList, parent)

  rvdList.children = []
  const keyedIndexes: Record<string | number, number> = {}
  const dataSubject = stateSubject<Record<string | number, T>>({})

  const { data, render, keyBy } = rvdList.props

  parent.sub.add(
    data.subscribe(
      observer((dataArray: T[]): void => {
        const dataDictionary: Record<string | number, T> = {}
        const toUnsubscribe: Subscription[] = []

        // In normal rendering mode, data dictionary is created in one iteration with child
        // elements rendering (to avoid additional iterations, for performance reason), but is
        // emitted after rendering iteration, so some children of list elements, could be rendered
        // in different order (after rendering all list items). It's still single sync operation,
        // so it's no difference for end user, elements will appear in correct order. But in hydrate
        // mode, we have to parse all elements in order, one by one - so we have to create and emit
        // data dictionary before list items rendering iteration, to keep correct rendering order.
        // It means additional iteration on data array, but it shouldn't matter a lot in hydrate
        // mode - it will be faster than render anyway, because of not creating new DOM elements
        if (hydrate) initDataForHydrate<T>(dataSubject, dataArray, keyBy)

        // If list hasn't got actually rendered children, activate list append mode
        if (rvdList.children.length === 0) rvdList.append = true

        // Set next sibling of last list element, as last sibling of whole list - it will be
        // used in append mode, to append items to DOM faster
        setListNextSibling(rvdList as RvdListNode, parent)

        for (let i = 0; i < dataArray.length; ++i) {
          const newItem = dataArray[i]
          const key = getKey<T>(newItem, keyBy)
          dataDictionary[key] = newItem

          const existingNode = rvdList.children[i]

          if (existingNode && existingNode.key === key) {
            existingNode.index = i
            keyedIndexes[key] = i
          } else {
            const oldIndex = keyedIndexes[key]

            if (!oldIndex && oldIndex !== 0) {
              const child = render(
                (fieldName?: keyof T) => keyedListItem<T>(key, fieldName, dataSubject),
                key
              )

              if (i >= rvdList.children.length) rvdList.append = true

              child.key = key
              renderRvdStaticChild(child, i, rvdList, context)

              if (rvdList.append) rvdList.children[i] = child
              else rvdList.children.splice(i, 0, child)

              keyedIndexes[key] = i
            } else {
              if (existingNode) {
                reorderKeyedListItems<T>(
                  rvdList.children[oldIndex],
                  existingNode,
                  rvdList,
                  dataArray,
                  key,
                  keyBy,
                  keyedIndexes,
                  toUnsubscribe,
                  i
                )
              }
            }
          }
        }
        rvdList.append = false

        if (!hydrate) dataSubject.next(dataDictionary)

        removeExcessiveKeyedListChildren(rvdList, dataArray, keyedIndexes, toUnsubscribe)

        asyncScheduler.schedule(unsubscribeAsync, 0, toUnsubscribe)
      })
    )
  )
  hydrate = false
}

/**
 * Reactive Virtual DOM Keyed List Renderer
 *
 * Render and connect RVD non-keyed list node.
 * On every data array update, when number of elements has changed, add/remove elements.
 *
 * @param rvdList
 * @param parent
 * @param context
 */
export function renderRvdNonKeyedList<T extends RvdListDataType = unknown>(
  rvdList: RvdNonKeyedListNode<T>,
  parent: RvdParent,
  context: RvdContext
): void {
  removeExistingNode(rvdList.index, parent)

  initRvdGroupNode(rvdList, parent)

  const { data, render } = rvdList.props

  rvdList.append = true // always append mode for non-keyed list
  rvdList.children = []

  parent.sub.add(
    data.subscribe(
      observer((dataArray: T[]): void => {
        const newLength = dataArray.length,
          oldLength = rvdList.children.length

        setListNextSibling(rvdList as RvdListNode, parent)

        if (newLength > oldLength) {
          rvdList.children.length = newLength
          for (let i = oldLength; i < newLength; ++i) {
            renderRvdStaticChild(
              render((fieldName?: keyof T) => nonKeyedListItem<T>(i, fieldName, data), i),
              i,
              rvdList,
              context
            )
          }
        } else if (newLength < oldLength) {
          removeNonKeyedListChildren<T>(newLength, oldLength, rvdList)
        }
      })
    )
  )
}
