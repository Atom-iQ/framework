import { Observable, ParentSubscription, ObservableState } from '@atom-iq/rx'

import type {
  RvdAnimationEventHandler,
  RvdChangeEventHandler,
  RvdClipboardEventHandler,
  RvdCompositionEventHandler,
  RvdDragEventHandler,
  RvdFocusEventHandler,
  RvdFormEventHandler,
  RvdKeyboardEventHandler,
  RvdMouseEventHandler,
  RvdPointerEventHandler,
  RvdEventHandler,
  RvdTouchEventHandler,
  RvdTransitionEventHandler,
  RvdUIEventHandler,
  RvdWheelEventHandler,
  CSSProperties,
  RvdEvent,
  RvdAnyEventHandler,
  StaticOrObservable,
  ReactiveEventDelegationContainer
} from '..'
import { RvdListType, RvdNodeFlags } from '../../flags'

import * as css from './css'

export interface RvdRenderer {
  <P>(rootRvdElement: RvdNode<P>, rootDom: Element): RvdParent<RvdNode<P>>
  <P>(rootRvdElement: RvdNode<P>, rootDom: Element, middlewares: RvdMiddlewares): RvdParent<
    RvdNode<P>
  >
  <P>(
    rootRvdElement: RvdNode<P>,
    rootDom: Element,
    initContext: () => Omit<RvdContext, AtomiqContextKey>
  ): RvdParent<RvdNode<P>>
  <P>(
    rootRvdElement: RvdNode<P>,
    rootDom: Element,
    initContext: () => Omit<RvdContext, AtomiqContextKey>,
    middlewares: RvdMiddlewares
  ): RvdParent<RvdNode<P>>
  <P>(
    rootRvdElement: RvdNode<P>,
    rootDom: Element,
    middlewaresOrInitContext?: RvdMiddlewares | (() => Omit<RvdContext, AtomiqContextKey>) | never,
    middlewares?: RvdMiddlewares | never
  ): RvdParent<RvdNode<P>>
}

/******************************
 * Reactive Virtual DOM Nodes *
 ******************************/

/**
 * Reactive Virtual DOM Node
 *
 * Abstract type, extended by all Rvd nodes
 */
export interface RvdNode<P extends RvdProps = RvdProps> {
  // Properties from JSX
  flag: RvdNodeFlags
  type?: RvdNodeType
  props?: P | null
  className?: string | null | Observable<string | null>
  children?: RvdChild | RvdChild[] | null
  key?: string | number
  ref?: RvdRefObject<ElementRef> | RvdRefObject<ComponentRef>
  // Properties from renderer
  dom?: Element | Text
  index?: number
  sub?: ParentSubscription
}

/**
 * Reactive Virtual DOM Parent
 *
 * Node connected by renderer - all its children are nodes, that are changing
 * dynamically in runtime
 */
export type RvdParent<Node extends RvdNode = RvdNode> = {
  [K in keyof Node]: K extends 'children'
    ? Node extends RvdComponentNode
      ? Node[K]
      : (RvdNode | undefined)[]
    : Node[K]
}

/**
 * Reactive Virtual DOM Element Node
 *
 * Abstract type, extended by all Rvd HTML and SVG nodes
 */
export interface RvdElementNode<P extends RvdDOMProps = RvdDOMProps> extends RvdNode<P> {
  flag:
    | RvdNodeFlags.SvgElement
    | RvdNodeFlags.HtmlElement
    | RvdNodeFlags.Input
    | RvdNodeFlags.Select
    | RvdNodeFlags.Textarea
  type: RvdElementNodeType
  ref?: RvdRefObject<ElementRef>
  dom?: HTMLElement | SVGElement
}

/**
 * Reactive Virtual DOM HTML Element Node
 *
 * Rvd node, connected with HTML Element
 */
export interface RvdHTMLElementNode<
  P extends RvdHTMLProps<HTMLAttributes<T>, T> = RvdHTMLProps<
    HTMLAttributes<HTMLElement>,
    HTMLElement
  >,
  T extends HTMLElement = HTMLElement
> extends RvdElementNode<P> {
  flag: RvdNodeFlags.HtmlElement | RvdNodeFlags.Input | RvdNodeFlags.Select | RvdNodeFlags.Textarea
  type: RvdHTMLElementNodeType
  dom?: HTMLElement
}

/**
 * Reactive Virtual DOM SVG Element Node
 *
 * Rvd node, connected with SVG Element
 */
export interface RvdSVGElementNode extends RvdElementNode<RvdSVGProps<SVGElement>> {
  flag: RvdNodeFlags.SvgElement
  type: RvdSVGElementNodeType
  dom?: SVGElement
}

/**
 * Reactive Virtual DOM Text Node
 *
 * Rvd node, connected with DOM Text Node - created by renderer from strings
 */
export interface RvdTextNode extends RvdNode<undefined> {
  type?: undefined
  flag: RvdNodeFlags.Text
  dom: Text
}

export type RvdDomNode = RvdHTMLElementNode | RvdSVGElementNode | RvdTextNode

/**
 * Reactive Virtual DOM Group Node
 *
 * Abstract type, extended by all container (non-DOM) nodes - components, lists and fragments
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface RvdGroupNode<P extends RvdComponentProps | RvdListProps<any> | undefined = unknown>
  extends RvdNode<P> {
  flag: RvdNodeFlags.List | RvdNodeFlags.Component | RvdNodeFlags.Fragment
  // Properties set by renderer
  dom?: Element // parent dom element
  previousSibling?: Element | Text
}

/**
 * Reactive Virtual DOM Component Node
 *
 * Container (non-DOM) node, connected with component - it's something like
 * component instance - created when component function is called and component
 * is added to Reactive Virtual DOM
 */
export interface RvdComponentNode<P extends RvdComponentProps = RvdComponentProps>
  extends RvdGroupNode<P> {
  type: RvdComponent<P>
  flag: RvdNodeFlags.Component
  children?: [RvdNode | undefined]
  ref?: RvdRefObject<ComponentRef>
}

/**
 * Reactive Virtual DOM Fragment Node
 *
 * Container (non-DOM) node, created from fragments and arrays.
 * Remove and re-create all children on re-render
 */
export interface RvdFragmentNode extends RvdGroupNode<undefined> {
  flag: RvdNodeFlags.Fragment
  type?: undefined
  children: RvdChild[] | null
}

/**
 * Reactive Virtual DOM List Node
 *
 * Abstract type, extended by keyed and non-keyed lists
 */
export interface RvdListNode<
  T extends RvdListDataType = unknown,
  P extends RvdListProps<T> = RvdListProps<T>
> extends RvdGroupNode<P> {
  type: RvdListType
  flag: RvdNodeFlags.List
  // Properties set by renderer
  children?: (RvdNode | undefined)[]
  nextSibling?: Element | Text | null
  append?: boolean
}

/**
 * Reactive Virtual DOM Keyed List Node
 *
 * Container (non-DOM) node, for dynamic lists of elements, tracked by key.
 * Move, add, remove or skip rendering children on re-render, based on keys
 */
export interface RvdKeyedListNode<T> extends RvdListNode<T, RvdKeyedListProps<T>> {
  type: RvdListType.Keyed
}

/**
 * Reactive Virtual DOM Non-Keyed List Node
 *
 * Container (non-DOM) node, for dynamic lists of elements, tracked by index in array.
 * Add, remove or skip rendering children on re-render - update nodes instead of moving
 */
export interface RvdNonKeyedListNode<T> extends RvdListNode<T, RvdNonKeyedListProps<T>> {
  type: RvdListType.NonKeyed
}

/***********************************
 * Reactive Virtual DOM Node Types *
 ***********************************/

export type RvdNodeType = RvdElementNodeType | RvdComponent | RvdListType

export type RvdElementNodeType = RvdHTMLElementNodeType | RvdSVGElementNodeType

export type RvdHTMLElementNodeType = keyof RvdHTML

export type RvdSVGElementNodeType = keyof RvdSVG

/**
 * Reactive Virtual DOM Component
 */
export interface RvdComponent<P extends {} = {}> {
  (): RvdChild
  (props: RvdComponentProps<P>): RvdChild
  (props?: RvdComponentProps<P>): RvdChild
}

/***********************************
 * Reactive Virtual DOM Node Props *
 ***********************************/

/**
 * Reactive Virtual DOM Props - all possible types of node props
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RvdProps = RvdComponentProps | RvdDOMProps | RvdListProps<any>

export type RvdDOMProps<
  E extends EventTarget = Element,
  P extends HTMLAttributes<E> = HTMLAttributes<E>
> = RvdSVGProps<E> | RvdHTMLProps<P, E>

export type RvdHTMLProps<
  E extends HTMLAttributes<T>,
  T extends EventTarget
> = RvdSpecialAttributes & E

export interface RvdSVGProps<T extends EventTarget>
  extends SVGAttributes<T>,
    RvdSpecialAttributes {}

/**
 * Reactive Virtual DOM List props
 *
 * Abstract type, extended by keyed and non-keyed lists props
 */
export interface RvdListProps<T extends RvdListDataType = unknown> {
  data: Observable<T[]>
  render: RenderRvdKeyedListItem<T> | RenderRvdNonKeyedListItem<T>
}

/**
 * Reactive Virtual DOM Keyed List props
 *
 * Props of keyed list node, contain data, render item callback and keyBy field
 */
export interface RvdKeyedListProps<T extends RvdListDataType = unknown> extends RvdListProps<T> {
  keyBy: RvdListKeyBy<T>
  render: RenderRvdKeyedListItem<T>
}

/**
 * Reactive Virtual DOM Non-Keyed List props
 *
 * Props of non-keyed list node, contain data and render item callback
 */
export interface RvdNonKeyedListProps<T extends RvdListDataType = unknown> extends RvdListProps<T> {
  render: RenderRvdNonKeyedListItem<T>
}

export type RenderRvdKeyedListItem<T extends RvdListDataType = unknown> = (
  itemField: RvdListItemField<T, keyof T | never>,
  key?: number | string
) => RvdNode

export type RenderRvdNonKeyedListItem<T extends RvdListDataType = unknown> = (
  itemField: RvdListItemField<T, keyof T | never>,
  index?: number
) => RvdStaticChild

export type RvdListItemField<
  T extends RvdListDataType = unknown,
  N extends keyof T | never = keyof T | never
> = (fieldName?: N) => RvdListItemFieldObservable<T, N>

type RvdListItemFieldObservable<
  T extends RvdListDataType = unknown,
  N extends keyof T | never = keyof T | never
> = N extends keyof T ? Observable<T[keyof T]> : Observable<T>

export type RvdListDataType = Object | string | number

export type RvdListKeyBy<T extends RvdListDataType = unknown> = '' | keyof T | RvdListKeyByFn<T>

export type RvdListKeyByFn<T extends RvdListDataType = unknown> = (item: T) => string | number
/**
 * Reactive Virtual DOM Component props
 */
export type RvdComponentProps<P extends {} = {}> = P & RvdComponentSpecialProps

export type RvdComponentSpecialProps = {
  children?: RvdComponentChild
  ref?: RvdRefObject<ComponentRef>
  key?: string | number
}

export interface RvdSpecialAttributes {
  ref?: RvdRefObject<ElementRef>
  key?: string | number
}

export type RvdEventHandlerProp = RvdAnyEventHandler

export type RvdDOMProp =
  | RvdEventHandlerProp
  | DangerousHTML
  | CSSProperties
  | RvdChild[]
  | string
  | number
  | boolean

export type RvdObservableDOMProp = Observable<RvdDOMProp>

export type RvdDOMPropName = keyof RvdDOMProps
export type RvdDOMEventHandlerName = PickEventHandlerNames<RvdDOMPropName>

type PickEventHandlerNames<PropName extends string> = PropName extends `on${string}`
  ? PropName
  : never

export type RvdElementProp = RvdDOMProp | RvdObservableDOMProp

export type RvdStyleProp = CSSProperties | string | Observable<CSSProperties | string>

/**
 * Reactive Virtual DOM Child
 */
export type RvdChild<P extends RvdProps = RvdProps> = RvdStaticChild<P> | RvdObservableChild<P>

export type RvdComponentChild<P extends RvdProps = RvdProps> =
  | RvdChild<P>
  | RvdCallbackChild
  | Observable<RvdCallbackChild>

export type RvdPrimitiveChild = string | number | boolean | null | undefined

export type RvdCallbackChild = Function

export type RvdArrayChild = RvdChild[]

export type RvdStaticChild<P extends RvdProps = RvdProps> =
  | RvdNode<P>
  | RvdPrimitiveChild
  | RvdArrayChild

export type RvdObservableChild<P extends RvdProps = RvdProps> = Observable<RvdStaticChild<P>>

/** REF */

export type ElementRefPropType = RvdEventHandler<RvdEvent> | Observable<RvdDOMProp> | RvdDOMProp

export interface ElementRef<
  E extends Element = Element,
  P extends HTMLAttributes<E> | SVGAttributes<E> = HTMLAttributes<E> | SVGAttributes<E>
> {
  props: P
  dom: E
}

export type ComponentRef = Record<string, RvdComponentRefFieldUnion> & {
  props: Record<string, RvdComponentRefFieldUnion>
}

export type RvdComponentRefFieldUnion =
  | ObservableState<RvdComponentRefFieldUnion>
  | Observable<RvdComponentRefFieldUnion>
  | AnyType

export interface RvdRefObject<
  RefType extends ElementRef | ComponentRef = ElementRef | ComponentRef
> {
  current: RefType | null
  onConnect: (ref: RefType) => void
}

export type PrimitiveType = string | number | boolean | null | undefined

export type ReferenceType = Object | Array<PrimitiveType | ReferenceType> | Function

export type AnyType = PrimitiveType | ReferenceType

/** CONTEXT */

/**
 * Reactive Virtual DOM Context
 */
export interface RvdContext {
  readonly $: AtomiqContext
  readonly [handle: RvdContextHandle]: RvdContextFieldUnion
  readonly [name: RvdContextName]: RvdContextFieldUnion
}

export type RvdContextHandle = Exclude<number, 0>
export type RvdContextName = Exclude<string, '' | '0' | AtomiqContextKey>

export type RvdContextFieldUnion =
  | ObservableState<RvdContextFieldUnion>
  | Observable<RvdContextFieldUnion>
  | AnyType

export type AtomiqContextKey = '$'

export interface AtomiqContext extends RvdMiddlewares {
  rootElement: Element
  delegationContainer: ReactiveEventDelegationContainer
  hydrate: boolean
}

export interface RvdMiddlewares {
  element: RvdElementMiddleware
  text: RvdTextMiddleware
  component: RvdComponentMiddleware
}

export type RvdElementMiddleware =
  | ((
      elementRvd: RvdElementNode,
      context: RvdContext,
      parentRvd: RvdParent
    ) => RvdElementNode | false)
  | null

export type RvdTextMiddleware =
  | ((text: string | number, context: RvdContext, parentRvd: RvdParent) => string | number | false)
  | null

export type RvdComponentMiddleware =
  | ((
      componentRvd: RvdComponentNode,
      context: RvdContext,
      parentRvd: RvdParent
    ) => RvdComponentNode | false)
  | null

/** Rvd DOM Nodes */

/**
 * Controlled form element - input, select or textarea
 */
export type RvdControlledFormElement = RvdHTML['input'] | RvdHTML['select'] | RvdHTML['textarea']

export type DOMFormElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

export interface RvdHTML {
  a: RvdHTMLElementNode<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>
  abbr: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  address: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  area: RvdHTMLElementNode<AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>
  article: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  aside: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  audio: RvdHTMLElementNode<AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>
  b: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  base: RvdHTMLElementNode<BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>
  bdi: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  bdo: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  big: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  blockquote: RvdHTMLElementNode<BlockquoteHTMLAttributes<HTMLElement>>
  body: RvdHTMLElementNode<HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>
  br: RvdHTMLElementNode<HTMLAttributes<HTMLBRElement>, HTMLBRElement>
  button: RvdHTMLElementNode<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
  canvas: RvdHTMLElementNode<CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>
  caption: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  cite: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  code: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  col: RvdHTMLElementNode<ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>
  colgroup: RvdHTMLElementNode<ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>
  data: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  datalist: RvdHTMLElementNode<HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>
  dd: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  del: RvdHTMLElementNode<DelHTMLAttributes<HTMLElement>>
  details: RvdHTMLElementNode<DetailsHTMLAttributes<HTMLElement>>
  dfn: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  dialog: RvdHTMLElementNode<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>
  div: RvdHTMLElementNode<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
  dl: RvdHTMLElementNode<HTMLAttributes<HTMLDListElement>, HTMLDListElement>
  dt: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  em: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  embed: RvdHTMLElementNode<EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>
  fieldset: RvdHTMLElementNode<FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>
  figcaption: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  figure: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  footer: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  form: RvdHTMLElementNode<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>
  h1: RvdHTMLElementNode<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
  h2: RvdHTMLElementNode<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
  h3: RvdHTMLElementNode<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
  h4: RvdHTMLElementNode<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
  h5: RvdHTMLElementNode<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
  h6: RvdHTMLElementNode<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
  head: RvdHTMLElementNode<HTMLAttributes<HTMLElement>, HTMLHeadElement>
  header: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  hgroup: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  hr: RvdHTMLElementNode<HTMLAttributes<HTMLHRElement>, HTMLHRElement>
  html: RvdHTMLElementNode<HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>
  i: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  iframe: RvdHTMLElementNode<IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>
  img: RvdHTMLElementNode<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>
  input: RvdHTMLElementNode<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
  ins: RvdHTMLElementNode<InsHTMLAttributes<HTMLModElement>, HTMLModElement>
  kbd: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  keygen: RvdHTMLElementNode<KeygenHTMLAttributes<HTMLElement>>
  label: RvdHTMLElementNode<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>
  legend: RvdHTMLElementNode<HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>
  li: RvdHTMLElementNode<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>
  link: RvdHTMLElementNode<LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>
  main: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  map: RvdHTMLElementNode<MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>
  mark: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  menu: RvdHTMLElementNode<MenuHTMLAttributes<HTMLElement>>
  menuitem: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  meta: RvdHTMLElementNode<MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>
  meter: RvdHTMLElementNode<MeterHTMLAttributes<HTMLElement>>
  nav: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  noindex: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  noscript: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  object: RvdHTMLElementNode<ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>
  ol: RvdHTMLElementNode<OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>
  optgroup: RvdHTMLElementNode<OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>
  option: RvdHTMLElementNode<OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>
  output: RvdHTMLElementNode<OutputHTMLAttributes<HTMLElement>>
  p: RvdHTMLElementNode<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>
  param: RvdHTMLElementNode<ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>
  picture: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  pre: RvdHTMLElementNode<HTMLAttributes<HTMLPreElement>, HTMLPreElement>
  progress: RvdHTMLElementNode<ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>
  q: RvdHTMLElementNode<QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>
  rp: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  rt: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  ruby: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  s: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  samp: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  script: RvdHTMLElementNode<ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>
  section: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  select: RvdHTMLElementNode<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>
  small: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  source: RvdHTMLElementNode<SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>
  span: RvdHTMLElementNode<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>
  strong: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  style: RvdHTMLElementNode<StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>
  sub: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  summary: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  sup: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  table: RvdHTMLElementNode<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>
  tbody: RvdHTMLElementNode<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>
  td: RvdHTMLElementNode<TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>
  textarea: RvdHTMLElementNode<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>
  tfoot: RvdHTMLElementNode<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>
  th: RvdHTMLElementNode<ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>
  thead: RvdHTMLElementNode<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>
  time: RvdHTMLElementNode<TimeHTMLAttributes<HTMLElement>>
  title: RvdHTMLElementNode<HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>
  tr: RvdHTMLElementNode<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>
  track: RvdHTMLElementNode<TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>
  u: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  ul: RvdHTMLElementNode<HTMLAttributes<HTMLUListElement>, HTMLUListElement>
  var: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  video: RvdHTMLElementNode<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>
  wbr: RvdHTMLElementNode<HTMLAttributes<HTMLElement>>
  // webview: RvdHTMLElement<WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement>
}

export interface RvdSVG {
  animate: RvdSVGElementNode
  animateTransform: RvdSVGElementNode
  circle: RvdSVGElementNode
  clipPath: RvdSVGElementNode
  defs: RvdSVGElementNode
  desc: RvdSVGElementNode
  ellipse: RvdSVGElementNode
  feBlend: RvdSVGElementNode
  feColorMatrix: RvdSVGElementNode
  feComponentTransfer: RvdSVGElementNode
  feComposite: RvdSVGElementNode
  feConvolveMatrix: RvdSVGElementNode
  feDiffuseLighting: RvdSVGElementNode
  feDisplacementMap: RvdSVGElementNode
  feDistantLight: RvdSVGElementNode
  feDropShadow: RvdSVGElementNode
  feFlood: RvdSVGElementNode
  feFuncA: RvdSVGElementNode
  feFuncB: RvdSVGElementNode
  feFuncG: RvdSVGElementNode
  feFuncR: RvdSVGElementNode
  feGaussianBlur: RvdSVGElementNode
  feImage: RvdSVGElementNode
  feMerge: RvdSVGElementNode
  feMergeNode: RvdSVGElementNode
  feMorphology: RvdSVGElementNode
  feOffset: RvdSVGElementNode
  fePointLight: RvdSVGElementNode
  feSpecularLighting: RvdSVGElementNode
  feSpotLight: RvdSVGElementNode
  feTile: RvdSVGElementNode
  feTurbulence: RvdSVGElementNode
  filter: RvdSVGElementNode
  foreignObject: RvdSVGElementNode
  g: RvdSVGElementNode
  image: RvdSVGElementNode
  line: RvdSVGElementNode
  linearGradient: RvdSVGElementNode
  marker: RvdSVGElementNode
  mask: RvdSVGElementNode
  metadata: RvdSVGElementNode
  path: RvdSVGElementNode
  pattern: RvdSVGElementNode
  polygon: RvdSVGElementNode
  polyline: RvdSVGElementNode
  radialGradient: RvdSVGElementNode
  rect: RvdSVGElementNode
  stop: RvdSVGElementNode
  svg: RvdSVGElementNode
  switch: RvdSVGElementNode
  symbol: RvdSVGElementNode
  text: RvdSVGElementNode
  textPath: RvdSVGElementNode
  tspan: RvdSVGElementNode
  use: RvdSVGElementNode
  view: RvdSVGElementNode
}

export interface DangerousHTML {
  __html: string | Observable<string>
}

/**
 * Reactive Virtual DOM Attributes
 */
export interface DOMAttributes<T extends EventTarget> {
  children?: RvdChild | RvdChild[]
  dangerouslySetInnerHTML?: DangerousHTML
  title?: string
  value?: string | number | boolean | Array<string | number | boolean>

  /** SYNTHETIC EVENT HANDLERS **/

  // ----------------------------------------------------
  // Classic Event Handlers
  // ----------------------------------------------------

  // Clipboard Events
  onCopy?: RvdClipboardEventHandler<T>
  onCut?: RvdClipboardEventHandler<T>
  onPaste?: RvdClipboardEventHandler<T>

  // Composition Events
  onCompositionEnd?: RvdCompositionEventHandler<T>
  onCompositionStart?: RvdCompositionEventHandler<T>
  onCompositionUpdate?: RvdCompositionEventHandler<T>

  // Focus Events
  onFocus?: RvdFocusEventHandler<T>
  onBlur?: RvdFocusEventHandler<T>

  // Form Events
  onChange?: RvdChangeEventHandler<T>
  onInput?: RvdFormEventHandler<T>
  onReset?: RvdFormEventHandler<T>
  onSubmit?: RvdFormEventHandler<T>
  onInvalid?: RvdFormEventHandler<T>

  // Image Events
  onLoad?: RvdEventHandler<RvdEvent<T>, T>
  onError?: RvdEventHandler<RvdEvent<T>, T> // also a Media Event

  // Keyboard Events
  onKeyDown?: RvdKeyboardEventHandler<T>
  onKeyPress?: RvdKeyboardEventHandler<T>
  onKeyUp?: RvdKeyboardEventHandler<T>

  // Media Events
  onAbort?: RvdEventHandler<RvdEvent<T>, T>
  onCanPlay?: RvdEventHandler<RvdEvent<T>, T>
  onCanPlayThrough?: RvdEventHandler<RvdEvent<T>, T>
  onDurationChange?: RvdEventHandler<RvdEvent<T>, T>
  onEmptied?: RvdEventHandler<RvdEvent<T>, T>
  onEncrypted?: RvdEventHandler<RvdEvent<T>, T>
  onEnded?: RvdEventHandler<RvdEvent<T>, T>
  onLoadedData?: RvdEventHandler<RvdEvent<T>, T>
  onLoadedMetadata?: RvdEventHandler<RvdEvent<T>, T>
  onLoadStart?: RvdEventHandler<RvdEvent<T>, T>
  onPause?: RvdEventHandler<RvdEvent<T>, T>
  onPlay?: RvdEventHandler<RvdEvent<T>, T>
  onPlaying?: RvdEventHandler<RvdEvent<T>, T>
  onProgress?: RvdEventHandler<RvdEvent<T>, T>
  onRateChange?: RvdEventHandler<RvdEvent<T>, T>
  onSeeked?: RvdEventHandler<RvdEvent<T>, T>
  onSeeking?: RvdEventHandler<RvdEvent<T>, T>
  onStalled?: RvdEventHandler<RvdEvent<T>, T>
  onSuspend?: RvdEventHandler<RvdEvent<T>, T>
  onTimeUpdate?: RvdEventHandler<RvdEvent<T>, T>
  onVolumeChange?: RvdEventHandler<RvdEvent<T>, T>
  onWaiting?: RvdEventHandler<RvdEvent<T>, T>

  // MouseEvents
  onClick?: RvdMouseEventHandler<T>
  onContextMenu?: RvdMouseEventHandler<T>
  onDblClick?: RvdMouseEventHandler<T>
  onDrag?: RvdDragEventHandler<T>
  onDragEnd?: RvdDragEventHandler<T>
  onDragEnter?: RvdDragEventHandler<T>
  onDragExit?: RvdDragEventHandler<T>
  onDragLeave?: RvdDragEventHandler<T>
  onDragOver?: RvdDragEventHandler<T>
  onDragStart?: RvdDragEventHandler<T>
  onDrop?: RvdDragEventHandler<T>
  onMouseDown?: RvdMouseEventHandler<T>
  onMouseEnter?: RvdMouseEventHandler<T>
  onMouseLeave?: RvdMouseEventHandler<T>
  onMouseMove?: RvdMouseEventHandler<T>
  onMouseOut?: RvdMouseEventHandler<T>
  onMouseOver?: RvdMouseEventHandler<T>
  onMouseUp?: RvdMouseEventHandler<T>

  // Selection Events
  onSelect?: RvdEventHandler<RvdEvent<T>, T>

  // Touch Events
  onTouchCancel?: RvdTouchEventHandler<T>
  onTouchEnd?: RvdTouchEventHandler<T>
  onTouchMove?: RvdTouchEventHandler<T>
  onTouchStart?: RvdTouchEventHandler<T>

  // Pointer events
  onPointerDown?: RvdPointerEventHandler<T>
  onPointerMove?: RvdPointerEventHandler<T>
  onPointerUp?: RvdPointerEventHandler<T>
  onPointerCancel?: RvdPointerEventHandler<T>
  onPointerEnter?: RvdPointerEventHandler<T>
  onPointerLeave?: RvdPointerEventHandler<T>
  onPointerOver?: RvdPointerEventHandler<T>
  onPointerOut?: RvdPointerEventHandler<T>

  // UI Events
  onScroll?: RvdUIEventHandler<T>

  // Wheel Events
  onWheel?: RvdWheelEventHandler<T>

  // Animation Events
  onAnimationStart?: RvdAnimationEventHandler<T>
  onAnimationEnd?: RvdAnimationEventHandler<T>
  onAnimationIteration?: RvdAnimationEventHandler<T>

  // Transition Events
  onTransitionEnd?: RvdTransitionEventHandler<T>
}

type WithObservableAttributes<
  Attributes extends DOMAttributes<Target>,
  Target extends EventTarget
> = {
  [PropertyName in keyof Attributes]: PropertyName extends `on${string}`
    ? Attributes[PropertyName]
    : StaticOrObservable<Attributes[PropertyName]>
}

export type HTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticHTMLAttributes<T>,
  T
>

interface StaticHTMLAttributes<T extends EventTarget> extends DOMAttributes<T> {
  // Standard HTML Attributes
  accessKey?: string
  class?: string
  className?: string
  contentEditable?: boolean
  contextMenu?: string
  dir?: string
  draggable?: boolean
  hidden?: boolean
  id?: string
  lang?: string
  slot?: string
  spellCheck?: boolean
  style?: css.CSSProperties | string
  styleName?: string // CSS Modules support
  tabIndex?: number
  title?: string

  // Unknown
  inputMode?: string
  is?: string
  radioGroup?: string // <command>, <menuitem>

  // WAI-ARIA
  role?: string

  // RDFa Attributes
  about?: string
  datatype?: string
  inlist?: unknown
  prefix?: string
  property?: string
  resource?: string
  typeof?: string
  vocab?: string

  // Non-standard Attributes
  autoCapitalize?: string
  autoCorrect?: string
  autoSave?: string
  color?: string
  itemProp?: string
  itemScope?: boolean
  itemType?: string
  itemID?: string
  itemRef?: string
  results?: number
  security?: string
  unselectable?: boolean

  /**
   * Identifies the currently active element when DOM focus is
   * on a composite widget, textbox, group, or application.
   */
  'aria-activedescendant'?: string
  /**
   * Indicates whether assistive technologies will present all,
   * or only parts of, the changed region based on the change
   * notifications defined by the aria-relevant attribute.
   */
  'aria-atomic'?: boolean | 'false' | 'true'
  /**
   * Indicates whether inputting text could trigger display of
   * one or more predictions of the user's intended value for an
   * input and specifies how predictions would be
   * presented if they are made.
   */
  'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both'
  /**
   * Indicates an element is being modified and that assistive technologies
   * MAY want to wait until the modifications are complete before exposing them to the user.
   */
  'aria-busy'?: boolean | 'false' | 'true'
  /**
   * Indicates the current "checked" state of checkboxes,
   * radio buttons, and other widgets.
   * @see aria-pressed @see aria-selected.
   */
  'aria-checked'?: boolean | 'false' | 'mixed' | 'true'
  /**
   * Defines the total number of columns in a table, grid, or treegrid.
   * @see aria-colindex.
   */
  'aria-colcount'?: number
  /**
   * Defines an element's column index or position with respect to the
   * total number of columns within a table, grid, or treegrid.
   * @see aria-colcount @see aria-colspan.
   */
  'aria-colindex'?: number
  /**
   * Defines the number of columns spanned by a cell or gridcell
   * within a table, grid, or treegrid.
   * @see aria-colindex @see aria-rowspan.
   */
  'aria-colspan'?: number
  /**
   * Indicates the element that represents the current item within
   * a container or set of related elements.
   */
  'aria-current'?: boolean | 'false' | 'true' | 'page' | 'step' | 'location' | 'date' | 'time'
  /**
   * Identifies the element (or elements) that describes the object.
   * @see aria-labelledby
   */
  'aria-describedby'?: string
  /**
   * Identifies the element that provides a detailed, extended description for the object.
   * @see aria-describedby.
   */
  'aria-details'?: string
  /**
   * Indicates that the element is perceivable but disabled,
   * so it is not editable or otherwise operable.
   * @see aria-hidden @see aria-readonly.
   */
  'aria-disabled'?: boolean | 'false' | 'true'
  /**
   * Indicates what functions can be performed when
   * a dragged object is released on the drop target.
   * @deprecated in ARIA 1.1
   */
  'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup'
  /**
   * Identifies the element that provides an error message for the object.
   * @see aria-invalid @see aria-describedby.
   */
  'aria-errormessage'?: string
  /**
   * Indicates whether the element, or another grouping
   * element it controls, is currently expanded or collapsed.
   */
  'aria-expanded'?: boolean | 'false' | 'true'
  /**
   * Identifies the next element (or elements) in an alternate
   * reading order of content which, at the user's discretion,
   * allows assistive technology to override the general
   * default of reading in document source order.
   */
  'aria-flowto'?: string
  /**
   * Indicates an element's "grabbed" state in a drag-and-drop operation.
   * @deprecated in ARIA 1.1
   */
  'aria-grabbed'?: boolean | 'false' | 'true'
  /**
   * Indicates the availability and type of interactive
   * popup element, such as menu or dialog, that can be
   * triggered by an element.
   */
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
  /**
   * Indicates whether the element is exposed to an accessibility API.
   * @see aria-disabled.
   */
  'aria-hidden'?: boolean | 'false' | 'true'
  /**
   * Indicates the entered value does not conform to the format expected by the application.
   * @see aria-errormessage.
   */
  'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling'
  /**
   * Indicates keyboard shortcuts that an author has
   * implemented to activate or give focus to an element.
   */
  'aria-keyshortcuts'?: string
  /**
   * Defines a string value that labels the current element.
   * @see aria-labelledby.
   */
  'aria-label'?: string
  /**
   * Identifies the element (or elements) that labels the current element.
   * @see aria-describedby.
   */
  'aria-labelledby'?: string
  /** Defines the hierarchical level of an element within a structure. */
  'aria-level'?: number
  /**
   * Indicates that an element will be updated, and describes the types
   * of updates the user agents, assistive technologies, and user can expect
   * from the live region.
   */
  'aria-live'?: 'off' | 'assertive' | 'polite'
  /** Indicates whether an element is modal when displayed. */
  'aria-modal'?: boolean | 'false' | 'true'
  /** Indicates whether a text box accepts multiple lines of input or only a single line. */
  'aria-multiline'?: boolean | 'false' | 'true'
  /**
   * Indicates that the user may select more
   * than one item from the current selectable descendants.
   */
  'aria-multiselectable'?: boolean | 'false' | 'true'
  /**
   * Indicates whether the element's orientation is horizontal,
   * vertical, or unknown/ambiguous.
   */
  'aria-orientation'?: 'horizontal' | 'vertical'
  /**
   * Identifies an element (or elements) in order to define a visual,
   * functional, or contextual parent/child relationship
   * between DOM elements where the DOM hierarchy cannot be used
   * to represent the relationship.
   * @see aria-controls.
   */
  'aria-owns'?: string
  /**
   * Defines a short hint (a word or short phrase) intended
   * to aid the user with data entry when the control has no value.
   * A hint could be a sample value or a brief description of the expected format.
   */
  'aria-placeholder'?: string
  /**
   * Defines an element's number or position in the current set of listitems
   * or treeitems. Not required if all elements in the set are present in the DOM.
   * @see aria-setsize.
   */
  'aria-posinset'?: number
  /**
   * Indicates the current "pressed" state of toggle buttons.
   * @see aria-checked @see aria-selected.
   */
  'aria-pressed'?: boolean | 'false' | 'mixed' | 'true'
  /**
   * Indicates that the element is not editable, but is otherwise operable.
   * @see aria-disabled.
   */
  'aria-readonly'?: boolean | 'false' | 'true'
  /**
   * Indicates what notifications the user agent will trigger when
   * the accessibility tree within a live region is modified.
   * @see aria-atomic.
   */
  'aria-relevant'?: 'additions' | 'additions text' | 'all' | 'removals' | 'text'
  /** Indicates that user input is required on the element before a form may be submitted. */
  'aria-required'?: boolean | 'false' | 'true'
  /** Defines a human-readable, author-localized description for the role of an element. */
  'aria-roledescription'?: string
  /**
   * Defines the total number of rows in a table, grid, or treegrid.
   * @see aria-rowindex.
   */
  'aria-rowcount'?: number
  /**
   * Defines an element's row index or position with respect to
   * the total number of rows within a table, grid, or treegrid.
   * @see aria-rowcount @see aria-rowspan.
   */
  'aria-rowindex'?: number
  /**
   * Defines the number of rows spanned by a cell
   * or gridcell within a table, grid, or treegrid.
   * @see aria-rowindex @see aria-colspan.
   */
  'aria-rowspan'?: number
  /**
   * Indicates the current "selected" state of various widgets.
   * @see aria-checked @see aria-pressed.
   */
  'aria-selected'?: boolean | 'false' | 'true'
  /**
   * Defines the number of items in the current set of listitems
   * or treeitems. Not required if all elements in the set are present in the DOM.
   * @see aria-posinset.
   */
  'aria-setsize'?: number
  /** Indicates if items in a table or grid are sorted in ascending or descending order. */
  'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other'
  /** Defines the maximum allowed value for a range widget. */
  'aria-valuemax'?: number
  /** Defines the minimum allowed value for a range widget. */
  'aria-valuemin'?: number
  /**
   * Defines the current value for a range widget.
   * @see aria-valuetext.
   */
  'aria-valuenow'?: number
  /** Defines the human readable text alternative of aria-valuenow for a range widget. */
  'aria-valuetext'?: string
}

export type AnchorHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticAnchorHTMLAttributes<T>,
  T
>

interface StaticAnchorHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  download?: unknown
  href?: string
  hrefLang?: string
  media?: string
  rel?: string
  target?: string
  type?: string
  as?: string
}

export type AudioHTMLAttributes<T extends EventTarget> = MediaHTMLAttributes<T>

export type AreaHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticAreaHTMLAttributes<T>,
  T
>

interface StaticAreaHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  alt?: string
  coords?: string
  download?: unknown
  href?: string
  hrefLang?: string
  media?: string
  rel?: string
  shape?: string
  target?: string
}

export type BaseHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticBaseHTMLAttributes<T>,
  T
>

interface StaticBaseHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  href?: string
  target?: string
}

export type BlockquoteHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticBlockquoteHTMLAttributes<T>,
  T
>

interface StaticBlockquoteHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  cite?: string
}

export type ButtonHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticButtonHTMLAttributes<T>,
  T
>

interface StaticButtonHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  autoFocus?: boolean
  disabled?: boolean
  form?: string
  formAction?: string
  formEncType?: string
  formMethod?: string
  formNoValidate?: boolean
  formTarget?: string
  name?: string
  type?: string
  value?: string
}

export type CanvasHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticCanvasHTMLAttributes<T>,
  T
>

interface StaticCanvasHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  height?: number | string
  width?: number | string
}

export type ColHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticColHTMLAttributes<T>,
  T
>

interface StaticColHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  span?: number
  width?: number | string
}

export type ColgroupHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticColgroupHTMLAttributes<T>,
  T
>

interface StaticColgroupHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  span?: number
}

export type DetailsHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticDetailsHTMLAttributes<T>,
  T
>

interface StaticDetailsHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  open?: boolean
}

export type DelHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticDelHTMLAttributes<T>,
  T
>

interface StaticDelHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  cite?: string
  dateTime?: string
}

export type DialogHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticDialogHTMLAttributes<T>,
  T
>

interface StaticDialogHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  open?: boolean
}

export type EmbedHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticEmbedHTMLAttributes<T>,
  T
>

interface StaticEmbedHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  height?: number | string
  src?: string
  type?: string
  width?: number | string
}

export type FieldsetHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticFieldsetHTMLAttributes<T>,
  T
>

interface StaticFieldsetHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  disabled?: boolean
  form?: string
  name?: string
}

export type FormHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticStaticFormHTMLAttributes<T>,
  T
>

interface StaticStaticFormHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  acceptCharset?: string
  action?: string
  autoComplete?: string
  encType?: string
  method?: string
  name?: string
  noValidate?: boolean
  target?: string
}

export type HtmlHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticHtmlHTMLAttributes<T>,
  T
>

interface StaticHtmlHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  manifest?: string
}

export type IframeHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticIframeHTMLAttributes<T>,
  T
>

interface StaticIframeHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  allowFullScreen?: boolean
  allowTransparency?: boolean
  frameBorder?: number | string
  height?: number | string
  marginHeight?: number
  marginWidth?: number
  name?: string
  sandbox?: string
  scrolling?: string
  seamless?: boolean
  src?: string
  srcDoc?: string
  width?: number | string
}

export type ImgHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticImgHTMLAttributes<T>,
  T
>

interface StaticImgHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  alt?: string
  crossOrigin?:
    | 'anonymous'
    | 'use-credentials'
    | ''
    | Observable<'anonymous' | 'use-credentials' | ''>
  height?: number | string
  sizes?: string
  src?: string
  srcSet?: string
  useMap?: string
  width?: number | string
}

export type InsHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticInsHTMLAttributes<T>,
  T
>

interface StaticInsHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  cite?: string
  dateTime?: string
}

export type InputHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticInputHTMLAttributes<T>,
  T
>

interface StaticInputHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  accept?: string
  alt?: string
  autoComplete?: string
  autoFocus?: boolean
  capture?: boolean
  checked?: boolean
  crossOrigin?: string
  disabled?: boolean
  form?: string
  formAction?: string
  formEncType?: string
  formMethod?: string
  formNoValidate?: boolean
  formTarget?: string
  height?: number | string
  list?: string
  max?: number | string
  maxLength?: number
  min?: number | string
  minLength?: number
  multiple?: boolean
  name?: string
  pattern?: string
  placeholder?: string
  readOnly?: boolean
  required?: boolean
  size?: number
  src?: string
  step?: number | string
  type?: string
  value?: string | number
  defaultValue?: string | number
  width?: number | string

  onChange?: RvdChangeEventHandler<T>
}

export type KeygenHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticKeygenHTMLAttributes<T>,
  T
>

interface StaticKeygenHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  autoFocus?: boolean
  challenge?: string
  disabled?: boolean
  form?: string
  keyType?: string
  keyParams?: string
  name?: string
}

export type LabelHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticLabelHTMLAttributes<T>,
  T
>

interface StaticLabelHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  form?: string
  htmlFor?: string
}

export type LiHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticLiHTMLAttributes<T>,
  T
>

interface StaticLiHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  value?: string | string[] | number
}

export type LinkHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticLinkHTMLAttributes<T>,
  T
>

interface StaticLinkHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  as?: string
  crossOrigin?: string
  href?: string
  hrefLang?: string
  integrity?: string
  media?: string
  rel?: string
  sizes?: string
  type?: string
}

export type MapHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticMapHTMLAttributes<T>,
  T
>

interface StaticMapHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  name?: string
}

export type MenuHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticMenuHTMLAttributes<T>,
  T
>

interface StaticMenuHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  type?: string
}

export type MediaHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticMediaHTMLAttributes<T>,
  T
>

interface StaticMediaHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  autoPlay?: boolean
  controls?: boolean
  controlsList?: string
  crossOrigin?: string
  loop?: boolean
  mediaGroup?: string
  muted?: boolean
  playsinline?: boolean
  preload?: string
  src?: string
}

export type MetaHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticMetaHTMLAttributes<T>,
  T
>

interface StaticMetaHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  charSet?: string
  content?: string
  httpEquiv?: string
  name?: string
}

export type MeterHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticMeterHTMLAttributes<T>,
  T
>

interface StaticMeterHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  form?: string
  high?: number
  low?: number
  max?: number | string
  min?: number | string
  optimum?: number
  value?: string | string[] | number
}

export type QuoteHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticQuoteHTMLAttributes<T>,
  T
>

interface StaticQuoteHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  cite?: string
}

export type ObjectHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticObjectHTMLAttributes<T>,
  T
>

interface StaticObjectHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  classID?: string
  data?: string
  form?: string
  height?: number | string
  name?: string
  type?: string
  useMap?: string
  width?: number | string
  wmode?: string
}

export type OlHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticOlHTMLAttributes<T>,
  T
>

interface StaticOlHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  reversed?: boolean
  start?: number
}

export type OptgroupHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticOptgroupHTMLAttributes<T>,
  T
>

interface StaticOptgroupHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  disabled?: boolean
  label?: string
}

export type OptionHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticOptionHTMLAttributes<T>,
  T
>

interface StaticOptionHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  disabled?: boolean
  label?: string
  selected?: boolean
  value?: string | string[] | number
}

export type OutputHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticOutputHTMLAttributes<T>,
  T
>

interface StaticOutputHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  form?: string
  htmlFor?: string
  name?: string
}

export type ParamHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticParamHTMLAttributes<T>,
  T
>

interface StaticParamHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  name?: string
  value?: string | string[] | number
}

export type ProgressHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticProgressHTMLAttributes<T>,
  T
>

interface StaticProgressHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  max?: number | string
  value?: string | string[] | number
}

export type ScriptHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticScriptHTMLAttributes<T>,
  T
>

interface StaticScriptHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  async?: boolean
  charSet?: string
  crossOrigin?: string
  defer?: boolean
  integrity?: string
  nonce?: string
  src?: string
  type?: string
}

export type SelectHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticSelectHTMLAttributes<T>,
  T
>

interface StaticSelectHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  autoFocus?: boolean
  disabled?: boolean
  form?: string
  multiple?: boolean
  name?: string
  required?: boolean
  size?: number
  value?: string | string[] | number | number[]
  defaultValue?: string | string[] | number | number[]
  selectedIndex?: number
  onChange?: RvdChangeEventHandler<T>
}

export type SourceHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticSourceHTMLAttributes<T>,
  T
>

interface StaticSourceHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  media?: string
  sizes?: string
  src?: string
  srcSet?: string
  type?: string
}

export type StyleHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticStyleHTMLAttributes<T>,
  T
>

interface StaticStyleHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  media?: string
  nonce?: string
  scoped?: boolean
  type?: string
}

export type TableHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticTableHTMLAttributes<T>,
  T
>

interface StaticTableHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  cellPadding?: number | string
  cellSpacing?: number | string
  summary?: string
}

export type TextareaHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticTextareaHTMLAttributes<T>,
  T
>

interface StaticTextareaHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  autoComplete?: string
  autoFocus?: boolean
  cols?: number
  dirName?: string
  disabled?: boolean
  form?: string
  maxLength?: number
  minLength?: number
  name?: string
  placeholder?: string
  readOnly?: boolean
  required?: boolean
  rows?: number
  value?: string | number
  defaultValue?: string | number
  wrap?: string

  onChange?: RvdChangeEventHandler<T>
}

export type TdHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticTdHTMLAttributes<T>,
  T
>

interface StaticTdHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  colSpan?: number
  headers?: string
  rowSpan?: number
  scope?: string
}

export type ThHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticThHTMLAttributes<T>,
  T
>

interface StaticThHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  colSpan?: number
  headers?: string
  rowSpan?: number
  scope?: string
}

export type TimeHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticTimeHTMLAttributes<T>,
  T
>

interface StaticTimeHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  dateTime?: string
}

export type TrackHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticTrackHTMLAttributes<T>,
  T
>

interface StaticTrackHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  default?: boolean
  kind?: string
  label?: string
  src?: string
  srcLang?: string
}

export type VideoHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticVideoHTMLAttributes<T>,
  T
>

interface StaticVideoHTMLAttributes<T extends EventTarget> extends StaticMediaHTMLAttributes<T> {
  height?: number | string
  playsInline?: boolean
  poster?: string
  width?: number | string
}

// this list is "complete" in that it contains every SVG attribute
// that Inferno supports, but the types can be improved.
// Full list here: https://facebook.github.io/Inferno/docs/dom-elements.html
//
// The three broad type categories are (in order of restrictiveness):
//   - "number | string"
//   - "string"
//   - union of string literals
export type SVGAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticSVGAttributes<T>,
  T
>

interface StaticSVGAttributes<T extends EventTarget> extends DOMAttributes<T> {
  // Attributes which also defined in HTMLAttributes
  // See comment in SVGDOMPropertyConfig.old_lib
  class?: string
  className?: string
  color?: string
  height?: number | string
  id?: string
  lang?: string
  max?: number | string
  media?: string
  method?: string
  min?: number | string
  name?: string
  style?: css.CSSProperties
  target?: string
  type?: string
  width?: number | string

  // Other HTML properties supported by SVG elements in browsers
  role?: string
  tabIndex?: number

  // SVG Specific attributes
  accentHeight?: number | string
  accumulate?: 'none' | 'sum'
  additive?: 'replace' | 'sum'
  alignmentBaseline?:
    | 'auto'
    | 'baseline'
    | 'before-edge'
    | 'text-before-edge'
    | 'middle'
    | 'central'
    | 'after-edge'
    | 'text-after-edge'
    | 'ideographic'
    | 'alphabetic'
    | 'hanging'
    | 'mathematical'
    | 'inherit'
  allowReorder?: 'no' | 'yes'
  alphabetic?: number | string
  amplitude?: number | string
  arabicForm?: 'initial' | 'medial' | 'terminal' | 'isolated'
  ascent?: number | string
  attributeName?: string
  attributeType?: string
  autoReverse?: number | string
  azimuth?: number | string
  baseFrequency?: number | string
  baselineShift?: number | string
  baseProfile?: number | string
  bbox?: number | string
  begin?: number | string
  bias?: number | string
  by?: number | string
  calcMode?: number | string
  capHeight?: number | string
  clip?: number | string
  clipPath?: string
  clipPathUnits?: number | string
  clipRule?: number | string
  colorInterpolation?: number | string
  colorInterpolationFilters?: 'auto' | 'sRGB' | 'linearRGB' | 'inherit'
  colorProfile?: number | string
  colorRendering?: number | string
  contentScriptType?: number | string
  contentStyleType?: number | string
  cursor?: number | string
  cx?: number | string
  cy?: number | string
  d?: string
  decelerate?: number | string
  descent?: number | string
  diffuseConstant?: number | string
  direction?: number | string
  display?: number | string
  divisor?: number | string
  dominantBaseline?: number | string
  dur?: number | string
  dx?: number | string
  dy?: number | string
  edgeMode?: number | string
  elevation?: number | string
  enableBackground?: number | string
  end?: number | string
  exponent?: number | string
  externalResourcesRequired?: number | string
  fill?: string
  fillOpacity?: number | string
  fillRule?: 'nonzero' | 'evenodd' | 'inherit'
  filter?: string
  filterRes?: number | string
  filterUnits?: number | string
  floodColor?: number | string
  floodOpacity?: number | string
  focusable?: number | string
  fontFamily?: string
  fontSize?: number | string
  fontSizeAdjust?: number | string
  fontStretch?: number | string
  fontStyle?: number | string
  fontVariant?: number | string
  fontWeight?: number | string
  format?: number | string
  from?: number | string
  fx?: number | string
  fy?: number | string
  g1?: number | string
  g2?: number | string
  glyphName?: number | string
  glyphOrientationHorizontal?: number | string
  glyphOrientationVertical?: number | string
  glyphRef?: number | string
  gradientTransform?: string
  gradientUnits?: string
  hanging?: number | string
  horizAdvX?: number | string
  horizOriginX?: number | string
  ideographic?: number | string
  imageRendering?: number | string
  in2?: number | string
  in?: string
  intercept?: number | string
  k1?: number | string
  k2?: number | string
  k3?: number | string
  k4?: number | string
  k?: number | string
  kernelMatrix?: number | string
  kernelUnitLength?: number | string
  kerning?: number | string
  keyPoints?: number | string
  keySplines?: number | string
  keyTimes?: number | string
  lengthAdjust?: number | string
  letterSpacing?: number | string
  lightingColor?: number | string
  limitingConeAngle?: number | string
  local?: number | string
  markerEnd?: string
  markerHeight?: number | string
  markerMid?: string
  markerStart?: string
  markerUnits?: number | string
  markerWidth?: number | string
  mask?: string
  maskContentUnits?: number | string
  maskUnits?: number | string
  mathematical?: number | string
  mode?: number | string
  numOctaves?: number | string
  offset?: number | string
  opacity?: number | string
  operator?: number | string
  order?: number | string
  orient?: number | string
  orientation?: number | string
  origin?: number | string
  overflow?: number | string
  overlinePosition?: number | string
  overlineThickness?: number | string
  paintOrder?: number | string
  panose1?: number | string
  pathLength?: number | string
  patternContentUnits?: string
  patternTransform?: number | string
  patternUnits?: string
  pointerEvents?: number | string
  points?: string
  pointsAtX?: number | string
  pointsAtY?: number | string
  pointsAtZ?: number | string
  preserveAlpha?: number | string
  preserveAspectRatio?: string
  primitiveUnits?: number | string
  r?: number | string
  radius?: number | string
  refX?: number | string
  refY?: number | string
  renderingIntent?: number | string
  repeatCount?: number | string
  repeatDur?: number | string
  requiredExtensions?: number | string
  requiredFeatures?: number | string
  restart?: number | string
  result?: string
  rotate?: number | string
  rx?: number | string
  ry?: number | string
  scale?: number | string
  seed?: number | string
  shapeRendering?: number | string
  slope?: number | string
  spacing?: number | string
  specularConstant?: number | string
  specularExponent?: number | string
  speed?: number | string
  spreadMethod?: string
  startOffset?: number | string
  stdDeviation?: number | string
  stemh?: number | string
  stemv?: number | string
  stitchTiles?: number | string
  stopColor?: string
  stopOpacity?: number | string
  strikethroughPosition?: number | string
  strikethroughThickness?: number | string
  string?: number | string
  stroke?: string
  strokeDasharray?: string | number
  strokeDashoffset?: string | number
  strokeLinecap?: 'butt' | 'round' | 'square' | 'inherit'
  strokeLinejoin?: 'miter' | 'round' | 'bevel' | 'inherit'
  strokeMiterlimit?: number | string
  strokeOpacity?: number | string
  strokeWidth?: number | string
  surfaceScale?: number | string
  systemLanguage?: number | string
  tableValues?: number | string
  targetX?: number | string
  targetY?: number | string
  textAnchor?: string
  textDecoration?: number | string
  textLength?: number | string
  textRendering?: number | string
  to?: number | string
  transform?: string
  u1?: number | string
  u2?: number | string
  underlinePosition?: number | string
  underlineThickness?: number | string
  unicode?: number | string
  unicodeBidi?: number | string
  unicodeRange?: number | string
  unitsPerEm?: number | string
  vAlphabetic?: number | string
  values?: string
  vectorEffect?: number | string
  version?: string
  vertAdvY?: number | string
  vertOriginX?: number | string
  vertOriginY?: number | string
  vHanging?: number | string
  vIdeographic?: number | string
  viewBox?: string
  viewTarget?: number | string
  visibility?: number | string
  vMathematical?: number | string
  widths?: number | string
  wordSpacing?: number | string
  writingMode?: number | string
  x1?: number | string
  x2?: number | string
  x?: number | string
  xChannelSelector?: string
  xHeight?: number | string
  xlinkActuate?: string
  xlinkArcrole?: string
  xlinkHref?: string
  xlinkRole?: string
  xlinkShow?: string
  xlinkTitle?: string
  xlinkType?: string
  xmlBase?: string
  xmlLang?: string
  xmlns?: string
  xmlnsXlink?: string
  xmlSpace?: string
  y1?: number | string
  y2?: number | string
  y?: number | string
  yChannelSelector?: string
  z?: number | string
  zoomAndPan?: string
}

export type WebViewHTMLAttributes<T extends EventTarget> = WithObservableAttributes<
  StaticWebViewHTMLAttributes<T>,
  T
>

interface StaticWebViewHTMLAttributes<T extends EventTarget> extends StaticHTMLAttributes<T> {
  allowFullScreen?: boolean
  allowpopups?: boolean
  autoFocus?: boolean
  autosize?: boolean
  blinkfeatures?: string
  disableblinkfeatures?: string
  disableguestresize?: boolean
  disablewebsecurity?: boolean
  guestinstance?: string
  httpreferrer?: string
  nodeintegration?: boolean
  partition?: string
  plugins?: boolean
  preload?: string
  src?: string
  useragent?: string
  webpreferences?: string
}
