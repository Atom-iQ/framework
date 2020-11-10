import type {
  HTMLAttributes,
  InputHTMLAttributes,
  RvdChild,
  RvdComponentElement,
  RvdControlledFormElement,
  RvdDOMElement,
  RvdElement,
  RvdFragmentElement,
  RvdHTMLElement,
  RvdHTMLProps,
  RvdSVGElement
} from '../../../shared/types'
import { isNullOrUndef } from '../../../shared'
// noinspection ES6PreferShortImport
import { RvdElementFlags } from '../../../shared/flags'
import { isObservable } from 'rxjs'

/*
 * ELEMENTS
 */

/**
 * Check if given child is element (Component, Fragment, DOM Element)
 * @param rvdChild
 */
export function isRvdElement(rvdChild: RvdChild): rvdChild is RvdElement {
  return rvdChild && (rvdChild as RvdElement).elementFlag !== void 0
}

/**
 * Check if given element is Component
 * @param rvdElement
 */
export function isComponent(rvdElement: RvdElement): rvdElement is RvdComponentElement {
  return rvdElement.elementFlag === RvdElementFlags.Component
}

/**
 * Check if given element is Fragment
 * @param rvdElement
 */
export function isFragment(rvdElement: RvdElement): rvdElement is RvdFragmentElement {
  return (RvdElementFlags.AnyFragment & rvdElement.elementFlag) !== 0
}

/**
 * Check if given element is DOM Element
 * @param rvdElement
 */
export function isElement(rvdElement: RvdElement): rvdElement is RvdDOMElement {
  return (RvdElementFlags.Element & rvdElement.elementFlag) !== 0
}

/**
 * Check if given DOM Element is HTML Element
 *
 * Not used just now, but may be useful in future (middlewares etc.)
 * @param rvdElement
 */
export function isHtmlElement(
  rvdElement: RvdDOMElement
): rvdElement is RvdHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement> {
  return (RvdElementFlags.NonSvgElement & rvdElement.elementFlag) !== 0
}

/**
 * Check if given DOM Element is SVG Element
 * @param rvdElement
 */
export function isSvgElement(rvdElement: RvdDOMElement): rvdElement is RvdSVGElement {
  return rvdElement.elementFlag === RvdElementFlags.SvgElement
}

/**
 * Check if given DOM Element is SVG Element
 * @param rvdElement
 */
export function isControlledFormElement(
  rvdElement: RvdDOMElement
): rvdElement is RvdControlledFormElement {
  const props = rvdElement.props as RvdHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >

  if (rvdElement.elementFlag === RvdElementFlags.InputElement) {
    return isObservable(props.type)
      ? !isNullOrUndef(props.onInput$) ||
          !isNullOrUndef(props.onChange$) ||
          isObservable(props.value) ||
          isObservable(props.checked)
      : props.type && isCheckedType(props.type as string)
      ? !isNullOrUndef(props.onChange$) || isObservable(props.checked)
      : !isNullOrUndef(props.onInput$) || isObservable(props.value)
  }

  if (rvdElement.elementFlag === RvdElementFlags.TextareaElement) {
    return !isNullOrUndef(props.onInput$) || isObservable(props.value)
  }

  if (rvdElement.elementFlag === RvdElementFlags.SelectElement) {
    return !isNullOrUndef(props.onChange$) || isObservable(props.value)
  }
}

export const isCheckedType = (type: string): boolean => type === 'checkbox' || type === 'radio'
