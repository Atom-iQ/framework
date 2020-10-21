import { RvdComponent } from '@atom-iq/core'
import './Intro.scss'

const rvdDocs =
  'https://github.com/Atom-iQ/Atom-iQ/blob/master/docs/reactive-virtual-dom/REACTIVE-VIRTUAL-DOM.md'

const Intro: RvdComponent = () => (
  <section class="intro">
    <h4 class="intro__header">About Atom-iQ & Reactive Virtual DOM</h4>
    <p class="intro__content">
      <strong>Atom-iQ</strong> (pronounced as <em>Atomic</em>) is a DOM rendering framework. It uses
      the <strong>Reactive Virtual DOM</strong> architecture, new concept for UI rendering. Instead
      of diffing nodes (reconciliation), it creates <strong>Observers</strong> ("connecting
      nodes/props") in changeable nodes and every state update is <em>atomic</em>, and is "visible"
      only in those connected nodes - it <em>drastically</em> reduces number of operations during
      single state/ui update, compared to <strong>Virtual DOM</strong> - it's always only{' '}
      <em>nextState</em> call + transformations on that state (optional) + <strong>DOM</strong>{' '}
      element(s) update (depending on number of connected nodes), while in{' '}
      <strong>Virtual DOM</strong>, all nodes returned by <strong>Component</strong> (render)
      function call have to be checked against previous Virtual DOM state.{' '}
      <p style={{ margin: '5px 0' }}>
        <a href={rvdDocs} target="_blank">
          More about Reactive Virtual DOM
        </a>
      </p>
    </p>
    <h4 class="intro__next-releases-header">Next Releases</h4>
    <section class="intro__next-releases">
      <section class="next-releases__release">
        <h5>v0.2.0 (Middlewares)</h5>
        <ul>
          <li>Middlewares</li>
          <li>Ref, Context & Teardown Middleware packages</li>
          <li>Router</li>
          <li>iQRx Tools</li>
          <li>CLI "project" Command - generate new project (like CRA)</li>
        </ul>
      </section>
      <section class="next-releases__release">
        <h5>v0.3.0 (Synthetic Event System)</h5>
        <ul>
          <li>Event Delegation/Synthetic Events</li>
          <li>Store Middleware</li>
          <li>Scoped Styles Middleware</li>
          <li>Styled Components for Atom-iQ</li>
        </ul>
      </section>
    </section>
  </section>
)

export default Intro
