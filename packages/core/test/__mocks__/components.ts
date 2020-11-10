import { RvdComponent, RvdComponentElement, RvdDOMElement } from '../../src/shared/types'
import { createRvdElement } from '../../src/reactive-virtual-dom/create-element'
import { asapScheduler, Observable, scheduled } from 'rxjs'
import { RvdElementFlags } from '../../src/shared/flags'

export const Null: RvdComponent = () => null

export const staticChild = createRvdElement(RvdElementFlags.HtmlElement, 'div', 'test-div')

export const staticChildWithKey = (): RvdDOMElement =>
  createRvdElement(RvdElementFlags.HtmlElement, 'div', 'test-div', null, null, null, 'element')

export const staticChildWithClassname = (className: Observable<string> | string): RvdDOMElement =>
  createRvdElement(RvdElementFlags.HtmlElement, 'div', className)

export const observableChild = scheduled(
  [createRvdElement(RvdElementFlags.HtmlElement, 'div', 'test-div')],
  asapScheduler
)

export const WithElement: RvdComponent = () => staticChild

export const WithElementWithKey: RvdComponent = () => staticChildWithKey()

export const WithPropsAndElement: RvdComponent<{ className: Observable<string> }> = ({
  className
}) => staticChildWithClassname(className)

export const WithObservableChild: RvdComponent = () => observableChild

export const COMPONENT_ELEMENT: RvdComponentElement = {
  elementFlag: RvdElementFlags.Component,
  type: WithElement
}
