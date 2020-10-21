# Atom-iQ Ref Middleware (`@atom-iq/ref`)
#### Installing
- npm - `npm install --save @atom-iq/ref`
- yarn - `yarn add @atom-iq/ref`


#### Ref
Middleware allowing using Element and Component Refs

#### Starting the app
```typescript jsx
import App from './App'
import { createRvDOM, combineMiddlewares } from '@atom-iq/core'
import { refMiddleware } from '@atom-iq/ref'

const middlewares = combineMiddlewares(refMiddleware())()

const rvDOMSubscription = createRvDOM(middlewares)(<App />, document.getElementById('root'))
```

#### Usage
```typescript jsx
import { RvdComponent, createState } from '@atom-iq/core'
import { elementRef, componentRef, WithAttachRef } from '@atom-iq/ref'
import { first } from 'rxjs/operators'

const RefComponent: RvdComponent<{}, WithAttachRef> = (_props, { attachRef }) => {
  const [testState, nextTestState] = createState('test')
  
  const handleTestStateChange = (value: string) => nextTestState(value)
 
  attachRef(ref => ({
    ...ref,
    state: {
      testState
    },
    functions: {
      handleTestStateChange
    }
  }))

  return (
    <section>
      Component with attached ref
    </section>
  )
}

const App: RvdComponent = () => {
  const [element, connectElement] = elementRef(['className', 'id'], ['click'])
  const [component, connectComponent] = componentRef()

  first()(element).subscribe(ref => {
    const [buttonId, nextButtonId] = ref.props.id
    ref.events.click.subscribe(event => { // Use Teardown Middleware for auto-unsubscribe
      // Do something
    })
    console.log(ref.domElement) // button
  })
  
  first()(component).subscribe(ref => {
    ref.state.testState.subscribe(value => { // Use Teardown Middleware for auto-unsubscribe
      // do something
    })
    ref.functions.handleTestStateChange('New test state')
  })
  
  return (
    <main class="App">
      <RefComponent ref={connectComponent()} />
      <button type="button" ref={connectElement()} />
    </main>
  )
}

```

## Documentation
- [Framework](../../README.md)
- [Reactive Virtual DOM](../../docs/reactive-virtual-dom/REACTIVE-VIRTUAL-DOM.md)
- [Component](../../docs/framework/COMPONENT.md)
- [Elements](../../docs/framework/ELEMENTS.md)
- [Middleware](../../docs/framework/MIDDLEWARE.md)

