<p align="center">
    <img height="300" src="logo.png" alt="Atom-iQ logo" />
    <h3 align="center">
        Atom-iQ Frontend Framework
    </h3>
</p>

![gzip size](https://img.shields.io/bundlephobia/minzip/@atom-iq/core?label=%40atom-iq%2Fcore%20minzipped%20size&logo=npm)
[![MIT](https://img.shields.io/github/license/atom-iq/framework)](https://github.com/atom-iq/framework/blob/master/LICENSE.md)
[![NPM](https://img.shields.io/npm/v/@atom-iq/core?logo=npm)](https://www.npmjs.com/package/@atom-iq/core)
![Coverage](https://img.shields.io/badge/coverage-83%25-yellowgreen)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)  
[![forthebadge](https://forthebadge.com/images/badges/made-with-typescript.svg)](https://forthebadge.com)

[atom-iq.github.io](https://atom-iq.github.io)

###### Important! - [check early development stage notice](#early-development-stage-important-notes)

> **_!!!_** Documentation is still in progress and may contain outdated information **_!!!_**

### Atom-iQ contains:
- core - core features and Reactive Virtual DOM renderer
- fx - functional extensions - functional programming tools
- rx - reactive extensions - functional reactive programming tools (based on RxJS, but about 10x faster)


- CLI - Command Line tools
- babel-plugin-jsx - Plugin for Atom-iQ JSX

### Start a project
###### After `iq project <new-project-name>` command will be implemented in CLI, it'll be prefered method to start a project
Install **CLI** and **Core**:
- `npm install --save-dev @atom-iq/cli` / `npm install --global @atom-iq/cli` or
`yarn add -D @atom-iq/cli` / `yarn global add @atom-iq/cli`
- `npm install --save @atom-iq/core` or `yarn add @atom-iq/core`

Check [Core](packages/core) and [CLI](dev-packages/cli) docs for more info

### Language support
- **JSX** - **Atom-iQ** is using **JSX** for describing declarative user interface (own **Babel** plugin)
- **ES6(+)** - Framework is commonly using **ES6(+)** features
  > While it is possible to write **Atom-iQ** apps in **ES5** and without **JSX**, it *doesn't make sense* and **is not
  > recommended.**

- **TypeScript** - **Atom-iQ** is written in **TypeScript**, so it has native support. **iQ CLI** is providing
  support for both **JavaScript** and **TypeScript**, while managing `webpack` and `babel` configs. It's determined
  by `typescript: boolean` field of **iQ CLI** config file.
  > The choice should depend on the situation, but **TypeScript** is recommended in most cases and is the **iQ CLI** default
  > choice (`typescript` option is `true` by default). For a small and short-term projects, **JavaScript** could be enough.

### Rendering architecture (Atom-iQ RVD)
**Atom-iQ** is based on the **Reactive Virtual DOM** architecture (concept) - new `DOM` rendering solution, made for
performance and scalability - it's based on **Virtual DOM** and the *Observer pattern*. In **Reactive Virtual DOM**,
every value that's changing in runtime, has to be Observable. It's using Observers in **Reactive Virtual DOM** nodes,
instead of reconciliation (**Virtual DOM** diffing). It's using atomic, synchronous or asynchronous non-blocking
rendering - every UI update is independent, don't touch other parts of **Reactive Virtual DOM** and **DOM**, and could
be cancelled anytime. Unlike **Virtual DOM** libraries, **Atom-iQ** isn't doing updates in context of the Component and its subtree,
but in context of single state field and single connected node or prop. In example:

```jsx
import { useState } from '@atom-iq/core'

const Component = () => {
  const className = useState('example-class')
  
  const handleInputChange = event => {
    className.v = event.currentTarget.value
  }
  
  return (
    <main class="app">
      <header>
        <h1>Reactive Virtual DOM Example</h1>
      </header>
      <p class={className}>
        Example Element Text Content
      </p>
      <input value={className} onInput={handleInputChange} />
    </main>
  )
}
```
When changing input value and changing value of `className` state, **Atom-iQ** is not re-calling component function,
nor diffing component's subtree. The `className` state is connected to `<p>` element `class` prop and controlled
input `value` prop. **Atom-iQ** has observers set up on that **Reactive Virtual DOM** elements props, and
the update is visible only for those observers, changing only connected **DOM** properties. Worth notice
is fact, that this update is separated for both elements.

### Components
**Atom-iQ** Component is a function, that takes props as argument and returns **Reactive Virtual DOM** nodes. Component
function is called only once, when component is added to **Reactive Virtual DOM**, so component's internal state,
variables and functions are existing in closure. **Atom-iQ** is using _**hooks**_, to get access to component node,
context and lifecycle.


```jsx
import { useState, useContext, useOnInit, useProvideRef, useTeardown } from '@atom-iq/core'

const ExampleComponent = ({ title }) => {
  const content = useState('initial content')
  const author = useContext('author')
  let active = false
  
  useOnInit(() => {
    active = true
  })
  
  const setContent = event => {
    if (active) content.v = event.currentTarget.value
  }
  
  const resetContent = () => {
    if (active) content.v = 'initial content'
  }
  
  const switchActive = () => (active = !active)
  
  useProvideRef({
    setContent,
    resetContent
  })
  
  useTeardown(() => console.log('Example Component removed'))

  return (
    <main class="app">
      <header>{title}</header>
      <section>
        <input value={content} onInput={setContent} />
        <p onClick={switchActive}>{content}</p>
      </section>
      <footer>{author}</footer>
    </main>
  )
}
```

#### State
In **Atom-iQ** state is one of state subjects from `@atom-iq/rx`.

> Subject is special kind of **Observable**, that could emit values to multiple observers (multicasting).

State Subject has saved current state value (initial value, then it's saving last emitted value). It has
special property to get/set state value - `state.v = 'new value'` / `const stateValue = state.v`. When setting
`state.v` property value, Subject is emitting new value to Observers.

There are 3 types of State Subject:
- StateSubject (`stateSubject(initialValue)`) - emits values synchronously. Has initial value. Always emit last value
on subscribe.
- AsyncInitStateSubject (`asyncInitStateSubject()`) - emits values synchronously. Has no initial value, emit last value
on subscribe, after is initialized (first value is emitted)
- AsyncStateSubject (`asyncStateSubject(initialValue, debounce?, scheduler?)`) - emit values asynchronously on given
Scheduler (`animationFrameScheduler` by default). Has initial value and always emit last value on subscribe synchronously.  
Its behavior depends on *debounce* argument:
  - debounce is false (default) - schedule every next emission separately and update state value asynchronously in Scheduler
  action
  - debounce is true - schedule only one next emission, and when emission is pending, update state value synchronously and
  then emit last state value in async Scheduler action

```ts
import { stateSubject, asyncInitStateSubject, asyncStateSubject, observer } from '@atom-iq/rx'

const state = stateSubject('initialValue')
const asyncInitState = asyncInitStateSubject()
const asyncState = asyncStateSubject('initialValue')
const asyncDebounceState = asyncStateSubject('initialValue', true)

state.v = 'newValue' // same as state.next('newValue')
asyncInitState.v = 'firstValue'
asyncState.v = 'newValue'
asyncDebounceState.v = 'newValue'

state.subscribe(observer(value => {
  console.log(value)
}))
```

But it's recommended to use hook in components - `useState()` - it returns one of state subjects (depending on arguments),
but additionally, it adds it to component's subscription - it's important for performance reasons, subject will be
unsubscribed when component is removed from **Reactive Virtual DOM**, instead of unsubscribing all its observers.

```jsx
import { useState } from '@atom-iq/core'

const Component = () => {
  const state = useState('initialValue') // stateSubject('initialValue')
  const asyncInitState = useState() // asyncInitStateSubject()
  const asyncState = useState('initialValue', true) // asyncStateSubject('initialValue')
  const asyncDebounceState = useState('initialValue', { debounce: true }) // asyncStateSubject('initialValue', true)
  
  const updateState = () => {
    state.v = 'newValue'
    asyncInitState.v = 'firstValue'
    asyncState.v = 'newValue'
    asyncDebounceState.v = 'newValue'
  }
  
  return (
    <div onClick={updateState}>
      STATE: {state}
      ASYNC INIT STATE: {asyncInitState}
      ASYNC STATE: {asyncState}
      ASYNC DEBOUNCE STATE: {asyncDebounceState}
    </div>
  )
}
```


### Hooks
**Atom-iQ** is using hooks to access additional data for components, like component node, context and lifecycle.
Unlike **React** hooks, **Atom-iQ** hooks could be called in conditional statements, and their order doesn't matter.

Core library includes standard and factory hooks:
- state
  - `useState` - create and return one of state subjects. Adding state subject to component's subscription
  ```ts
  const state = useState(initialValue)
  ```
- context
  - `useContext` / `useContextFactory` - get value of context field for given key
  ```ts
  const value = useContext(key)
  
  const getContext = useContextFactory()
  const anotherValue = getContext(anotherKey)
  ```
  - `useProvideContext` - set/override context field value
  ```ts
  useProvideContext(key, newValue)
  ```
- lifecycle 
  - `useOnInit` - Call provided function after component and its children are initialized. When called without arguments,
  returns observable that will emit value after initialization
  ```ts
  useOnInit(() => {
    // on init action
  })
  
  useOnInit().subscribe(() => {
    // on init action
  })
  ```
  - `useTeardown` / `useTeardownFactory` - add teardown to component's subscription, that will be unsubscribed, when component
  is removed.
  ```ts
  const subscription = someObservable.subscribe(observer(() => {}))
  useTeardown(subscription)

  useTeardown(() => {
    // on destroy action
  })

  const addTeardown = useTeardownFactory()
  addTeardown(() => {
    // on destroy action
  })
  ```
  - `useSubscription` - get component's subscription
  ```ts
  const componentSub = useSubscription()
  componentSub.add(otherSubscription)
  ```
- ref
  - `useProvideRef` / `useProvideRefFactory` - share component internal functions, state and props as ref
  ```ts
  useProvideRef({
    someState,
    someFunction
  })
  
  const provideRef = useProvideRefFactory()
  provideRef({
    someState,
    someFunction
  })
  ```

### Events 
**Atom-iQ RVD** cooperates with **Reactive Event Delegation** system for DOM events handling. It's based on top-level
delegation - **Atom-iQ** is attaching event listeners to root DOM element, one listener per event type and specific option:
- standard, bubbling listener
- capturing listener
- passive listener

### Reactive Virtual DOM
**Reactive Virtual DOM** is an architecture (or concept) based on **Virtual DOM**, re-designed with reactive programming,
and _**The Observer pattern**_.

**Reactive Virtual DOM** nodes, returned in object tree structures from components (like in **Virtual DOM**),
are divided into static (not-changeable in runtime) and observable (_"changeable"_ / streamable) nodes. The same rule
is applied to props - every _non-observable_ value is static, not-changeable prop. Observable nodes or props,
are most likely transformed from state (component's or global) or from other sources like `rvDOM` events or
in example http calls.

According to this, **Reactive Virtual DOM** is always just one tree of objects, where the parts of the UI (nodes/props),
that are changing in runtime, are observable. When some state is updated, it's emitting new value and only parts of the
**Reactive Virtual DOM** connected to that's state observable, are getting "informed about change", and updating that
parts of **Reactive Virtual DOM**, without touching any other elements, causing atomic updates of the corresponding
**DOM** nodes or properties.

**Reactive Virtual DOM** architecture is designed for scalability - more complex the application is, the difference
is greater, as the scope of operations affected by **Reactive Virtual DOM** updates, doesn't depend on the application
size and structure.

### Scalable and extendable framework architecture
The **Core library** (`@atom-iq/core`) includes **Reactive Virtual DOM Renderer**,
core hooks (like `useState`or `useContext`) and _**TypeScript**_ interfaces.

Additional features could be added to the **Core library**, by extending basic renderer logic with **Middlewares** or with
other official **Tools**, **Hooks** and **Components** libraries, making **Atom-iQ** full customizable framework.

### Other frameworks/libraries inspirations and comparisons
**Atom-iQ** is inspired mostly by **[React](https://reactjs.org/)** and **React** was also the "base" for **Atom-iQ** development,
but it's re-designed from the lowest level - rendering solution (**Reactive Virtual DOM** vs **Virtual DOM**) -
it caused a lot of architecture specific changes in the library interface, but the API still looks similar.
According to this fact, references and comparisons to **React** could be common in the documentation.

In case of **React** like libraries, **[Inferno](https://infernojs.org/)** is one of the biggest inspirations, in case of improving
**Virtual DOM** performance. This will be one of the next goals to achieve after finishing correctly working
**Core library** implementation - do as much as possible on build time (first point - plugin). However, I wanna go deeper in
it and adapt a tool like a [Facebook's Prepack](https://prepack.io/), for the app code pre-evaluation - as
a standard build process - but it's a thing for the future.

I also admire **[Preact](https://preactjs.com/)** for its incredibly small 3kb bundle size - it's also one
of the **Atom-iQ** goals - to keep a size of the **Core** bundle as small as possible, but without
any compromises, using modern concepts and technologies - extendable with *"tree-shakeable"* additional packages.

> Anyway, while writing framework code, I used mostly **Inferno** code, as a **Virtual DOM** library reference.
> I was also using some parts of its code as a base - for **JSX** plugin and basic type definitions.

**Reactive Virtual DOM** is inspired of course by **Virtual DOM**, but also by the reactive programming
in **[Angular](https://angular.io/)**, with `async` pipe.
> I mean, the *concept* of direct binding Observables to templates (UI). The implementation is completely different,
> even if writing a full **RxJS** powered **Angular** app (all state in **Subjects** and custom, "on request" change
> detection - by `changeDetectorRef.detectChanges()`), it still won't be as reactive, and as scalable, as **Reactive
> Virtual DOM**, because changes aren't **atomic**.
>
> However, **Angular** has a great **CLI** and it's the inspiration for **iQ CLI**

**Atom-iQ** will also extend the concept of having one, core library and additional official packages, and
will provide a big, rich set of official **Middlewares**, **Tools** and **Components** packages.

More detailed comparisons with some other frameworks will be introduced in separate document

## Atom-iQ CLI (`@atom-iq/cli`)
**Atom-iQ CLI** is a main build and development tool for **Atom-iQ**. In case of build tool, it's abstraction
over `webpack` and `babel` config, including custom **JSX** plugin (as a dependency, it's separate library).

*The goal is to provide support for multiple config options, starting from zero config (without any config file,
default config from the CLI package will be used), through simple `iq.cli.json` / `iq.cli.js` config
files or/and custom `webpack.config.override.js` files (that have to export function, that is taking old generated
webpack config and CLI config as arguments and is returning new webpack config), ending at full `webpack.config.js`
files.*

It will also allow for extensions - adding custom command with access to standard **CLI** features.

### Commands
- `iq start [-p --port <port>]` - compile the app in development mode, run development server and watch for file changes.
  Optionally port can be specified, default is `7777`
- `iq build [-e --env <environment>]` - compile the app in production mode (default) and save the
  output in a directory specified in a config (`/dist` is default for production environment). Optionally other
  environment can be specified.
- > `iq project <project-name>` (v0.3.0) - generate new **Atom-iQ** project. After implementing this command,
  > it should be the main method of project init. It will include CLI prompts, which allow an easy configuration -
  > included framework packages, config type selection, initial TS/JS settings and style preprocessors config. When
  > used with `npx`, it will install the latest stable version of **Atom-iQ** packages and `@atom-iq/cli` as a
  > dev dependency - `iq` command will be then available in *package.json* scripts section. When CLI is installed
  > as a global package, `iq project` command is also installing CLI as project dev dependency and all global
  > `iq` commands, used inside the project directories, are using CLI installed in project.
- > other commands will be implemented in future versions - it could be in example commands for generating boilerplate
  > code, etc.

**More detailed info in Atom-iQ CLI documentation**

## Licenses and Copyrights
##### The project is released under the MIT License
- [The root level license file](LICENSE.md) includes only my own ([Adam Filipek](https://github.com/adamf92)) Copyrights
- Additionally, every package in `packages` and `dev-packages`, has it own license (`LICENSE.md` file)
  - That's because, in some packages I'm using small parts of code from other open source libraries, to not write almost the same things again.
  - Some packages are forks of other open source projects
  - So, the licenses of packages are including also copyrights of other authors, when there are only small parts of code included, it's explicitly stated
## Packages
- Core [@atom-iq/core](packages/core)
## Dev Packages
- CLI [@atom-iq/cli](dev-packages/cli)
- Babel Plugin JSX [@atom-iq/babel-plugin-jsx](dev-packages/babel-plugin-jsx)


### Early development stage important notes
> #### IMPORTANT
> The project is on early development stage. Core features are working and are covered by unit tests in >95%, however it still needs testing in a real app.
>
> Current state is the confirmation of:
> - **atomic** `DOM` updates, **without reconciliation** - using instead **atomic** `rvDOM` updates - no diffing,
>   change happening only in connected nodes
> - **fast operations on keyed arrays** - _adding, replacing, moving, removing_ only affected DOM Nodes - no matter
>   of their position in the array
>
> Simple example could be found in [web directory](web) - it's the initial work on Atom-iQ webpage -
> live - [atom-iq.dev](https://www.atom-iq.dev)

#### Versions
> **Atom-iQ** is using _**Semantic Versioning 2.0.0**_

As **Atom-iQ** framework is scalable & extendable - built with small parts, one _required_ **Atom-iQ Core Library**
(`@atom-iq/core`), _recommended_ **iQ CLI** (`@atom-iq/core`) build and development tool, and a lot of additional
packages containing **Middlewares** and **Tools**, in example `@atom-iq/store`, it will use the same major releases
for all packages in `@atom-iq` *npm scope*.

###### Before `v1.0.0` - first stable release - the end of early development stage
##### Unscheduled work on progressively implementing and testing new features
When version `v0.1.0` will be finished and released to npm, then next features will be added incrementally in new minor
releases. `v0.x` versions should have the same minor version for all the packages.
###### `v1.0.0` and after
When the framework will reach point when it will be working good and have enough features, the first stable version will be
released. After that day, next major versions will have specified release schedule, although it's too early to talk about the periods.

#### Documentation Scope
This documentation is describing features that are already implemented and will be included in
first official ("unstable") npm release - `v0.1.0`.
It will include also descriptions of the features planned for future releases, which interface and probable implementation,
are currently known and will be implemented, before stable `v1.0.0`.  
After releasing stable version, main docs will always contain only the current version docs, future features will be
described elsewhere.

When feature isn't already implemented or is implemented partially (but the interface and possible implementation
is known), there will be explicit information, with planned implementation version.

#### Repository
This repository is a `monorepo` for all official **Atom-iQ** framework packages, with the structure:
- `packages` - contains `@atom-iq/core` and **Middleware** and **Tools** packages
- `dev-packages` - contains `@atom-iq/cli` and other development packages, like plugins, etc.
- `docs` - contains *Markdown* documentation files
- during development, the official webpage will be also created (in **Atom-iQ**, off course) and stored in `web` directory
  in repository

###### After releasing v1.0.0 (the end of early development stage), remove early development sections starting [from](#early-development-stage-important-notes), ending here.

## Benchmarks
###### results from Atom-iQ v0.1.0 (without Reactive Event Delegation - it should improve performance, even 2x in some cases)

##### Color picker benchmark (dynamically change className of 1 from 266 elements)
```
Running "color-picker"...
Running benchmark "preact"...
preact x 2,468 ops/sec ±0.40% (60 runs sampled)
Running benchmark "react"...
react x 3,480 ops/sec ±1.37% (57 runs sampled)
Running benchmark "vue"...
vue x 1,970 ops/sec ±2.27% (57 runs sampled)
Running benchmark "inferno"...
inferno x 7,111 ops/sec ±0.53% (59 runs sampled)
Running benchmark "atom-iq"...
atom-iq x 29,525 ops/sec ±1.08% (58 runs sampled)
Fastest is atom-iq
```

##### Search results benchmark (dynamically change content of 200 elements)
```
Running "search-results"...
Running benchmark "preact"...
preact x 105 ops/sec ±1.04% (45 runs sampled)
Running benchmark "react"...
react x 203 ops/sec ±0.79% (54 runs sampled)
Running benchmark "vue"...
vue x 92.44 ops/sec ±0.92% (53 runs sampled)
Running benchmark "inferno"...
inferno x 242 ops/sec ±0.81% (57 runs sampled)
Running benchmark "atom-iq"...
atom-iq x 685 ops/sec ±21.59% (34 runs sampled)
Fastest is atom-iq
```

[more details in benchmark repo](https://github.com/Atom-iQ/isomorphic-ui-benchmarks)

Why is **Atom-iQ** that fast? The answer is **Reactive Virtual DOM**. In color picker benchmark one operation - set state (selected color index),
leads finally to 2 small DOM changes - set `Element.className` in 2 **Elements** - in one to `"color selected"`, and in one selected before,
back to `"color"`.
- While in **Virtual DOM** libraries, that operation (set state) is causing reconciliation - diffing **Component's Virtual DOM** tree, and in
  result, set `Element.className` in 2 **Elements**, in **Reactive Virtual DOM**, that operation is called _next state_, and is _streaming__ new
  `className` (string) to 2 _connected_ **Reactive Virtual DOM Elements** (_Observers_). _Observers_ are just setting new `Element.className` for
  that 2 **Elements**. That change is not happening in context of whole **Component**, but just those 2 single **RvdElement'**. So, in **Atom-iQ**,
  that update is a very small operation, in fact, _it's almost only setting `Element.className` for 2 **Elements**_.

> I'm excited to implement next performance benchmarks, it's clearly showing, that there is sense to develop **Atom-iQ**, as probably the fastest framework
> ever.
