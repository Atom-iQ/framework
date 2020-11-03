import type {
  DOMAttributes,
  HTMLAttributes,
  RvdChild,
  RvdComponentElement,
  RvdDOMElement,
  RvdDOMProp,
  RvdFragmentElement,
  RvdHTMLProps,
  RvdObservableDOMProp,
  RvdProps,
  RvdStaticChild,
  RvdSVGProps,
  RvdDOMElementType,
  RvdContext
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

export type RvdComponentRenderer = (rvdComponent: RvdComponentElement) => void

export type RvdFragmentRenderer = (rvdFragment: RvdFragmentElement) => void

export type RenderElementChildrenFn = (
  rvdElement: RvdDOMElement,
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
  createdFragment?: CreatedFragmentChild
) => (child?: RvdStaticChild) => void

export type FragmentRenderCallback = (
  childIndex: string,
  element: Element,
  createdChildrenMap: RvdChildrenManager,
  childrenSubscription: Subscription,
  context: RvdContext,
  isStatic: boolean,
  renderNewCallback: RenderNewChildCallbackFn
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
  context: RvdContext,
  createdFragment?: CreatedFragmentChild
) => void

/* ------------------------------------------------------------------------------------------------
 *
 * --------------------------------------------------------------------------------------------- */

export interface KeyedChild {
  index: string
  child: CreatedChild | CreatedFragmentChild
  fragmentChildren?: CreatedNodeChild[]
}

export interface CreatedChild {
  index: string
  element: Element | Text
  type?: RvdDOMElementType
  isText?: boolean
  key?: string | number
  subscription?: Subscription
  fragmentChildIndexes?: string[]
  fragmentChildKeys?: Dictionary<string>
  fragmentChildrenLength?: number
  oldKeyElementMap?: Dictionary<KeyedChild>
  isInFragmentAppendMode?: boolean
  nextSibling?: Element | Text
  fragmentAppend?: boolean
}

export interface CreatedFragmentChild extends CreatedChild {
  element: null
  fragmentChildIndexes: string[]
  fragmentChildKeys: Dictionary<string>
  fragmentChildrenLength: number
  oldKeyElementMap?: Dictionary<KeyedChild>
  isInFragmentAppendMode: boolean
  nextSibling?: Element | Text
  fragmentAppend?: boolean
}

export interface CreatedNodeChild extends CreatedChild {
  element: Element | Text
}

export type CreatedChildren = Dictionary<CreatedNodeChild>
export type CreatedFragmentChildren = Dictionary<CreatedFragmentChild>

export interface RvdChildrenManager {
  childrenLength: number
  readonly children: CreatedChildren
  readonly fragmentChildren: CreatedFragmentChildren
  isInAppendMode: boolean
}

/*
 * CONNECT PROPS
 */

export type DOMElementProps =
  | RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
  | RvdSVGProps<SVGElement>
export type DOMElementPropName = keyof DOMElementProps
export type DOMElementConnectableProp = Exclude<RvdElementProp, RvdChild[] | Observable<RvdChild[]>>
export type DOMEventHandlerPropName = keyof Omit<
  DOMAttributes<Element>,
  'children' | 'dangerouslySetInnerHTML'
>

export type RvdElementProp = RvdDOMProp | RvdObservableDOMProp

export type PropEntryCallback = (propName: DOMElementPropName, propValue: RvdElementProp) => void

export type ConnectPropCallback<T extends DOMElementConnectableProp = DOMElementConnectableProp> = (
  propName: DOMElementPropName,
  propValue: T
) => void

export type RvdStyleProp = CSSProperties | string | Observable<CSSProperties | string>
