import {
  CreatedChildrenManager,
  CreatedFragmentChild,
  CreatedNodeChild,
  HTMLAttributes,
  RvdChild,
  RvdComponentElement,
  RvdDOMElement,
  RvdElement,
  RvdElementFlags,
  RvdFragmentElement,
  RvdFragmentNode,
  RvdHTMLElement,
  RvdNode,
  RvdStaticChild,
  RvdSVGElement
} from '../../../shared/types'
import { isArray, isBoolean, isNullOrUndef, isStringOrNumber } from '../../../shared/utils'

/*
 * ELEMENTS
 */

/**
 * Check if given child is element (Component, Fragment, DOM Element)
 * @param rvdChild
 */
export function isRvdElement(rvdChild: RvdChild): rvdChild is RvdElement {
  return !!(rvdChild && (rvdChild as RvdElement).type)
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

/*
 * NODES
 */

/**
 * Check if given node is RvdNode (Element Node)
 * @param node
 */
export function isRvdNode(node: RvdNode | RvdFragmentNode): node is RvdNode {
  return node.dom !== undefined && node.elementSubscription !== undefined
}

/**
 * Check if given node is RvdFragmentNode
 * @param node
 */
export function isRvdFragmentNode(node: RvdNode | RvdFragmentNode): node is RvdFragmentNode {
  return !isRvdNode(node)
}

type ChildTypeSwitchCallback<T, R> = (child?: T) => R

export function childTypeSwitch<O, F = O, C = F>(
  nullCallback: ChildTypeSwitchCallback<undefined, O>,
  textCallback: ChildTypeSwitchCallback<string | number, O>,
  arrayCallback: ChildTypeSwitchCallback<RvdChild[], F>,
  componentCallback: ChildTypeSwitchCallback<RvdComponentElement, C>,
  fragmentCallback: ChildTypeSwitchCallback<RvdFragmentElement, F>,
  elementCallback: ChildTypeSwitchCallback<RvdDOMElement, O>
): (child: RvdStaticChild) => O | F | C {
  return child => {
    if (isNullOrUndef(child) || isBoolean(child)) {
      return nullCallback && nullCallback()
    } else if (isStringOrNumber(child)) {
      return textCallback(child)
    } else if (isArray(child)) {
      return arrayCallback(child)
    } else if (isRvdElement(child)) {
      if (isComponent(child)) {
        return componentCallback(child)
      } else if (isFragment(child)) {
        return fragmentCallback(child)
      } else if (isElement(child)) {
        return elementCallback(child)
      }
    }
  }
}

export function renderTypeSwitch(
  hasOneCallback: (existingChild?: CreatedNodeChild) => void,
  hasFragmentCallback: (existingFragment?: CreatedFragmentChild) => void,
  hasNothingCallback?: () => void
): (childIndex: string, createdChildren: CreatedChildrenManager) => void {
  return (childIndex, createdChildren) => {
    if (createdChildren.has(childIndex)) {
      return hasOneCallback(createdChildren.get(childIndex))
    } else if (createdChildren.hasFragment(childIndex)) {
      return hasFragmentCallback(createdChildren.getFragment(childIndex))
    } else {
      return hasNothingCallback !== void 0 && hasNothingCallback()
    }
  }
}
