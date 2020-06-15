# Rx Dom
###### Rx UI Suite -> Rx UI Core

## Documentation
### Core Elements
- [Element](#Element)
- [Element Props](#Element Props)
    - [Element and Component Props](#Element and Component Props)
    - [Element Prop](#Element Prop)
        - [Props Categories](#Props Categories)
- [Element Refs](#Element Refs)


# Element

Rx Element Documentation

# Element Props
## Element and Component Props

- Difference between Element And Component Props & More On Rx Component [in Rx Component documentation](../rx-dom/README.md)

## Element Prop

##### Single field in Element Props (`RxElementProps`) is called `prop/Prop` (`RxElementProp`)

## Props Categories
1. **Observable Props** (`RxObservableElementProp`)
    - In `Rx DOM`, every `prop`, which value is "**_changeable_**", have to be **RxJS** `RxO`  
    stream and exclusively for some special element properties (like in example `styles`) -  
    also `Record` with `RxO` streams.   
        > NOTE: Technically prop value is never changing, it is always reference<br />
         to the same Observable. In perspective of Rx DOM, **changeable** value<br />
         means, that value is Observable stream and new values can be emitted in that stream.
      
    - **Observable Props** could be bound **directly to elements, as a props  
    or as a children** - in `{}` **JSX** expressions. They will be connected,  
    subscribed and unsubscribed by `Rx DOM` implicitly.
    
2. **Callback Props**
    - In `Rx DOM`, every `prop`, which value is `Function` is **CallbackProp** - it's used for <br />
    passing component internal functions or anonymous functions down the `Rx DOM Tree`.
    - In Case of `RxElement` - Callback functions are [Event handlers](#Element Events)

    
3. **Static Props**
    - In `Rx DOM`, **Static Props**, are all `props` that aren't `Rx` stream (or `Array`/`Record`  
    with `Rx` streams for components) or `Function`. That means all the `props`, except  
    `Functions`, which are flat in case of time (synchronous), are connected statically  
    to other components props and DOM elements properties and cannot be changed in runtime.
    - **Static Props** are `readonly`. In `Rx DOM`, there aren't re-renders after `prop` value changes,  
    so changing component/element `prop` value is doing nothing, as component function will  
    not be called again with new props. `Rx Component` exists in `Rx DOM` as a **closure**,  
    from initial render until removing component from `Rx DOM` and values of `props`  
    are streamed inside/outside `Rx Component` in **Observable Props**

4. **Special Props**
    - **Special Props**, are common `props`, that **every type of Component or Element** could  
    have. Special props in every `Element` has the same type and they are reserved for  
    core `Rx DOM` functionalities like `Rx DOM Rendering Process`
        - `children` - 
# Component Children
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<br />

# Element Events
## Event Handlers

- **"Classic"** - passing callback, with event object as a argument, to `onEventName`  
   **Callback Prop** - the same way as in `React` - callback will be passed to `Rx Event`  
   subscription and called on every new *"EventName"* dispatch. It's automatically  
   unsubscribed after element is removed from `Rx DOM`
   
- **"Reactive"** - passing callback with `Rx Event` `RxO` stream as an argument, to `onEventName$`  
   `prop` - it's special `Rx Event` callback prop - `Rx Event` stream is callback's argument  
   and then any **RxJS** operation could be performed on stream - callback have to return  
   `RxSub` subscription or `RxO` stream:
   - If callback returns `RxSub`, then it will be automatically **unsubscribed**,  
     after `Element` is removed from `Rx DOM` (if `Element` has also `onEventName` 
     prop for that event, it is handled separately).
   
   - If callback returns `RxO` stream and `onEventName` `prop` is declared on `Element`,  
     then `onEventName` is subscribed to `RxO` returned from `onEventName$`, instead of  
     original `Rx Event` `RxO` - so event stream value could be modified in `onEventName$`  
     and then, that modified value will be available in "on{EventName}" callback argument.
   
   - If callback returns `RxO` and `onEventName` `prop` is not declared, `Rx DOM` will  
     subscribe to returned `RxO` implicitly. Unsubscribe logic is the same as for  
     `onEventName` - it will be automatically unsubscribed after `Element`
     is removed from `Rx DOM`

# Element Refs
- The purpose of the **Element Refs** is to provide access to element props  
  and events (subscribing to `Rx Events` from `Elements`, invoking **Callback Props**  
  from `onEventName` `prop` or even emitting *"custom/fake event"* - event  
  of the same shape or almost the same like real DOM Event, but created in `Ref`  
  and emitted to `Rx Event` subscribers) - here the situation is different,  
  than for Component Refs. Some of `Element` `props` could be **Observable Props**  
  (when **Component** state, **Observable Prop** or any other `RxO` is bound to  
  `Element` `prop`) and some could be **Static Props** - again static props are readonly,  
  but for **Element Refs** it could be changed - to make it available, it should be  
  specified in `rxElementRef()` config.  
  s
- `Props` are public `Rx Element` interface, so they are available for `Ref` by default.  
  `Ref` can make changes in `Rx DOM` only by **Observable Props** (by emitting new stream values).
 
- To make **Static Props** available in `Ref` as **Observable Props**, name of that props  
  should be specified in `connectedStaticProps` `Array` in `createElementRef()` config object  
  > NOTE: Property in DOM object will be set initially to **Static Prop** value,  
  then it will be connected and subscribed as `Rx Prop Reference` in new created `Ref`.

- To make any other `Rx DOM Element` property (which are not specified in **JSX** as  
  `Element` `prop`), available in `Ref` as **Observable Prop**, name of that `prop`  
  should be specified in `customRefProps` `Array` in `createElementRef()` config object.

- Then in the `props` field of created `Rx Element Ref`, items should have names of props as  
  a keys and should contain following fields:
   - `prop$` *(optional)* - **Observable Prop** *(not for not connected static props)*
   - `next(nextPropValue)` *(optional)* - function for emitting next `prop` value
     *(not for not connected static props)*
   - `staticProp` *(optional)* - static prop value from JSX (only for static props,  
     if static prop is connected - is in connectedStaticProps array, it's always just  
     initial value)
   
 rX Element Refs are allowing to call "Classic" event handler callbacks that are declared in
 JSX by default, observable streams for events connected to declared handlers are also exposed.
 If there are declared "Reactive" event handlers (which are returning Observable), stream returned
 from callback function is also exposed. To allow rX Element Refs to subscribe to events that
 has not handlers declared in JSX, event handler names should be specified in customRefEventHandlers
 array in createElementRef() config object.
   *
 To allow emitting "custom fake events" from Ref (all subscribed event handlers will be called with
 that "custom/fake" event object, but it won't be real DOM event - no real event listeners will be called
 and event WILL NOT be propagated and WILL NOT have default action) - for every event handlers - declared
 in JSX (it will not be available by default) and specified as custom customRefEventHandlers - handler names
 should be specified in customRefEmitters array createElementRef() config object (elements from customRefEmitters
 have to be specified in customRefEventHandlers or declared in JSX).
   *
 So, in the events field of created Ref, field named same as prop (or DOM attribute,
 which is rX DOM prop in created ref), will contain object with fields
   - event$ - observable rX Event
   - mappedEvent$ (optional) - observable stream, returned from 'on{EventName}$' element prop callback
     (only when there is 'on{EventName}$' prop declared)
   - handler(event) (optional) - callback function, value of 'on{EventName}' "Classic" handler prop
     (only when there is 'on{EventName}' prop declared)
   - emit(event) (optional) - emitting new "custom/fake event"
   (only when event handler name is in customRefEmitters)
