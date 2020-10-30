# Atom-iQ Teardown Middleware (`@atom-iq/teardown`)
#### Installing
- npm - `npm install --save @atom-iq/teardown`
- yarn - `yarn add @atom-iq/teardown`


#### Teardown
Middleware allowing adding Teardown logic to Atom-iQ Auto-unsubscribe system.

Teardown logic is the RxJS Subscription or any function, and is called on main
Subscription unsubscribe (in Teardown Middleware case, it's after Component is
removed from **Reactive Virtual DOM** - it's unsubscribing all nested Subscriptions
and calling all passed Teardown function

> ##### Note
> With current Core implementation, Teardown logic is added to parent element children subscription.
> It's not expected behavior, Components should have own separate subscriptions -  it will be fixed
> in one of v0.2.0 pre-releases. However, it's a Core package bug and **won't** affect Teardown
> Middleware API and implementation

#### Starting the app
```typescript jsx
import App from './App'
import { rvdRenderer, combineMiddlewares } from '@atom-iq/core'
import { teardownMiddleware } from '@atom-iq/teardown'

const middlewares = combineMiddlewares(teardownMiddleware())()

rvdRenderer(middlewares)(<App />, document.getElementById('root'))
```

#### Usage
```typescript jsx
import { RvdComponent, createState } from '@atom-iq/core'
import { WithTeardown } from '@atom-iq/teardown'

const App: RvdComponent<{}, WithTeardown> = (_props, { teardown }) => {
  const [someState, nextSomeState] = createState('Teardown Middleware')

  const subscription = someState.subscribe(state => console.log(state))

  const fn = () => console.log('Destroyed')

  teardown(subscription)
  teardown(fn)

  return (
    <main class="App">
      Atom-iQ Teardown Middleware
    </main>
  )
}

App.useMiddlewares = ['teardown']
```

## Documentation
- [Framework](../../README.md)
- [Reactive Virtual DOM](../../docs/reactive-virtual-dom/REACTIVE-VIRTUAL-DOM.md)
- [Component](../../docs/framework/COMPONENT.md)
- [Elements](../../docs/framework/ELEMENTS.md)
- [Middleware](../../docs/framework/MIDDLEWARE.md)

