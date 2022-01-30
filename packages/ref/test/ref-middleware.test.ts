// import { refMiddleware } from '../src'
// import { componentRefMiddleware } from '../src/component-ref-middleware'
// import { elementRefMiddleware } from '../src/element-ref-middleware'
//
// describe('Ref Middleware', () => {
//   test('should return Ref middleware declaration', () => {
//     const declaration = refMiddleware()
//
//     expect(declaration).toEqual({
//       name: 'ref',
//       middlewares: {
//         component: {
//           alias: 'attachRef',
//           fn: componentRefMiddleware
//         },
//         renderer: {
//           elementPreConnect: {
//             fn: elementRefMiddleware
//           }
//         }
//       }
//     })
//   })
// })
