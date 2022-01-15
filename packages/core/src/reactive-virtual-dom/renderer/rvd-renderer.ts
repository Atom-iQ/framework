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
  RvdKeyedListNode,
  RvdListNode,
  RvdNode,
  RvdNonKeyedListNode,
  RvdStaticChild
} from 'types'

import { isArray, isBoolean, isNullOrUndef, isStringOrNumber } from 'shared'
import { RvdChildFlags, RvdListType, RvdNodeFlags } from 'shared/flags'
import { applyComponentMiddlewares, applyMiddlewares } from 'middlewares/middlewares-manager'

import { textRenderCallback } from './render-callback/text'
import { nullRenderCallback } from './render-callback/null'
import { elementRenderCallback } from './render-callback/element'
import { connectElementProps } from './connect-props/connect-props'
import { setHtmlClassName, setSvgClassName } from './dom-renderer'
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
  initRvdNode,
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
 * @param parentRvdNode
 * @param context
 */
function renderRvdElement(
  rvdElement: RvdElementNode,
  parentRvdNode: RvdNode,
  context: RvdContext
): void {
  // 1. Create element
  const isSvg = rvdElement.flag === RvdNodeFlags.SvgElement
  rvdElement.dom = createDomElement(rvdElement.type, isSvg)
  rvdElement.sub = new SubscriptionGroup()
  rvdElement = applyMiddlewares('elementPreConnect', context, rvdElement)
  const { className, childFlags, children, dom, sub } = rvdElement

  // 2. Add css class to element
  if (isObservable(className)) {
    let prev = ''
    sub.add(
      className.subscribe(
        observer(
          isSvg
            ? c => (c || '') !== prev && setSvgClassName(dom as SVGElement, (prev = c || ''))
            : c => (c || '') !== prev && setHtmlClassName(dom as HTMLElement, (prev = c || ''))
        )
      )
    )
  } else if (className) {
    isSvg
      ? setSvgClassName(dom as SVGElement, className)
      : setHtmlClassName(dom as HTMLElement, className)
  }

  // 3. Render children
  if (childFlags) {
    rvdElement.rvd = []
    if (childFlags & RvdChildFlags.HasSingleChild) {
      if (isStringOrNumber(children)) {
        // if Element has single, static text child, it shouldn't use createdChildren abstraction
        dom.textContent = children + ''
      } else if (isObservable(children)) {
        let prev: RvdStaticChild
        sub.add(
          children.subscribe(
            observer(v => {
              if (v != prev) {
                if (isStringOrNumber(v) && !rvdElement.rvd[0]) {
                  if (rvdElement.dom.firstChild) {
                    rvdElement.dom.firstChild.nodeValue = (prev = v) + ''
                  } else {
                    rvdElement.dom.textContent = (prev = v) + ''
                  }
                } else {
                  renderRvdStaticChild((prev = v), 0, rvdElement, context)
                }
              }
            })
          )
        )
      } else {
        renderRvdStaticChild(children, 0, rvdElement, context)
      }
    } else {
      for (let i = 0; i < (children as RvdChild[]).length; ++i) {
        renderRvdChild(children[i], i, rvdElement, context)
      }
    }
  }

  elementRenderCallback(rvdElement, parentRvdNode)

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
 * @param parentRvdNode
 * @param context
 */
function renderRvdChild(
  child: RvdChild,
  index: number,
  parentRvdNode: RvdNode,
  context: RvdContext
) {
  if (isObservable(child)) {
    let prev: RvdStaticChild = undefined
    parentRvdNode.sub.add(
      child.subscribe(
        observer(c => c != prev && renderRvdStaticChild((prev = c), index, parentRvdNode, context))
      )
    )
  } else renderRvdStaticChild(child, index, parentRvdNode, context)
}

/**
 * Render Rvd Static Child
 * @param child
 * @param index
 * @param parentRvdNode
 * @param context
 */
export function renderRvdStaticChild(
  child: RvdStaticChild,
  index: number,
  parentRvdNode: RvdNode,
  context: RvdContext
): void {
  // Check child node type and call proper render function
  if (isRvdNode(child)) {
    child.index = index
    // Child is element node
    if (RvdNodeFlags.Element & child.flag) {
      return renderRvdElement(child as RvdElementNode, parentRvdNode, context)
    }
    // Child is fragment node
    if (RvdNodeFlags.AnyFragment & child.flag) {
      return renderRvdFragment(child as RvdFragmentNode, parentRvdNode, context)
    }
    // Child is component node
    if (child.flag === RvdNodeFlags.Component) {
      return renderRvdComponent(child as RvdComponentNode, parentRvdNode, context)
    }
    // Child is list node
    if (child.flag === RvdNodeFlags.List) {
      if (child.type === RvdListType.NonKeyed) {
        return renderRvdNonKeyedList(child as RvdNonKeyedListNode<unknown>, parentRvdNode, context)
      }
      if (child.type === RvdListType.Keyed) {
        return renderRvdKeyedList(child as RvdKeyedListNode<unknown>, parentRvdNode, context)
      }
    }
    // Child is not recognized node
    throw Error('RvdNode has unknown type')
  }
  // Child is array
  if (isArray(child)) {
    return renderRvdFragment(
      childrenArrayToFragment(child, index), // convert array to fragment node
      parentRvdNode,
      context
    )
  }
  // Child is string or number
  if (isStringOrNumber(child)) {
    return textRenderCallback(child, index, parentRvdNode, context)
  }
  // Child is null, undefined or boolean
  if (isNullOrUndef(child) || isBoolean(child)) {
    return nullRenderCallback(index, parentRvdNode)
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
 * @param parentRvdNode
 * @param context
 */
export function renderRvdComponent(
  rvdComponent: RvdComponentNode,
  parentRvdNode: RvdNode,
  context: RvdContext
): void {
  if (parentRvdNode.type !== RvdListType.Keyed) {
    removeExistingNode(parentRvdNode.rvd[rvdComponent.index], parentRvdNode)
  }

  initRvdNode(rvdComponent, parentRvdNode)

  const middlewareResult = applyComponentMiddlewares(context, rvdComponent)

  const componentChild = rvdComponent.type(rvdComponent.props, middlewareResult.props)

  renderRvdChild(componentChild, 0, rvdComponent, middlewareResult.context)
}

/**
 * Reactive Virtual DOM Fragment Renderer
 *
 * Called for Fragments and arrays (transformed internally to RvdFragmentElement), creates
 * Fragment Rendering Context, inside parent's Element Rendering Context.
 * Managing Fragment/Array children position - re-creating all children on re-call for non
 * keyed Fragments or skip rendering/move/remove/create for keyed Fragments
 *
 * @param rvdFragment
 * @param parentRvdNode
 * @param context
 */
export function renderRvdFragment(
  rvdFragment: RvdFragmentNode,
  parentRvdNode: RvdNode,
  context: RvdContext
): void {
  if (parentRvdNode.type !== RvdListType.Keyed) {
    removeExistingNode(parentRvdNode.rvd[rvdFragment.index], parentRvdNode)
  }

  initRvdNode(rvdFragment, parentRvdNode)

  for (let i = 0; i < rvdFragment.children.length; ++i) {
    renderRvdChild(rvdFragment.children[i], i, rvdFragment, context)
  }
}

export function renderRvdKeyedList<T extends Object | string | number = never>(
  rvdList: RvdKeyedListNode<T>,
  parentRvdNode: RvdNode,
  context: RvdContext
): void {
  if (parentRvdNode.type !== RvdListType.Keyed) {
    removeExistingNode(parentRvdNode.rvd[rvdList.index], parentRvdNode)
  }

  initRvdNode(rvdList, parentRvdNode)

  const keyedIndexes: Record<string | number, number> = {}
  const dataSubject = new Subject<Record<string | number, T>>()

  const { data, render, keyBy } = rvdList.props

  parentRvdNode.sub.add(
    data.subscribe(
      observer((dataArray: T[]): void => {
        const dataDictionary: Record<string | number, T> = {}
        const toUnsubscribe: Subscription[] = []

        if (rvdList.rvd.length === 0) rvdList.append = true

        setListNextSibling(rvdList as RvdListNode, parentRvdNode)

        for (let i = 0; i < dataArray.length; ++i) {
          const newItem = dataArray[i]
          const key = newItem[keyBy as string] as string | number
          dataDictionary[key] = newItem

          const existingNode = rvdList.rvd[i]

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

              if (i >= rvdList.rvd.length) rvdList.append = true

              child.key = key
              renderRvdStaticChild(child, i, rvdList, context)
              rvdList.rvd.splice(i, 0, child)
              keyedIndexes[key] = i
            } else {
              const child = rvdList.rvd[oldIndex]
              if (existingNode) {
                if (RvdNodeFlags.ElementOrText & (child as RvdNode).flag) {
                  if (RvdNodeFlags.ElementOrText & (existingNode as RvdNode).flag) {
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
                  if (RvdNodeFlags.ElementOrText & (existingNode as RvdNode).flag) {
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
  parentRvdNode: RvdNode,
  context: RvdContext
): void {
  if (parentRvdNode.type !== RvdListType.Keyed) {
    removeExistingNode(parentRvdNode.rvd[rvdList.index], parentRvdNode)
  }

  initRvdNode(rvdList, parentRvdNode)

  const { data, render } = rvdList.props

  rvdList.append = true // always append mode for non-keyed list

  parentRvdNode.sub.add(
    data.subscribe(
      observer((dataArray: T[]): void => {
        const newLength = dataArray.length,
          oldLength = rvdList.rvd.length

        setListNextSibling(rvdList as RvdListNode, parentRvdNode)

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
            const existingNode = rvdList.rvd[i]
            if (existingNode) {
              if (RvdNodeFlags.ElementOrText & existingNode.flag) {
                rvdList.dom.removeChild(existingNode.dom)
                rvdList.rvd[i] = undefined
              } else {
                // remove created component
                removeExistingGroup(existingNode as RvdComponentNode, rvdList)
              }
              toUnsubscribe.push(existingNode.sub)
            }
          }
          rvdList.rvd.length = newLength
          asyncScheduler.schedule(unsubscribeAsync, 0, toUnsubscribe)
        }
      })
    )
  )
}
