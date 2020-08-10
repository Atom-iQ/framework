import {
  RvdChild,
  RvdComponentElement,
  RvdDOMElement,
  RvdElement,
  RvdFragmentElement, RvdFragmentNode, RvdNode,
  RvdObservableComponentNode,
  RvdObservableFragmentNode,
  RvdObservableNode,
  RvdProps,
  RvdStaticChild
} from './rv-dom'
import { RxSub } from '../rxjs'
import { CustomMap, Dictionary } from '../common'
import { OperatorFunction } from 'rxjs'

export interface CreateRvDomFnConfig<P extends RvdProps = RvdProps> {
  querySelector?: string
  element?: Element
}

export type CreateRvDomFn<P extends RvdProps = RvdProps> = (
  rootNode: RvdElement<P>,
  config: CreateRvDomFnConfig<P>
) => void

export interface RvdRenderer {
  renderRvdComponent: RvdComponentRenderer
  renderRvdFragment: RvdFragmentRenderer
  renderRvdElement: RvdElementRenderer
}

export type RvdComponentRenderer =
  (rvdComponent: RvdComponentElement) => RvdObservableComponentNode

export type RvdElementRenderer = (rvdElement: RvdDOMElement) => RvdObservableNode

export type RvdFragmentRenderer = (rvdFragment: RvdFragmentElement) => RvdObservableFragmentNode

export type StreamChildFn = (child: RvdStaticChild) => RvdObservableComponentNode
export type SwitchMapChildFn = () => OperatorFunction<RvdStaticChild, RvdFragmentNode | RvdNode>

export type ChildrenRenderer = (
  renderRvdComponent: RvdComponentRenderer,
  renderRvdFragment: RvdFragmentRenderer,
  renderRvdElement: RvdElementRenderer
) => RenderElementChildrenFn

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

export interface CreatedChild {
  index: string
  element: Element | Text | '_Fragment'
  key?: string
  subscription?: RxSub
  fromFragment?: boolean
  fragmentChildIndexes?: string[]
  fragmentChildKeys?: Dictionary<string>
}

export interface CreatedFragmentChild extends CreatedChild {
  element: '_Fragment'
  subscription?: RxSub
  fragmentChildIndexes: string[]
  fragmentChildKeys: Dictionary<string>
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

export interface RvdMiddleware<T extends RvdChild = RvdChild> {
  (rvdChild: T): T
}
