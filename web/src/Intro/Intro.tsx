import { RvdComponent } from '@atom-iq/core'
import './Intro.scss'

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
    </p>
    <h4 class="intro__next-release-header">Next Release - v0.2.0</h4>
    <section class="intro__next-release">
      <ul>
        <li>
          <strong>Atom-iQ RED</strong> - Reactive Event Delegation
        </li>
        <li>
          <strong>Atom-iQ Middlewares</strong> - extending renderer & components logic
        </li>
        <li>
          <strong>Ref, Context & Teardown</strong> Middleware packages
        </li>
        <li>
          <strong>Atom-iQ RVD Renderer</strong> optimization - initial render
        </li>
      </ul>
    </section>
  </section>
)

export default Intro
