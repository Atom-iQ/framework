import { renderRvdComponent } from '../../../../src/reactive-virtual-dom/renderer/component'
import * as COMPONENTS from '../../../__mocks__/components'
import { asapScheduler, scheduled, Subscription } from 'rxjs'

import {
  staticChild,
  staticChildWithClassname,
  staticChildWithKey
} from '../../../__mocks__/components'
import {
  RvdComponent,
  RvdComponentProps,
  ComponentRefProp,
  RvdComponentNode,
  RvdNodeFlags
} from '../../../../src'

function createRvdComponent(
  type: RvdComponent,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: RvdComponentProps<any> | null,
  key?: string | number | null,
  ref?: ComponentRefProp
): RvdComponentNode {
  return {
    flag: RvdNodeFlags.Component,
    type,
    props,
    key,
    ref
  }
}

/* eslint-disable max-len */
describe('Component renderer (renderRvdComponent fn)', () => {
  let testSub: Subscription
  let subSpy: jest.SpyInstance

  beforeEach(() => {
    testSub = new Subscription()
    subSpy = jest.spyOn(testSub, 'add')
  })

  test('createRvdComponent should call renderNewCallback (last arg) with null returned by component', done => {
    renderRvdComponent(
      createRvdComponent(COMPONENTS.Null),
      '0',
      testSub,
      {},
      (child, childIndex) => {
        expect(child).toBeNull()
        expect(childIndex).toBe('0')
        expect(subSpy).toBeCalledTimes(0)
        done()
      }
    )
  })

  test('createRvdComponent should call renderNewCallback (last arg) with static child returned by component', done => {
    renderRvdComponent(
      createRvdComponent(COMPONENTS.WithElement),
      '0',
      testSub,
      {},
      (child, childIndex) => {
        expect(child).toEqual(staticChild)
        expect(childIndex).toBe('0')
        expect(subSpy).toBeCalledTimes(0)
        done()
      }
    )
  })

  test('createRvdComponent should call renderNewCallback (last arg) with static child returned by component and props passed from component to child', done => {
    const className = scheduled(['test-class'], asapScheduler)
    renderRvdComponent(
      createRvdComponent(COMPONENTS.WithPropsAndElement, { className }),
      '0',
      testSub,
      {},
      (child, childIndex) => {
        expect(child).toEqual(staticChildWithClassname(className))
        expect(childIndex).toBe('0')
        expect(subSpy).toBeCalledTimes(0)
        done()
      }
    )
  })

  test('createRvdComponent should call renderNewCallback (last arg) with last Observable child value returned by component and should add subscription to parent children subscription', done => {
    renderRvdComponent(
      createRvdComponent(COMPONENTS.WithObservableChild),
      '0',
      testSub,
      {},
      (child, childIndex) => {
        expect(child).toEqual(staticChild)
        expect(childIndex).toBe('0')
        expect(subSpy).toBeCalledTimes(1)
        done()
      }
    )
  })

  test('createRvdComponent should call renderNewCallback with element with key passed from component (when returned element has no key)', done => {
    const componentKey = 'component'
    renderRvdComponent(
      createRvdComponent(COMPONENTS.WithElement, null, componentKey),
      '0',
      testSub,
      {},
      (child, childIndex) => {
        expect(child).toEqual({ ...staticChild, key: componentKey })
        expect(childIndex).toBe('0')
        expect(subSpy).toBeCalledTimes(0)
        done()
      }
    )
  })

  test('createRvdComponent should call renderNewCallback with element with combined component and element key (when returned element has key)', done => {
    const componentKey = 'component'
    const elementKey = 'element'
    renderRvdComponent(
      createRvdComponent(COMPONENTS.WithElementWithKey, null, componentKey),
      '0',
      testSub,
      {},
      (child, childIndex) => {
        expect(child).toEqual({ ...staticChildWithKey(), key: `${componentKey}.${elementKey}` })
        expect(childIndex).toBe('0')
        expect(subSpy).toBeCalledTimes(0)
        done()
      }
    )
  })

  test('createRvdComponent should call renderNewCallback with element with element`s key when it`s the same as component key (when returned element has key)', done => {
    const componentKey = 'element'
    const elementKey = 'element'
    renderRvdComponent(
      createRvdComponent(COMPONENTS.WithElementWithKey, null, componentKey),
      '0',
      testSub,
      {},
      (child, childIndex) => {
        expect(child).toEqual({ ...staticChildWithKey(), key: elementKey })
        expect(child).toEqual({ ...staticChildWithKey(), key: componentKey })
        expect(childIndex).toBe('0')
        expect(subSpy).toBeCalledTimes(0)
        done()
      }
    )
  })
})
