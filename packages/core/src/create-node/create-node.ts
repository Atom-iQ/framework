import type {
  RvdComponentRef,
  RvdElementRef,
  RvdChild,
  RvdClassName,
  RvdComponent,
  RvdComponentNode,
  RvdComponentProps,
  RvdDOMProps,
  RvdElementNode,
  RvdElementNodeType,
  RvdFragmentNode,
  RvdListNode,
  RvdListProps,
  RvdNode,
  RvdProps,
  RvdRefObject
} from 'types'
import { isArray } from 'shared'
import { RvdListType, RvdNodeFlags } from 'shared/flags'

export function createRvdElement(
  type: RvdElementNodeType,
  flag: RvdNodeFlags,
  className: RvdClassName = null,
  props: RvdDOMProps | null = null,
  children: RvdChild | RvdChild[] | null = null,
  key: string | number | null = null,
  ref: RvdRefObject<RvdElementRef> = null
): RvdElementNode {
  return new RVD(
    flag,
    type,
    props,
    className,
    children,
    key,
    ref
  ) as RvdElementNode
}

export function createRvdFragment(
  children: RvdChild[],
  key: string | number | null = null
): RvdFragmentNode {
  return new RVD(
    RvdNodeFlags.Fragment,
    null,
    null,
    null,
    children,
    key
  ) as RvdFragmentNode
}

export function createRvdComponent<P>(
  type: RvdComponent<P>,
  props: RvdComponentProps<P> | null = null,
  key: string | number | null = null,
  ref: RvdRefObject<RvdComponentRef> = null
): RvdComponentNode {
  return new RVD(
    RvdNodeFlags.Component,
    type,
    props,
    null,
    null,
    key,
    ref
  ) as RvdComponentNode
}

export function createRvdList<T>(
  props: RvdListProps<T>,
  children?: RvdListProps<T>['children']
): RvdListNode<T> {
  if (children) {
    props.render = children
  }
  return new RVD(
    RvdNodeFlags.List,
    props.keyBy ? RvdListType.Keyed : RvdListType.NonKeyed,
    props,
  ) as RvdListNode<T>
}

export function normalizeProps(rvdElement: RvdNode): RvdNode {
  if (rvdElement.props && RvdNodeFlags.Element & rvdElement.flag) {
    if (rvdElement.props['class'] || rvdElement.props['className']) {
      rvdElement.className = rvdElement.props['class'] || rvdElement.props['className']
      delete rvdElement.props['class']
      delete rvdElement.props['className']
    }

    if ((rvdElement.props as Exclude<RvdProps, RvdListProps>).children) {
      if (
        !rvdElement.children ||
        (isArray(rvdElement.children) && rvdElement.children.length === 0)
      ) {
        rvdElement.children = (rvdElement.props as Exclude<RvdProps, RvdListProps>).children as
          | RvdChild
          | RvdChild[]
      }
      delete (rvdElement.props as Exclude<RvdProps, RvdListProps>).children
    }
  }
  return rvdElement
}

class RVD implements RvdNode {
  public flag: RvdNode['flag']
  public type: RvdNode['type']
  public props: RvdNode['props']
  public className: RvdNode['className']
  public children: RvdNode['children']
  public key: RvdNode['key']
  public ref: RvdNode['ref']

  constructor(
    flag: RvdNode['flag'],
    type: RvdNode['type'],
    props: RvdNode['props'],
    className: RvdNode['className'] = null,
    children: RvdNode['children'] = null,
    key: RvdNode['key'] = null,
    ref: RvdNode['ref'] = null
  ) {
    this.flag = flag
    this.type = type
    this.props = props
    this.className = className
    this.children = children
    this.key = key
    this.ref = ref
  }
}
