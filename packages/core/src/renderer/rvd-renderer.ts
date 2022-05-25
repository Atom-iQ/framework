import {
  asyncScheduler,
  keyedListItem,
  nonKeyedListItem,
  isObservable,
  observer,
  Subscription,
  stateSubject,
  groupSub
} from '@atom-iq/rx';

import type {
  RvdChild,
  RvdComponentNode,
  RvdContext,
  RvdElementNode,
  RvdFragmentNode,
  RvdKeyedListNode,
  RvdListDataType,
  RvdListNode,
  RvdNode,
  RvdNonKeyedListNode,
  RvdObservableChild,
  RvdStaticChild
} from 'types';
import { isArray, isBoolean, isNullOrUndef, isStringOrNumber } from 'shared'
import { RvdNodeFlags } from 'shared/flags'

import { hookContext, hookOnInit, updateHooksManager } from '../hooks'

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
  hydrateSingleTextChild,
  initRvdGroupNode,
  isRvdNode,
  removeExcessiveDomInHydrate,
  removeExistingNode,
  setListNextSibling,
  unsubscribeAsync,
  createDomElement,
  findDomElement,
  isRvdElement,
  isRvdFragment,
  isRvdComponent,
  isRvdList,
  isRvdKeyedList,
  isRvdNonKeyedList,
  isRvdDomNode,
  renderDomChild
} from './utils';


/* -------------------------------------------------------------------------------------------
 *  Reactive Virtual DOM Child Node Renderer
 * ------------------------------------------------------------------------------------------- */

/**
 * Render Reactive Virtual DOM Child
 *
 * Check if input RVD child is Observable, subscribe to it and render child on every
 * emission (if it's changed).
 * Otherwise, render static child.
 * @param index
 * @param child
 * @param parent
 * @param context
 */
export function renderRvdChild(index: number, child: RvdChild, parent: RvdNode, context: RvdContext): void {
  if (isObservable(child)) {
    let prev: RvdStaticChild = undefined
    parent.sub.add(
      child.subscribe(
        observer(c => c != prev && renderRvdStaticChild(index, (prev = c), parent, context))
      )
    )
  } else renderRvdStaticChild(index, child, parent, context)
}

/**
 * Render Reactive Virtual DOM Static Child
 *
 * Render or hydrate new Reactive Virtual DOM node.
 * Check type of input RVD static child and call proper renderer function
 * @param index
 * @param child
 * @param parent
 * @param context
 */
function renderRvdStaticChild(
  index: number,
  child: RvdStaticChild,
  parent: RvdNode,
  context: RvdContext
): void {
  // Check child node type and call proper render function
  if (isRvdNode(child)) {
    child.index = index
    renderRvdNode(child, parent, context)
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
      ? hydrateText(index, child, parent, context)
      : renderText(index, child, parent, context)
  }
  // Child is null, undefined or boolean
  if (isNullOrUndef(child) || isBoolean(child)) {
    return renderNull(index, parent)
  }
  // Child is wrong type
  throw Error('Wrong Child type')
}

function renderRvdNode(child: RvdNode, parent: RvdNode, context: RvdContext): void {
  // Child is element node
  if (isRvdElement(child)) {
    return context.$.hydrate
      ? hydrateRvdElement(child, parent, context)
      : renderRvdElement(child, parent, context)
  }
  // Child is component node
  if (isRvdComponent(child)) {
    return renderRvdComponent(child, parent, context)
  }
  // Child is fragment node
  if (isRvdFragment(child)) {
    return renderRvdFragment(child, parent, context)
  }
  // Child is list node
  if (isRvdList(child)) {
    if (isRvdNonKeyedList(child)) {
      return renderRvdNonKeyedList(child, parent, context)
    }
    if (isRvdKeyedList(child)) {
      return renderRvdKeyedList(child, parent, context, context.$.hydrate)
    }
  }
  // Child is not recognized node
  throw Error('RvdNode has unknown type')
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
  parent: RvdNode,
  context: RvdContext
): void {
  // 1. Apply middleware - if it returns false, stop rendering
  const middleware = context.$.element

  if (middleware) {
    rvdElement = middleware(rvdElement, parent, context) as RvdElementNode
    if (!rvdElement) return
  }

  // 2. Create DOM Element
  const isSvg = rvdElement.flag === RvdNodeFlags.SvgElement
  const dom = (rvdElement.dom = createDomElement(rvdElement.type, isSvg))
  rvdElement.sub = groupSub()
  const { className, children } = rvdElement

  // 3. Add css class to element
  if (isObservable(className)) {
    connectObservableClassName(className, rvdElement, isSvg)
  } else if (className) {
    setClassName(isSvg, dom, className)
  }

  // 4. Render children
  if (!isNullOrUndef(children)) {
    if (isArray(children)) {
      // Render array of children
      renderElementChildren(children, rvdElement, context)
    } else if (isObservable(children)) {
      // Render single observable child
      renderSingleObservableChild(children, rvdElement, context)
    } else if (isStringOrNumber(children)) {
      // if Element has single, static text child, it shouldn't use createdChildren abstraction
      dom.textContent = children + ''
    } else {
      rvdElement.live = new Array(1)
      renderRvdStaticChild(0, children, rvdElement as RvdNode, context)
    }
  }

  // 5. Render Element in DOM and connect it to parent RVD
  renderDomElement(rvdElement, parent)

  // 6. Connect Element Props
  if (rvdElement.props) connectElementProps(rvdElement, context)
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
  parent: RvdNode,
  context: RvdContext
): void {
  // 1. Apply middleware - if it returns false, stop rendering
  const middleware = context.$.element

  if (middleware) {
    rvdElement = middleware(rvdElement, parent, context) as RvdElementNode
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
  const { className, children } = rvdElement

  // 3. Connect observable className or fix static className, if it's different from SSR
  if (isObservable(className)) {
    connectObservableClassName(className, rvdElement, isSvg, true)
  } else if (className !== dom.className) {
    setClassName(isSvg, dom, className)
  }

  // 4. Render or hydrate children (if rendered DOM doesn't match Rvd, fix it)
  if (!isNullOrUndef(children)) {
    let isSingleChild = false
    if (isArray(children)) {
      // Render or hydrate array of children
      renderElementChildren(children, rvdElement, context)
    } else if (isObservable(children)) {
      // Render or hydrate single observable child
      renderSingleObservableChild(
        children,
        rvdElement,
        context,
        true
      )
      isSingleChild = true
    } else if (isStringOrNumber(children)) {
      // Hydrate single static text child - don't use RVD children abstraction
      hydrateSingleTextChild(children + '', dom)
      isSingleChild = true
    } else {
      // Render or hydrate single static child
      rvdElement.live = new Array(1)
      renderRvdStaticChild(0, children, rvdElement, context)
    }

    // If DOM Element has more children (from SSR) than Rvd Element, remove excessive DOM elements
    removeExcessiveDomInHydrate(rvdElement, isSingleChild, dom)
  } else if (dom.firstChild) {
    // If Rvd element has no children, but DOM element has, clear DOM children
    dom.textContent = ''
  }

  // 5. Connect Element to parent RVD
  parent.sub.add(sub)
  if (!isRvdKeyedList(parent)) {
    // Add element node to parent rvd (children)
    parent.live[rvdElement.index] = rvdElement
  }

  // 6. Connect Element Props
  if (rvdElement.props) connectElementProps(rvdElement, context)
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
function renderElementChildren(
  children: RvdChild[],
  rvdElement: RvdNode,
  context: RvdContext
) {
  const size = children.length
  rvdElement.live = new Array(size)
  for (let i = 0; i < size; ++i) {
    renderRvdChild(i, children[i], rvdElement, context)
  }
}

/**
 * Render Reactive Virtual DOM Element Single Observable Child
 *
 * Subscribe to RVD Element single child observable and render child on every emission.
 * If it's text child, use dedicated optimization and don't use RVD children abstraction
 * @param child
 * @param rvdElement
 * @param context
 * @param hydrate
 */
function renderSingleObservableChild(
  child: RvdObservableChild,
  rvdElement: RvdNode,
  context: RvdContext,
  hydrate = false
) {
  const live = (rvdElement.live = new Array(1))
  const { dom } = rvdElement
  let prev: RvdStaticChild =
    hydrate && dom.firstChild.nodeType === Node.TEXT_NODE ? dom.firstChild.nodeValue : undefined

  rvdElement.sub.add(
    child.subscribe(
      observer(v => {
        if (v != prev) {
          if (isStringOrNumber(v) && !live[0]) {
            if (dom.firstChild) {
              dom.firstChild.nodeValue = (prev = v) + ''
            } else {
              dom.textContent = (prev = v) + ''
            }
          } else {
            renderRvdStaticChild(0, (prev = v), rvdElement, context)
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
function renderRvdComponent(
  rvdComponent: RvdComponentNode,
  parent: RvdNode,
  context: RvdContext
): void {
  const middleware = context.$.component

  if (middleware) {
    rvdComponent = middleware(rvdComponent, parent, context) as RvdComponentNode
    if (!rvdComponent) return
  }

  removeExistingNode(rvdComponent.index, parent)

  initRvdGroupNode(rvdComponent, parent)

  rvdComponent.live = new Array(1) as [RvdNode | undefined]

  updateHooksManager(rvdComponent, context)

  const child = rvdComponent.type(rvdComponent.props)

  renderComponentChild(child, rvdComponent, hookContext(), hookOnInit())
}

/**
 * Render Reactive Virtual DOM Child
 *
 * Check if input RVD child is Observable, subscribe to it and render child on every
 * emission (if it's changed).
 * Otherwise, render static child.
 * @param child
 * @param component
 * @param context
 * @param init
 */
function renderComponentChild(
  child: RvdChild,
  component: RvdComponentNode,
  context: RvdContext,
  init: (() => void) | null
) {
  if (isObservable(child)) {
    let prev: RvdStaticChild = undefined
    component.sub.add(
      child.subscribe(
        observer(c => {
          c != prev && renderRvdStaticChild(0, (prev = c), component, context)
          if (init) {
            init()
            init = null
          }
        })
      )
    )
  } else {
    renderRvdStaticChild(0, child, component, context)
    if (init) init()
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
function renderRvdFragment(
  rvdFragment: RvdFragmentNode,
  parent: RvdNode,
  context: RvdContext
): void {
  removeExistingNode(rvdFragment.index, parent)

  const { children } = rvdFragment

  initRvdGroupNode(rvdFragment, parent)

  const size = children.length
  rvdFragment.live = new Array(size)

  for (let i = 0; i < size; ++i) {
    renderRvdChild(i, children[i], rvdFragment, context)
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
function renderRvdKeyedList<T extends RvdListDataType = unknown>(
  rvdList: RvdKeyedListNode<T>,
  parent: RvdNode,
  context: RvdContext,
  hydrate: boolean
): void {
  removeExistingNode(rvdList.index, parent)

  initRvdGroupNode(rvdList, parent)

  rvdList.live = []
  const keyedIndexes: Record<string | number, number> = {}
  const dataSubject = stateSubject<Record<string | number, T>>({})

  const { data, render, keyBy, keepRemoved = false, keepSubscribed = false } = rvdList.props

  if (keepRemoved) rvdList.removed = {}

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
        if (rvdList.live.length === 0) rvdList.append = true

        // Set next sibling of last list element, as last sibling of whole list - it will be
        // used in append mode, to append items to DOM faster
        setListNextSibling(rvdList as RvdListNode, parent)

        for (let i = 0; i < dataArray.length; ++i) {
          const newItem = dataArray[i]
          const key = getKey<T>(newItem, keyBy)
          dataDictionary[key] = newItem

          const existingNode = rvdList.live[i]

          if (existingNode && existingNode.key === key) {
            existingNode.index = i
            keyedIndexes[key] = i
          } else {
            const oldIndex = keyedIndexes[key]

            if (!oldIndex && oldIndex !== 0) {
              const removedChild = keepRemoved && rvdList.removed[key]
              const child = removedChild || render(
                (fieldName?: keyof T) => keyedListItem<T>(key, fieldName, dataSubject),
                key
              )

              if (i >= rvdList.live.length) rvdList.append = true

              child.key = key
              if (removedChild) {
                renderRemovedListChild(i, child, rvdList, context, key, keepSubscribed)
              } else {
                renderRvdStaticChild(i, child, rvdList, context)
              }

              if (rvdList.append) rvdList.live[i] = child
              else rvdList.live.splice(i, 0, child)

              keyedIndexes[key] = i
            } else {
              if (existingNode) {
                reorderKeyedListItems<T>(
                  rvdList.live[oldIndex],
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

function renderRemovedListChild<T extends RvdListDataType = unknown>(
  index: number,
  child: RvdNode,
  rvdList: RvdListNode<T>,
  context: RvdContext,
  key: string | number,
  keepSubscribed: boolean
) {
  child.index = index
  if (isRvdDomNode(child)) {
    renderDomChild(child, rvdList)
  } else {
    renderRemovedGroupChildren(child)
  }
  if (!keepSubscribed) {
    context.$.hydrate = true
    renderRvdStaticChild(index, child, rvdList, context)
    context.$.hydrate = false
  }
  delete rvdList.removed[key]
}

function renderRemovedGroupChildren(group: RvdNode): void {
  for (const child of group.live) {
    if (isRvdDomNode(child)) {
      renderDomChild(child, group)
    } else {
      renderRemovedGroupChildren(child)
    }
  }
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
function renderRvdNonKeyedList<T extends RvdListDataType = unknown>(
  rvdList: RvdNonKeyedListNode<T>,
  parent: RvdNode,
  context: RvdContext
): void {
  removeExistingNode(rvdList.index, parent)

  initRvdGroupNode(rvdList, parent)

  rvdList.append = true // always append mode for non-keyed list
  rvdList.live = []

  const { data, keepRemoved } = rvdList.props

  if (keepRemoved) rvdList.removed = {}

  parent.sub.add(
    data.subscribe(
      observer((dataArray: T[]): void => {
        const newLength = dataArray.length,
          oldLength = rvdList.live.length

        setListNextSibling(rvdList as RvdListNode, parent)

        if (newLength > oldLength) {
          appendNonKeyedListChildren(newLength, oldLength, rvdList, context)
        } else if (newLength < oldLength) {
          removeNonKeyedListChildren<T>(newLength, oldLength, rvdList)
        }
      })
    )
  )
}

function appendNonKeyedListChildren<T extends RvdListDataType = unknown>(
  newLength: number,
  oldLength: number,
  rvdList: RvdNonKeyedListNode<T>,
  context: RvdContext
): void {
  const { render, data, keepRemoved, keepSubscribed } = rvdList.props
  rvdList.live.length = newLength
  for (let i = oldLength; i < newLength; ++i) {
    const removedChild = keepRemoved && rvdList.removed[i]
    const child = removedChild || render(
      (fieldName?: keyof T) => nonKeyedListItem<T>(i, fieldName, data),
      i
    )

    if (removedChild) {
      renderRemovedListChild(i, child as RvdNode, rvdList, context, i, keepSubscribed)
    } else {
      renderRvdStaticChild(i, child, rvdList, context)
    }
  }
}
