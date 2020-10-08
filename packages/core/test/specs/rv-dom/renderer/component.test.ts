/* eslint-disable max-len */
import { renderRvdComponent } from '../../../../src/rv-dom/renderer/component'
import * as COMPONENTS from '../../../__mocks__/components'
import { RxSub } from '../../../../src/shared/types'
import { asapScheduler, scheduled, Subscription } from 'rxjs'
import { createRvdComponent } from '../../../../src/rv-dom/create-element'
import {
  staticChild,
  staticChildWithClassname,
  staticChildWithKey
} from '../../../__mocks__/components'

describe('Component renderer (renderRvdComponent fn)', () => {
  let testSub: RxSub
  let subSpy: jest.SpyInstance

  beforeEach(() => {
    testSub = new Subscription()
    subSpy = jest.spyOn(testSub, 'add')
  })

  test('createRvdComponent should call renderNewCallback (last arg) with null returned by component', done => {
    renderRvdComponent('0', testSub, (child, childIndex) => {
      expect(child).toBeNull()
      expect(childIndex).toBe('0')
      expect(subSpy).toBeCalledTimes(0)
      done()
    })(createRvdComponent(COMPONENTS.Null))
  })

  test('createRvdComponent should call renderNewCallback (last arg) with static child returned by component', done => {
    renderRvdComponent('0', testSub, (child, childIndex) => {
      expect(child).toEqual(staticChild)
      expect(childIndex).toBe('0')
      expect(subSpy).toBeCalledTimes(0)
      done()
    })(createRvdComponent(COMPONENTS.WithElement))
  })

  test('createRvdComponent should call renderNewCallback (last arg) with static child returned by component and props passed from component to child', done => {
    const className = scheduled(['test-class'], asapScheduler)
    renderRvdComponent('0', testSub, (child, childIndex) => {
      expect(child).toEqual(staticChildWithClassname(className))
      expect(childIndex).toBe('0')
      expect(subSpy).toBeCalledTimes(0)
      done()
    })(createRvdComponent(COMPONENTS.WithPropsAndElement, { className }))
  })

  test('createRvdComponent should call renderNewCallback (last arg) with last Observable child value returned by component and should add subscription to parent children subscription', done => {
    renderRvdComponent('0', testSub, (child, childIndex) => {
      expect(child).toEqual(staticChild)
      expect(childIndex).toBe('0')
      expect(subSpy).toBeCalledTimes(1)
      done()
    })(createRvdComponent(COMPONENTS.WithObservableChild))
  })

  test('createRvdComponent should call renderNewCallback with element with key passed from component (when returned element has no key)', done => {
    const componentKey = 'component'
    renderRvdComponent('0', testSub, (child, childIndex) => {
      expect(child).toEqual({ ...staticChild, key: componentKey })
      expect(childIndex).toBe('0')
      expect(subSpy).toBeCalledTimes(0)
      done()
    })(createRvdComponent(COMPONENTS.WithElement, null, componentKey))
  })

  test('createRvdComponent should call renderNewCallback with element with combined component and element key (when returned element has key)', done => {
    const componentKey = 'component'
    const elementKey = 'element'
    renderRvdComponent('0', testSub, (child, childIndex) => {
      expect(child).toEqual({ ...staticChildWithKey, key: `${componentKey}.${elementKey}` })
      expect(childIndex).toBe('0')
      expect(subSpy).toBeCalledTimes(0)
      done()
    })(createRvdComponent(COMPONENTS.WithElementWithKey, null, componentKey))
  })
})
