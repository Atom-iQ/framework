import { RvdComponent, RvdComponentNode, RvdElementNode } from '../../src/shared/types'
import { asapScheduler, Observable, scheduled, SchedulerLike } from 'rxjs'
import { RvdNodeFlags } from 'shared/flags'
import { createRvdElement } from '../utils'

export const Null: RvdComponent = () => null

export const staticChild = createRvdElement(RvdNodeFlags.HtmlElement, 'div', 'test-div')

export const staticChildWithKey = (): RvdElementNode =>
  createRvdElement(RvdNodeFlags.HtmlElement, 'div', 'test-div', null, null, null, 'element')

export const staticChildWithClassname = (className: Observable<string> | string): RvdElementNode =>
  createRvdElement(RvdNodeFlags.HtmlElement, 'div', className)

export const observableChild = scheduled(
  [createRvdElement(RvdNodeFlags.HtmlElement, 'div', 'test-div')],
  asapScheduler as unknown as SchedulerLike
)

export const WithElement: RvdComponent = () => staticChild

export const WithElementWithKey: RvdComponent = () => staticChildWithKey()

export const WithPropsAndElement: RvdComponent<{ className: Observable<string> }> = ({
  className
}) => staticChildWithClassname(className)

export const WithObservableChild: RvdComponent = () => observableChild

export const COMPONENT_ELEMENT: RvdComponentNode = {
  flag: RvdNodeFlags.Component,
  type: WithElement
}
