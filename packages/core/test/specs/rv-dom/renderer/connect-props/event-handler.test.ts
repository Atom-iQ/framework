import { createDomElement } from '../../../../../src/reactive-virtual-dom/renderer/utils'
import { RvdMouseEvent } from '../../../../../src/shared/types'
import { dispatchMouseEvent } from '../../../../__mocks__/events'
// eslint-disable-next-line max-len
import {
  handleRedEvent,
  initEventDelegation
} from '../../../../../src/reactive-event-delegation/event-delegation'

/* eslint-disable max-len */
describe('Connecting Element Props', () => {
  let element = createDomElement('div')

  beforeEach(() => {
    const parentElement = createDomElement('div')
    initEventDelegation(parentElement)
    element = createDomElement('div')
    parentElement.appendChild(element)
  })

  // TODO: Move to handleRedEvent spec when created
  test('MOVE TO HANDLE RED EVENT', done => {
    const onClick = (event: RvdMouseEvent<HTMLDivElement>) => {
      expect(event.target).toBe(element)
      done()
    }
    handleRedEvent(element, 'onClick', onClick)
    dispatchMouseEvent(element)
  })
})
