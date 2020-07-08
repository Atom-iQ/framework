# rX UI Suite
#### Project Name
###### rX UI Suite is project working name, it will be used until we find better name
###### All packages names as `rx-component` are also working names

#### Development Plan
- Before starting real work again, clean up the repository - files, names, directories, packages etc.
- target version for making project public is `v0.1.0`
- `v0.0.1` is target version for first working version, which means:
  -  JSX is properly transformed into `rvDOM`
  - `rvDOM` is correctly created from components and connected - with exception for array case,
    it could not be 100% implemented
  - basic unit tests for rendering `rvDOM`
- and for public `v0.1.0` version:
  - all rendering and subscribing/unsubscribing cases are 100% implemented
  - complete unit tests suite
  - it depends on situation, but it will be good to have basic implementation
    of router and other non-core libraries

## Framework
#### `rX UI Suite` is a full reactive framework for building User Interfaces

`rX UI Core` is based on the **Reactive Virtual DOM** concept - completely new DOM rendering solution,
based on **Virtual DOM**, extended with `RxJS`. Core library includes Component API, similar to `React`
Functional Components with state and JSX - but it may look similar, in fact, they are completely different
which will be explained in [Reactive Virtual DOM](#reactive-virtual-dom) section.

`rX UI Suite` contains also additional libraries, which makes it complete framework:
- `rx-ui-cli` (not implemented)
- `rx-ui-router` (not implemented)
- `rx-ui-redux` state management (not implemented)
- `rx-ui-tools` - helper functions for reactive programming

## Reactive Virtual DOM

**Reactive Virtual DOM** is similar to **Virtual DOM**,  as it is also creating a tree of JS objects,
representing DOM structure, but all components rendering/re-rendering or element attribute changing
logic is completely different.

#### Key Features
**Reactive Virtual DOM** is introducing atomic state and DOM updates, no re-render approach and don't need
diff algorithm (except array case, where maximum simple diff algorithm will be probably introduced)

In `rvDOM` everything that could be changed in runtime, have to be `RxJS` **Observable stream**. 

#### Reactive Virtual DOM vs Virtual DOM
###### React is most popular Virtual DOM library, so we will be using React as example
##### Main differences
- in `vDOM` all the props/children (and state) are changeable
- `rvDOM` is introducing static and observable props/children:
  - static props are all props, that aren't `RxJS` **Observable**
  - static in this case, means that they aren't changing in runtime
  - observable props, are according to the name `RxJS` **Observable** props
  - they are "changing" in runtime - in fact, they aren't changing, but they are streams and they
    are emitting new values in runtime
  - so, in `rvDOM` all changes are made by emitting new values to observable props
- in `vDOM` every change of component's props or state is causing re-render of the component, which means - comparing
  new returned **Virtual DOM** to previous `vDOM` snapshot and updating properties that changed (or inserting
  or removing elements) - based on diff algorithm
- in `rvDOM` change of state or props, which means - new value was emitted - is not causing component re-render.
  Component is rendered just once, when it's mounted and is re-rendered only when is removed and will be 
  mounted again. Change of state is emitted only to connected (subscribed) properties or **Observable** children
  and is updating connected elements properties or adding/removing DOM node, independently, without touching
  any other part of UI - that's called atomic state and DOM updates
  - thanks to that, `rvDOM` doesn't need diff algorithm to track what's changed - it's assuming that, if Observable
    is emitting new value, it means that change happened - tracking changes is managed by `RxJS` subscription
- in `vDOM` **state** is something, that is persisting between component re-renders, which means, that in case
  of Functional Components in `React`, component is a function which returns `vDOM`, but also a state connected
  to that component, but existing outside the component function
- in `rvDOM` it's simpler - component is function is called only when it's mounted, so component is just
  a **closure**! And component state is just a Observable variable (in most cases it's `BehaviorSubject`) hidden
  inside Component closure
- in `vDOM` DOM updates are synchronous - `vDOM` is always compared with previous state and the changes are propagated
- in `rvDOM` updates are asynchronous and independent, which means that many changes could be propagated at once,
  but to different elements of application
  
#### Consider that simple example
```typescript jsx
const App = () => {
  const [name, setName] = useState('App');

  const changeName = () => setName('Changed Name');

  return (
    <main className="app">
      <button type="button" onClick={changeName}>Change Name</button>
      <Layout name={name} />
    </main>
  );
};

const Layout = ({ name }) => (
  <section className="app-layout">
    <Header>{name}</Header>
    <Footer name={name} />
  </section>
);

const Header = ({ children }) => (
  <h1 className="app-header">{children}</h1>
);

const Footer = ({ name }) => (
  <footer className="app-footer" title={name}>
    <h2 className="app-footer__h2">{name}</h2>
    <h3 className="app-footer__h3">Footer</h3>
  </footer>
);
```
That code will work in both `rX UI Suite` and `React`.

Ok, so what's happened, after clicking `Change Name`?

#### Virtual DOM (React)
1. `setName` is called - `App` component is re-rendered (function is called) with new `name` state
    value - `'Changed Name'`
2. in `App` component `useState` is called for getting actual `name` value and `changeName` function is re-created
3. returned `vDOM` is compared against previous version - in this case `main` and `button` are skipped,
   but `Layout` `name` prop is changed
4. `Layout` component is re-rendered with new `name` prop value
5. `vDOM` returned from `Layout` is compared against previous version - `Header` and `Footer` have props changed
6. `Header` is re-rendered with new `children` prop value
7. returned `vDOM` is compared against previous version and as value of Text node inside `h1` changed,
   that Text node is updated
8. `Footer` is re-rendered with new `name` prop value
9. returned `vDOM` is compared against previous version and as value of title attribute on `footer` changed,
   that attribute value is updated and as Text node inside `h2` changed, that text is also updated

#### Reactive Virtual DOM (rX UI Suite)
First, assume that in `rvDOM`, `useState` is creating `RxJS` **BehaviorSubject** and returning array
with **Observable** stream of state and function which calls **Subject**'s `next` method:

```typescript
const useState = function<T extends unknown = unknown>(
  initialState: T
): rxComponent.RxState<T> {
  const stateSubject: RxBS<T> =
    new BehaviorSubject(initialState);

  const state$: RxO<T> = stateSubject.asObservable();
  const setState: rxComponent.RxSetStateFn<T> = valueOrCallback  => {
    if (isFunction(valueOrCallback)) {
      state$.pipe(
        first()
      ).subscribe(valueOrCallback);
    } else {
      stateSubject.next(<T>valueOrCallback);
    }
  };

  return [state$, setState, stateSubject];
};
```

So, `name` is **Observable** stream and calling `setName` is emitting new value to `name` stream subscribers.

Then, what's happening:
1. `setName` is called - `next` method of `name` state **Subject** is called with `'Changed Name'` as a new value -
   it's emitting new `name` to connected subscribers
2. as `name` is connected (subscribed implicitly) in 3 places, that 3 tasks will run asynchronously at once:
    - in `Header` subscription to the child Text node of `h1` is getting new value and Text node is updated
    - in `Footer` subscription to the `title` prop of `footer` is getting new value and attribute value is updated
    - in `Footer` subscription to the child Text node of `h2` is getting new value and Text node is updated

###### It's very simple example, but demonstrates the power of `rvDOM` Atomic Updates
It's main concept difference between **Reactive Virtual DOM** and **Virtual DOM**
- `vDOM` change is a change of whole `vDOM` structures - then previous `vDOM` structure is compared to new
  computed `vDOM` structure and changes are made in where the structure is different
- so `vDOM` is making changes to `DOM` only where there's a difference, but to know a difference, changes from whole
  `vDOM` structure are compared to previous structure - **so, `DOM` updates could be considered atomic,
  but `vDOM` updates definitely not**
- `rvDOM` change is completely different - `rvDOM` has not something like `previous structure` - `rvDOM` is
  immutable **Observable** stream with connected nodes structure and every nested child is another **Observable**
  observed by parent element - it could be cold and synchronous **Observable**, when child is static
  (is not changing in runtime) or hot and asynchronous **Observable**, when child is coming from **Observable**
- thanks to that architecture, `rvDOM` change is updating (by emitting new value) only that parts of `rvDOM`, that
  are **subscribed** to the state that changed (**Observable** which is emitting new value) - without touching other
  parts of `rvDOM` - **`rvDOM` updates are atomic**
- `rvDOM` is updating `DOM` atomically in subscriptions to **Observable** props/children - it's changing `DOM`
  element property or is inserting/removing/replacing `DOM` node
- as all `rvDOM` changes are atomic and independent from other parts of `rvDOM`, all `DOM` changes are also
  atomic and independent - in example, when some `state` property is connected to some prop of 2 different
  elements in component, change of that state is not a one `rvDOM` change (like in `vDOM` it is one `vDOM` change) - in
  `rvDOM` there are 2 separate atomic changes, one for each connected (subscribed) prop - `rvDOM` is starting
  2 asynchronous and independent `DOM` updates - thanks to that, update of one of props/children depends only
  on that one update and error doesn't affect rendering of other elements
- so, `rvDOM` is changing only where connected prop (state) is getting new value and is updating `DOM` properties/nodes
  that are connected to that prop - **so, both `rvDOM` and `DOM` updates are completely atomic** - `rvDOM` knows what
  should be updated (in `vDOM` it's that difference between previous and current state, computed by diff (reconciliation)
  algorithm) without diffs, because of `RxJS` subscriptions - change is propagated to subscribed props and **Observable**
  prop, that is changing, knows which parts of `rvDOM` are subscribed to it

#### Because of that Reactive architecture and Atomic updates concept, the main advantages of Reactive Virtual DOM are:
###### In this moment - "theoretically" - there are just assumptions, we will see the results in first working release (`v0.0.1`)
- Performance
  - theoretically `rvDOM` should be faster than every `vDOM` implementation in most possible scenarios
  - as you saw in the example case, which is very simple case, `vDOM` required 9 steps (operations) and is running
    diff (reconciliation) algorithm for every element and component in `vDOM` tree from component, where state
    was changed to components and elements, where `DOM` will be updated. It's in example causing re-render of
    `Layout` component and is running diff against it's `vDOM`, doesn't matter that it's only passing props down
    to the children. `vDOM` has to run diff against `Layout`'s returned `vDOM`, to know, that it has to re-render
    children components, where the `DOM` updates should happened
  - in `rvDOM`, the same example case is just 2 simple steps/operations (or may be considered as 4 steps, cause 2nd step
    is in fact splitted into 3 asynchronous operations)
    - 1st step is emitting new `name` state value
    - 2nd step is asynchronously and independently updating `DOM` properties and nodes in 3 connected
      (subscribed) elements
    - that operations don't need any diff algorithm and are not affecting any element or component between
      component where state changed and where the `DOM` will be updated (ie. `Layout`) - they are also not
      re-rendering components where `DOM` will be updated, they are making changes only in elements, where the
      props are subscribed
  - so in `vDOM` it will be various number of steps, depending on how complicated is change and how complicated
    is `vDOM` elements and components structure (in example it could have additional steps, like re-creating
    functions or getting actual state).
  - in `rvDOM` in the other hand it will always be 2 steps and 2nd step will always have the same number of
    independent, asynchronous operations, as number of places where the changing prop is connected (subscribed)
  - so in almost every case `rvDOM` is performing less operations than `vDOM`
  - and all that operations are a lot less complicated
  - more complicated the change and affected components and elements structure is, `rvDOM` has more performance
    benefits over `vDOM` - because in `rvDOM`, number of operations in 2nd step, don't depend on element structure,
    but only on number of connections/bindings
  - that facts are confirming that `rvDOM` architecture is designed to outperform every `vDOM` implementation
  - predictability, described below is allowing for easy ahead-of-time compilation - in production AOT build,
    `rvDOM` could be initially rendered and connected on build time and then on application start - ready, created
    and connected `DOM` will be just attached to root element, which will definitely increase initial performance
  - `rvDOM` and `rX UI Suite` aims to be fastest and best performance UI framework on the market
- Predictability
  - Atomic updates concept is also guarantee of predictability
  - Developer has full control of what should be updated - only explicitly connected (subscribed) props and children
    are changing in reaction to connected state update - the rest of `rvDOM` (and `DOM`) is untouched - even if
    the state, that will be updated is passed many levels down in the component tree as a prop - new state value
    will be streamed by that **Observable** prop and subscription will be triggered only on target element, all
    Components between one, where state changed and one where the `DOM` updates will be made, are untouched
    in that operation, as long as they don't bind that stream to some element prop or don't perform any side effect
  - every side effect is explicit and controlled by developer - every side effect of changing anything in app,
    have to be handled as `RxJS` **Observable** stream transformation (pipeline)
  - every UI change is described as `RxJS` **Observable** stream transformation
  - because of this architecture, number and type of every Component and element children is explicit, known
    even at build time and are not changing in runtime
    - in `vDOM` number of component/element children could change on runtime, it depends in example on changes
      in rendered array or on results of conditional expressions
    - in `rvDOM` normal `array` is static prop, so it will not be changing in runtime. But it means also, that it's
      value should be explicitly declared in application - all values that coming outside the application should be
      **Observables** - according to it, number of children is just computed from array length
    - normal conditional expressions are also computed from static properties and the result is known on build time
    - but in `rvDOM`, more realistic case, when conditional expression is evaluated on runtime or when array elements
      are changing on runtime (similar to normal arrays and conditional expressions in `vDOM`) is when the array
      is streamed as a value of **Observable** state or some elements are rendered conditionally,
      depending on **Observable** stream value
    - it looks like the type and number of child elements could be different, but for `rvDOM` it's just a single
      **Observable** child and it's known on build time, that it's one **Observable** child
- Scalability
  - `rvDOM` architecture is scalable and independent of size of application
  - thanks to **Atomic updates** concept, all state updates are always constant number of operations - it will
    always depend on number of places where state is connected (subscribed)
  - so, state updates performance is independent of application size
- More natural, functional component behavior
  - Component function is called only when component is added to `rvDOM`
  - because of that, component state are just **Observable** variables, existing in `DOM` in component closure
  - currently `React` is using hooks to achieve similar functional behavior, in `rvDOM`, it's natural
  - Component lifecycle is simpler too, it's just a function lifecycle and some operations on **Observable** streams:
    - everything inside function body will be executed, when Component is created (but before it's `rvDOM`
      is rendered, as it will be rendered after function return value) - it's creating state subjects or component
      functions - it's called once, only after Component is added to `rvDOM` - it's like a `constructor` in `React`
      class component
    - if we want something like `componentDidMount` or some use case of `useEffect` from `React` - means doing some
      action, after Components `rvDOM` (and `DOM`) is initially rendered, we should return **Observable**
      of component's `rvDOM`, piped with specific operation. `rx-ui-tools` is providing `rx-ui-tools/lifecycle`
      package for handling that **Observables**
    - for doing side effect after Component's `rvDOM` is initially rendered,
      use `afterRender(afterRenderCallback, rvDOM)` helper function
    - for doing side effect after Component is removed from `rvDOM`,
      use `afterDestroy(afterDestroyCallback, rvDOM)` helper function
    - for doing both `afterRender` and `afterDestroy`, use `lifecycle({ afterRender, afterDestroy, render })`
      helper function
    - for doing action after state or prop value changed, use `tap` operator on state or prop **Observable** stream or
      provided helper function `afterChange(callback, ...propsAndState)`
    

## Detailed docs for packages
#### rX UI Core
- rX DOM [docs](packages/rx-dom/README.md) 
- rX Component [docs](packages/rx-component/README.md)
- rX UI Shared [docs](packages/rx-ui-shared/README.md)

#### rX UI Modules
- rX UI Tools [doc](packages/tools/README.md)
