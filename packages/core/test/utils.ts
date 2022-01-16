import { Observable } from '@atom-iq/rx'

import {
  HTMLAttributes,
  RvdHTMLElementNode,
  ElementRefProp,
  RvdChild,
  RvdDOMProps,
  RvdElementNode,
  RvdElementNodeType
} from 'types'
import { createDomElement } from 'rvd/renderer/utils'
import { RvdNodeFlags } from 'shared/flags'

export const domDivEmpty = (): HTMLDivElement => createDomElement('div', false) as HTMLDivElement

export type RvdTestDivElement = RvdHTMLElementNode<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export const domDivClassName = (className: string): HTMLDivElement => {
  const el = createDomElement('div', false) as HTMLDivElement
  el.className = className
  return el
}

export const domDivClassNameProps = (rvdElement: RvdTestDivElement): HTMLDivElement => {
  const divElement = createDomElement('div', false) as HTMLDivElement
  divElement.className = rvdElement.className as string
  divElement.id = rvdElement.props.id as string
  divElement.setAttribute('title', rvdElement.props.title as string)
  return divElement
}

export function createRvdElement(
  flag:
    | RvdNodeFlags.HtmlElement
    | RvdNodeFlags.SvgElement
    | RvdNodeFlags.Input
    | RvdNodeFlags.Textarea
    | RvdNodeFlags.Select,
  type: RvdElementNodeType,
  className?: string | null | Observable<string | null>,
  props?: RvdDOMProps | null,
  children?: RvdChild | RvdChild[] | null,
  key?: string | number | null,
  ref?: ElementRefProp
): RvdElementNode {
  return {
    flag,
    type,
    className,
    props,
    children,
    key,
    ref
  }
}
