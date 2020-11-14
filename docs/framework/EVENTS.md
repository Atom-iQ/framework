# Atom-iQ RED (Reactive Event Delegation)
**Atom-iQ** has own event handling system, called *Reactive Event Delegation* (**Atom-iQ RED**).
It's an abstraction over browser native event system, based on top-level delegation, internal mapping
of handlers and **RxJS** streams.

**Atom-iQ RED** is inspired by **React Event System**, but has one major concept difference:
- The target for **React's** system, beyond performance, is providing cross browser interoperability - that's
  why *React Synthetic Events* are different from a browser native events. The main con of that approach is a lot
  bigger bundle size, as all Event types have to be re-implemented.
- **Atom-iQ RED** target is just performance and reactive interface. It's concentrated on simulating browser event
  capturing and bubbling phases, but, unlike **React**, is using extended native events. **RED Synthetic Event** has
  the same interface as browser native event, with some properties and methods overridden (like `currentTarget`
  or `stopPropagation()`), to work in **RED** abstraction layer.

#### Classic and Reactive Handlers
**Atom-iQ RED** is providing 2 different types of event handlers, that could be attached to **Reactive Virtual DOM** element:
- **Classic Event Handler** - is a function with signature `(event: RedSyntheticEvent) => void`. It's inspired
  by **React's** event handlers and is working the same way. It should be passed to classic event handler props,
  like `onClick`, `onChange` etc.

- **Reactive Event Handler** - is a function with signature `(event$: Observable<RedSyntheticEvent>) => Observable<RedSyntheticEvent>`.
  The main difference, beyond interface, is that event stream returned from handler, will be passed to next handler in
  capturing or bubbling process - it provides reactive control over event propagation (ie. filtering out a stream, will
  stop event propagation, but only for a certain phase - as in **RED**, all propagation for specific event phase is
  handled on one stream). It should be passed to reactive event handler props, that look's like classic, but ending
  with `$` - `onClick$`, `onChange$`, etc.
  - **Controlled Form Element Handler** - is a subtype of reactive handler, used only for Controlled Form Elements,
    when the form element is controlled only by the handler (without Observable value prop) - it's **Atom-iQ** specific
    feature - more in Controlled Form Elements docs.
    It has signature `(event$: Observable<RedSyntheticEvent>) => Observable<string | number | boolean | Array<string | number>>`.
    Stream returned from handler will act as `value` (or `checked`) prop.

Both classic nad reactive handlers attached to **RvdElement**, aren't registered on corresponding DOM element, but in
**RED** internal container, called **Event Delegation Handler**.

#### Event Delegation Handler
Event Delegation Handler is the most important part of **Atom-iQ RED**. It's handling **RED Synthetic Events** in response
to browser native events. **RED** main container contains Event Delegation Handlers, one for specific event type and only
active ones - it's automatically creating them, when first handler for given event type is registered, and automatically
destroying them, when last handler is removed.

When delegation handler is created, it's registering corresponding DOM event handler on the app root DOM element,
transforming it to Observable stream and subscribing to it. It's also creating handlers maps, where **RED Synthetic
Event** handlers will be registered, when corresponding elements are added to **Reactive Virtual DOM**. When DOM event
fires, it's caught by delegation handler, then it's going through the pipeline of specific **RxJS** operators, that
are calling element handlers in the order determined by event phase, setting correct `currentTarget` for handlers.
Everything is done on one stream and resulting in one subscription, that's kept in Event Delegation Handler.
**Atom-iQ RED** is registering separate listeners (in delegation handler) for capture and bubble phases, and separate
listeners for passive events (capture and bubble) - it may look like worse for performance - 4 handlers
instead 1 - but in fact it should provide better performance. Most common are bubble handlers, and separate stream
for them, will be faster, without conditional logic for capture and passive events. Other handlers
are rare and listeners for them will be registered only once they have connected handlers.

**Atom-iQ RED** is never registering DOM listeners, when **Atom-iQ RVD** has not corresponding handlers.

Before delegation handler is removed (last element with handler for event type is removed from rvDOM), it's removing
listeners from app root DOM element, by unsubscribing its subscriptions.

Internally, it's cooperating greatly with **Atom-iQ RVD Auto-unsubscribe system** - adding small cleanup teardown functions
to element subscription, when element handler is registered - it's called when element is removed from **Reactive
Virtual DOM**, removing handler from internal mapping, and when it's last, removing also delegation handler.

