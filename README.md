# rX UI Suite
#### Project Name
###### rX UI Suite is project working name, it will be used until we find better name
###### All packages names as `rx-component` are also working names

## Framework
#### `rX UI Suite` is a full reactive framework for building User Interfaces

`rX UI Core` is based on the **Reactive Virtual DOM** concept - completely new  
DOM rendering solution, based on **Virtual DOM**, extended with `RxJS`.  
Core library includes Component API, similar to `React` Functional Component  
with state and JSX - but it may look similar, in fact, they are completely different  
which will be explained in [Reactive Virtual DOM](#reactive-virtual-dom) section.

`rX UI Suite` contains also additional libraries, which makes it complete framework:  
- `rx-ui-cli` (not implemented)
- `rx-ui-router` (not implemented)
- `rx-ui-redux` state management (not implemented)
- `rx-ui-utils` - helper functions for reactive programming

## Reactive Virtual DOM

**Reactive Virtual DOM** is similar to **Virtual DOM**,  as it is also creating a tree of JS  
objects, representing DOM structure, but all components rendering/re-rendering  
or element attribute changing logic is completely different.

#### Key Features
**Reactive Virtual DOM** is introducing atomic state and DOM updates,  
no re-render approach and don't need diff algorithm (except array case,  
where maximum simple diff algorithm will be probably introduced)  
In `rvDOM` everything that could be changed in runtime, have to be  
`RxJS` **Observable stream**. 

#### Reactive Virtual DOM vs Virtual DOM
###### React is most popular Virtual DOM library, so we will be using React as example
##### Main differences
- in `vDOM` all the props/children (and state) are changeable
- `rvDOM` is introducing static and observable props/children:
  - static props are all props, that aren't `RxJS` **Observable**
  - static in this case, means that they aren't changing in runtime
  - observable props, are according to the name `RxJS` **Observable** props
  - they are "changing" in runtime - in fact, they aren't changing, but they  
    are streams and they are emitting new values in runtime
  - so, in `rvDOM` all changes are made by emitting new values to observable props
- in `vDOM` every change of component's props or state is causing re-render of  
  the component, which means - comparing new returned **Virtual DOM**  
  to previous `vDOM` snapshot and updating properties that changed (or inserting  
  or removing elements) - based on diff algorithm
- in `rvDOM` change of state or props, which means - new value was emitted -  
  is not causing component re-render. Component is rendered just once, when it's  
  mounted and is re-rendered only when is removed and will be mounted again.  
  Change of state is emitted only to connected (subscribed) properties  
  or **Observable** children and is updating connected elements properties  
  or adding/removing DOM node, independently, without touching any other part  
  of UI - that's called atomic state and DOM updates
  - thanks to that, `rvDOM` doesn't need diff algorithm to track what's changed -  
    it's assuming that, if Observable is emitting new value, it means that  
    change happened - tracking changes is managed by `RxJS` subscription
- in `vDOM` **state** is something, that is persisting between component re-renders,  
  which means, that in case of Functional Components in React, component is  
  a function which returns `vDOM`, but also a state connected to that component  
  but existing outside the component function
- in `rvDOM` it's simpler - component is function is called only when it's mounted,  
  so component is just a **closure** ! And component state is just a Observable  
  variable (in most cases it's `BehaviorSubject`) hidden inside Component closure
- in `vDOM` DOM updates are synchronous - `vDOM` is always compared with  
  previous state and the changes are propagated
- in `rvDOM` updates are asynchronous and independent, which means that  
  many changes could be propagated at once, but to different elements of  
  application
  
#### Consider that simple example
```jsx harmony
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
1. `setName` is called - `App` component is re-rendered (function is called) with new  
  `name` state value - `'Changed Name'`
2. returned `vDOM` is compared against previous version - in this case `main` and  
  `button` are skipped, but `Layout` `name` prop is changed
3. `Layout` component is re-rendered with new `name` prop value
4. `vDOM` returned from `Layout` is compared against previous version - `Header`  
  and `Footer` have props changed
5. `Header` is re-rendered with new `children` prop value
6. returned `vDOM` is compared against previous version and as value of Text node  
  inside `h1` changed, that Text node is updated
7. `Footer` is re-rendered with new `name` prop value
8. returned `vDOM` is compared against previous version and as value of title  
  attribute on `footer` changed, that attribute value is updated and as Text node  
  inside `h2` changed, that text is also updated

#### Reactive Virtual DOM (rX UI Suite)
First, assume that in `rvDOM`, `useState` is creating `RxJS` **BehaviorSubject**  
and returning array with **Observable** stream of state and function which calls  
**Subject**'s `next` method:

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

So, `name` is **Observable** stream and calling `setName` is emitting new value to  
`name` stream subscribers.

Then, what's happening:
1. `setName` is called - `next` method of `name` state **Subject** is called with  
  `'Changed Name'` as a new value - it's emitting new `name` to connected  
  subscribers
2. as `name` is connected (subscribed implicitly) in 3 places, that 3 tasks  
  will run asynchronously at once:
    - in `Header` subscription to the child Text node of `h1` is getting new  
    value and Text node is updated
    - in `Footer` subscription to the `title` prop of `footer` is getting new  
    value and attribute value is updated
    - in `Footer` subscription to the child Text node of `h2` is getting new  
    value and Text node is updated

## Detailed docs for packages
#### rX UI Core
- rX DOM [docs](packages/rx-dom/README.md) 
- rX Component [docs](packages/rx-component/README.md)
- rX UI Shared [docs](packages/rx-ui-shared/README.md)

#### rX UI Modules
- rX UI Tools [doc](packages/rx-ui-tools/README.md)
