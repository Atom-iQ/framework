# Rx Component
###### Rx UI Suite -> Rx UI Core

## Documentation
### Core Elements
- [Component](#component)
- [Component Props](#component-props)
    - [Element and Component Props](#element-and-component-props)
    - [Component Prop](#component-prop)
        - [Props Categories](#props-categories)
- [Component Refs](#component-refs)


# Component
- First thing worth to note is that **Rx UI Suite** is designed in Functional Programming  
  and Reactive Functional Programming paradigms and doesn't allow **Class Components**,  
  that you probably already know from **Virtual DOM** libraries such as **React**
- **Rx Component** is just a function, that looks almost the same as **Functional Component**  
  in **React** - it returns `JSX Element` or `null`, but it also could return `Observable`  
  of `JSX Element` or `null` - it's the first visible difference
- But the main difference between **Rx Component** and components in **Virtual DOM**  
  is in the background:
  - In **Virtual DOM** every change of Component state or props is causing re-render  
    of Component with new state or props values
  - For **Functional Component** that means calling Component function again, after  
    every change of Component state or props
  - In **Rx DOM** every **_"change"_** means **_"new value is emitted from `Observable prop`  
    or `Observable state field`"_** - **Static Props** and any other variables declared  
    inside of **Rx Component** function are **readonly**
  - Thanks to that, after Component is created in **Rx DOM** (function is called with props),  
    it will exist in **Rx DOM** and will not be re-created (**no re-render!**)  
  - It will be called again, only after being removed and mounted again in **Rx DOM**
  - **Rx Component** state and props values are existing in **Rx DOM**, hidden in **JavaScript**  
    closure, created on Component function call
  - Unlike in **Virtual DOM**, in **Rx DOM** Component state and props are not changing  
    and are not passing new values to children, but are **streaming** new values between  
    **Rx DOM tree Elements and Components** - which means that every change is  
    100% atomic and don't affects other parts of **Rx DOM**
  - It means also, that **Rx DOM** don't need any diff logic to follow changes in DOM  
    structure, as changes are automatically followed by RxJS subscription in connected  
    **Rx Elements**


# Component Props
## Element and Component Props
Generally, in `Rx UI Core`, we can distinguish two different, but similar types of `Props`:

- `Rx Element Props`
- `Rx Component Props`

The main difference between them, is that names (keys) of `Rx Element Props` are limited  
and cannot be different, than names of `DOM` properties available for that type of `Rx Element`  
or for event handling - names of events in PascalCase, prefixed with `on`, with or without  
`$` suffix. And additionally special `children` and `ref` props.

> NOTE: `onEventName$` is a new syntax specific to `Rx DOM` and `Rx UI Core`.<br />
 It's called **_Reactive_** event handler - Passed callback is getting access to `Rx Event`<br />
 `Observable` stream (as argument) and can return Subscription (for auto unsubscribe<br />
 in `Rx Element`) or Observable, which will be passed to "**_Classic_**" handlers.<br /><br />
 *__React__ like* `onEventName` event handlers, with `Rx Event` as an argument, are invoked<br />
 as next callback in subscription to `"EventName"` `Rx Event Stream` of `Rx Element`<br />
 and is called "**_Classic_**" event handler.

[More On Rx Element Props in Rx DOM documentation](../rx-dom/README.md)

Names of `Rx Component Props`, on the other hand, are unlimited, they could be **any custom  
string**, that is *allowed as an object property key*.

> NOTE: `children` and `ref` are not allowed as custom props, they are special props,<br />
 used in Rx DOM Rendering process and have the same type for all components

## Component Prop

##### Single field in Component Props object(`RxComponentProps`) is called `prop/Prop` (`RxComponentProp`)

#### 

## Props Categories
1. **Observable Props** (`RxObservableComponentProp`)
    - In `Rx DOM`, every `prop`, which value is "**_changeable_**", have to be **RxJS** `Observable` <br />
    stream and exclusively for components - also `Array` or `Record` with `Rx` streams.   
        > NOTE: Technically prop value is never changing, it is always reference<br />
         to the same Observable. In perspective of Rx DOM, **changeable** value<br />
         means, that value is Observable stream and new values can be emitted in that stream.
      
    - **Observable Props** passed to component, could be then bound **directly to elements** <br />
    **props or as a children** - in `{}` **JSX** expressions. They will be connected, subscribed <br />
    and unsubscribed by `Rx DOM` implicitly.
    
    - They could be also passed as `props` to another component or used as argument <br />
    in *__Observable__ conditional statement* - function used in `{}` **JSX** expressions that <br />
    returns specific `RxObservableComponentProp` or `RxObservableChild` `Rx` stream, <br />
    based on argument `Rx` stream value. 
    
2. **Callback Props**
    - In `Rx DOM`, every `prop`, which value is `Function` is **CallbackProp** - it's used for <br />
    passing component internal functions or anonymous functions down the `Rx DOM Tree`.
    
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
    have. Special props in every `Component` has the same type and they are reserved for  
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

# Component Refs
- The purpose of the **Component Refs** is to provide access to **Component** `props`,  
  `state` and `functions`
- in `Rx Component`, all internal functionalities of **Component**, that should be available for `Ref`,  
  **have to be explicitly declared** (except `props`, which are the only **Component** public interface.  
  `State` and `functions` are internal to **Component**), so even if there is created `Ref` on  
  component, it will have no access to **Component** `state` and `functions`, if they won't be  
  **_connected to Ref_**.
- `Props` are available for `Ref` by default, but **Static Props**, in case of ref are  
  `readonly` - `Ref` can only emit new value in **Observable Prop** stream
    > NOTE: theoretically all props in case of ref, are readonly, as Observable prop  
    reference cannot be changed on runtime - change of prop value WILL NOT re-render  
    component - it's key difference vs Virtual DOM
