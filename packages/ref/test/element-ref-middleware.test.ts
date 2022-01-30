// import { RvdContext, RvdElementNode, RvdNodeFlags } from '@atom-iq/core'
// import { isObservable, StateSubject, SubscriptionGroup } from '@atom-iq/rx'
//
// import { elementRefMiddleware } from '../src/element-ref-middleware'
//
// describe('Element Ref Middleware', () => {
//   // eslint-disable-next-line max-len
//   test('should return function returning unchanged rvdElement, when Ref is not set', () => {
//     const mockElement: RvdElementNode = {
//       type: 'div',
//       flag: RvdNodeFlags.HtmlElement,
//       dom: document.createElement('div'),
//       sub: new SubscriptionGroup()
//     }
//
//     const subSpy = jest.spyOn(mockElement.sub, 'add')
//
//     const result = elementRefMiddleware({} as RvdContext, mockElement)
//     expect(result).toBe(mockElement)
//     expect(subSpy).not.toBeCalled()
//   })
//
// eslint-disable-next-line max-len
//   test('should attach ref to Element - take control over selected props, call Ref callback and return changed Element', () => {
//     const mockRefCallback = jest.fn() as unknown as ElementRefProp
//     mockRefCallback.controlProps = ['className', 'title', 'id']
//
//     const mockElement: RvdElementNode = {
//       type: 'div',
//       flag: RvdNodeFlags.HtmlElement,
//       className: 'test',
//       props: {
//         title: 'mock-title'
//       },
//       ref: mockRefCallback,
//       dom: document.createElement('div'),
//       sub: new SubscriptionGroup()
//     }
//
//     const subSpy = jest.spyOn(mockElement.sub, 'add')
//
//     const result = elementRefMiddleware({} as RvdContext, mockElement)
//     expect(mockRefCallback).toBeCalledWith({
//       domElement: mockElement.dom,
//       props: {
//         title: expect.any(StateSubject),
//         id: expect.any(StateSubject),
//         className: expect.any(StateSubject)
//       }
//     })
//     expect(isObservable(result.className)).toBeTruthy()
//     expect(isObservable(result.props.title)).toBeTruthy()
//     expect(isObservable(result.props.id)).toBeTruthy()
//   })
// })
