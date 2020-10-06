<p align="center">
    <img height="300" src="logo.png" alt="Atom-iQ logo" />
    <h5 align="center">
        Scalable, declarative, reactive & functional next-gen front-end framework,
        with new <em>Reactive Virtual DOM</em> architecture and simple, functional component API with JSX
    </h5>
</p>

###### Important! - [check early development stage notice](#early-development-stage-important-notes)

#### The Fastest Framework Ever?
The **UNBELIEVABLE** results of first implemented performance benchmark - `color-picker` from [Atom-iQ/isomorphic-ui-benchmarks](https://github.com/Atom-iQ/isomorphic-ui-benchmarks)
(the fork of [marko-js/isomorphic-ui-benchmarks](https://github.com/marko-js/isomorphic-ui-benchmarks)) - are proving, that **Atom-iQ**, with **Reactive Virtual DOM** architecture,
is **OUTPERFORMING** even the fastest **Virtual DOM** libraries/frameworks.

Average results of the **benchmark** (_Chrome_) - cases with different array sizes - **from 266 to 2128 colors** (original **benchmark** ran on **133 colors**):

- Atom-iQ 14388 ops/sec
- Inferno 3524 ops/sec (~4x slower)
- React 1712 ops/sec (~8x slower)
- Preact 1197 ops/sec (~12x slower)
- Vue 929 ops/sec (~15x slower)

###### *Average from 3 results for 266, 532, 1064 and 2128 colors

Example result (266 colors):
```
Warming up...
Warmup complete.
Running "color-picker"...
Running benchmark "preact"...
preact x 2,681 ops/sec ±0.44% (61 runs sampled)
Running benchmark "react"...
react x 3,618 ops/sec ±0.81% (58 runs sampled)
Running benchmark "vue"...
vue x 2,039 ops/sec ±2.51% (56 runs sampled)
Running benchmark "inferno"...
inferno x 7,411 ops/sec ±0.60% (58 runs sampled)
Running benchmark "atom-iq"...
atom-iq x 27,995 ops/sec ±1.73% (41 runs sampled)
Fastest is atom-iq
```

While one of the fastest libraries on the market - **Inferno** is achieving over **7k ops/sec**, **Atom-iQ** has almost **28k** !!!
**Atom-iQ** is also achieving better **1064 colors** result (**~9k ops/sec**), than **Inferno** with **266 colors**.

[more details in benchmark repo](https://github.com/Atom-iQ/isomorphic-ui-benchmarks)

Why is **Atom-iQ** that fast? The answer is **Reactive Virtual DOM**. In this benchmark one operation - set state - selected color index,
leads finally to 2 small DOM changes - set `Element.className` in 2 **Elements** - in one to `"color selected"`, and in one selected before,
back to `"color"`.
- While in **Virtual DOM** libraries, that operation (set state) is causing reconciliation - diffing **Component's Virtual DOM** tree, and in
  result, set `Element.className` in 2 **Elements**
- In **Reactive Virtual DOM**, that operation is called _next state_, and is _streaming__ new `className` (string) to 2 _connected_ **Reactive
  Virtual DOM Elements** (_Observers_). _Observers_ are just setting new `Element.className` for that 2 **Elements**. That change is not happening
  in context of whole **Component**, but just those 2 single **RvdElement'**. So, in **Atom-iQ**, that update is a very small operation, in fact,
  _it's almost only setting `Element.className` for 2 **Elements**_, **Atom-iQ** can make updates faster than browser can render it.

> I'm excited to implement next performance benchmarks, it's clearly showing, that there is sense to develop **Atom-iQ**, as probably the fastest framework
> ever.

## Atom-iQ Framework
**Atom-iQ** is a scalable and extendable framework for building reactive user interfaces. It's using declarative
and functional approach.

#### Start a project
###### After `iq project <new-project-name` command will be implemented in CLI, it'll be preffered method to start a project
Install **Core** and **CLI**:
- `yarn add @atom-iq/core`
- `yarn add -D @atom-iq/cli` / `yarn global add @atom-iq/cli`

Check [Core](packages/core) and [CLI](dev-packages/cli) docs for more info

> #### Name
> The framework name should be pronounced as _**atomic**_ by default, although it's visually combination of
> _**Atom**_ and _**iQ**_ words. It's named after the most characteristic feature of the **Reactive Virtual DOM**
> architecture - **Atomic** `rvDOM` updates, means that every state update is causing changes only in connected
> parts (elements / props) of `rvDOM` and in a result making atomic changes to `DOM` - the same result as
> in **Virtual DOM**, but without comparing any **JS** object trees (without *reconciliation*) and **with a lot less
> operations** (even in very small examples, it will be described in [Reactive Virtual DOM section](#reactive-virtual-dom)).
>
> Another "**Atomic** in **Atom-iQ**", is the framework architecture - starting from small rendering library, extendable
> by official **Middlewares** (extending rendering logic and component functions), **Utility/Tools** packages, as well
> as by custom / third-party libraries.
>
> Finally, the framework name is written as **Atom**, with **iQ** suffix, separated by a hyphen. Besides looking good,
> the suffix has been extracted to be associated with the smart framework architecture and intelligent
> solutions it introduces.

##### Language support
- **JSX** - **Atom-iQ** is using **JSX** for declaratively describing user interface (own **Babel** plugin)
- **ES6(+)** - Framework is commonly using **ES6(+)** features
  > While most of them, like arrow functions or destructuring, are easy to replace with a legacy **ES5** features,
  > _**Tagged Templates**_ - _used, in example, for reducing a boilerplate and improving development experience with
  > **RxJS** operations in **iQRx** tools package_ - are hard to write and a lot less readable, while using these
  > functions in **ES5** code.

> While it is possible to write **Atom-iQ** apps in **ES5** and without **JSX**, it *doesn't make sense* and **is not
> recommended.**

- **TypeScript** - **Atom-iQ** is written in **TypeScript**, so it has native support. **iQ CLI** is providing
  support for both **JavaScript** and **TypeScript**, while managing `webpack` and `babel` configs. It's determined
  by `typescript: boolean` field of **iQ CLI** config file.
  > The choice should depend on the situation, but **TypeScript** is recommended in most cases and is the **iQ CLI** default
  > choice (`typescript` option is `true` by default). For a small and short-term projects, **JavaScript** could be enough.
- Styles - **iQ CLI** has support for **CSS Modules** and style preprocessors (in `v0.1.0` it's only **Sass**). There is also
  planned an official `styled-components` implementation for **Atom-iQ**, working the same way as in **React**, with
  additional **iQ Component Middleware** for declaring *__Component__-scoped* styles
  ([check Middleware docs](docs/framework/MIDDLEWARE.md)).

#### Rendering architecture & Reactive programming
**Atom-iQ** is based on the **Reactive Virtual DOM** architecture (concept) - new `DOM` rendering solution, made for
performance and scalability. Although it's causing new "complications", by requiring **Reactive Extensions** (**RxJS**,
which is considered hard to learn library), using _**Reactive programming**_ for describing **UI** changes, is removing
other complications, characteristic to **Virtual DOM**, making a lot of things easier and more natural for **JavaScript**.  
**Another advantage is that it's giving full declarative control of UI, over the time.**

**Disadvantage is that it (*RxJS*) is requiring unnecessary boilerplate code, even for simple operations.**

##### *Atom-iQ* is addressing these complications with *iQRx*
For making reactive programming with RxJS a lot easier, reduce or even almost remove boilerplate, providing the way
to work with streams, almost like with plain values - **Atom-iQ** is introducing **iQRx** tools package (optional).

##### More about *Reactive Virtual DOM* concept:
- [Reactive Virtual DOM basics](#reactive-virtual-dom)
- [Reactive Virtual DOM more detailed documentation](docs/reactive-virtual-dom/REACTIVE-VIRTUAL-DOM.md)

##### More about *iQRx* tools:
- [iQRx basics](#atom-iq-iqrx-tools-atom-iqrx)
- [iQRx more detailed documentation](docs/framework/IQ-RX-TOOLS.md)

#### Components
The **Component API** is inspired by **React**, **_but without a support for class components_** - they have no sense with
**Reactive Virtual DOM** architecture. In **Atom-iQ**, the **Component** is just a function, that's taking
props as argument (and middleware props as second, optional argument - `v0.2.0`) and returns **Reactive Virtual DOM**
elements (or other values, that could be element children) - looks like **React's Functional Component**, the difference
is how it's treated by the renderer. While **React** is calling **Component function** everytime the props or state
are changed (because of that, it needs `hooks` for state, lifecycle and some other performance improvements, what's
making **React Functional Component** more than just a function), **Atom-iQ** is calling **Component function** only when
it's added to `rvDOM`. Thanks to that, everything what's inside component, like state or functions, is existing
in runtime, as just a closure.
> Furthermore, it's private and internal for **Component**, unlike private class fields/methods,
> which are public after compilation to older **ES** versions.

That behavior is making **Atom-iQ Component API** a lot easier and component lifecycle is based on **JS** function
lifecycle and operations on streams, which are performed on **Observable** state or props (lifecycle functions moved
to **Middlewares**).

**Components** second argument, **Middleware props**, are special functions, that are extending **Components** behaviors
and features. They have access to the **Component's** `rvDOM` **Rendering Context**, and can provide functionalities to
**Components**, based on it ([more about Middlewares](#scalable-and-extendable-framework-architecture)).

Additionally, **Reactive Virtual DOM** architecture is enabling new solutions, like **Private/Internal Components** /
**Component Functions Composition** -  more info in **Component** documentation (link below).

##### More about Components:
- [Detailed Components documentation](docs/framework/COMPONENT.md)

#### Scalable and extendable framework architecture
The **Core library** (`@atom-iq/core`) includes just a basic **Reactive Virtual DOM Renderer** (without features like
*ref* or *context*, those will be available as **Middleware**) and _**TypeScript**_ interfaces.

It will provide also `createState` function, which looks similar to **React's** `useState` hook and new `eventState` function,
that's providing a way to describe state, as a set of operations, with an event (or multiple events) as a source - connected by
the **Reactive Event Handler** props of an element - [more info](docs/framework/COMPONENT.md#state).

It has **one required peer dependency** - **RxJS**. That's the minimal setup for **Atom-iQ** apps, when it acts as a *simple library*.

Additional features could be added to the **Core library**, by extending basic renderer logic with **Middlewares** or with
other official **Tools** and **Components** libraries, making **Atom-iQ** full customizable framework.

#### Extending core logic with Middlewares (v0.2.0)
**Atom-iQ Middleware** is a function implementing specific interface, based on Middleware type.
There are 2 main types of Middleware - **iQ Renderer Middleware** and **iQ Component Middleware**.
- **iQ Renderer Middleware** is the function, that's taking `rvDOM` nodes objects and return these objects after
  modifications (or/and other arguments, depending on the subtype). They are called with other middlewares of the same subtype,
in specific rendering stage, in order they are specified in an order array (explicitly or automatically) - in other
words, those middleware functions are passed to basic renderer functions from core library and could modify
renderer behaviors.  
_**They are extending Reactive Virtual DOM Renderer**_.
  - Subtypes for **iQ Renderer Middleware** are based on rendering stage, when it's called

- **iQ Component Middleware** is a little more complex, as it's a similar function, that will be called just before
  calling **Component** function, taking some **Component** `rvDOM` specific arguments. The difference is that they have
  to return a function that will be injected to all application components (or only those that need it), with other
  **iQ Component Middlewares** as a second argument for **Component function**. It could be any function. All props
  middleware functions are composed in object and passed as a second argument, to distinguish between explicitly
  passed component props and implicitly injected global functionalities, called **Middleware Props**.  
  _**They are extending Atom-iQ Components functionalities and behaviors, while the component remains
  just a simple function with the same interface.**_

  As a **Middleware** is doing additional operation before injecting its function to the **Component**, and it will be often
  unnecessary for all **Components** to have all **Middleware Props** (many of them probably won't need any global
  functionality), it should be declared per **Component** function, which middlewares it's using - it should be done by **Babel plugin**.

**Middleware** packages are often combinations of different **Middleware** *types* and *subtypes*.
The framework is including official **Middleware** packages.

It's of course possible to write custom **Middlewares**, as they are just functions, implementing specific interfaces.
- [More detailed info in Middleware documentation](docs/framework/MIDDLEWARE.md)

#### Other frameworks/libraries inspirations and comparisons
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
> Currently, `@atom-iq/core` has 4.4kb (gzipped) - but it's still missing some features. On the other hand,
> it's highly unoptimized in current state, so it's hard to say how it will be in the future. It also has one
> required dependency - **RxJS** - fortunately it's *tree-shakeable* and **Core** is not using a lot of functions.

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


Scalable and extendable framework architecture, with the **Middleware** concept - extending core library
with special functions - is inspired by plugins in **[Vue.js](https://vuejs.org/)** (also official tools
and components, that aren't plugins).
> Again, it's just a *"concept"* inspiration - in **Vue**, plugins are installed before starting app,
> and are adding some functionalities, by modifying **Vue** global object or prototype (or just adding
> standard features - called "assets" in official docs). **Atom-iQ** is using functional programming
> and has not instances or global objects - **Middlewares** could be a global component's
> extensions - functions (created in declaration factory functions, passed to `createRvDOM` first function),
> that are taking Component's `rvDOM` related data as arguments and returning function, that will be
> injected to all components as a second argument. Second type of **Middleware**, is a _"rendering hook"_
> **Middleware**. That functions are called in different rendering steps - they have subtypes for
> concrete rendering step, taking `rvDOM` related data, depending on the subtype and returning it transformed.

**Atom-iQ** will also extend the concept of having one, core library and additional official packages, and
will provide a big, rich set of official **Middlewares**, **Tools** and **Components** packages.

More detailed comparisons and comparisons with some other frameworks will be introduced in separate document

## Atom-iQ CLI (`@atom-iq/cli`)
**Atom-iQ CLI** is a main build and development tool for **Atom-iQ**. In case of build tool, it's abstraction
over `webpack` and `babel` config, including custom **JSX** plugin (as a dependency, it's separate library).

*The goal is to provide support for multiple config options, starting from zero config (without any config file,
default config from the CLI package will be used), through simple `iq.cli.json` / `iq.cli.js` config
files or/and custom `webpack.config.override.js` files (that have to export function, that is taking old generated
webpack config and CLI config as arguments and is returning new webpack config), ending at full `webpack.config.js`
files.*

It will also allow for extensions - adding custom command with access to standard **CLI** features.

#### Commands
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

## Reactive Virtual DOM
**Reactive Virtual DOM** is an architecture (or concept) based on **Virtual DOM**, re-designed with reactive programming,
and _**The Observer pattern**_.
> **Atom-iQ's** implementation of `rvDOM` is using **RxJS** as a streaming library, because it's **the most popular
> and stable solution**, known not only for JavaScript developers. **Reactive Extensions'** implementation of _**The Observer**_
> pattern is also composing well with **Reactive Virtual DOM** concept, as well as it has important functionalities,
> like different kinds of **Subject** or great nested subscriptions management, out of the box.
>
> *All **Reactive Virtual DOM** Documentation will be using **RxJS** and **Reactive Extensions** concepts, to
> describe the `rvDOM` architecture.*
>
> However, **Most.js** is known for the **best performance**, from all **JS reactive streams libraries** and theoretically
> **Reactive Virtual DOM** implementation with **Most.js**, could (or should) be even faster than with **RxJS**.
> Anyway, to achieve the same things with **Most.js**, additional libraries / custom solutions would be needed and
> the library has a definitely smaller community and could be even considered harder to learn than popular **RxJS**.

**Reactive Virtual DOM Elements**, returned in object tree structures from **Components** (like in **Virtual DOM**),
are divided into **Static** (not-changeable in runtime) and **Observable** (_"changeable"_ / streamable) **Nodes**. The same rule
is applied to **props** - every _**non-Observable**_ value is **Static**, not-changeable prop. These **Observable Nodes or props**,
are most likely transformed from **state** (component's or global) or from other sources like `rvDOM` **Events** or
in example http calls. **State** is a field _existing inside **Component** closure_, and it's one of the **RxJS' Subjects**.
`createState` is using `BehaviorSubject` and this type of `Subject` should work best for classic **React** like **state**.
`eventState` is using `ReplaySubject` with replayed one last value, similar to **Behavior**, but without initial value.

According to this, **Reactive Virtual DOM** is _always just one tree of objects_, where the parts of the **UI (Nodes/Props)**, _that are
changing in runtime, are **Observable**_. When some **state** is updating, *it's emitting new value* and only parts of the `rvDOM`
connected to that's state **Observable**, are getting "informed about change", and updating that parts of `rvDOM`,
without touching any other elements, causing atomic updates of the corresponding `DOM` **Nodes** or **Properties**.

#### What it exactly means and what advantage it has ?
Consider this max simple example, which could look almost the same in **Atom-iQ** and in **React**
```typescript jsx
import { createState } from '@atom-iq/core'
// or
// import { useState } from 'react'

const Test = ({ appHeader }) => {
  const [testClass, nextTestClass] = createState('testClass') // or useState('testClass') in React

  const handleClick = () => nextTestClass('newTestClass')

  return (
    <main>
      <section className="test-section"> // `className` used to be React compatible, in Atom-iQ just `class` is recommended
        <header>
          <h1>{appHeader}</h1>
        </header>
        <article className="test-article">
          <p>
            <span className={testClass}>Span with testClass</span>
          </p>
        </article>
      </section>
      <section>
        <button onClick={handleClick()}>Change class</button>
      </section>
    </main>
  )
}
```

Ok, that's *no-brain* **Component** with some **JSX** structure and just one string state field, which is passed to
`className` prop of `span`, that's in fifth level of deepness in the **JSX** structure. Additionally, it has also `appHeader`
string prop. Consider that it can be changed on runtime, so in **Atom-iQ** it's an **Observable** string. It contains
also a `handleClick` function, which is just calling `setTestClass` with `'newTestClass'` argument. That function is
passed to `onClick` (event handler) prop of `button`. Let's consider 3 cases - first is initial **Component** render,
second is clicking the button and changing `testClass` state, and the last case is when `appHeader` prop is
changing (is emitting new value in `rvDOM`), somewhere higher in `vDOM`/`rvDOM` tree structure.

1. Initial **Component** Render
   - Overall, initial render is similar in both frameworks / architectures, **Component** function is called with
     props (one prop in this case, `appHeader`). Then operations inside function are performed, and then resulting
     `vDOM` / `rvDOM` tree is returned. Then, both rendering engines are recursively rendering corresponding `DOM`
     trees
   - **React / Virtual DOM** - on the initial render, `useState` is creating state field connected with `Test` **Component**
     instance (as it's functional component, "instance" in this case means, component function result and state / other
     hooks, connected with that component, existing somewhere in `vDOM`) and returning tuple with its current value
     and `setState` function. Created **state** is existing outside of **Component** function, to persist between **Component**
     function re-calls (re-renders). Then the `handleClick` function is created. As it's initial render, it will
     create nodes and add them to `vDOM` and in a result to `DOM`.
   - **Atom-iQ / Reactive Virtual DOM** - **Component's** function is called only on the initial render, when the
     **Component** is added to `rvDOM`. A `createState` function is creating `BehaviorSubject` inside the *closure* and
     is returning tuple with state stream (`BehaviorSubject` as `Observable`) and `nextState` (calling **Subject's**
     `next` method) function. Then `handleClick` function is created. Returned `rvDOM` is rendered recursively and
     all elements are added to `rvDOM` tree structure and in result to `DOM`. However, in the case of **Observable**
     Props / State bound to `rvDOM` properties or nodes, renderer is subscribing to those streams and applying
     `rvDOM` / `DOM` operations synchronously or asynchronously, depending on the **Observable** type.
2. Changing **Component** State
    - This logic is completely different and is the main scalability and performance advantage for **Reactive Virtual DOM**
    - **React / Virtual DOM** - clicking the "Change class" button, is calling `setTestClass` function with
      `'newTestClass'` argument - it's the special **React's** `setState` function, which is informing **React**, that something
      inside it, is changed. It's causing re-call of **Component's** function, which means re-evaluation of everything inside
    **Component's** function - in this case, getting current (changed) value of `testClass` state, re-creating `handleClick`
      function and returning new **Virtual DOM** tree structure, with just one simple change - `span`'s `className` prop, was
      changed from `'testClass'` to `'newTestClass'`. Then **React** is running *reconciliation* on the result `vDOM` - it's comparing
      recursively all elements, starting from `main`, ending on a button's text node child, against previous **Component's** `vDOM`.
      So, for applying one small change that is affecting only one element's attribute, **React** has to check all other nodes.
      Even if that is fast and performant heuristic algorithm, which is definitely faster than operations on the `DOM` tree,
      *it's still performing a lot of unnecessary operations*, to check where the change happened.
    - **Atom-iQ / Reactive Virtual DOM** - clicking the "Change class" button, is calling `setTestClass` function with
      `'newTestClass'` argument. It's calling `BehaviorSubject`'s `next` method, which will emit `'newTestClass'` as a next stream
      value. Then, next value is received by the `span`'s `className` prop observer (subscriber), which is updating `DOM` **Element's**
      `className` property. **That's all!**
3. Change of the **Component** Prop
    - It's basically the same situation, as for changing state, only first step is different, as it happens outside
      the component - in one of parent components.
    - **React / Virtual DOM** - change of prop(s) is detected, while running *reconciliation* on one of parents components `vDOM`.
      So, it's (almost) always change of some state in parent component, running reconciliation, checking all nodes in parent,
      detecting that component prop is changed and then re-calling **Component's** function, which cause similar operations
      as described in previous point (Changing Component State).
    - **Atom-iQ / Reactive Virtual DOM** - change of prop, is emitting next value, by the **Observable Prop**. It means,
      that when that prop is coming in example from some state, then when that state is emitting next value, it's just
      causing the same single operation as for **Component** state (for every connected / subscribed prop or node), no matter
      how deep is the prop passed in **Component** / **Elements** tree.

#### Conclusions
Even in that simple, minimal example, it's clearly seen, that **Reactive Virtual DOM** is doing a **LOT LESS** operations,
on every **state** update, compared to **Virtual DOM**. The changes in `rvDOM` are **atomic**, do not touching other **UI** elements -
changes are detected *atomically per state* field and in elements, that are* explicitly, declaratively connected* with that
**Observable** state field. In the opposite to **Virtual DOM**, **Reactive Virtual DOM** is not even touching elements,
which have not **Observable props**, nor **Observable children**.

**Reactive Virtual DOM** architecture is designed for **scalability** - more complex the application is, the difference
is greater, as the scope of operations affected by `rvDOM` updates, doesn't depend on the application size and structure.

> htmlTemplateTag (v0.3.0/v0.4.0)
> Thanks to the fact, that **Static** elements and props are rendered just once, and then they aren't affected by the
> update cycles, **Atom-iQ** could introduce `htmlTemplate`, template tag function, that's improvement of performance
> for rendering static elements.
>
> // TODO: Check if it's worth it. There could be problems with optimization of these strings.
>
> Example:
> ```jsx
> const InnerComponent = ({ testProp }) => (<someJsx />)
> const [someClassStream] = createState('someClass')
> 
> const staticHtmlGroup = iQhtml`
>   <div class="static-template">
>     <section class="${someClassStream}">
>       <div class="inner-div">
>         ${<InnerComponent testProp="abc" />}
>       </div>
>     </section>
>   </div>
> `
> ```
>
> *__It's not a templating language, nor an alternative way of writing apps.__ It is a feature, that is created only for
> specific cases (lot of static elements in component & most of them has also only static props) and is just an
> addition to standard **JSX** interface.*
>
> It's "template tag argument" is just a plain html text with `rvDOM` children/props interpolations. It's returning
> new type of `RvdElement`, called `RvdHTMLTemplateElement`, with pre-parsed HTML string and mapping of interpolated
> values. `htmlTemplate` pre-parsing is removing all interpolations from the html template string, replacing it by
> specific content, based on interpolation type.
> - For the **HTML Attribute interpolation**, if the value is a plain string or number, it's just added to string. Otherwise,
>   when the value is **Observable**, it's removing interpolation, along with the attribute name. Instead, it's adding a
>   special attribute, with interpolation index (from an array of all template interpolations) and connecting it
>   with interpolation, adding entry to interpolations map.
> - For the HTML Child interpolation, if a value is a plain string or number (TextNode or another html string), it's just
>   added to string, same as attributes. Otherwise, when it's any **JSX** value or **Observable**, interpolation is replaced by
>   placeholder element, with a special attribute and reference is added to interpolations map.
>
> Then, when renderer is taking care of `RvdHTMLTemplateElement`, **the `DOM` subtree is generated at once from HTML String.**
> The top-level created parent element is referenced, for connecting interpolated attribute values to the `DOM` elements or
> replacing placeholder for evaluated **JSX** expression / connected **Observable** child, and then for appending it to parent `DOM`.
> `rvDOM` renderer is connecting props / rendering children the same way, as in standard **JSX** approach, the only difference,
> is that reference to them, had to be found in generated `DOM` by the attribute from interpolation map. After connecting of each
> interpolation, attribute is removed. After connecting them all, the top-level element is ready to be appended to parent `DOM`.
>
> This functionality should improve performance, when there's a lot of static elements to render, next to each other. In
> one operation it's doing, something that normally will need a one operation per static element, creating unnecessary
> rendering contexts, children managers, etc., while separate rendering of them isn't needed and useful anywhere.
>
> **The rule worth to remember, is "fewer interpolations (proportionally to static elements number), better performance"**.
> `htmlTemplate` with large and disproportional number of interpolations is a mistake, renderer will faster create
> those elements from **JSX** one by one, than when it has to find them in generated `DOM`

## Atom-iQ iQRx Tools (@atom-iq/rx)
While using reactive programming and **RxJS** leads to the biggest **Atom-iQ** advantages, I know that for some people,
it could be an argument against library. **RxJS** is known from its steep learning curve and is considered a
"hard to learn, hard to master" library, and it may be the key argument for some less experienced people, to use existing
**Virtual DOM** based solutions, with basic plain data structures instead of reactive streams.

On the other hand, keeping all state in **Observable** streams and doing all state transformations in **pipeable operators**
or **Observable create functions** requires some boilerplate code. In certain situations, like in example doing math
operations on some streamed numbers or concatenating various number of streamed strings, it may look like writing a lot
of unnecessary and complicated code for easiest operations.

#### **iQRx** tools are made to keep all the advantages of reactive architecture, along with easy and user-friendly API
Main objectives for **iQRx** are:
- provide an easy interface, allowing working with **Atom-iQ**, for even less **RxJS** experienced people
- reduce boilerplate, mainly for common use cases, like mapping stream values to `rvDOM` elements, etc.
- provide smart way for declaring expressions with latest streams values combined, almost like with plain values

#### iQRx Expression tagged template functions
**iQRx** tagged templates provide easy and no-boilerplate way for expressions with multiple stream values. Their template
string arguments are specific _**"JS in JS"**_ expressions, allowing **Observable** interpolations. So, they look like
normal **JS** expressions, with **Observables** used as regular, plain values.  
At first, **iQRx** tagged template functions are combining all interpolated streams with `combineLatest`, then injecting
the latest values into template string, and finally returning new Observable with evaluated expression.

- Without **iQRx**
```typescript
    import { combineLatest, of } from 'rxjs'
    import { switchMap } from 'rxjs/operators'
    import { first, second, third } from './observable-numbers'

    const plain = 7

    const result = combineLatest([first, second, third]).pipe(
      switchMap(([firstVal, secondVal, thirdVal]) => of(
          (firstVal + secondVal) * 3 / (2 + thirdVal) + plain
        )
      )
    )
```
- With **iQRx**
```typescript
    import { iQRxMath } from '@atom-iq/rx'
    import { first, second, third } from './observable-numbers'

    const plain = 7

    const result = iQRxMath`
      (${first} + ${second}) * 3 / (2 + ${third}) + ${plain}
    `
```


> > (v0.3.0/v0.4.0)
> ##### The *Atom-iQ iQRx Tools* package is providing utilities for easier and more efficient work with *RxJS*, especially in **Atom-iQ**
> Example of a lot of boilerplate in **RxJS** operations, could be doing some math calculations on values from different
> streams. `iQRxMath` template tag function is made for easy math operations on streams. `iQRxSentence` is an equivalent for
> string streams composition and `iQRxLogical` for booleans.
>
> Example:
> ```typescript jsx
> import { createState } from '@atom-iq/core'
> import { iQRxMath, iQRxSentence, iQRxLogical, iQRxTernary } from '@atom-iq/rx'
> 
> const AtomiQRxTools = ({ propsNumber }, { store }) => {
>   const [stateNumber, nextStateNumber] = createState(7)
>   // Store Middleware prop function callback is taking { state, dispatch } as argument, so the same function
>   // is used for selectors and action factories - both state and dispatch are optional, but cannot be used
>   // together. It's returning [state$, connectState?] for selectors, and [action$?, connectAction?]? for action factories.
>   // `connectState` and `connectAction` acts similar as `connectEvent` from `eventState`
>   const [storeNumber] = store(({ state }) => state.storeNumber)
>   const [userName] = store(({ state }) => state.user.name)
>   const [isAdmin] = store(({ state }) => state.user.isAdmin)
>
>   const calculatedNumbers = iQRxMath`
>     8 + (${stateNumber} - ${storeNumber} * 3) / 2 + ${propsNumber}
>   `
> 
>   const isLuckyAdmin = iQRxLogical`${isAdmin} && ${propsNumber} === 7`
> 
>   const className = (suffix) => `rx-tools-example${suffix ? `__${suffix}` : ''}`
>
>   return (
>     <section class={className()}>
>       <header class={className('header')}>
>         {iQRxTernary`
>           ${isLuckyAdmin} ? ${(
>             <h1 className={className('h1')}>
>               {iQRxSentence`Hello ${userName}! You are lucky admin, your number is ${propsNumber}`}
>             </h1>
>            )} : ${iQRxSentence`Hello ${userName}, your state number is ${stateNumber}`}
>         `}
>       </header>
>       <article class={className('article')}>
>         {calculatedNumbers}
>       </article>
>     </section>
>   )
> }
> 
> // AtomiQRxTools.useMiddleware = ['store'] - Added by babel plugin
> 
> export default AtomiQRxTools
> ```
>
> Those template tag functions are a nice way to compose basic streams, providing experience close to working with
> plain values. They are taking template strings, with specific **JavaScript** expressions, with streams interpolations.
> First functions are combining the latest values from interpolated streams, then injecting them into expressions,
> evaluating expressions and streaming the latest expression result (when some stream will emit new value, expression
> will be re-evaluated).

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
> The project is on early development stage. Core features are working, however it still needs testing in a real app.
>
> The current version is `v0.1.0-alpha.3` - first pre-release
>
> Current state is the confirmation of:
> - **atomic** `DOM` updates, **without reconciliation** - using instead **atomic** `rvDOM` updates - no diffing,
>   change happening only in connected nodes
> - **fast operations on keyed arrays** - _adding, replacing, moving, removing_ only affected DOM Nodes - no matter
>   of their position in the array (in **React**, they have to be siblings)
>   - classic example for comparison vs. **React** (just checked) - switch first and last element of the array
>     - in **React** all **DOM Elements** within list are affected
>     - in **Atom-iQ** only the first and last of elements are affected - but even these **DOM Elements** aren't
>       re-created, they are the same elements, just moved - `rvDOM` **Renderer** is then connecting new returned (in the array)
>       `rvDOM` **Elements**, to existing, moved **DOM Elements**
>
> Simple example could be found in [_preview directory](web) - better example - official **Atom-iQ** webpage is
> under development.
>
> The priority for full `v0.1.0` - first npm release is now adding more unit tests and test features in practice.
>
> The source code of the renderer will also be improved and refactored, during the evolution of the project.
> Currently I'm concentrated on creating 100% working version to check **Reactive Virtual DOM** architecture
> in practice, then will be time for improvements.

#### Versions
> **Atom-iQ** is using _**Semantic Versioning 2.0.0**_

As **Atom-iQ** framework is scalable & extendable - built with small parts, one _required_ **Atom-iQ Core Library**
(`@atom-iq/core`), _recommended_ **iQ CLI** (`@atom-iq/core`) build and development tool, and a lot of additional
packages containing **Middlewares** and **Tools**, in example `@atom-iq/ref`, `@atom-iq/context`,
`@atom-iq/store`, it will use the same major releases for all packages in `@atom-iq` *npm scope*.

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

##### A more detailed description of everything about the framework **DEVELOPMENT**, will be still (and always) available:
- [Atom-iQ Development Processes](DEVELOPMENT.md)
