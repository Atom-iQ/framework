### `@reactive-ui/core`
## Reactive UI Core Library Documentation
#### Components
- [Component](#component)
- [Component Props](#component-props)
    - [Element and Component Props](#element-and-component-props)
    - [Component Prop](#component-prop)
        - [Component Props Categories](#component-props-categories)
- [Component Refs](#component-refs)
#### Elements
- [Element](#element)
- [Element Props](#element-props)
    - [Element Prop](#element-prop)
        - [Element Props Categories](#element-props-categories)
- [Element Events](#element-events)
- [Element Refs](#element-refs)

# Component
- First thing worth to note, is that **Reactive UI** is designed in Functional Programming and Reactive
  Functional Programming paradigms and doesn't allow **Class Components**, that you probably already know
  from **Virtual DOM** libraries such as **React**
- **Rx Component** is just a function, that looks almost the same as **Functional Component** in
  **React** - it returns `JSX Element` or `null`, but it also could return `Observable` of `JSX Element`
  or `null` - it's the first visible difference
- But the main difference between **Rx Component** and components in **Virtual DOM** is in the background:
  - In **Virtual DOM** every change of Component state or props is causing re-render of Component with new
    state or props values
  - For **Functional Component** that means calling Component function again, after every change of
    Component state or props
  - In **Rx DOM** every **_"change"_** means **_"new value is emitted from `Observable prop` or `Observable
    state field`"_** - **Static Props** and any other variables declared inside of **Rx Component** function
    are **readonly**
  - Thanks to that, after Component is created in **Rx DOM** (function is called with props), it will exist
    in **Rx DOM** and will not be re-created (**no re-render!**)  
  - It will be called again, only after being removed and mounted again in **Rx DOM**
  - **Rx Component** state and props values are existing in **Rx DOM**, hidden in **JavaScript** closure,
    created on Component function call
  - Unlike in **Virtual DOM**, in **Rx DOM** Component state and props are not changing and are not
    passing new values to children, but are **streaming** new values between **Rx DOM tree Elements
    and Components** - which means that every change is 100% atomic and don't affects other
    parts of **Rx DOM**
  - It means also, that **Rx DOM** don't need any diff logic to follow changes in DOM structure, as changes
    are automatically followed by RxJS subscription in connected **Rx Elements**


# Component Props
## Element and Component Props
Generally, in `Rx UI Core`, we can distinguish two different, but similar types of `Props`:

- `Rx Element Props`
- `Rx Component Props`

The main difference between them, is that names (keys) of `Rx Element Props` are limited
and cannot be different, than names of `DOM` properties available for that type of `Rx Element`
or for event handling - names of events in PascalCase, prefixed with `on`, with or without
`$` suffix. And additionally special `children` and `ref` props.

> NOTE: `onEventName$` is a new syntax specific to `Rx DOM` and `Rx UI Core`. It's called **_Reactive_**
event handler - Passed callback is getting access to `Rx Event` `Observable` stream (as argument)
and can return Subscription (for auto unsubscribe in `Rx Element`) or Observable, which will be passed
to "**_Classic_**" handlers.
>
>*__React__ like* `onEventName` event handlers, with `Rx Event` as an argument, are invoked as next callback
in subscription to `"EventName"` `Rx Event Stream` of `Rx Element` and is called "**_Classic_**" event handler.

Names of `Rx Component Props`, on the other hand, are unlimited, they could be **any custom string**, that
is *allowed as an object property key*.

> NOTE: `children` and `ref` are not allowed as custom props, they are special props, used in Rx DOM Rendering
process and have the same type for all components

## Component Prop

##### Single field in Component Props object(`RxComponentProps`) is called `prop/Prop` (`RxComponentProp`)

## Component Props Categories
1. **Observable Props** (`RxObservableComponentProp`)
    - In `Rx DOM`, every `prop`, which value is "**_changeable_**", have to be **RxJS** `Observable` stream
      and exclusively for components - also `Array` or `Record` with `Rx` streams.   
        > NOTE: Technically prop value is never changing, it is always reference to the same Observable.
        In perspective of Rx DOM, **changeable** value means, that value is Observable stream and new values
        can be emitted in that stream.
      
    - **Observable Props** passed to component, could be then bound **directly to elements** **props or as a
      children** - in `{}` **JSX** expressions. They will be connected, subscribed and unsubscribed by
      `Rx DOM` implicitly.
    
    - They could be also passed as `props` to another component or used as argument in *__Observable__ conditional
      statement* - function used in `{}` **JSX** expressions that returns specific `RxObservableComponentProp`
      or `RxObservableChild` `Rx` stream, based on argument `Rx` stream value. 
    
2. **Callback Props**
    - In `Rx DOM`, every `prop`, which value is `Function` is **CallbackProp** - it's used for passing component
      internal functions or anonymous functions down the `Rx DOM Tree`.
    
3. **Static Props**
    - In `Rx DOM`, **Static Props**, are all `props` that aren't `Rx` stream (or `Array`/`Record` with `Rx`
      streams for components) or `Function`. That means all the `props`, except `Functions`, which are flat in
      case of time (synchronous), are connected statically to other components props and DOM elements properties
      and cannot be changed in runtime.

    - **Static Props** are `readonly`. In `Rx DOM`, there aren't re-renders after `prop` value changes, so
      changing component/element `prop` value is doing nothing, as component function will not be called again
      with new props. `Rx Component` exists in `Rx DOM` as a **closure**, from initial render until removing
      component from `Rx DOM` and values of `props` are streamed inside/outside `Rx Component` in**Observable Props**

4. **Special Props**
    - **Special Props**, are common `props`, that **every type of Component or Element** could have. Special
    props in every `Component` has the same type and they are reserved for core `Rx DOM` functionalities like
    `Rx DOM Rendering Process`
        - `children`
        
# Component Children
TODO

# Component Refs
- The purpose of the **Component Refs** is to provide access to **Component** `props`, `state` and `functions`
- in `Rx Component`, all internal functionalities of **Component**, that should be available for `Ref`, **have
  to be explicitly declared** (except `props`, which are the only **Component** public interface. `State` and
  `functions` are internal to **Component**), so even if there is created `Ref` on component, it will have no
  access to **Component** `state` and `functions`, if they won't be **_connected to Ref_**.
- `Props` are available for `Ref` by default, but **Static Props**, in case of ref are `readonly` - `Ref`
  can only emit new value in **Observable Prop** stream
    > NOTE: theoretically all props in case of ref, are readonly, as Observable prop reference cannot be
    changed on runtime - change of prop value WILL NOT re-render component - it's key difference vs Virtual DOM

# Element

Rx Element Documentation

# Element Props
## Difference between Element and Component Props

- Difference between Element And Component Props [Element and Component Props section](#element-and-component-props)

## Element Prop

##### Single field in Element Props (`RxElementProps`) is called `prop/Prop` (`RxElementProp`)

## Element Props Categories
1. **Observable Props**
    - In `Rx DOM`, every `prop`, which value is "**_changeable_**", have to be **RxJS** `RxO` stream
      and exclusively for some special element properties (like in example `styles`) - also `Record` with
      `RxO` streams.   
        > NOTE: Technically prop value is never changing, it is always reference to the same Observable.
        In perspective of Rx DOM, **changeable** value means, that value is Observable stream and new values
        can be emitted in that stream.
      
    - **Observable Props** could be bound **directly to elements, as a props or as a children** - in `{}` 
      **JSX** expressions. They will be connected, subscribed and unsubscribed by `Rx DOM` implicitly.
    
2. **Callback Props**
    - In `Rx DOM`, every `prop`, which value is `Function` is **CallbackProp** - it's used for passing
      component internal functions or anonymous functions down the `Rx DOM Tree`.
    - In Case of `RxElement` - Callback functions are [Event handlers](#Element Events)

3. **Static Props**
    - In `Rx DOM`, **Static Props**, are all `props` that aren't `Rx` stream (or `Array`/`Record` with `Rx`
      streams for components) or `Function`. That means all the `props`, except `Functions`, which are flat
      in case of time (synchronous), are connected statically to other components props and DOM elements
      properties and cannot be changed in runtime.
    - **Static Props** are `readonly`. In `Rx DOM`, there aren't re-renders after `prop` value changes, so
      changing component/element `prop` value is doing nothing, as component function will not be called
      again with new props. `Rx Component` exists in `Rx DOM` as a **closure**, from initial render until
      removing component from `Rx DOM` and values of `props` are streamed inside/outside `Rx Component` in
      **Observable Props**

4. **Special Props**
    - **Special Props**, are common `props`, that **every type of Component or Element** could have. Special
      props in every `Element` has the same type and they are reserved for core `Rx DOM` functionalities
      like `Rx DOM Rendering Process`
        - `children`

# Element Events
## Event Handlers

- **"Classic"** - passing callback, with event object as a argument, to `onEventName` **Callback Prop** - the same
  way as in `React` - callback will be passed to `Rx Event` subscription and called on every new *"EventName"*
  dispatch. It's automatically unsubscribed after element is removed from `Rx DOM`
   
- **"Reactive"** - passing callback with `Rx Event` `RxO` stream as an argument, to `onEventName$` `prop` - it's
  special `Rx Event` callback prop - `Rx Event` stream is callback's argument and then any **RxJS** operation
  could be performed on stream - callback have to return `RxSub` subscription or `RxO` stream:
   - If callback returns `RxSub`, then it will be automatically **unsubscribed**, after `Element` is removed
     from `Rx DOM` (if `Element` has also `onEventName` prop for that event, it is handled separately).
   
   - If callback returns `RxO` stream and `onEventName` `prop` is declared on `Element`, then `onEventName` is
     subscribed to `RxO` returned from `onEventName$`, instead of original `Rx Event` `RxO` - so event stream
     value could be modified in `onEventName$` and then, that modified value will be available in **"on{EventName}"**
     callback argument.
   
   - If callback returns `RxO` and `onEventName` `prop` is not declared, `Rx DOM` will subscribe to returned
     `RxO` implicitly. Unsubscribe logic is the same as for `onEventName` - it will be automatically unsubscribed
     after `Element` is removed from `Rx DOM`

# Element Refs
- The purpose of the **Element Refs** is to provide access to element props and events (subscribing to
  `Rx Events` from `Elements`, invoking **Callback Props** from `onEventName` `prop` or even emitting
  *"custom/fake event"* - event of the same shape or almost the same like real DOM Event, but created
  in `Ref` and emitted to `Rx Event` subscribers) - here the situation is different, than for Component Refs.
  Some of `Element` `props` could be **Observable Props** (when **Component** state, **Observable Prop** or
  any other `RxO` is bound to `Element` `prop`) and some could be **Static Props** - again static props are
  readonly, but for **Element Refs** it could be changed - to make it available, it should be specified in
  `rxElementRef()` config.

- `Props` are public `Rx Element` interface, so they are available for `Ref` by default. `Ref` can make changes
  in `Rx DOM` only by **Observable Props** (by emitting new stream values).
 
- To make **Static Props** available in `Ref` as **Observable Props**, name of that props should be specified
  in `connectedStaticProps` `Array` in `createElementRef()` config object
  > NOTE: Property in DOM object will be set initially to **Static Prop** value, then it will be connected
  and subscribed as `Rx Prop Reference` in new created `Ref`.

- To make any other `Rx DOM Element` property (which are not specified in **JSX** as `Element` `prop`),
  available in `Ref` as **Observable Prop**, name of that `prop` should be specified in `customRefProps`
  `Array` in `createElementRef()` config object.

- Then in the `props` field of created `Rx Element Ref`, items should have names of props as a keys and should
  contain following fields:
   - `prop$` *(optional)* - **Observable Prop** *(not for not connected static props)*
   - `next(nextPropValue)` *(optional)* - function for emitting next `prop` value
     *(not for not connected static props)*
   - `staticProp` *(optional)* - static prop value from JSX (only for static props, if static prop
     is connected - is in connectedStaticProps array, it's always just initial value)
   
 rX Element Refs are allowing to call "Classic" event handler callbacks that are declared in
 JSX by default, observable streams for events connected to declared handlers are also exposed.
 If there are declared "Reactive" event handlers (which are returning Observable), stream returned
 from callback function is also exposed. To allow rX Element Refs to subscribe to events that
 has not handlers declared in JSX, event handler names should be specified in customRefEventHandlers
 array in createElementRef() config object.

 To allow emitting "custom fake events" from Ref (all subscribed event handlers will be called with
 that "custom/fake" event object, but it won't be real DOM event - no real event listeners will be called
 and event WILL NOT be propagated and WILL NOT have default action) - for every event handlers - declared
 in JSX (it will not be available by default) and specified as custom customRefEventHandlers - handler names
 should be specified in customRefEmitters array createElementRef() config object (elements from customRefEmitters
 have to be specified in customRefEventHandlers or declared in JSX).

 So, in the events field of created Ref, field named same as prop (or DOM attribute, which is rX DOM prop in
 created ref), will contain object with fields
   - event$ - observable rX Event
   - mappedEvent$ (optional) - observable stream, returned from 'on{EventName}$' element prop callback (only when
     there is 'on{EventName}$' prop declared)
   - handler(event) (optional) - callback function, value of 'on{EventName}' "Classic" handler prop (only when
     there is 'on{EventName}' prop declared)
   - emit(event) (optional) - emitting new "custom/fake event" (only when event handler name is in customRefEmitters)
