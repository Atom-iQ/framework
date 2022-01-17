import { MiddlewarePackageDefinition } from 'types'

interface PkgArgs {
  name: string
  dependencies?: string[]
}

interface MiddlewareArgs {
  name?: string
  alias?: string
  fn: Function
}

const getMockMiddleware = middleware => (middleware ? middleware : undefined)

const mockMiddlewareFactory = (
  { name, dependencies }: PkgArgs,
  component?: MiddlewareArgs | MiddlewareArgs[],
  renderer?: { [name: string]: MiddlewareArgs | MiddlewareArgs[] }
): MiddlewarePackageDefinition => ({
  name,
  dependencies,
  middlewares: {
    component: getMockMiddleware(component),
    renderer: renderer
      ? {
          elementPreRender: getMockMiddleware(renderer['elementPreRender']),
          elementPreConnect: getMockMiddleware(renderer['elementPreConnect']),
          textPreRender: getMockMiddleware(renderer['textPreRender'])
        }
      : undefined
  }
})

export const MOCK_MIDDLEWARES = (mockFn: Function): MiddlewarePackageDefinition[] => [
  mockMiddlewareFactory({ name: 'context' }, [
    {
      name: 'useContext',
      alias: 'context',
      fn: mockFn
    },
    {
      name: 'createContext',
      alias: 'createContext',
      fn: mockFn
    }
  ]),
  mockMiddlewareFactory(
    { name: 'lifecycle' },
    {
      alias: 'lifecycle',
      fn: mockFn
    }
  ),
  mockMiddlewareFactory(
    { name: 'router' },
    {
      alias: 'router',
      fn: mockFn
    }
  ),
  mockMiddlewareFactory(
    { name: 'scoped-styles' },
    {
      alias: 'scoped',
      fn: mockFn
    }
  ),
  mockMiddlewareFactory(
    { name: 'i18n' },
    {
      alias: 'i18n',
      fn: mockFn
    },
    {
      textPreRender: {
        fn: mockFn
      },
      elementPreConnect: {
        fn: mockFn
      }
    }
  ),
  mockMiddlewareFactory(
    { name: 'theme' },
    {
      alias: 'theme',
      fn: mockFn
    },
    {
      elementPreConnect: {
        fn: mockFn
      }
    }
  ),
  mockMiddlewareFactory(
    { name: 'contextDependent', dependencies: ['context'] },
    {
      alias: 'dep',
      fn: mockFn
    }
  ),
  mockMiddlewareFactory(
    { name: 'store' },
    {
      alias: 'store',
      fn: mockFn
    }
  ),
  mockMiddlewareFactory(
    { name: 'contextStore', dependencies: ['context', 'store'] },
    {
      alias: 'contextStore',
      fn: mockFn
    }
  ),
  mockMiddlewareFactory(
    { name: 'ref' },
    {
      alias: 'provideRef',
      fn: mockFn
    },
    {
      elementPreConnect: {
        fn: mockFn
      }
    }
  )
]
