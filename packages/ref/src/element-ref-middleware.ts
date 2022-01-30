import type {
  ElementRef,
  RvdElementNode,
  RvdDOMProp,
  RvdContext,
  RvdRefObjectWithObservable
} from '@atom-iq/core'
import {
  isObservable,
  Observable,
  observer,
  stateSubject,
  StateSubject,
  SubscriptionGroup
} from '@atom-iq/rx'

const createPropState = (
  elementSubscription: SubscriptionGroup,
  propValue?: Observable<RvdDOMProp> | RvdDOMProp
): StateSubject<RvdDOMProp> => {
  const isObservableProp = isObservable(propValue)

  const state: StateSubject<RvdDOMProp> = stateSubject<RvdDOMProp>(
    isObservableProp ? void 0 : propValue
  )

  if (isObservableProp) {
    elementSubscription.add(propValue.subscribe(observer(v => state.next(v))))
  }

  return state
}

export const elementRefMiddleware = (
  context: RvdContext,
  rvdElement: RvdElementNode
): RvdElementNode => {
  if (rvdElement.ref) {
    const ref: ElementRef = {
      props: {},
      domElement: rvdElement.dom
    }

    if (rvdElement.ref.__controlProps) {
      rvdElement.ref.__controlProps.forEach(propName => {
        if (propName === 'className') {
          const propState = createPropState(rvdElement.sub, rvdElement.className)
          ref.props['className'] = propState
          rvdElement.className = propState as Observable<string>
        } else {
          const propState = createPropState(rvdElement.sub, rvdElement.props[propName])
          ref.props[propName] = propState
          rvdElement.props[propName] = propState as Observable<RvdDOMProp>
        }
      })
    }

    for (const propName in rvdElement.props) {
      if (!rvdElement.ref.__controlProps || !rvdElement.ref.__controlProps.includes(propName)) {
        ref.props[propName] = rvdElement.props[propName]
      }
    }

    rvdElement.ref.current = ref
    if ((rvdElement.ref as RvdRefObjectWithObservable<ElementRef>).__subject) {
      // eslint-disable-next-line @typescript-eslint/no-extra-semi
      ;(rvdElement.ref as RvdRefObjectWithObservable<ElementRef>).__subject.next(
        rvdElement.ref.current
      )
    }
  }

  return rvdElement
}
