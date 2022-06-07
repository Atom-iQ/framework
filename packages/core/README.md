# Atom-iQ Core (`@atom-iq/core`)
#### Installing
- npm - `npm install --save @atom-iq/core`
- yarn - `yarn add @atom-iq/core`

> However, after it will be implemented in iQ CLI (`@atom-iq/cli`), recommended way to start a project,
> will be `iq project <project-name>` command (or `npx @atom-iq/cli project <project-name>`)

#### The Extendable _Reactive Virtual DOM_ Renderer
**Atom-iQ** Core library is a main, required library of the **Atom-iQ** framework. It could also act
independently, as lightweight DOM rendering library, but it's recommended to use it with additional,
optional framework packages, that's making complete front-end ecosystem.

The Core library is including **Reactive Virtual DOM Renderer**, hooks and main
type definitions for the framework.

#### Starting the app
```typescript jsx
import App from './App'
import { start } from '@atom-iq/core'


const rootDomRvd = start(<App />)(document.getElementById('root'))
```

## Documentation
- [Framework](../../README.md)
- [Reactive Virtual DOM](../../docs/reactive-virtual-dom/REACTIVE-VIRTUAL-DOM.md)
- [Component](../../docs/framework/COMPONENT.md)
- [Elements](../../docs/framework/ELEMENTS.md)

