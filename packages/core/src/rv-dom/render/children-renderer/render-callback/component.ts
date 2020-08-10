import {
  CreatedChildrenManager,
  RenderCallback,
  RvdComponentElement, RvdFragmentElement,
  RvdFragmentNode,
  RvdNode, RxSub
} from '@@types'
import { renderRvdComponent } from '../../render'
import { switchMap } from 'rxjs/operators'
import {
  isRvdFragmentNode,
  renderTypeSwitch,
  switchNestedFragments,
  syncObservable
} from '../../utils'
import { renderChildInIndexPosition } from '../dom-renderer'

const switchComponentNode = (
  childIndex: string,
  createdChildren: CreatedChildrenManager
) => (node: RvdNode | RvdFragmentNode) => isRvdFragmentNode(node) ?
  switchNestedFragments(childIndex, createdChildren)(node) :
  syncObservable(node)

const replaceElement = (
  child: RvdComponentElement,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub
) => () => {
  const childSub = switchMap(
    switchComponentNode(childIndex, createdChildren)
  )(renderRvdComponent(child)).subscribe((componentChild: RvdNode) => {
    const componentChildIndex = componentChild.indexInFragment || childIndex
    renderChildInIndexPosition(
      newChild => createdChildren.add(componentChildIndex, {
        ...newChild,
        fromFragment: true
      }),
      componentChild.dom,
      componentChildIndex,
      element,
      createdChildren
    )
  })

  childrenSubscription.add(childSub)
}

const replaceFragment = (
  child: RvdComponentElement,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub
) => () => {
  const childSub = switchMap(
    switchComponentNode(childIndex, createdChildren)
  )(renderRvdComponent(child)).subscribe((componentChild: RvdNode) => {
    const componentChildIndex = componentChild.indexInFragment || childIndex
    renderChildInIndexPosition(
      newChild => createdChildren.add(componentChildIndex, {
        ...newChild,
        fromFragment: true
      }),
      componentChild.dom,
      componentChildIndex,
      element,
      createdChildren
    )
  })

  childrenSubscription.add(childSub)
}

const render = (
  child: RvdComponentElement,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub
) => () => {
  const childSub = switchMap(
    switchComponentNode(childIndex, createdChildren)
  )(renderRvdComponent(child)).subscribe((componentChild: RvdNode) => {
    const componentChildIndex = componentChild.indexInFragment || childIndex
    renderChildInIndexPosition(
      newChild => createdChildren.add(componentChildIndex, {
        ...newChild,
        fromFragment: true
      }),
      componentChild.dom,
      componentChildIndex,
      element,
      createdChildren
    )
  })

  childrenSubscription.add(childSub)
}

export const componentRenderCallback: RenderCallback = (
  childIndex,
  element,
  createdChildren,
  childrenSubscription
) => (child: RvdComponentElement): void => {
  renderTypeSwitch(
    replaceElement(child, childIndex, element, createdChildren, childrenSubscription),
    replaceFragment(child, childIndex, element, createdChildren, childrenSubscription),
    render(child, childIndex, element, createdChildren, childrenSubscription)
  )(childIndex, createdChildren)
}

export const staticComponentRenderCallback: RenderCallback = (
  childIndex,
  element,
  createdChildren,
  childrenSubscription
) => (child: RvdComponentElement): void => {
  render(child, childIndex, element, createdChildren, childrenSubscription)()
}
