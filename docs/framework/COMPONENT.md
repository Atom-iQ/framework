# Atom-iQ Component
###### `RvdComponent` interface from `@atom-iq/core`
```typescript jsx
const rvdComponent = <SomeComponent prop={value} {...props} />
```
In **Atom-iQ**, **Component** is one of the main app's reusable building blocks. **Component** is a declarative
description of a part of the **UI** and connected behaviors. It means that **Component** is:
- describing part of **UI**, by grouping **Reactive Virtual DOM** Elements and other Components (returning `rvDOM`)
- describing behaviors, connected to that part of **UI**, by grouping
  - **state** - all the data, that can be changed in runtime - changes of state are the main factor, that's
    causing **UI** updates
  - **state transformations** - operations on state, performed before binding it somewhere in returned `rvDOM` - done
    mostly in **RxJS** operators, **Observable** create functions or **iQRx** tools functions
  - **functions** - private, internal **Component**'s functions - causing emitting new state values or any other operations
  - **and by binding state, transformed state or other Observables to returned `rvDOM`, declaring which parts of returned
    `rvDOM` will be changing (or could be) in runtime**

#### Atom-iQ Component is a function, taking props as first, and middleware props as second argument and returning the part of `rvDOM`
- both arguments are optional
  - props is an object, containing properties passed from parent **Component**
  - middleware props is an object, containing functions, that are extending Components features and behaviors,
    available for every **Component**, but may depend on rendering context (means, where the **Component** is located in `rvDOM`)
- returned value have to be compatible with `rvDOM`, described as:
  - **JSX** - main and default option, used in most examples in documentation
  - micro templating language - **iQRxML** - alternative way of declaring **UI**, used as tagged templates - containing
    HTML with both, standard **JS** tagged templates interpolations and some minimalistic additional syntax, made
    especially for **Reactive Programming** (it's just the idea, at this time)
  - **iQStaticHtml** - another tagged template, containing *only HTML compatible* template string, and allowing for
    **interpolations**. This one is creating special `rvDOM` element, `RvdStaticHtmlGroupElement`, and should be used,
    when there's a lot of static elements, one after each other, in UI declaration. When rendering, it will be parsed
    to **DOM Nodes**, from **HTML String**, at once. Then interpolated values will be connected with created **DOM Nodes**,
    and all the structure will be attached to **DOM**. As it's for static elements case, they could be grouped and appear
    in `rvDOM` as a single **Element**, because as long as their parent is existing in **DOM**, they will never change
    and won't be touched, while making changes in state / UI. Therefore, while **Atom-iQ** is well optimized enough, when
    rendering static elements from standard, single `rvDOM` nodes, it could be optimized even more and making some
    parts of UI, act almost like a static page.

##### All these options could be combined, even in one Component
Example of different Components
```typescript jsx
import { createState, RvdComponent, RxO, iQStaticHtml } from '@atom-iq/core'
import { iQRxIf, iQRxList, iQRxDistinctMap } from '@atom-iq/rx'
import iQRxML from '@atom-iq/rx-ml'
import { pipe } from 'rxjs'
import { map, distinctUntilChanged } from "rxjs/operators"

import { TestOne, TestTwo, TestThree } from './test-components'

interface ExampleProps {
  propsNumber: RxO<number>
  propsStrings: RxO<string[]>
  shouldRenderAdditionalStatic: RxO<boolean>
}

const JSXExample: RvdComponent<ExampleProps> = ({ propsNumber, propsStrings, shouldRenderAdditionalStatic }) => {
  const [header, nextHeader] = createState('JSX')
  
  const shouldShowP = pipe(
    map(number => number >= 7),
    distinctUntilChanged()
  )(propsNumber)

  return (
    <TestOne language={header}>
      <header class="JSX__HEADER">{header}</header>
      {iQRxIf(
        (<p class="JSX__NUMBER">{propsNumber}</p>),
        (<span class="JSX__NUMBER">{propsNumber}</span>)
      )(shouldShowP)}
      <section class="JSX__ARRAY">
        {iQRxList(str => <TestTwo text={str} />)(propsStrings)}
      </section>
      {iQRxIf(
        iQStaticHtml`
          <section class="JSX__STATIC-HTML">
            <header>
              <h2>STATIC HTML IN</h3>
              <h3>${header}</h3>
            </header>
            <div class="JSX__INTERPOLATED">
              ${<TestThree />}
            </div>
          </section>
        `
      )(shouldRenderAdditionalStatic)}
    </TestOne>
  )
}

const IQRxMLExample: RvdComponent<ExampleProps> = ({ propsNumber, propsStrings, shouldRenderAdditionalStatic }) => {
  const [header, nextHeader] = createState('iQRxML')
  
  const shouldShowP = iQRxDistinctMap(number => number >= 7)(propsNumber)

  const third = iQRxML`<TestThree />`

  const JSXinIQRxML = <div class="JSX">JSX IN iQRxML</div>

  return iQRxML`
    <TestOne language=${header}>
      <header class="iQRxML__HEADER">${header}</header>
      <iQRx ${shouldShowP} |> iQRxIf ->
        <p class="iQRxML__NUMBER">${propsNumber}</p>
      <->
        <span class="iQRxML__NUMBER">${propsNumber}</span>
      </iQRx>
      <section class="iQRxML__ARRAY">
        <iQRx ${propsStrings} |> iQRxList -> str =>
          <TestTwo text={str} />
        </iQRx>
      </section>
      <iQRx ${shouldRenderAdditionalStatic} |> iQRxIf -> 
        ${iQStaticHtml`
          <section class="iQRxML__STATIC-HTML">
            <header>
              <h2>STATIC HTML IN</h3>
              <h3>${header}</h3>
            </header>
            <div class="iQRxML__INTERPOLATED">
              ${third}
            </div>
          </section>
        `}
      </iQRx>
      ${JSXinIQRxML}
    </TestOne>
  `
}
```

Second **Component** is showing also usage of `iQRxDistinctMap` instead of standard `RxJS` operators. Both example components,
are using `createState` function, which will be described in [State section](#state).

##### For more info about **iQRxML** templating micro language, check its [documentation](IQRX-ML.md).

#### Component function is called only once, when Component is added to `rvDOM`, creating *Component Rendering Context*
_**Component Rendering Context**_ is a closure, where the **Component's** state and connected operations exists, while it's a part
of current **Reactive Virtual DOM**.
> As **Atom-iQ** is using functional programming and generally has not instances (except storing data - Observable
> streams are instances of Observable class and internally renderer is using `ChildrenManager` class, it's special
> implementation of `Map` for managing rendering *synchronous* and *asynchronous* children of Element), technically
> **Components** has not instances.  
> However, a term *"instance"* (in quotes), will be used in case of **Components**, meaning a single appearance of a
> **Component** of the same type in the `rvDOM` structure. In other words, **Component** *"instance"* is a single
>**Component Rendering Context**, created by calling **Component** function.

## Props
#### Component Props Categories
1. **Observable Props**
    - In `rvDOM`, every `prop`, which value is "**_changeable_**", have to be **RxJS** `Observable` stream
      and exclusively for components - also `Array` or `Record` with streams.

    - **Observable Props** passed to **Component**, could be then bound **directly to elements/components
       props or as children** - in `{}` **JSX** expressions. They will be connected, subscribed and
       unsubscribed by `rvDOM` implicitly.

2. **Callback Props**
    - In `rvDOM`, every `prop`, which value is `Function` is **CallbackProp** - it's used for passing **Component**
      internal functions or anonymous functions down the `rvDOM Tree`.

3. **Static Props**
    - In `rvDOM`, **Static Props**, are all `props` that aren't stream (or `Array`/`Record` with streams for
      components) or `Function`. That means all the `props`, except `Functions`, which are flat in
      case of time (synchronous), are connected statically to other components props and DOM elements properties
      and cannot be changed in runtime.

    - **Static Props** are `readonly`. In `rvDOM`, **Components** functions aren't called  after `prop` value changes, so
      changing **Component**/element `prop` value is doing nothing, as component function will not be called again
      with new props. `RvdComponent` exists in `rvDOM` as a **closure**, from initial render, until removing
      **Component** from `rvDOM` and values of `props` are streamed inside/outside `RvdComponent` in**Observable Props**

4. **Special Props**
    - **Special Props**, are common `props`, that **every type of Component or Element** could have. Special
    props in every **Component** has the same type, and they are reserved for the core `rvDOM` functionalities like
    `rvDOM Rendering Process`

## State
**Component state** is a _**Component's internal data**_, that could be connected to **Component's UI**, and could be
_explicitly changed in the runtime_.

> ##### Double meaning of the term `state` / _Component state_
> In **Atom-iQ**, **"Component state"** has double meaning. It's a single field of **Component's** internal data, but we're
> also using term **"Component state"** for all these _(state) fields_ inside **Component**. However, the term
> _**"Component state field"**_ is too long, to be called explicitly every time.  
> So, the term **"state"** should be enough for both meanings and should not be confusing.

Generally, `state`'s _**role**_ is the same, as in **React**, but because of **Reactive Virtual DOM** architecture,
it's implementation and behavior is completely different - it's a lot less connected with **Component** itself (means,
with **Component** internal functionalities - like hooks in **React**, in the other hand it's truly private
inside **Component**) - it's existing in **Component Rendering Context**,  but unless explicitly referenced with `Ref`,
it's not visible even for the renderer.

**State** has to be **Observable**, with the ability to emit new values over time, so **RxJS Subjects** are a natural
choice. **BehaviorSubject** is **recommended in most cases**, according to the fact, that it's keeping the last value.

#### `createState` function
**Atom-iQ Core library** (`@atom-iq/core`) provides the `createState` function, to help to create a state.
```typescript jsx
import { createState, RvdComponent } from '@atom-iq/core'

const App: RvdComponent = () => {
  const [state, nextState] = createState<string>('state') // type param will be inferred in this case
  
  return (
    <main class="create-state-example">
      <header>
        <h1>{state}</h1>
      </header>
      <footer>
        <button onClick={() => nextState('new state')}>Update state</button>
      </footer>
    </main>
  )
}

export default App
```
It looks like **React's** `useState` hook and is designed to provide a similar interface, as it's really nice and
comfortable to work with. Difference in naming is off course caused by its implementation - inside, it's just creating a
**BehaviorSubject** and returning a tuple with `BehaviorSubject` exposed as **Observable** on first position (`state`),
and function for emitting next **state** on second position (`nextState`).

`nextState` function could take a next **state** value () or callback, taking current **state** value and returning next
state value. Then it's calling **BehaviorSubject's** `next` method, emitting new state to subscribers (connected
`rvDOM` nodes) - that's the reason, why it's called a `nextState`, not a `setState`, like in **React**.

#### `eventState` function - new, more reactive and declarative alternative
###### Reactive Event State
**Atom-iQ** is introducing completely new **Reactive Event State** - approach, where the state and its updates, are
declaratively described as transformations of _**Connected Events**_. Let's go with example:
```typescript jsx
import { eventState, RvdComponent } from '@atom-iq/core'
import { map, pipe, tap, scan } from 'rxjs/operators'
// startWith deprecated in new RxJS version, assume some simple custom re-implementation
import startWith from './start-with-custom' 


const App: RvdComponent = () => {
  const [state, connectEvent] = eventState<string>(pipe(
    scan(acc => acc + 1, 0),
    map(num => `new state number ${num}!`)
  )) // 1
  
  const logClick = tap(event => console.log('Update state from event: ', event)) // 2
    
  const header = startWith('state')(state) // 3
    
  return (
    <main class="create-state-example">
      <header>
        <h1>{header}</h1>
      </header>
      <footer>
        <button onClick$={connectEvent(logClick)}>Update state</button>
      </footer>
    </main>
  )
}

export default App
```

The `eventState` function is returning connectEvent, instead of nextState as a second element - the function that's
connecting state and event (for a certain element) - then state value are computed from incoming events.
One state field could be connected to multiple events.

Let's analyze example:
1. `eventState` is taking an operator (that could be piped before) - it's used to compute state value from
   events - for all connected ones (it's optional, state could keep just event, but it's not recommended).
2. Additionally, connectEvent is also taking optional (pre-)operator, called per one concrete event, before calling operator for
   all events - it's enabling connecting different types of events, by transforming them to the same format.
3. In this example, state, that is connected to returned `rvDOM`, is handled by the `startWith` operator
   before connecting, to provide initial `value` to renderer. It's optional, but it's good to use - the `eventState`
   is using internally `ReplaySubject`, with buffer set to 1 - as it's a state, and it holds last `value` for new
   Observers, but hasn't initial `value` - as the events has not initial `values` too.

This example may look more complicated, but is actually more declarative and reactive, _**and eliminates the need to make
imperative `nextState(value)` calls**_. The only way for state updates, is connecting it to event.

> Notice `onClick$`, with `$` suffix - it's a special, new Event Handler Prop type - **Reactive Event Handler**


> #### State immutability and "changes" in *Reactive Virtual DOM*
> First sentence at the top of the section, says that `state` could be "_explicitly changed in the runtime_". It could
> be confusing, as in fact, `state` fields (and **Subjects**) are immutable objects and aren't ever-changing in runtime.
> Instead, they are stream, that emitting new `state` values. Anyway, it's often called the _"change of the state"_, as
> it's the standard term for web apps, and is also a good description for emitting new `state` values - but it's worth
> to know, that every "change" in **Reactive Virtual DOM** is in the fact emission of new stream value.

It's recommended to use `createState` function (or own functional abstraction), instead of just **BehaviorSubjects**
in **Components**, to keep consistency with **Atom-iQ** functional design.

## Lifecycle
**Component Lifecycle** in **Atom-iQ** and **Reactive Virtual DOM** is a little different (a lot simpler), than those
known from **Virtual DOM** or other solution (ie. **Angular**). It's caused by the fact, that props and state changes
in `rvDOM` are atomic and aren't tracked per **Component**, but per field (single prop / single state field). Then,
**Atom-iQ Component** has not `update lifecycle`, update is connected with particular prop / state and part of the **UI**,
connected with that prop / state, and should be handled with **RxJS operators**.

So, the **Component Lifecycle** is just:
1. Init - **Component function** is called - all operations before `return` statement are executed
2. Render - returned `rvDOM` part is transformed to **DOM** (renderer) and appended to parent element
3. Destroy - **Component** is removed from `rvDOM` and it's children are removed from **DOM**

First step is just the function content, performing action after the 2nd step (after a render) is achievable by returning
**Observable** of `rvDOM` and using some operators on it. For doing something after Destroy, there will be needed
some hacks, but it's possible (from **Component** function).

As with **Reactive Virtual DOM**, usage of **Component Lifecycle functions** will be a lot less important and should
be rather _rare_, **Atom-iQ Core** library (`@atom-iq/core`) has not utilities for **lifecycle** - it's moved to
optional `@atom-iq/lifecycle` **Middleware** package - more info below, in **Middleware** section.

## Middleware
##### Extending Component's behavior


## Internal Components & Component Functions Composition
**Reactive Virtual DOM** architecture and **Atom-iQ Component API**, are allowing **Component Functions Composition**
with **Internal Components**. It means declaring **Components** , inside other **Component's** function, using its
props, state and functions, without passing it as props.
> It's possible, because for **AtomiQRvdRenderer** there is no difference, if streams bound to **Component's** `rvDOM` are
> from **Component's** state, props, etc., or from outside of the **Component** function - changes are tracked *atomically*,
> per stream, not per **Component**. Therefore, it's possible to even create state outside function, above its declaration,
> and then use it inside **Component**, and it will be updating `rvDOM` and `DOM`, although, it will be shared between
> all **Component** *"instances"*

- To distinguish between **Parent Component**, which means *"**Component**, which called (and pass props) this **Component**"*
  and *"**Component**, where this (internal) **Component** is declared"*, let's call it **Declare Context Component**


The pros of **Internal Components**:
- They are hidden from the rest of application, private for **Declare Context Component**
- They have access to all the state, props and functions from **Declare Context Component**, without a need to pass it
  as props
- Above point, means that it could reduce number of props passed to children **Components**

The cons:
- **Internal Components** functions have to be created every time the **Declare Context Component** is added to `rvDOM`
- Abusing this pattern could lead to readability decreasing

Both, the pros and cons should be considered, while using **Internal Components**. In example, using **Internal Components**
in **Component** that is often being added and removed from `rvDOM` isn't the best idea, in case of performance.  
On the other hand, it's enabling some interesting solutions, like creating something like _**"Module Components"**_ -
**Component** containing smaller, **Internal Components** sharing some state and props between "Components in module".
It will ensure, that some Components will never be used outside the *"module"*

Example:
```typescript jsx
import { createState, RvdComponent, RxO } from '@atom-iq/core' // RxO is a shortcut interface for Observable
import { map } from 'rxjs/operators'

interface Props {
  firstMainProp: RxO<string>
  secondMainProp: RxO<number>
  showHeaderText: RxO<boolean>
}

const DeclareContextComponent: RvdComponent<Props> = ({ firstMainProp, secondMainProp, showHeaderText }) => { 
  const [sectionHeader, nextSectionHeader] = createState<string>('SECTION HEADER')

  const SectionHeader: RvdComponent = () => {
    const [otherInfo, nextOtherInfo] = createState<string>('OTHER INFO')

    const HeaderTextsSwitcher: RvdComponent = () => {
      const handleHeaderTextChange = () => nextSectionHeader('NEW HEADER')
      const handleOtherInfoChange = () => nextOtherInfo('NEW OTHER INFO')
        
      const SwitchButton: RvdComponent<{ type: 'header' | 'info' }> = ({ type }) => (
        <button onClick={type === 'header' ? handleHeaderTextChange : handleOtherInfoChange}>
          {type === 'header' ? 'Change header' : 'Change other info'}
        </button>
      )
        
      return (
        <div>
          <SwitchButton type="header" />
          <SwitchButton type="info" />
        </div>
      )
    } 

    return (
      <header>
        {map(show => show ? (<h1>{sectionHeader}</h1>) : null)(showHeaderText)}
        <h2>{otherInfo}</h2>
      </header>
    ) 
  }

  const ContentSection: RvdComponent = () => (
    <div>
      {firstMainProp}
      {secondMainProp}
      Header text: {sectionHeader}
    </div>
  )

  return (
    <section className="declare-context-component">
      <SectionHeader />
      <ContentSection />
    </section>
  )
}
```

