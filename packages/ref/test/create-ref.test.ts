import { componentRef, elementRef } from '../src'
import { ComponentRef, ElementRef } from '@atom-iq/core'

describe('Create Ref functions', () => {
  // eslint-disable-next-line max-len
  test('elementRef should return Observable Ref and connectRef function, which return function that after connecting Element emit Ref', done => {
    const mockRef = {} as ElementRef
    const [ref, connectRef] = elementRef(['value'], ['click'])
    const connectCallback = connectRef()
    ref.subscribe({
      next: value => {
        expect(value).toEqual(mockRef)
        connectCallback.complete()
      },
      complete: done
    })
    connectCallback(mockRef)
  })

  // eslint-disable-next-line max-len
  test('componentRef should return Observable Ref and connectRef function, which return function that after connecting Component emit Ref', done => {
    const mockRef = {} as ComponentRef
    const [ref, connectRef] = componentRef()
    const connectCallback = connectRef()
    ref.subscribe(value => {
      expect(value).toEqual(mockRef)
      done()
    })
    connectCallback(mockRef)
  })
})
