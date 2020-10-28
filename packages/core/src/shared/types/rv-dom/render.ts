import type {
  DOMAttributes,
  HTMLAttributes,
  RvdChild,
  RvdComponentElement,
  RvdDOMElement,
  RvdDOMProp,
  RvdFragmentElement,
  RvdFragmentElementType,
  RvdHTMLProps,
  RvdConnectedNode,
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

export type CreateRvDomFn<P extends RvdProps = RvdProps> = (
  middlewares?: CombinedMiddlewares
) => (rootNode: RvdChild<P>, rootDOMElement: Element) => Subscription

export interface RvdRenderer {
  renderRvdComponent: RvdComponentRenderer
  renderRvdFragment: RvdFragmentRenderer
  renderRvdElement: RvdElementRenderer
}

export type RvdComponentRenderer = (rvdComponent: RvdComponentElement) => void

export type RvdElementRenderer = (rvdElement: RvdDOMElement) => RvdConnectedNode

export type RvdFragmentRenderer = (rvdFragment: RvdFragmentElement) => void

export type RenderElementChildrenFn = (
  rvdElement: RvdDOMElement,
  element: Element,
  context: RvdContext
) => Subscription

export type RenderCallback = (
  childIndex: string,
  element: Element,
  createdChildrenMap: CreatedChildrenManager,
  childrenSubscription?: Subscription,
  context?: RvdContext,
  isStatic?: boolean
) => (child?: RvdStaticChild) => void

export type FragmentRenderCallback = (
  childIndex: string,
  element: Element,
  createdChildrenMap: CreatedChildrenManager,
  childrenSubscription: Subscription,
  context: RvdContext,
  isStatic: boolean,
  renderNewCallback: RenderNewChildCallbackFn
) => (child?: RvdStaticChild) => void

export type RenderChildFn = (
  element: Element,
  createdChildrenMap: CreatedChildrenManager,
  childrenSubscription: Subscription,
  context: RvdContext,
  isStatic: boolean
) => (child: RvdChild, index: number) => void

export type RenderNewChildCallbackFn = (
  child: RvdChild,
  childIndex: string,
  context: RvdContext
) => void

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
}

export interface CreatedFragmentChild extends CreatedChild {
  element: null
  fragmentChildIndexes: string[]
  fragmentChildKeys: Dictionary<string>
  fragmentChildrenLength: number
  oldKeyElementMap?: Dictionary<KeyedChild>
}

export interface CreatedNodeChild extends CreatedChild {
  element: Element | Text
}

export type CreatedChildren = Dictionary<CreatedNodeChild>
export type CreatedFragmentChildren = Dictionary<CreatedFragmentChild>

export interface CreatedChildrenManager {
  childrenLength: number
  readonly children: CreatedChildren
  readonly fragmentChildren: CreatedFragmentChildren
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
