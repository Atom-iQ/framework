import { RvdComponent } from '@atom-iq/core'
import './Details.scss'

const componentDocs = 'https://github.com/Atom-iQ/Atom-iQ/blob/master/docs/framework/COMPONENT.md'

const Details: RvdComponent = () => (
  <section class="details">
    <section class="details__item">
      <h4>Components</h4>
      <article>
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
          While React is calling Component function everytime the props or state are changed
          (because of that, it needs hooks for state, lifecycle and some other performance
          improvements, what's making React Functional Component more than just a function), Atom-iQ
          is calling Component function only when it's added to rvDOM. Thanks to that, everything
          what's inside component, like state or functions, is existing in runtime, as just a
          closure.
        </p>
        <p>
          By default, Atom-iQ Components are using JSX for declaring the shape of Reactive Virtual
          DOM (own plugin - @atom-iq/babel-plugin-jsx). There's also plan to implement simple,
          custom templating language as an alternative.
        </p>
        <p>
          <a href={componentDocs} target="_blank">
            More about Atom-iQ Components
          </a>
        </p>
      </article>
    </section>
    <section class="details__item">
      <h4>Reactive programming and RxJS</h4>
      <article>
        <p>
          Atom-iQ's Reactive Virtual DOM is based on Reactive Programming and the Observer patter.
          It's using RxJS as a streaming library - because it's the most popular and stable
          solution.
        </p>
        <p>
          Every state field in Atom-iQ have to be RxJS Subject and every changeable value have to be
          Observable. Most common for state is BehaviorSubject (createState) or ReplaySubject
          (eventState).
        </p>
        <p>
          Observables could (and should) be bound directly to Reactive Virtual DOM nodes - framework
          is automatically "connecting" them (creating Observers and Subscriptions) and managing
          subscriptions.
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
        <p>
          Atom-iQ will provide iQRx Tools (@atom-iq/rx) package for easy and quick work with RxJS
        </p>
      </article>
    </section>
    <section class="details__item">
      <h4>Scalable Framework Architecture</h4>
      <article>
        <p>
          The Core library (@atom-iq/core) includes just a basic Reactive Virtual DOM Renderer
          (without features like ref or context, those will be available as Middleware) and
          TypeScript interfaces. It's only 4.4kb minified gzipped size.
        </p>
        <p>
          It provides also createState function, which looks similar to React's useState hook and a
          new eventState function, that provides a way to describe state, as a set of operations,
          with an event (or multiple events) as a source - connected by the Reactive Event Handler
          props of an element.
        </p>
        <p>
          Additional features could be added to the Core library, by extending basic renderer logic
          with Middlewares or with other official Tools and Components libraries, making Atom-iQ
          full customizable framework.
        </p>
        <p>
          Atom-iQ has also own iQ CLI, that's main build and development tool for Atom-iQ apps. It
          could work without any config (like create-react-app and react-scripts), with simple
          config file or accepting also custom webpack configuration.
        </p>
      </article>
    </section>
  </section>
)

export default Details
