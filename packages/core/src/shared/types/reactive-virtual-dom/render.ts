import type {
  DOMAttributes,
  RvdChild,
  RvdComponentNode,
  RvdElementNode,
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

export type RenderElementChildrenFn = (
  rvdElement: RvdElementNode,
  element: Element,
  context: RvdContext
) => Subscription

export type RenderCallbackFactory = (
  childIndex: string,
  element: Element,
  createdChildrenMap: RvdChildrenManager,
  childrenSubscription?: Subscription,
  context?: RvdContext,
  isStatic?: boolean,
  createdFragment?: RvdCreatedFragment
) => (child?: RvdStaticChild) => void

export type FragmentRenderCallback = (
  childIndex: string,
  element: Element,
  createdChildrenMap: RvdChildrenManager,
  childrenSubscription: Subscription,
  context: RvdContext,
  isStatic: boolean,
  renderNewCallback: RenderNewChildCallbackFn,
  parentFragment?: RvdCreatedFragment
) => (child?: RvdStaticChild) => void

export type RenderChildFn = (
  element: Element,
  createdChildrenMap: RvdChildrenManager,
  childrenSubscription: Subscription,
  context: RvdContext,
  isStatic: boolean
) => (child: RvdChild, index: number) => void

export type RenderNewChildCallbackFn = (
  child: RvdChild,
  childIndex: string,
  context?: RvdContext,
  createdFragment?: RvdCreatedFragment
) => void

export type RenderElementCallback = (element: Element, subscription: Subscription) => void

/* ------------------------------------------------------------------------------------------------
 *
 * --------------------------------------------------------------------------------------------- */

export interface RvdCreatedNode {
  index: string
  element: Element | Text
  type?: RvdElementNodeType
  isText?: boolean
  key?: string | number
  subscription?: Subscription
}

export interface RvdCreatedFragment {
  index: string
  indexes: string[]
  key?: string | number
  keys?: Dictionary<string>
  oldKeys?: Dictionary<string>
  size: number
  append: boolean
  nextSibling?: Element | Text
}

export type RvdCreatedNodes = Dictionary<RvdCreatedNode>
export type RvdCreatedFragments = Dictionary<RvdCreatedFragment>

export interface RvdChildrenManager {
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
export type RvdDOMConnectableProp = Exclude<RvdElementProp, RvdChild[] | Observable<RvdChild[]>>
export type RvdDOMEventHandlerName = keyof Omit<
  DOMAttributes<Element>,
  'children' | 'dangerouslySetInnerHTML'
>

export type RvdElementProp = RvdDOMProp | RvdObservableDOMProp

export type RvdPropEntryCallback = (propName: RvdDOMPropName, propValue: RvdElementProp) => void

export type RvdStyleProp = CSSProperties | string | Observable<CSSProperties | string>
