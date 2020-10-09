# Reactive Virtual DOM
### The architecture of Atom-iQ

#### Motivation
> The idea for this project came to my mind when I was looking for **RxJS** solutions for **React**, other
> than `redux-observable`. **RxJS** and reactive programming is something I missed in **React**, compared
> to the **Angular** in which I wrote earlier. Then I realized that such a combination does not make much
> sense - _the **Virtual DOM** architecture contradicts it_. The solutions I've seen are passing new values
> to props when new stream values come out. This obviously results in reconciliation and differentiation
> of the `vDOM` **Component** structure.  
> That's not the point - it looks like these solutions track property changes that are… **Observable**
> and know best when their values change.
>
> Although, the `vDOM` differentiation, which results in _**atomic**_ `DOM` updates, is definitely faster
> than doing such operations on the `DOM` tree, it's still doing operations (even if it's just checking)
> on the whole sub-tree, _**while it could be done on single (`vDOM`) nodes**_.
>
> Proof, that the `vDOM` reconciliation is important for performance, is the big difference between
> the differently optimized libraries.
>
> On the other hand, **React** is a great library to work, well-designed, especially with **Functional
> Components and hooks**. However, **hooks** were introduced to **React Functional Components**,
> to allow them to act like their internal context (closure) were kept.
>
> **Reactive Virtual DOM** acts completely different and *address these and more issues*.

### One change, that made a big difference
**Reactive Virtual DOM** has one base assumption:
- nodes and properties are distinguished to **Static** and **Observable**
  - **Static** are all synchronous **JS (JSX)** values, in other words, all
    standard `vDOM` values
  - **Observables**, could have the same values as **Statics**, but are
    "wrapped" inside an **Observable** stream

Which leads to the other assumptions:
- `rvDOM` nodes or properties, with connected (interpolated/bound)
  **Observables**, are the **Observers**
- connected **Observables** are coming more likely from state / props
- **"connected"** means that **Observable** state / prop is passed
  somewhere in **Components** returned `rvDOM`, but they aren't passed
  as values, but as references
- to know that state (or props, but **Observable** props are most likely
  just references to the state from parent components tree) was
  updated, no diffing is needed - *connected nodes / properties get
  notification directly from the source*, not touching other elements
- when connected node gets a notification about update with new
  value, it will either update a `DOM` property or child / children
- as everything that's changing in runtime is passed as a reference,
  **Component** functions are called just once they are added to `rvDOM`,
  then they're existing with internal closure context (**Component
  Rendering Context**)
- as a **Components** and **Fragments** are not `DOM` elements, their
  **Rendering Contexts** are existing inside their first `RvdDOMElement`
  parent's rendering context
- **Element Rendering Contexts** are really important, because while
  the element is existing in `rvDOM` and `DOM`, it's **Rendering Context** is
  keeping all the information about children shape and keeping them
  in sync
- **The exception**, when the `rvDOM` renderer is checking children elements, is when
  rendering dynamic arrays - then it's using **keys**:
  - if **keys** aren't used, then *elements will be always re-created*
  - if **keys** are used, `rvDOM` is managing them in **Fragment Rendering Context** - that context
    is also created for streamed arrays - it has mapping between **keys** and `rvDOM` & `DOM` elements.
    So, when new array is streamed it's moving, replacing, removing and rendering children,
    base on mappings
- children rendered from **Fragments** and **Arrays**, nested in **Elements**, are treated different, than
  other children or children from other arrays, look at example:
  ```typescript jsx
  import { iQRxList } from '@atom-iq/rx'

  // streamedArray = Observable with ['abc', 'def']
  const App = ({ streamedArray }) => {
    // Helper operator, doing rxjs `map()` inside and `Array.prototype.map()`,
    // passing callback from argument to it (to Array `map`)
    const mapList = iQRxList(item => <div key={item}>{item}</div>)
    
    return (
      <main class="app">
        <header>
          <h1>Header</h1>
        </header>
        <section>Section</section>
        {mapList(streamedArray)}
        <article>
          Mid Page Article
        </article>
        <>
          <div>Div In Fragment</div>
          <div>Second Div In Fragment</div>
          {[
            <div>Div In Nested Array</div>,
            <div>Second Div In Nested Array</div>
          ]}
        </>
        <footer>Footer</footer>
      </main>
    )
  }   
  ```
  Listed **DOM** children of main should be:
  ```
    0. header
    1. section
    2. div key=abc
    3. div key=def
    4. article
    5. div (Div In Fragment)
    6. div (Second Div In Fragment)
    7. div (Div In Nested Array)
    8. div (Second Div In Nested Array)
    9. footer
  ```
  `rvDOM` renderer is managing them _separately_ in **Element Rendering Context**:
  ```
    0. header
    1. section
    2. FragmentRendererContext (from array)
    2.0. div key=abc
    2.1. div key=def
    3. article
    4. FragmentRendererContext (Fragment)
    4.0. div (Div In Fragment)
    4.1. div (Second Div In Fragment)
    4.2. FragmentRendererContext (Fragment)
    4.2.0. div (Div In Nested Array)
    4.2.1. div (Second Div In Nested Array)
    5. footer
  ```
  It's making managing children a lot of easier and guarantee, that static and other stream dependent
  elements are not touched, during the update of dynamic array.

In **Atom-iQ**, after calling `createRvDOM(middlewares?)(rootRvDOM, rootDOMorSelector)`, **Reactive
Virtual DOM Renderer** is creating `rvDOM` sub-trees, passing static and connecting (subscribing) **Observable**
state / props, rendering `DOM` sub-trees and creating corresponding trees of **Subscriptions**. All the **Subscriptions**
in `rvDOM` nodes are managed by the renderer - thanks to the **RxJS Subscription** nesting ability.

### Reactive Virtual DOM is always only one
Unlike the **Virtual DOM**, `rvDOM` is always one for the main `DOM` structure - after starting, the reference
to the top `RvdNode` will remain the same in the runtime. All nested nodes will have the same references too:
- **Statics** will have also the same `DOM` **Elements** and their references
- in case of streamable (changeable) nodes, **Observables** - there will be the same references to the streams,
  and their **Observers** will be in the parent, referenced tree
  - for the changeable sub-trees, situation is the same - when they are existing in the `DOM`, they are
    existing in the `rvDOM` too with the same references

It doesn't mean that `rvDOM` is _mutable_, it's **immutable**, but additionally it's **readonly** in case
of **JavaScript Objects**, but "inside" these **readonly** objects, new **immutable** `rvDOM` values are
streamed.

> #### Pre-evaluation
> This opens up big new possibilities for pre-evaluating code during compilation. Theoretically, it could
> be possible to create the initial `rvDOM` and `DOM` in the *pre-evaluation* stage - without any input data - just
> create state entities and connect (subscribe) to nodes. Then in the browser, after starting the application,
> just attach the pre-created nodes to the root `DOM`. The plan is to adapt [**Facebook's Prepack**](https://prepack.io/)
> and develop the solution to achieve it.

> #### SSR
> Similar to **Pre-evaluation** - I think that, in case of **Server Side Rendering**, it should be possible, to `hydrate`
> only **Observable** nodes or **Static** nodes with **Observable** props - the rest of **Statics** will be out
> of control of framework, as standard `DOM` nodes, but without corresponding `rvDOM` nodes - as the only thing,
> that framework is doing in case of statics is initial render.

### Reactive Virtual DOM, DOM, RxJS and it's push model
**ReactiveX (RxJS)** and its *push system*, is the ideal way to model the browser `DOM` events system. `DOM` **Events**
are also pushed, same way like **Observable** stream values. Unlike **Virtual DOM**, where it's change could
be completely different, than resulting `DOM` change, **Reactive Virtual DOM** is almost a 1:1 `DOM` model,
except that `DOM` don't see **Components** and **Fragments**. **Atomic** change in `rvDOM` is resulting in corresponding
change in `DOM`. Thanks to **RxJS**, `rvDOM` is also existing in runtime, almost the same way as `DOM` and have
the ability, to listen for multiple **Events** (from one source), without changing its references, completely
asynchronous - like in real `DOM`.

That makes programming in **Atom-iQ** and **Reactive Virtual DOM**  much more predictable - *developer has
the full control*, where and when the change happens and can be sure exactly which `DOM` elements will be updated

### "Concurrent mode" by default
Lastly, the **React** team is working on new set of features called "Concurrent mode". It means that rendering
(updating) tasks could be cancelled, when more urgent update happened or **React** can work on different state updates
concurrently. It can always render elements in memory, while waiting for asynchronous data.

**Atom-iQ** provides "Concurrent mode" features by default, thanks to the **Reactive Virtual DOM** architecture
- As dynamic content in **Atom-iQ** must be **Observable**, it could be cancelled (unsubscribing or operators)
  - When new update is happening before previous update finished, previous update could be cancelled just by
    `switchMap` operator
- **Atom-iQ** state updates are **atomic**, rendering could be synchronous or asynchronous
  - while rendering **Element's** children, it's not rendering them one by one (except they are all synchronous) - when
    **Element** is asynchrounous, it could even render 5 mins later than the siblings - **Atom-iQ** will render that **Element**,
    in correct order after finishing asynchronous operation - without touching other elements (except DOM parent and nextSibling,
    where it's added of course, for `appendChild` or `insertBefore`).
  - updates don't touching other **Elements**, so they are independent from other updates
- When **Atom-iQ** is creating and rendering Observable Elements, it creating Observers and doesn't care if it source is streaming
  a value - it could create all **Reactive Virtual DOM**, without initial values and then update elements, when the value is emitted
  
  
## Examples, with described differences vs Virtual DOM

#### Consider that simple example
```typescript jsx
const App = () => {
  // const [name, setName] = useState('App') // in React
  // Atom-iQ has also new reactive and declarative `eventState`, check details below in docs
  const [name, nextName] = createState('App') // in Atom-iQ

  const handleChangeName = () => nextName('Changed Name') // setName in React

  return (
    <main className="app">
      <button type="button" onClick={handleChangeName}>Change Name</button>
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
Ok, so what's happened, after clicking `Change Name`?

#### Virtual DOM
1. `setName` is called - `App` **Component** is re-rendered (function is called) with new `name` state
    value - `'Changed Name'`
2. in `App` **Component** `useState` is called for getting actual `name` value and `changeName` function is re-created
3. returned `vDOM` is compared against previous version - in this case `main` and `button` are skipped,
   but `Layout` `name` prop is changed
4. `Layout` **Component** is re-rendered with new `name` prop value
5. `vDOM` returned from `Layout` is compared against previous version - `Header` and `Footer` have props changed
6. `Header` is re-rendered with new `children` prop value
7. returned `vDOM` is compared against previous version and as value of Text node inside `h1` changed,
   that `Text` node is updated
8. `Footer` is re-rendered with new `name` prop value
9. returned `vDOM` is compared against previous version and as value of title attribute on `footer` changed,
   that attribute value is updated and as `Text` node inside `h2` changed, that text is also updated

#### Reactive Virtual DOM
1. `setName` is called - `next` method of the `name` state's **Behavior Subject** is called with `'Changed Name'`
   as a new value - it's emitting new `name` to connected subscribers
3. as `name` is connected (subscribed implicitly) in 3 places, that 3 tasks will run asynchronously at once:
    - in `Header` subscription to the child `Text` node of `h1` is getting new value and Text node is updated
    - in `Footer` subscription to the `title` prop of `footer` is getting new value and attribute value is updated
    - in `Footer` subscription to the child `Text` node of `h2` is getting new value and Text node is updated

#### Classic non-real world example - update of state passed deeply down in structure
```typescript jsx
const App = () => {
  // const [name, setName] = useState('App') // in React
  const [name, nextName] = createState('App') // in Atom-iQ

  const handleChangeName = () => nextName('Changed Name')

  return (
    <main className="app">
      <Nest {name} />
      <button type="button" onClick={handleChangeName}>Change Name</button>
    </main>
  );
};

const Nest = ({ name }) => (
  <section className="a">
    <section className="b">
      <section className="c">
        <section className="d">
          <section className="e">
            <Nest2>
               <Nest3 name={name} />
            </Nest2>
          </section>
        </section>
      </section>
    </section>
  </section>
);

const Nest2 = ({ children }) => (
  <section className="f">
    <section className="g">
      <section className="h">
        <section className="i">
          <section className="j">
            {children}
          </section>
        </section>
      </section>
    </section>
  </section>
);

const Nest3 = ({ name }) => (
  <section className="k">
    <section className="l">
      <section className="m">
        <section className="nested :)">
          <section className={name}>
            {name}
          </section>
        </section>
      </section>
    </section>
  </section>
);
```

I know that it's really strange example, but it demonstrates the real power of **Reactive Virtual DOM** - the
scalability - operations during the update, are independent of app structure and size.

While in `vDOM`, for changing the most nested `section` `className` and `TextNode`, it needs a checking of all nested
structure, starting on re-calling the `App`, then all 3 `Nest` **Components** with their nested elements.

In **Reactive Virtual DOM**, it's almost the same as in previous example - now there are only 2 operations in the 2nd step,
so _**it's even faster**_.

### Reactive Event State
**Atom-iQ** has a new feature for handling a state, declaratively described as a pipeline of operations,
with a connected event as a source. Check example:
```typescript jsx
import { eventState } from '@atom-iq/core'
import { map } from 'rxjs/operators'
// startWith deprecated in new RxJS version, assume some simple custom re-implementation
import startWith from './start-with-custom'

const App = () => {
  const [name, connectEvent] = eventState(map(event => event.target.value))

  const header = startWith('App')(name)

  return (
    <main className="app">
      <header>
        <h1>{header}</h1>
      </header>
      <input placeholder="Type new App name" value={name} onChange$={connectEvent()} />
    </main>
  );
};
```
