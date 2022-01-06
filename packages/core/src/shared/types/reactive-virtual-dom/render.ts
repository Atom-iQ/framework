import type {
  RvdChild,
  RvdComponentNode,
  RvdDOMProp,
  RvdFragmentNode,
  RvdObservableDOMProp,
  RvdProps,
  RvdStaticChild,
  RvdElementNodeType,
  RvdContext,
  RvdDOMProps
} from './rv-dom'
import type { Dictionary } from '../common'
import type { CSSProperties, CombinedMiddlewares } from '..'
import type { Observable, Subscription } from 'rxjs'

export type ReactiveVirtualDOMRenderer = <P extends RvdProps = RvdProps>(
  middlewares?: CombinedMiddlewares,
  rvDomId?: string
) => InitReactiveVirtualDOM<P>

export type InitReactiveVirtualDOM<P extends RvdProps = RvdProps> = (
  rootNode: RvdStaticChild<P>,
  rootDOMElement: Element
) => Subscription

export type RvdComponentRenderer = (rvdComponent: RvdComponentNode) => void

export type RvdFragmentRenderer = (rvdFragment: RvdFragmentNode) => void

export type RenderChildFn = (
  element: Element,
  createdChildrenMap: __RvdChildrenManager,
  childrenSubscription: Subscription,
  context: RvdContext,
  isStatic: boolean
) => (child: RvdChild, index: number) => void

export type RenderNewChildCallbackFn = (
  child: RvdChild,
  childIndex: string,
  context?: RvdContext,
  createdFragment?: __RvdCreatedFragment
) => void

export type RenderElementCallback = (element: Element, subscription: Subscription) => void

/* ------------------------------------------------------------------------------------------------
 * Old Children Manager
 * --------------------------------------------------------------------------------------------- */

export interface __RvdCreatedNode {
  index: string
  element: Element | Text
  type?: RvdElementNodeType
  isText?: boolean
  key?: string | number
  subscription?: Subscription
}

export interface __RvdCreatedFragment {
  index: string
  indexes: string[]
  key?: string | number
  keys?: Dictionary<string>
  oldKeys?: Dictionary<string>
  size: number
  append: boolean
  nextSibling?: Element | Text
}

export type RvdCreatedNodes = Dictionary<__RvdCreatedNode>
export type RvdCreatedFragments = Dictionary<__RvdCreatedFragment>

export interface __RvdChildrenManager {
  size: number
  readonly children: RvdCreatedNodes
  readonly fragmentChildren: RvdCreatedFragments
  readonly removedNodes: RvdCreatedNodes
  readonly removedFragments: RvdCreatedFragments
  append: boolean
}

/*
 * CONNECT PROPS
 */
export type RvdDOMPropName = keyof RvdDOMProps
export type RvdDOMEventHandlerName = PickEventHandlerNames<RvdDOMPropName>

type PickEventHandlerNames<PropName extends string> = PropName extends `on${string}`
  ? PropName
  : never

export type RvdElementProp = RvdDOMProp | RvdObservableDOMProp

export type RvdStyleProp = CSSProperties | string | Observable<CSSProperties | string>
