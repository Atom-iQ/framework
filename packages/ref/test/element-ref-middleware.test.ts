import { ElementRefProp, RvdDOMElement, RvdElementFlags } from '@atom-iq/core'
import { elementRefMiddleware } from '../src/element-ref-middleware'
import { Observable, Subscription } from 'rxjs'

describe('Element Ref Middleware', () => {
  // eslint-disable-next-line max-len
  test('should return function returning unchanged rvdElement, when Ref is not set', () => {
    const mockElement: RvdDOMElement = {
      type: 'div',
      flag: RvdElementFlags.HtmlElement
    }

    const mockDomElement = document.createElement('div')
    const sub = new Subscription()
    const subSpy = jest.spyOn(sub, 'add')

    const result = elementRefMiddleware(mockElement, mockDomElement, sub)
    expect(result).toBe(mockElement)
    expect(subSpy).not.toBeCalled()
  })

  // eslint-disable-next-line max-len
  test('should attach ref to Element - take control over selected props and events, call Ref callback and return changed Element', () => {
    const mockRefCallback = (jest.fn() as unknown) as ElementRefProp
    mockRefCallback.controlProps = ['className', 'title', 'id']
    mockRefCallback.getEvents = ['click']
    mockRefCallback.complete = jest.fn()

    const mockClickFn = jest.fn()

    const mockElement: RvdDOMElement = {
      type: 'div',
      flag: RvdElementFlags.HtmlElement,
      className: 'test',
      props: {
        title: 'mock-title',
        onClick: mockClickFn
      },
      ref: mockRefCallback
    }

    const mockDomElement = document.createElement('div')
    const sub = new Subscription()
    const subSpy = jest.spyOn(sub, 'add')

    const result = elementRefMiddleware(mockElement, mockDomElement, sub)
    expect(mockRefCallback).toBeCalledWith({
      domElement: mockDomElement,
      props: {
        title: [expect.any(Observable), expect.any(Function)],
        id: [expect.any(Observable), expect.any(Function)],
        className: [expect.any(Observable), expect.any(Function)],
        onClick: mockClickFn
      },
      events: {
        click: expect.any(Observable)
      }
    })
    expect(result.className instanceof Observable).toBeTruthy()
    expect(result.props.title instanceof Observable).toBeTruthy()
    expect(result.props.id instanceof Observable).toBeTruthy()
    expect(subSpy).toBeCalledTimes(1)
  })
})
