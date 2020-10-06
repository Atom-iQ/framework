import { RvdComponent } from '@atom-iq/core'
import './Intro.scss'

const Intro: RvdComponent = () => (
  <section class="intro">
    <h4 class="intro__header">About Atom-iQ Framework</h4>
    <p class="intro__content">
      <>
        <strong>Atom-iQ</strong> is DOM rendering framework. It's using&nbsp;
        <strong>Reactive Virtual DOM</strong> architecture, new concept for UI rendering.
      </>
      <>
        &nbsp;Instead of diffing nodes (reconciliation), it's creating&nbsp;
        <strong>Observers</strong>
        &nbsp;("connecting nodes/props") in changeable nodes and every state update is&nbsp;
        <em>atomic</em>,
      </>
      <>
        &nbsp;and is "visible" only in those connected nodes - it&nbsp;<em>drastically</em>
      </>
      <>
        &nbsp;reduces number of operations during single state/ui update, compared to&nbsp;
        <strong>Virtual DOM</strong> - it's always only <em>nextState</em> call +&nbsp;
      </>
      <>
        transformations on that state (optional) + <strong>DOM</strong> element(s) update (depending
        on number of connected nodes), while in <strong>Virtual DOM</strong>, all nodes returned by{' '}
        <strong>Component</strong> (render) function call have to be checked.
      </>
    </p>
  </section>
)

export default Intro
