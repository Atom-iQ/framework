import { RvdComponentNode, RvdNodeFlags } from '@atom-iq/core'
import { componentRefMiddleware } from '../src/component-ref-middleware'

describe('Component Ref Middleware', () => {
  // eslint-disable-next-line max-len
  test('should return function returning null, when ref is not passed to component (to keep that component working)', () => {
    const mockComponentElement: RvdComponentNode = {
      type: () => null,
      flag: RvdNodeFlags.Component
    }
    const attachRef = componentRefMiddleware(mockComponentElement)
    expect(attachRef(() => null)).toBeNull()
  })

  // eslint-disable-next-line max-len
  test('should return function taking callback as arg (taking old, not attached Ref, returning new Ref) and calling Ref callback', () => {
    const mockRefCallback = jest.fn()
    const mockTestAttachedFn = jest.fn()
    const mockComponentElement = {
      type: () => null,
      flag: RvdNodeFlags.Component,
      props: {
        test: 'abc'
      },
      ref: mockRefCallback
    }
    const refSpy = jest.spyOn(mockComponentElement, 'ref')
    const attachRef = componentRefMiddleware(mockComponentElement as RvdComponentNode)
    attachRef(ref => ({ ...ref, functions: { mock: mockTestAttachedFn } }))
    expect(refSpy).toBeCalledWith({
      props: {
        test: 'abc'
      },
      state: {},
      functions: {
        mock: mockTestAttachedFn
      }
    })
  })
})
