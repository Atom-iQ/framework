# Atom-iQ Reactive Virtual DOM Elements
###### `RvdDOMElement` from `@atom-iq/core`
**Reactive Virtual DOM Element** is the representation of **DOM** object

```typescript jsx
const rvdElement = <section class="atom-iq">I'm element's text child</section>
```

## Element Props
#### Difference between Element and Component Props
Generally, in **Atom-iQ**, we can distinguish between two different, but similar types of `Props`:

- `RvdDOMElement Props`
- `RvdComponent Props`

The main difference between them, is that names (keys) of `RvdDOMElement Props` are limited
and cannot be different, than names of `DOM` properties (or `HTML` attributes in some cases)
available for that type of `RvdDOMElement` or for event handling - names of events in PascalCase,
prefixed with `on`, with or without `$` suffix. And additionally special `children`, `key`, and
props added/enabled by **Middlewares**, like `ref`.

> `onEventName$` is a new syntax specific to `rvDOM` and **Atom-iQ**. It's called **_Reactive
> Event Handler_** - Passed callback is getting access to `RvdEvent` `Observable` stream (as an argument)
> and should return Observable, for auto-unsubscribe by the framework.

> *__React__ like* `onEventName` event handlers, with `RvdEvent` as an argument, are invoked as next callback
> in subscription to Event (_"EventName"_) stream of `RvdDOMElement` and is called "**_Classic Event Handler_**".

Names of `RvdComponent Props`, on the other hand, are unlimited, they could be **any custom string**, that
is *allowed as an object property key*.

> `children`, `key` and `ref` are not allowed as custom props, they are special props, used in rvDOM Rendering
> process and have the same type for all components

#### HTML like Prop names
**Atom-iQ** is allowing for prop names like `class` or `for`, but is also allowing using _**React** like_
names (`className`, `htmlFor`) - when both will be presented, **HTML** like names will be used

### Element Props Categories
1. **Observable Props**
    - In `rvDOM`, every `prop`, which value is "**_changeable_**", have to be **RxJS** `RxO` stream
      and exclusively for some special element properties (like in example `styles`) - also `Record`
      with `Observable` streams.
        > NOTE: Technically prop value is never changing, it is always reference to the same Observable.
        In perspective of rvDOM, **changeable** value means, that value is an Observable stream and new values
        can be emitted in that stream.

    - **Observable Props** could be bound **directly to elements, as props or as children** - in `{}`
      **JSX** expressions. They will be connected, subscribed and unsubscribed by `rvDOM` implicitly.

2. **Callback Props**
    - In `rvDOM`, every `prop`, which value is `Function` is **CallbackProp** - it's used for passing
      component internal functions or anonymous functions down the `rvDOM Tree`.
    - In Case of `RvdDOMElement` - Callback functions are [Event handlers](#element-events)

3. **Static Props**
    - In `rvDOM`, **Static Props**, are all `props` that aren't **Observable** stream (or `Array`/`Record` with
      streams for components) or `Function`. That means all the `props`, except `Functions`, which are flat
      in case of time (synchronous), are connected statically to other components props and DOM elements
      properties and cannot be changed in runtime.
    - **Static Props** are `readonly`. In `rvDOM`, **Components** functions aren't called after `prop` value
      changes, so changing component/element (static) `prop` value is doing nothing, as component function
      will not be called again with new props. `RvdComponent` exists in `rvDOM` as a **closure**, from
      initial render, until removing component from `rvDOM` and values of `props` are streamed inside/outside
      `RvdComponent` in **Observable Props**
      > Changing Static props or other static values leads to unexpected behaviors - if child depends on
      > static value, it will be changed (UI won't be changed) and then child will be removed - when it
      > will be added to `rvDOM` again, it will be different

4. **Special Props**
    - **Special Props**, are common `props`, that **every type of Component or Element** could have. Special
      props in every `Element` has the same type, and they are reserved for the core `rvDOM` functionalities
      like `rvDOM Rendering Process`
## Element Events
#### Event Handlers
**Atom-iQ** has two types of Event handlers for `rvDOM` Elements:
- **"Classic"** - passing callback, with event object as an argument, to `onEventName` **Callback Prop** - the same
  way as in `React` - callback will be passed to `RvdEvent` subscription and called on every new **Event** (*"EventName"*)
  dispatch. It's automatically unsubscribed after element is removed from `rvDOM`

- **"Reactive"** - passing callback with `RvdEvent` **Observable** stream as an argument, to `onEventName$` `prop` - it's
  special `RvdReactiveEvent` handler callback prop - `RvdEvent` stream is callback's argument and then any **RxJS** operation
  could be performed on that stream - callback have to return **Observable**, which will be added to Element's subscription
  and unsubscribed after element is removed from `rvDOM`
  - it could be used with **Component's Reactive Event State** - [check Component docs](COMPONENT.md#reactive-event-state)
