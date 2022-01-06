import type {
  ElementRef,
  ElementRefPropState,
  RvdElementNode,
  RvdDOMProp,
  RvdContext
} from '@atom-iq/core'
import { isObservable, Observable, ReplaySubject, Subscription } from 'rxjs'
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
  context: RvdContext,
  rvdElement: RvdElementNode
): RvdElementNode => {
  if (rvdElement.ref) {
    const ref: ElementRef = {
      props: {},
      events: {},
      domElement: rvdElement.dom
    }

    rvdElement.sub.add(rvdElement.ref.complete)

    if (rvdElement.ref.controlProps) {
      rvdElement.ref.controlProps.forEach(propName => {
        if (propName === 'className') {
          const propState = createPropState(rvdElement.sub, rvdElement.className)
          ref.props['className'] = propState
          rvdElement.className = propState[0] as Observable<string>
        } else {
          const propState = createPropState(rvdElement.sub, rvdElement.props[propName])
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

    // if (rvdElement.ref.getEvents) {
    //   rvdElement.ref.getEvents.forEach(eventName => {
    //     ref.events[eventName] = fromEvent(rvdElement.dom, eventName)
    //   })
    // }

    rvdElement.ref(ref)
  }

  return rvdElement
}
