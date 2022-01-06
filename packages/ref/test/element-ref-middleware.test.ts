import { ElementRefProp, RvdContext, RvdElementNode, RvdNodeFlags } from '@atom-iq/core'
import { elementRefMiddleware } from '../src/element-ref-middleware'
import { Observable, Subscription } from 'rxjs'

describe('Element Ref Middleware', () => {
  // eslint-disable-next-line max-len
  test('should return function returning unchanged rvdElement, when Ref is not set', () => {
    const mockElement: RvdElementNode = {
      type: 'div',
      flag: RvdNodeFlags.HtmlElement,
      dom: document.createElement('div'),
      sub: new Subscription()
    }

    const subSpy = jest.spyOn(mockElement.sub, 'add')

    const result = elementRefMiddleware({} as RvdContext, mockElement)
    expect(result).toBe(mockElement)
    expect(subSpy).not.toBeCalled()
  })

  // eslint-disable-next-line max-len
  test('should attach ref to Element - take control over selected props and events, call Ref callback and return changed Element', () => {
    const mockRefCallback = jest.fn() as unknown as ElementRefProp
    mockRefCallback.controlProps = ['className', 'title', 'id']
    mockRefCallback.getEvents = ['click']
    mockRefCallback.complete = jest.fn()

    const mockClickFn = jest.fn()

    const mockElement: RvdElementNode = {
      type: 'div',
      flag: RvdNodeFlags.HtmlElement,
      className: 'test',
      props: {
        title: 'mock-title',
        onClick: mockClickFn
      },
      ref: mockRefCallback,
      dom: document.createElement('div'),
      sub: new Subscription()
    }

    const subSpy = jest.spyOn(mockElement.sub, 'add')

    const result = elementRefMiddleware({} as RvdContext, mockElement)
    expect(mockRefCallback).toBeCalledWith({
      domElement: mockElement.dom,
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
