import {
  asyncScheduler,
  keyedListItem,
  nonKeyedListItem,
  Subject,
  SubscriptionGroup,
  isObservable,
  observer,
  Subscription
} from '@atom-iq/rx'

import type {
  RvdChild,
  RvdComponentNode,
  RvdContext,
  RvdElementNode,
  RvdFragmentNode,
  RvdGroupNode,
  RvdKeyedListNode,
  RvdListNode,
  RvdNode,
  RvdNonKeyedListNode,
  RvdParent,
  RvdStaticChild
} from 'types'

import { isArray, isBoolean, isNullOrUndef, isStringOrNumber } from 'shared'
import { RvdListType, RvdNodeFlags } from 'shared/flags'
import { applyComponentMiddlewares, applyMiddlewares } from 'middlewares/middlewares-manager'

import { textRenderCallback } from './render-callback/text'
import { nullRenderCallback } from './render-callback/null'
import { elementRenderCallback } from './render-callback/element'
import { connectElementProps } from './connect-props/connect-props'
import { setClassName } from './dom-renderer'
import {
  moveOrRemoveElement,
  moveOrRemoveGroup,
  removeExcessiveChildren,
  switchElement,
  switchToElement,
  switchToGroup
} from './keyed-list/move-node'
import {
  childrenArrayToFragment,
  createDomElement,
  initRvdGroupNode,
  isRvdNode,
  removeExistingGroup,
  removeExistingNode,
  setListNextSibling,
  unsubscribeAsync
} from './utils'

/**
 * Render Rvd Element
 *
 * Create, connect and render new DOM element
 * @param rvdElement
 * @param parent
 * @param context
 */
function renderRvdElement(
  rvdElement: RvdElementNode,
  parent: RvdParent,
  context: RvdContext
): void {
  // 1. Create element
  const isSvg = rvdElement.flag === RvdNodeFlags.SvgElement
  rvdElement.dom = createDomElement(rvdElement.type, isSvg)
  rvdElement.sub = new SubscriptionGroup()
  rvdElement = applyMiddlewares('elementPreConnect', context, rvdElement)
  const { className, children, dom, sub } = rvdElement

  // 2. Add css class to element
  if (isObservable(className)) {
    rvdElement.className = ''
    sub.add(
      className.subscribe(
        observer(
          c =>
            (c || '') !== rvdElement.className &&
            setClassName(isSvg, dom, (rvdElement.className = c || ''))
        )
      )
    )
  } else if (className) {
    setClassName(isSvg, dom, className)
  }

  // 3. Render children
  if (!isNullOrUndef(children)) {
    rvdElement.children = []
    if (isArray(children)) {
      for (let i = 0; i < (children as RvdChild[]).length; ++i) {
        renderRvdChild(children[i], i, rvdElement as RvdParent, context)
      }
    } else if (isObservable(children)) {
      let prev: RvdStaticChild
      sub.add(
        children.subscribe(
          observer(v => {
            if (v != prev) {
              if (isStringOrNumber(v) && !rvdElement.children[0]) {
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
    } else if (isStringOrNumber(children)) {
      // if Element has single, static text child, it shouldn't use createdChildren abstraction
      dom.textContent = children + ''
    } else {
      renderRvdStaticChild(children, 0, rvdElement as RvdParent, context)
    }
  }

  elementRenderCallback(rvdElement, parent)

  if (rvdElement.props) {
    connectElementProps(rvdElement, context)
  }
}

/**
 * Render Rvd Child
 *
 * If child is Observable, subscribe to it with ChildObserver.
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

/**
 * Render Rvd Static Child
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
      return renderRvdElement(child as RvdElementNode, parent, context)
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
        return renderRvdKeyedList(child as RvdKeyedListNode<unknown>, parent, context)
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
    return textRenderCallback(child, index, parent, context)
  }
  // Child is null, undefined or boolean
  if (isNullOrUndef(child) || isBoolean(child)) {
    return nullRenderCallback(index, parent)
  }
  // Child is wrong type
  throw Error('Wrong Child type')
}

/* -------------------------------------------------------------------------------------------
 *  Component renderer
 * ------------------------------------------------------------------------------------------- */

/**
 * Render Rvd Component and attach returned child(ren) to parent element
 * @param rvdComponent
 * @param parent
 * @param context
 */
export function renderRvdComponent(
  rvdComponent: RvdComponentNode,
  parent: RvdParent,
  context: RvdContext
): void {
  removeExistingNode(rvdComponent.index, parent)

  initRvdGroupNode(rvdComponent, parent)

  const middlewareResult = applyComponentMiddlewares(context, rvdComponent)

  const componentChild = rvdComponent.type(rvdComponent.props, middlewareResult.props)

  renderRvdChild(componentChild, 0, rvdComponent as RvdParent, middlewareResult.context)
}

/**
 * Reactive Virtual DOM Fragment Renderer
 *
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

  for (let i = 0; i < children.length; ++i) {
    renderRvdChild(children[i], i, rvdFragment as RvdParent, context)
  }
}

export function renderRvdKeyedList<T extends Object | string | number = never>(
  rvdList: RvdKeyedListNode<T>,
  parent: RvdParent,
  context: RvdContext
): void {
  removeExistingNode(rvdList.index, parent)

  initRvdGroupNode(rvdList, parent)

  const keyedIndexes: Record<string | number, number> = {}
  const dataSubject = new Subject<Record<string | number, T>>()

  const { data, render, keyBy } = rvdList.props

  parent.sub.add(
    data.subscribe(
      observer((dataArray: T[]): void => {
        const dataDictionary: Record<string | number, T> = {}
        const toUnsubscribe: Subscription[] = []

        if (rvdList.children.length === 0) rvdList.append = true

        setListNextSibling(rvdList as RvdListNode, parent)

        for (let i = 0; i < dataArray.length; ++i) {
          const newItem = dataArray[i]
          const key = newItem[keyBy as string] as string | number
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
              rvdList.children.splice(i, 0, child)
              keyedIndexes[key] = i
            } else {
              const child = rvdList.children[oldIndex]
              if (existingNode) {
                if (RvdNodeFlags.DomNode & (child as RvdNode).flag) {
                  if (RvdNodeFlags.DomNode & (existingNode as RvdNode).flag) {
                    switchElement<T>(
                      existingNode as RvdElementNode,
                      child as RvdElementNode,
                      rvdList,
                      i
                    )
                    keyedIndexes[key] = i

                    moveOrRemoveElement<T>(
                      existingNode as RvdElementNode,
                      rvdList,
                      dataArray,
                      keyBy as string,
                      keyedIndexes,
                      toUnsubscribe,
                      i,
                      true
                    )
                  } else {
                    switchToElement<T>(child as RvdElementNode, rvdList, i)
                    keyedIndexes[key] = i

                    moveOrRemoveGroup<T>(
                      existingNode as RvdListNode,
                      rvdList,
                      dataArray,
                      keyBy as string,
                      keyedIndexes,
                      toUnsubscribe,
                      i
                    )
                  }
                } else {
                  if (RvdNodeFlags.DomNode & (existingNode as RvdNode).flag) {
                    switchToGroup<T>(child as RvdListNode, rvdList, i)
                    keyedIndexes[key] = i

                    moveOrRemoveElement<T>(
                      existingNode as RvdElementNode,
                      rvdList,
                      dataArray,
                      keyBy as string,
                      keyedIndexes,
                      toUnsubscribe,
                      i
                    )
                  } else {
                    switchToGroup<T>(child as RvdListNode, rvdList, i)
                    keyedIndexes[key] = i

                    moveOrRemoveGroup<T>(
                      existingNode as RvdListNode,
                      rvdList,
                      dataArray,
                      keyBy as string,
                      keyedIndexes,
                      toUnsubscribe,
                      i
                    )
                  }
                }
              }
            }
          }
        }
        rvdList.append = false

        removeExcessiveChildren(rvdList, dataArray, keyedIndexes, toUnsubscribe)

        asyncScheduler.schedule(unsubscribeAsync, 0, toUnsubscribe)
        dataSubject.next(dataDictionary)
      })
    )
  )
}

export function renderRvdNonKeyedList<T extends Object | string | number = never>(
  rvdList: RvdNonKeyedListNode<T>,
  parent: RvdParent,
  context: RvdContext
): void {
  removeExistingNode(rvdList.index, parent)

  initRvdGroupNode(rvdList, parent)

  const { data, render } = rvdList.props

  rvdList.append = true // always append mode for non-keyed list

  parent.sub.add(
    data.subscribe(
      observer((dataArray: T[]): void => {
        const newLength = dataArray.length,
          oldLength = rvdList.children.length

        setListNextSibling(rvdList as RvdListNode, parent)

        if (newLength > oldLength) {
          for (let i = oldLength; i < newLength; ++i) {
            renderRvdStaticChild(
              render((fieldName?: keyof T) => nonKeyedListItem<T>(i, fieldName, data), i),
              i,
              rvdList,
              context
            )
          }
        } else if (newLength < oldLength) {
          const toUnsubscribe: Subscription[] = []
          for (let i = newLength; i < oldLength; ++i) {
            const existingNode = rvdList.children[i]
            if (existingNode) {
              if (RvdNodeFlags.DomNode & existingNode.flag) {
                rvdList.dom.removeChild(existingNode.dom)
                rvdList.children[i] = undefined
              } else {
                // remove created component
                removeExistingGroup(existingNode as RvdParent<RvdGroupNode>, rvdList)
              }
              toUnsubscribe.push(existingNode.sub)
            }
          }
          rvdList.children.length = newLength
          asyncScheduler.schedule(unsubscribeAsync, 0, toUnsubscribe)
        }
      })
    )
  )
}
