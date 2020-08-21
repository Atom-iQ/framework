import {
  DOMAttributes,
  HTMLAttributes,
  RvdChild,
  RvdComponentElement,
  RvdDOMElement,
  RvdDOMProp,
  RvdElement,
  RvdFragmentElement,
  RvdHTMLProps,
  RvdNode,
  RvdObservableDOMProp,
  RvdProps,
  RvdStaticChild,
  RvdSVGProps
} from './rv-dom'
import { RxO, RxSub } from '../rxjs'
import { CustomMap, Dictionary } from '../common'
import { CSSProperties } from '../dom/css'

export interface CreateRvDomFnConfig {
  querySelector?: string
  element?: Element
}

export type CreateRvDomFn<P extends RvdProps = RvdProps> = (
  rootNode: RvdChild<P>,
  config: CreateRvDomFnConfig
) => RxSub

export interface RvdRenderer {
  renderRvdComponent: RvdComponentRenderer
  renderRvdFragment: RvdFragmentRenderer
  renderRvdElement: RvdElementRenderer
}

export type RvdComponentRenderer = (rvdComponent: RvdComponentElement) => void

export type RvdElementRenderer = (rvdElement: RvdDOMElement) => RvdNode

export type RvdFragmentRenderer = (rvdFragment: RvdFragmentElement) => void

export type RenderElementChildrenFn = (children: RvdChild[], element: Element) => RxSub;

export type RenderCallback = (
  childIndex: string,
  element: Element,
  createdChildrenMap: CreatedChildrenManager,
  childrenSubscription: RxSub
) => (child?: RvdStaticChild) => void;

export type RenderStaticChildFn = (
  childIndex: string,
  element: Element,
  createdChildrenMap: CreatedChildrenManager,
  childrenSubscription: RxSub
) => (child: RvdStaticChild) => void;

export type RenderChildFn = (
  element: Element,
  createdChildrenMap: CreatedChildrenManager,
  childrenSubscription: RxSub
) => (child: RvdChild, index: number) => void;

export type RenderNewChildCallbackFn = (child: RvdChild, childIndex: string) => void

export interface KeyedChild {
  index: string
  child: CreatedChild | CreatedFragmentChild,
  fragmentChildren?: CreatedNodeChild[]
}

export interface CreatedChild {
  index: string
  element: Element | Text | '_Fragment'
  key?: string | number
  subscription?: RxSub
  fromFragment?: boolean
  fragmentChildIndexes?: string[]
  fragmentChildKeys?: Dictionary<string>
  fragmentChildrenLength?: number
  oldKeyElementMap?: Dictionary<KeyedChild>
}

export interface CreatedFragmentChild extends CreatedChild {
  element: '_Fragment'
  subscription?: RxSub
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

export interface CreatedChildPositionInfo {
  indexInArray: number
  allSortedIndexes: string[]
  isFirst: boolean
  isLast: boolean
  previousSibling: CreatedNodeChild
  nextSibling: CreatedNodeChild
  firstChild: CreatedNodeChild
}

export interface CreatedChildrenManager extends CustomMap<CreatedNodeChild> {
  hasOneChild: () => boolean
  getFirstIndex: () => string
  getFirstChild: () => CreatedNodeChild
  getPositionInfoForNewChild: (index: string) => CreatedChildPositionInfo
  hasFragment: (key: string) => boolean
  getFragment: (key: string) => CreatedFragmentChild
  addFragment: (key: string, value: CreatedFragmentChild) => boolean
  replaceFragment: (key: string, value: CreatedFragmentChild) => boolean
  removeFragment: (key: string) => boolean
  createEmptyFragment: (index: string) => boolean
}

/*
 * CONNECT PROPS
 */

export type DOMElementProps = RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> |
  RvdSVGProps<SVGElement>
export type DOMElementPropName = keyof DOMElementProps | 'key' | 'ref'
export type DOMElementConnectablePropName = keyof Omit<DOMElementProps, 'children'>
export type DOMElementConnectableProp = Exclude<RvdElementProp, RvdChild[] | RxO<RvdChild[]>>
export type DOMEventHandlerPropName =
  keyof Omit<DOMAttributes<Element>, 'children' | 'dangerouslySetInnerHTML'>

export type RvdElementProp = RvdDOMProp | RvdObservableDOMProp

export type PropEntryCallback =
  ([propName, propValue]: [DOMElementPropName, RvdElementProp]) => void

export type ConnectPropCallback<
  T extends DOMElementConnectableProp = DOMElementConnectableProp
> = (propName: DOMElementConnectablePropName, propValue: T) => void

export type RvdStyleProp = CSSProperties | string | RxO<CSSProperties | string>
