# Reactive UI Middleware
> Example with different middlewares:
> ```jsx
> // Header.jsx
> import { map, switchMap } from 'rxjs/operators'
> import { logoutAction } from '../store/actions'
> 
> const Header = ({ children, ref }, { store, context }) => {
>   const theme = context(ctx => ctx.theme)
>   const user$ = store(state => state.user)
>   const isLoggedIn$ = map(user => !!user)(user$)
> 
>   const logout = store('dispatch', logoutAction())
> 
>   const userMenu$ = switchMap(
>     isLoggedIn => isLoggedIn ? (<UserMenu user={user$} />) : null
>   )(isLoggedIn$)
> 
>   ref(
>     componentRef => ({
>       ...componentRef,
>       functions: { logout },
>       state: { user$ }
>     })
>   )  
> 
>   return (
>     <header className={theme.header$}>
>       <h1 className={theme.headerText$}>{children}</h1>
>       {userMenu$}
>     </header>
>   )
> }
> 
> Header.useMiddleware = ['store', 'context']
> 
> export default Header
> ```
> When starting the app:
> ```jsx
> // index.jsx
> import { createRvDOM } from '@reactive-ui/core'
> import { renderingHookMiddlewares, componentPropsMiddlewares } from '@reactive-ui/middleware'
> import { componentRefMiddleware, elementRefMiddleware } from '@reactive-ui/ref'
> import { contextMiddleware } from '@reactive-ui/context'
> import { storeMiddleware } from '@reactive-ui/store'
> import { customGlobalElementClassNameMiddleware } from 'some-custom-library'
> import App from './App'
> import store from './store'
> 
> createRvDOM(
>   <App />,
>   {
>     querySelector: '#root'
>   }
> )(
>    renderingHookMiddlewares({
>      componentRenderHooks: [componentRefMiddleware],
>      elementRenderHooks: [customGlobalElementClassNameMiddleware('APP'), elementRefMiddleware]
>    }),
>   componentPropsMiddlewares({
>     store: storeMiddleware(store),
>     context: contextMiddleware()
>   })
> )
> ```
