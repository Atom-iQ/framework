import {
  CreatedChildrenManager,
  CreatedFragmentChild,
  CreatedNodeChild,
  RenderCallback,
  RvdChild,
  RvdFragmentElement,
  RvdNode,
  RxSub
} from '@@types'
import { switchMap } from 'rxjs/operators'
import { renderRvdFragment } from '../../render'
import { renderChildInIndexPosition } from '../dom-renderer'
import {
  childrenArrayToFragment,
  renderTypeSwitch,
  switchNestedFragments
} from '../../utils'


const replaceElement = (
  child: RvdFragmentElement,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub
) => (existingChild: CreatedNodeChild) => {
  const childSub = switchMap(
    switchNestedFragments(childIndex, createdChildren)
  )(renderRvdFragment(child)).subscribe((fragmentChild: RvdNode) => {
    renderChildInIndexPosition(
      newChild => createdChildren.add(fragmentChild.indexInFragment, {
        ...newChild,
        fromFragment: true
      }),
      fragmentChild.dom,
      fragmentChild.indexInFragment,
      element,
      createdChildren
    )
  })

  childrenSubscription.add(childSub)
}

const replaceFragment = (
  child: RvdFragmentElement,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub
) => (existingFragment: CreatedFragmentChild) => {
  const childSub = switchMap(
    switchNestedFragments(childIndex, createdChildren)
  )(renderRvdFragment(child)).subscribe((fragmentChild: RvdNode) => {
    renderChildInIndexPosition(
      newChild => createdChildren.add(fragmentChild.indexInFragment, {
        ...newChild,
        fromFragment: true
      }),
      fragmentChild.dom,
      fragmentChild.indexInFragment,
      element,
      createdChildren
    )
  })

  childrenSubscription.add(childSub)
}

const render = (
  child: RvdFragmentElement,
  childIndex: string,
  element: Element,
  createdChildren: CreatedChildrenManager,
  childrenSubscription: RxSub
) => () => {
  createdChildren.createEmptyFragment(childIndex)
  const childSub = switchMap(
    switchNestedFragments(childIndex, createdChildren)
  )(renderRvdFragment(child)).subscribe((fragmentChild: RvdNode) => {
    renderChildInIndexPosition(
      newChild => createdChildren.add(fragmentChild.indexInFragment, {
        ...newChild,
        fromFragment: true
      }),
      fragmentChild.dom,
      fragmentChild.indexInFragment,
      element,
      createdChildren
    )
  })

  childrenSubscription.add(childSub)
}

export const fragmentRenderCallback: RenderCallback = (
  childIndex,
  element,
  createdChildren,
  childrenSubscription
) => (child: RvdFragmentElement): void => {
  renderTypeSwitch(
    replaceElement(child, childIndex, element, createdChildren, childrenSubscription),
    replaceFragment(child, childIndex, element, createdChildren, childrenSubscription),
    render(child, childIndex, element, createdChildren, childrenSubscription)
  )(childIndex, createdChildren)
}

export const staticFragmentRenderCallback: RenderCallback = (
  childIndex,
  element,
  createdChildren,
  childrenSubscription
) => (child: RvdFragmentElement): void => {
  createdChildren.createEmptyFragment(childIndex)
  const childSub = switchMap(
    switchNestedFragments(childIndex, createdChildren)
  )(renderRvdFragment(child)).subscribe((fragmentChild: RvdNode) => {
    renderChildInIndexPosition(
      newChild => createdChildren.add(fragmentChild.indexInFragment, {
        ...newChild,
        fromFragment: true
      }),
      fragmentChild.dom,
      fragmentChild.indexInFragment,
      element,
      createdChildren
    )
  })

  childrenSubscription.add(childSub)
}

export const arrayRenderCallback: RenderCallback = (
  ...args: [string, Element, CreatedChildrenManager, RxSub]
) => (child: RvdChild[]): void => fragmentRenderCallback(
  ...args
)(childrenArrayToFragment(child))

export const staticArrayRenderCallback: RenderCallback = (
  ...args: [string, Element, CreatedChildrenManager, RxSub]
) => (child: RvdChild[]): void => staticFragmentRenderCallback(
  ...args
)(childrenArrayToFragment(child))
