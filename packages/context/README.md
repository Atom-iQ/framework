# Atom-iQ Context Middleware (`@atom-iq/context`)
#### Installing
- npm - `npm install --save @atom-iq/context`
- yarn - `yarn add @atom-iq/context`


#### Context
Package containing Middlewares, provides access to Context API

Middlewares:
- initContext - called on application init, provides initial root context object
- createContext - Component Middleware, creates nested Context, that will be passed to children
  and returns function, that's adding new fields to that Context
- context (useContext) - Component Middleware, returns function that's getting Context field by name

Tools:
- contextProvider function - factory for Context Provider Component - returns Component, that's using
  createContext Middleware, providing new Context with specified field or fields to children

#### Starting the app
```typescript jsx
import App from './App'
import { rvdRenderer, combineMiddlewares } from '@atom-iq/core'
import { contextMiddleware } from '@atom-iq/ref'

const initialRootContext = {
  message: 'Atom-iQ Context Middleware'
}

const middlewares = combineMiddlewares(contextMiddleware(initialRootContext))()

rvdRenderer(middlewares)(<App />, document.getElementById('root'))
```

#### Usage
```typescript jsx
import { RvdComponent, createState } from '@atom-iq/core'
import { contextProvider, WithContext, WithCreateContext } from '@atom-iq/context'

const Consumer: RvdComponent<{}, WithContext> = (_props, { context }) => (
  <section>
    {context('message')}
    {context('fromCreate')}
  </section>
)

const App: RvdComponent<{}, WithCreateContext & WithContext> = (_props, { createContext, context }) => {
  createContext('fromCreate', 'Created in App by createContext')

  const Nested = contextProvider({
    message: 'Nested message',
    fromCreate: 'Nested fromCreate'
  })

  return (
    <main class="App">
      {context('message')} // 'Atom-iQ Context Middleware' - from root
      {context('fromCreate')} // 'Created in App by createContext'
      <Consumer /> // Same as above
      <Nested>
        <Consumer /> // 'Nested message' and 'Nested fromCreate'
      </Nested>
    </main>
  )
}

```

## Documentation
- [Framework](../../README.md)
- [Reactive Virtual DOM](../../docs/reactive-virtual-dom/REACTIVE-VIRTUAL-DOM.md)
- [Component](../../docs/framework/COMPONENT.md)
- [Elements](../../docs/framework/ELEMENTS.md)
- [Middleware](../../docs/framework/MIDDLEWARE.md)

