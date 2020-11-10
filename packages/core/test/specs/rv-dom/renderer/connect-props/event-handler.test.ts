import { createDomElement } from '../../../../../src/reactive-virtual-dom/renderer/utils'
import { RedMouseEvent } from '../../../../../src/shared/types'
import { dispatchMouseEvent } from '../../../../__mocks__/events'
import { tap } from 'rxjs/operators'
// eslint-disable-next-line max-len
import { connectEventHandler } from '../../../../../src/reactive-virtual-dom/renderer/connect-props/event-handler'
import { Observable, Subscription } from 'rxjs'
import { initEventDelegation } from '../../../../../src/reactive-event-delegation/event-delegation'

/* eslint-disable max-len */
describe('Connecting Element Props', () => {
  let element = createDomElement('div')

  beforeEach(() => {
    const parentElement = createDomElement('div')
    initEventDelegation(parentElement)
    element = createDomElement('div')
    parentElement.appendChild(element)
  })

  test('connectEventHandler should connect classic event handler', done => {
    const onClick = (event: RedMouseEvent<HTMLDivElement>) => {
      expect(event.target).toBe(element)
      done()
    }

    const sub = new Subscription()
    const subSpy = jest.spyOn(sub, 'add')

    connectEventHandler('onClick', onClick, element, sub)
    expect(subSpy).toBeCalled()
    dispatchMouseEvent(element)
  })

  test('connectEventHandler should connect reactive event handler', done => {
    const onClick$ = (event$: Observable<RedMouseEvent<HTMLDivElement>>) => {
      return tap((event: RedMouseEvent<HTMLDivElement>) => {
        expect(event.target).toBe(element)
        done()
      })(event$)
    }

    const sub = new Subscription()
    const subSpy = jest.spyOn(sub, 'add')

    connectEventHandler('onClick$', onClick$, element, sub)
    expect(subSpy).toBeCalled()
    dispatchMouseEvent(element)
  })
})
