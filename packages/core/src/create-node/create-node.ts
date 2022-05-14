import type {
  ComponentRef,
  ElementRef,
  RvdChild,
  RvdClassName,
  RvdComponent,
  RvdComponentNode,
  RvdComponentProps,
  RvdDOMProps,
  RvdElementNode,
  RvdElementNodeType,
  RvdFragmentNode,
  RvdListProps,
  RvdNode,
  RvdProps,
  RvdRefObject
} from 'types';
import { isArray } from 'shared';
import { RvdNodeFlags } from 'shared/flags';

export function createRvdElement(
  type: RvdElementNodeType,
  flag: RvdNodeFlags,
  className: RvdClassName = null,
  props: RvdDOMProps | null = null,
  children: RvdChild | RvdChild[] | null = null,
  key: string | number | null = null,
  ref: RvdRefObject<ElementRef> = null
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
    key,
    null
  ) as RvdFragmentNode
}

export function createRvdComponent<P>(
  type: RvdComponent<P>,
  props: RvdComponentProps<P> | null = null,
  key: string | number | null = null,
  ref: RvdRefObject<ComponentRef> = null
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
    className: RvdNode['className'],
    children: RvdNode['children'],
    key: RvdNode['key'],
    ref: RvdNode['ref']
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
