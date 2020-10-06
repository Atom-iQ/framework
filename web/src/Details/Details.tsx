import { RvdComponent } from '@atom-iq/core'
import './Details.scss'

const Details: RvdComponent = () => (
  <section class="details">
    <section class="details__item">
      <h4>Components</h4>
      <p>
        Atom-iQ's Component API is inspired by React's Functional Components (no support for
        classes, they have no sense with Reactive Virtual DOM architecture).
      </p>
      <p>
        In Atom-iQ, the Component is just a function, that's taking props as argument (and
        middleware props as second, optional argument - v0.2.0) and returns Reactive Virtual DOM
        Elements (or other values, that could be element children) - looks like React's Functional
        Component, the difference is how it's treated by the renderer.
      </p>
      <p>
        While React is calling Component function everytime the props or state are changed (because
        of that, it needs hooks for state, lifecycle and some other performance improvements, what's
        making React Functional Component more than just a function), Atom-iQ is calling Component
        function only when it's added to rvDOM. Thanks to that, everything what's inside component,
        like state or functions, is existing in runtime, as just a closure.
      </p>
    </section>
    <section class="details__item">
      <h4>Reactive programming and RxJS</h4>
      <p>
        Atom-iQ's Reactive Virtual DOM is based on Reactive Programming and the Observer patter.
        It's using RxJS as a streaming library - because it's the most popular and stable solution.
      </p>
      <p>
        Every state field in Atom-iQ have to be RxJS Subject and every changeable value have to be
        Observable. Most common for state is BehaviorSubject (createState) or ReplaySubject
        (eventState).
      </p>
      <p>
        Observables should be bound directly to Reactive Virtual DOM nodes - framework is
        automatically "connecting" (creating Observer and Subscription) it.
      </p>
      <p>
        In case of Element's props, the Observer next callback is calling connected DOM Element
        setAttribute method (or doing some other operation in special cases like className or
        style).
      </p>
      <p>
        In case of Element's children, Observer next callback is calling parent's Element
        appendChild, insertBefore, replaceChild or removeChild methods.
      </p>
      <p>
        In case of Component's children or props, it's just passing reference to the Observable to
        nested Component.
      </p>
      <p>Atom-iQ will provide iQRx Tools (@atom-iq/rx) package for easy and quick work with RxJS</p>
    </section>
    <section class="details__item">
      <h4>Extendable/Scalable Framework Architecture</h4>
      <p>
        The Core library (@atom-iq/core) includes just a basic Reactive Virtual DOM Renderer
        (without features like ref or context, those will be available as Middleware) and TypeScript
        interfaces. It's only 4.4kb minified gzipped size.
      </p>
      <p>
        It will provide also createState function, which looks similar to React's useState hook and
        new eventState function, that's providing a way to describe state, as a set of operations,
        with an event (or multiple events) as a source - connected by the Reactive Event Handler
        props of an element.
      </p>
      <p>
        Additional features could be added to the Core library, by extending basic renderer logic
        with Middlewares or with other official Tools and Components libraries, making Atom-iQ full
        customizable framework.
      </p>
    </section>
  </section>
)

export default Details
