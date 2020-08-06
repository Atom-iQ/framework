import {
  CreatedChildrenManager, CreatedFragmentChild, CreatedNodeChild,
  HTMLAttributes,
  RvdChild,
  RvdComponentElement,
  RvdDOMElement,
  RvdElement,
  RvdFragmentElement,
  RvdFragmentNode,
  RvdHTMLElement,
  RvdNode, RvdStaticChild,
  RvdSVGElement,
  RvdSVGElementType
} from '@@types'
import {
  isArray,
  isBoolean,
  isFunction,
  isNullOrUndef,
  isString,
  isStringOrNumber
} from '@@shared/utils'
import { SVGElementTypes } from '@@shared/utils/elements'

export function isComponent(
  rvdElement: RvdElement
): rvdElement is RvdComponentElement {
  return Boolean(isFunction(rvdElement.type) && rvdElement._component)
}

export function isElement(
  rvdElement: RvdElement
): rvdElement is RvdHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement> | RvdSVGElement {
  return isString(rvdElement.type) && rvdElement.type !== '_Fragment'
}

export function isFragment(
  rvdElement: RvdElement
): rvdElement is RvdFragmentElement {
  return isString(rvdElement.type) && rvdElement.type === '_Fragment'
}

export function isRvdElement(
  rvdChild: RvdChild
): rvdChild is RvdElement {
  if (typeof rvdChild === 'object') {
    const rvdElement: RvdElement = rvdChild as RvdElement
    return (isComponent(rvdElement) || isElement(rvdElement) || isFragment(rvdElement))
  }

  return false
}

export function isSvgElement(
  rvdElement: RvdDOMElement
): rvdElement is RvdSVGElement {
  return SVGElementTypes.includes(rvdElement.type as RvdSVGElementType)
}

export function isRvdNode(
  node: RvdNode | RvdFragmentNode
): node is RvdNode {
  return node.dom !== undefined && node.elementSubscription !== undefined
}

export function isRvdFragmentNode(
  node: RvdNode | RvdFragmentNode
): node is RvdFragmentNode {
  return !isRvdNode(node)
}

type ChildTypeSwitchCallback<T, R> = (child?: T) => R;

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
      return nullCallback()
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
      return hasNothingCallback !== undefined && hasNothingCallback()
    }
  }
}
