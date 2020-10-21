import { RvdComponent } from '@atom-iq/core'
import './Details.scss'
import { WithContext } from '@atom-iq/context'

const componentDocs = 'https://github.com/Atom-iQ/Atom-iQ/blob/master/docs/framework/COMPONENT.md'

const Details: RvdComponent<{}, WithContext> = (_, { context }) => (
  <section class="details">
    <section class="details__item">
      <h4>Components</h4>
      <article>
        <p>
          <strong>Atom-iQ's Component API </strong> is inspired by{' '}
          <strong>React's Functional Components</strong>. Unlike <strong>React</strong>, and{' '}
          <em>React-like libraries</em>, <strong>Atom-iQ</strong> hasn't support for{' '}
          <em>Class Components</em>
        </p>
        <p>
          In <strong>Atom-iQ</strong>, the <strong>Component</strong> is just a function, that takes
          props and Middleware props as arguments and returns{' '}
          <strong>
            <em>Reactive Virtual DOM Elements</em>
          </strong>{' '}
          (or other values, that could be element children) - looks like{' '}
          <strong>React's Functional Component</strong>, the difference is how it's treated by the
          renderer.
        </p>
        <p>
          While <strong>React</strong> is calling <strong>Component</strong> function{' '}
          <em>everytime the props or state are changing</em> (because of that, it needs hooks for
          state, lifecycle and some other performance improvements, what's making{' '}
          <strong>React Functional Component</strong> more than just a function),{' '}
          <strong>Atom-iQ</strong> is calling <strong>Component</strong> function{' '}
          <em>only when it's added to rvDOM</em>. Thanks to that, everything what's inside{' '}
          <strong>Component</strong>, like state or functions, is existing in runtime, as{' '}
          <em>just a closure.</em> It could be said, that <strong>Atom-iQ Components</strong>{' '}
          behavior, is something that <strong>React</strong> is trying to achieve with{' '}
          <strong>hooks.</strong>
        </p>
        <p>
          By default, <strong>Atom-iQ Components</strong> are using <strong>JSX</strong> for
          declaring the shape of{' '}
          <strong>
            <em>Reactive Virtual DOM</em>
          </strong>{' '}
          (own plugin -{' '}
          <a href={`${context<string>('npmScopeUrl')}/babel-plugin-jsx`} target="_blank">
            @atom-iq/babel-plugin-jsx
          </a>
          ). There's also plan to implement simple, custom templating language as an alternative.
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
          <strong>
            Atom-iQ's <em>Reactive Virtual DOM</em>
          </strong>{' '}
          is based on <em>Reactive Programming and the Observer pattern.</em> It's using{' '}
          <strong>RxJS</strong> as a streaming library - because it's the most popular and stable
          solution.
        </p>
        <p>
          Every state field in <strong>Atom-iQ</strong> have to be <strong>RxJS Subject</strong> and
          every changeable value have to be <strong>Observable</strong>. Most common for state is{' '}
          <strong>BehaviorSubject</strong> (<em>createState</em>) or <strong>ReplaySubject</strong>{' '}
          (<em>eventState</em>).
        </p>
        <p>
          <strong>Observables</strong> could (and should) be bound directly to{' '}
          <strong>
            <em>Reactive Virtual DOM</em>
          </strong>{' '}
          nodes - framework is automatically "connecting" them (creating{' '}
          <strong>Observers and Subscriptions</strong>) and managing subscriptions.
        </p>
        <p>
          In case of <em>Element's props</em>, the <strong>Observer</strong> next callback is
          calling connected <strong>DOM Element</strong> <em>setAttribute</em> method (or doing some
          other operation in special cases like <em>className or style</em>).
        </p>
        <p>
          In case of <em>Element's children</em>, <strong>Observer</strong> next callback is calling
          parent's <strong>Element</strong>{' '}
          <em>appendChild, insertBefore, replaceChild or removeChild</em> methods.
        </p>
        <p>
          In case of <em>Component's children or props</em>, it's just passing{' '}
          <strong>Observable's</strong> reference to nested <strong>Component</strong>.
        </p>
        <p>
          <strong>Atom-iQ</strong> will provide <strong>iQRx Tools</strong> (@atom-iq/rx) package
          for easy and quick work with <strong>RxJS</strong>
        </p>
      </article>
    </section>
    <section class="details__item">
      <h4>Scalable Framework Architecture</h4>
      <article>
        <p>
          The <strong>Core library</strong> (
          <a href={`${context<string>('npmScopeUrl')}/core`} target="_blank">
            @atom-iq/core
          </a>
          ) includes{' '}
          <strong>
            <em>Extendable Reactive Virtual DOM Renderer</em>
          </strong>{' '}
          and <strong>TypeScript interfaces</strong>. <em>It's about 6kb minified gzipped size.</em>
        </p>
        <p>
          It provides also <em>createState</em> function, which looks similar to{' '}
          <strong>React's useState hook</strong> and a new <em>eventState</em> function, that
          provides a way to describe state, as a set of operations, with an event (or multiple
          events) as a source - without imperative <em>nextState</em> calls - connected by the{' '}
          <strong>Reactive Event Handler</strong> props of an element.
        </p>
        <p>
          Additional features could be added to the <strong>Core library</strong>, by extending
          basic renderer logic with <strong>Middlewares</strong> or with other official{' '}
          <strong>Tools and Components</strong> libraries, making <strong>Atom-iQ</strong> full
          customizable framework.
        </p>
        <p>
          <strong>Atom-iQ</strong> has also own <strong>iQ CLI</strong> (
          <a href={`${context<string>('npmScopeUrl')}/cli`} target="_blank">
            @atom-iq/cli
          </a>
          ), that's <em>main build and development tool</em> for <strong>Atom-iQ</strong> apps. It
          could work without any config (like create-react-app and react-scripts), with simple
          config file or accepting also custom webpack configuration.
        </p>
      </article>
    </section>
  </section>
)

Details.useMiddlewares = ['context']

export default Details
