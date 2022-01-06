import { combineMiddlewares } from 'middlewares'
import { MOCK_MIDDLEWARES } from '../../__mocks__/middlewares'
import { CombinedMiddlewares } from 'types'

describe('combineMiddlewares function', () => {
  test('should return combined middlewares', () => {
    const mockFn = jest.fn()
    const result = combineMiddlewares(...MOCK_MIDDLEWARES(mockFn))()

    const expected: CombinedMiddlewares = {
      component: {
        createContext: mockFn,
        context: mockFn,
        lifecycle: mockFn,
        router: mockFn,
        scoped: mockFn,
        i18n: mockFn,
        theme: mockFn,
        dep: mockFn,
        store: mockFn,
        contextStore: mockFn,
        provideRef: mockFn
      },
      textPreRender: {
        middlewares: {
          i18n: mockFn
        },
        order: ['i18n']
      },
      elementPreConnect: {
        middlewares: {
          i18n: mockFn,
          theme: mockFn,
          ref: mockFn
        },
        order: ['i18n', 'theme', 'ref']
      }
    }

    expect(result).toEqual(expected)
  })

  test('should return combined middlewares, in correct order', () => {
    const mockFn = jest.fn()
    const result = combineMiddlewares(...MOCK_MIDDLEWARES(mockFn))({
      elementPreConnect: ['theme', 'i18n', 'ref']
    })

    const expected: CombinedMiddlewares = {
      component: {
        createContext: mockFn,
        context: mockFn,
        lifecycle: mockFn,
        router: mockFn,
        scoped: mockFn,
        i18n: mockFn,
        theme: mockFn,
        dep: mockFn,
        store: mockFn,
        contextStore: mockFn,
        provideRef: mockFn
      },
      textPreRender: {
        middlewares: {
          i18n: mockFn
        },
        order: ['i18n']
      },
      elementPreConnect: {
        middlewares: {
          i18n: mockFn,
          theme: mockFn,
          ref: mockFn
        },
        order: ['theme', 'i18n', 'ref']
      }
    }

    expect(result).toEqual(expected)
  })
})
