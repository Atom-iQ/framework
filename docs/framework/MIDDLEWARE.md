# Atom-iQ Middleware
##### Extending Renderer and Components behavior

#### From main documentation
### Extending core logic with Middlewares (v0.0.2)
**Atom-iQ Middleware** is a function implementing specific interface, based on Middleware type
There are 2 main types of Middleware - **iQ Renderer Middleware** and **iQ Component Middleware**
- **iQ Renderer Middleware** is the function, that's taking `rvDOM` nodes objects and return these objects after
 modifications (or/and other arguments, depending on subtype). They are called with other middlewares of the same subtype,
 in specific rendering stage, in order they are specified in an order array (explicitly or automatically) - in other
 words, those middleware functions are passed to basic renderer functions from core library and could modify
 renderer behaviors.
 _**They are extending Reactive Virtual DOM Renderer**_
   - Subtypes for **iQ Renderer Middleware** are based on rendering stage, when it's called
- **iQ Component Middleware** is a little more complex, as it's a similar function, that will be called just before
 calling **Component** function, taking some **Component** `rvDOM` specific arguments. The difference is that they have
 to return a function that will be injected to all application components (or only those that need it), with other
 **iQ Component Middlewares** as a second argument for **Component function**. It could be any function. All props
 middleware functions are composed in object and passed as a second argument, to distinguish between explicitly
 passed component props and implicitly injected global functionalities, called **Middleware Props**.
 _**They are extending Atom-iQ Components functionalities and behaviors, while the component remains
 just a simple function with the same interface.**_

> As a **Middleware** is doing additional operation before injecting its function to the **Component**, and it will be often
> unnecessary for all **Components** to have all **Middleware Props** (many of them probably won't need any global
> functionality), it should be declared per **Component** function, which middlewares it's using - but it's the thing
> that could be done by **Babel** plugin.

Middleware packages are often combinations of different middleware types and subtypes.
The framework is including official middleware packages.
It's of course possible to write custom middlewares, as they are just functions, implementing specific interfaces.

### Example with different middleware types

##### _iQ Component Middlewares_ & using special `ref` prop with _iQ Renderer Middleware_ - Ref Middleware (Component):
```typescript jsx
// Header.tsx
import { map, switchMap } from 'rxjs/operators'
import { logoutAction } from '../store/actions'

const Header = ({ children, ref }, { store, context }) => {
  const theme = context(ctx => ctx.theme)
  const user = store(({ state }) => state.user)
  const isLoggedIn = map(user => !!user)(user$)

  const logout = store(logoutAction())

  const userMenu = switchMap(
     isLoggedIn => isLoggedIn ? (<UserMenu user={user} />) : null
   )(isLoggedIn)

   ref(
     componentRef => ({
       ...componentRef,
       functions: { logout },
       state: { user }
     })
   )

   return (
     <header class={theme.header}>
       <h1 class={theme.headerText}>{children}</h1>
       {userMenu}
     </header>
   )
 }

 // Header.useMiddleware = ['store', 'context']

export default Header
```
When starting the app:
```typescript jsx
// index.tsx
import { rvdRenderer, createState } from '@atom-iq/core'
import { combineMiddlewares } from '@atom-iq/middleware'
import { iQRefMiddleware } from '@atom-iq/ref' // It's iQElementRefMiddleware and iQComponentRefMiddleware combined, they could be used separately
import { iQContextMiddleware } from '@atom-iq/context'
import { iQStoreMiddleware } from '@atom-iq/store'
import { customGlobalElementClassNameMiddleware } from 'some-custom-library'
import App from './App'
import store from './store'

const [message, nextMessage] = createState<string>('')

const globalContext = {
  globalMessenger: (next?: string) => {
    if (next === undefined) {
      return message
    }

    nextMessage(next)
  }
}

const middlewares = combineMiddlewares(
  contextMiddleware('context', globalContext),
  iQStoreMiddleware('store', store),
  customGlobalElementClassNameMiddleware('atom-iq-app'),
  iQRefMiddleware()
)

rvdRenderer(middlewares)(
  <App />,
  '#root'
)
```
