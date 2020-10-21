import { createDomElement } from '../../../../../src/rv-dom/renderer/utils'
import { RvdMouseEvent } from '../../../../../src/shared/types'
import { dispatchMouseEvent } from '../../../../__mocks__/events'
import { tap } from 'rxjs/operators'
import { connectEventHandler } from '../../../../../src/rv-dom/renderer/connect-props/event-handler'
import { Observable, Subscription } from 'rxjs'

/* eslint-disable max-len */
describe('Connecting Element Props', () => {
  test('connectEventHandler should connect classic event handler', done => {
    const onClick = (event: RvdMouseEvent<HTMLDivElement>) => {
      expect(event.target).toBe(element)
      done()
    }

    const sub = new Subscription()
    const subSpy = jest.spyOn(sub, 'add')
    const element = createDomElement('div', false)
    connectEventHandler(element, sub)('onClick', onClick)
    expect(subSpy).toBeCalled()
    dispatchMouseEvent(element)
  })

  test('connectEventHandler should connect reactive event handler', done => {
    const onClick$ = (event$: Observable<RvdMouseEvent<HTMLDivElement>>) => {
      return tap((event: RvdMouseEvent<HTMLDivElement>) => {
        expect(event.target).toBe(element)
        done()
      })(event$)
    }

    const sub = new Subscription()
    const subSpy = jest.spyOn(sub, 'add')
    const element = createDomElement('div', false)
    connectEventHandler(element, sub)('onClick$', onClick$)
    expect(subSpy).toBeCalled()
    dispatchMouseEvent(element)
  })
})
