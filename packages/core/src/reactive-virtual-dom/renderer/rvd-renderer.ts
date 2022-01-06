import {
  asyncScheduler,
  keyedListItem,
  keyedListItemField,
  listItem,
  listItemField,
  Observable,
  SchedulerLike,
  Subject,
  Subscription
} from 'rxjs'
import {
  childrenArrayToFragment,
  createDomElement,
  initRvdNode,
  isObservable,
  isRvdNode,
  removeExistingGroup,
  removeExistingNode,
  unsubscribeAsync
} from './utils'

import type {
  Dictionary,
  RvdChild,
  RvdComponentNode,
  RvdContext,
  RvdElementNode,
  RvdFragmentNode,
  RvdKeyedListNode,
  RvdListNode,
  RvdNode,
  RvdNonKeyedListNode,
  RvdObservableChild,
  RvdStaticChild
} from 'types'

import { isArray, isBoolean, isNullOrUndef, isStringOrNumber } from 'shared'
import { RvdChildFlags, RvdListType, RvdNodeFlags } from 'shared/flags'
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

/**
 * Render Rvd DOM Element and return it with subscription to parent
 * @param rvdElement
 * @param parentRvdNode
 * @param context
 */
function renderRvdElement(
  rvdElement: RvdElementNode,
  parentRvdNode: RvdNode,
  context: RvdContext
): void {
  rvdElement = applyMiddlewares('elementPreRender', context, rvdElement, parentRvdNode)
  // 1. Create element
  const isSvg = rvdElement.flag === RvdNodeFlags.SvgElement
  rvdElement.dom = createDomElement(rvdElement.type, isSvg)
  rvdElement.sub = new Subscription()
  rvdElement = applyMiddlewares('elementPreConnect', context, rvdElement)
  const { className, childFlags, children } = rvdElement

  // 2. Add css class to element
  if (isObservable(className)) {
    rvdElement.className = ''
    rvdElement.sub.add(
      className.subscribe((className: string): void => {
        if ((className || '') != rvdElement.className) {
          setClassName(isSvg, rvdElement.dom, (rvdElement.className = className || ''))
        }
      })
    )
  } else if (className) {
    setClassName(isSvg, rvdElement.dom, className)
  }

  // 3. Render children
  if (childFlags) {
    rvdElement.rvd = []
    if (childFlags & RvdChildFlags.HasSingleChild) {
      if (isStringOrNumber(children)) {
        // if Element has single, static text child, it shouldn't use createdChildren abstraction
        rvdElement.dom.textContent = children + ''
      } else if (isObservable(children)) {
        let previousValue: RvdStaticChild
        rvdElement.sub.add(
          children.subscribe(value => {
            if (value != previousValue) {
              if (isStringOrNumber(value) && !rvdElement.rvd[0]) {
                if (rvdElement.dom.firstChild) {
                  rvdElement.dom.firstChild.nodeValue = (previousValue = value) + ''
                } else {
                  rvdElement.dom.textContent = (previousValue = value) + ''
                }
              } else {
                renderRvdStaticChild((previousValue = value), 0, rvdElement, context)
              }
            }
          })
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
 * Closure with child element rendering function. Taking common params
 * for all children and returning function for single child rendering.
 * @param child
 * @param childIndex
 * @param parentRvdNode
 * @param context
 * @returns Child rendering function, that is checking if child
 * is Observable. If yes, subscribing to it, calling static
 * child rendering function for every new emitted value and adding
 * subscription to childrenSubscription. If no, calling static
 * child rendering function just once
 */
function renderRvdChild(
  child: RvdChild,
  childIndex: number,
  parentRvdNode: RvdNode,
  context: RvdContext
) {
  if (isObservable(child)) renderRvdObservableChild(child, childIndex, parentRvdNode, context)
  else renderRvdStaticChild(child, childIndex, parentRvdNode, context)
}

export function renderRvdObservableChild(
  child: RvdObservableChild,
  childIndex: number,
  parentRvdElement: RvdNode,
  context: RvdContext
): void {
  let lastChildValue: RvdStaticChild
  parentRvdElement.sub.add(
    child.subscribe(value => {
      if (value != lastChildValue) {
        renderRvdStaticChild((lastChildValue = value), childIndex, parentRvdElement, context)
      }
    })
  )
}
/* -------------------------------------------------------------------------------------------
 *  Element Children Rendering functions
 * ------------------------------------------------------------------------------------------- */
/**
 * @params ...args - DOM Element, string child index, children map and children subscription
 * @returns Static child rendering function that is checking static child type and calling
 * specific callback for given child type
 */
export function renderRvdStaticChild(
  child: RvdStaticChild,
  childIndex: number,
  parentRvdNode: RvdNode,
  context: RvdContext
): void {
  // Check child node type and call proper render function
  if (isRvdNode(child)) {
    child.index = childIndex
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
      childrenArrayToFragment(child, childIndex), // convert array to fragment node
      parentRvdNode,
      context
    )
  }
  // Child is string or number
  if (isStringOrNumber(child)) {
    return textRenderCallback(child, childIndex, parentRvdNode, context)
  }
  // Child is null, undefined or boolean
  if (isNullOrUndef(child) || isBoolean(child)) {
    return nullRenderCallback(childIndex, parentRvdNode)
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

export function renderRvdNonKeyedList(
  rvdList: RvdNonKeyedListNode<Object>,
  parentRvdNode: RvdNode,
  context: RvdContext
): void {
  if (parentRvdNode.type !== RvdListType.Keyed) {
    removeExistingNode(parentRvdNode.rvd[rvdList.index], parentRvdNode)
  }

  initRvdNode(rvdList, parentRvdNode)

  const { data, render } = rvdList.props

  parentRvdNode.sub.add(
    data.subscribe(dataArray => {
      const newLength = dataArray.length,
        oldLength = rvdList.rvd.length
      if (newLength > oldLength) {
        for (let i = oldLength; i < newLength; ++i) {
          renderRvdChild(
            render(
              <T>(fieldName?: keyof T) =>
                (fieldName ? listItemField<T>(i, fieldName) : listItem<T>(i))(
                  data as Observable<T[]>
                ),
              i
            ),
            i,
            rvdList,
            context
          )
        }
      } else if (newLength < oldLength) {
        const toUnsubscribe: Subscription[] = []
        for (
          let i = newLength, existingNode = rvdList.rvd[i];
          i < oldLength;
          existingNode = rvdList.rvd[++i]
        ) {
          if (existingNode) {
            if (RvdNodeFlags.ElementOrText & existingNode.flag) {
              parentRvdNode.dom.removeChild(existingNode.dom)
              rvdList.rvd[i] = undefined
            } else {
              // remove created component
              removeExistingGroup(existingNode as RvdComponentNode, parentRvdNode)
            }
            toUnsubscribe.push(existingNode.sub)
          }
        }
        rvdList.rvd.length = newLength
        const scheduler = asyncScheduler as unknown as SchedulerLike
        scheduler.schedule(unsubscribeAsync, 0, toUnsubscribe)
      }
    })
  )
}

export function renderRvdKeyedList(
  rvdList: RvdKeyedListNode<Object>,
  parentRvdNode: RvdNode,
  context: RvdContext
): void {
  if (parentRvdNode.type !== RvdListType.Keyed) {
    removeExistingNode(parentRvdNode.rvd[rvdList.index], parentRvdNode)
  }

  initRvdNode(rvdList, parentRvdNode)

  const dataDictionarySubject = new Subject<Dictionary<Object>>()

  const { data, render, keyBy } = rvdList.props

  const keyedIndexes: Record<string | number, number> = {}

  parentRvdNode.sub.add(
    data.subscribe(dataArray => {
      const dataDictionary = {}
      const toUnsubscribe: Subscription[] = []
      for (let i = 0; i < dataArray.length; ++i) {
        const newItem = dataArray[i]
        const key = newItem[keyBy]
        dataDictionary[key] = newItem

        const existingNode = rvdList.rvd[i]

        if (existingNode && existingNode.key === key) {
          existingNode.index = i
          keyedIndexes[key] = i
        } else {
          const oldIndex = keyedIndexes[key]

          if (!oldIndex && oldIndex !== 0) {
            const child = render(
              <T>(fieldName?: keyof T) =>
                (fieldName ? keyedListItemField<T>(key, fieldName) : keyedListItem<T>(key))(
                  dataDictionarySubject as unknown as Observable<Record<string, T>>
                ),
              key
            ) as RvdNode

            child.key = key
            renderRvdStaticChild(child as RvdStaticChild, i, rvdList, context)
            rvdList.rvd.splice(i, 0, child as RvdNode)
            keyedIndexes[key] = i
          } else {
            const child = rvdList.rvd[oldIndex]
            if (existingNode) {
              if (RvdNodeFlags.ElementOrText & (child as RvdNode).flag) {
                if (RvdNodeFlags.ElementOrText & (existingNode as RvdNode).flag) {
                  switchElement(existingNode as RvdElementNode, child as RvdElementNode, rvdList, i)
                  keyedIndexes[key] = i

                  moveOrRemoveElement(
                    existingNode as RvdElementNode,
                    rvdList,
                    dataArray,
                    keyBy,
                    keyedIndexes,
                    toUnsubscribe,
                    i,
                    true
                  )
                } else {
                  switchToElement(child as RvdElementNode, rvdList, i)
                  keyedIndexes[key] = i

                  moveOrRemoveGroup(
                    existingNode as RvdListNode<unknown>,
                    rvdList,
                    dataArray,
                    keyBy,
                    keyedIndexes,
                    toUnsubscribe,
                    i
                  )
                }
              } else {
                if (RvdNodeFlags.ElementOrText & (existingNode as RvdNode).flag) {
                  switchToGroup(child as RvdListNode<unknown>, rvdList, i)
                  keyedIndexes[key] = i

                  moveOrRemoveElement(
                    existingNode as RvdElementNode,
                    rvdList,
                    dataArray,
                    keyBy,
                    keyedIndexes,
                    toUnsubscribe,
                    i
                  )
                } else {
                  switchToGroup(child as RvdListNode<unknown>, rvdList, i)
                  keyedIndexes[key] = i

                  moveOrRemoveGroup(
                    existingNode as RvdListNode<unknown>,
                    rvdList,
                    dataArray,
                    keyBy,
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

      removeExcessiveChildren(rvdList, dataArray, keyedIndexes, toUnsubscribe)

      const scheduler = asyncScheduler as unknown as SchedulerLike
      scheduler.schedule(unsubscribeAsync, 0, toUnsubscribe)
      dataDictionarySubject.next(dataDictionary)
    })
  )
}
