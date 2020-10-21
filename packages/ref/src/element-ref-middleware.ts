import type { ElementRef, ElementRefPropState, RvdDOMElement, RvdDOMProp } from '@atom-iq/core'
import { fromEvent, isObservable, Observable, ReplaySubject, Subscription } from 'rxjs'
import { first } from 'rxjs/operators'

const createPropState = (
  elementSubscription: Subscription,
  propValue?: Observable<RvdDOMProp> | RvdDOMProp
): ElementRefPropState => {
  const stateSubject = new ReplaySubject<RvdDOMProp>(1)

  if (propValue) {
    if (isObservable(propValue)) {
      elementSubscription.add(propValue.subscribe(value => stateSubject.next(value)))
    } else {
      stateSubject.next(propValue as RvdDOMProp)
    }
  }

  const nextState = (valueOrCallback: RvdDOMProp | ((value: RvdDOMProp) => RvdDOMProp)) => {
    if (typeof valueOrCallback === 'function') {
      first<RvdDOMProp>()(stateSubject.asObservable()).subscribe((value: RvdDOMProp) => {
        const nextValue = (valueOrCallback as (v: RvdDOMProp) => RvdDOMProp)(value)
        stateSubject.next(nextValue)
      })
    } else {
      stateSubject.next(valueOrCallback)
    }
  }

  return [stateSubject.asObservable(), nextState]
}

export const elementRefMiddleware = (
  rvdElement: RvdDOMElement,
  domElement: Element,
  elementSubscription: Subscription
): RvdDOMElement => {
  if (rvdElement.ref) {
    const ref: ElementRef = {
      props: {},
      events: {},
      domElement
    }

    elementSubscription.add(rvdElement.ref.complete)

    if (rvdElement.ref.controlProps) {
      rvdElement.ref.controlProps.forEach(propName => {
        if (propName === 'className') {
          const propState = createPropState(elementSubscription, rvdElement.className)
          ref.props['className'] = propState
          rvdElement.className = propState[0] as Observable<string>
        } else {
          const propState = createPropState(elementSubscription, rvdElement.props[propName])
          ref.props[propName] = propState
          rvdElement.props[propName] = propState[0]
        }
      })
    }

    for (const propName in rvdElement.props) {
      if (!rvdElement.ref.controlProps || !rvdElement.ref.controlProps.includes(propName)) {
        ref.props[propName] = rvdElement.props[propName]
      }
    }

    if (rvdElement.ref.getEvents) {
      rvdElement.ref.getEvents.forEach(eventName => {
        ref.events[eventName] = fromEvent(domElement, eventName)
      })
    }

    rvdElement.ref(ref)
  }

  return rvdElement
}
