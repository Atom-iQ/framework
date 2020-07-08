// Logic concept


/*
  1. renderRxDom rootNode - type: App
  renderRxDom({
    type: App,
    props: {},
    children: null,
    _component: App
  }, rootDom)

  -> createComponent - call component closure (state)
  -> generate rv-dom for root component element
 */
/*
  2. renderRxDom node - type "main" - returned from App
  __componentState is closed in parent renderRxDom invocation

  renderRxDom({
    type: 'main',
    props: {
      className: of('RxO-rv-dom') // Observable property,
      id: 'main',
      onClick: () => __componentState.setShowFooter(false)
    },
    children: [
      of({
        type: Header,
        props: {
          header: __rootComponentState.header,
          hElement: 'h1'
        },
        _component: Header
      }),
      of({
        type: 'section',
        props: {
          className: 'RxO-dom__section'
        },
        children: [
          {
            type: Header,
            props: {
              header: 'New Section',
              hElement: 'h2'
            },
            _component: Header
          }
        ]
      }),
      __rootComponentState.showFooter.pipe(map(value => value ? ({
        type: Footer,
        props: {
          setHeader: __rootComponentState.setHeader
        },
        _component: Footer
      }) : undefined))
    ]
  })

  -> create rv-dom element ('main' in this case)
  -> map rxDom props to rv-dom element attributes and events:
    - subscribe to observable props - setAttribute on every new prop value
       (in this case subscribe to observable className)
    - for event props (prop of type function with name started from 'on')
      subscribe to observable event listener and call prop callback on every
      new event happened (in this case 'click' listener)
    - for static props (raw string, number, styles object) - setAttribute
      (in this case 'id')
  -> map rxDom children to rv-dom children:
    - subscribe to observable children  - call renderRxDom for child on every new child value
      (in this case all children all observable - rxDom will subscribe and
      call renderRxDom for Header and 'section' (one time, as they are 'static
      observable children - aren't depending on boolean expression stream) and
      for Footer(footer is depending on boolean expression stream, rxDom will
      be listening for changes in that stream and will be calling renderRxDom
      every time the value changes))
    - insert static children - only primitive values - all elements are
      observable children
  -> append child to given parent element (in this case append 'main' to
     element with id 'root')
*/

/*
  3. First rv-dom generated
  <div id="root">
    <main id="main"> // attached listener to 'click'
    </main>
  </div>

  -> asynchronously getting children
 */

/*
  4. renderRxDom for 'main' children
  renderRxDom({
    type: Header,
    props: {
      header: __rootComponentState.header,
      hElement: 'h1'
    },
    _component: Header
  }, mainElement)

  -> call Header() with props header (state from App) and hElement (h1)
  -> call renderRxDom for Header rv-dom

  renderRxDom({
    type: 'section',
    props: {
      className: 'RxO-dom__section'
    },
    children: [
      {
        type: Header,
        props: {
          header: 'New Section',
          hElement: 'h2'
        },
        _component: Header
      }
    ]
  }, mainElement)

  -> create 'section' element
  -> set static class as 'RxO-dom__section'
  -> subscribe to children - just Header - call renderRxDom for Header
  -> append 'section' to 'main'

  renderRxDom({
    type: Footer,
    props: {
      setHeader: __rootComponentState.setHeader
    },
    _component: Footer
  }, mainElement)

  -> call Footer() with props setHeader (set state callback from App)
  -> call renderRxDom for Footer rv-dom
 */

/*
  5. Next rv-dom generated
  <div id="root">
    <main id="main" class="RxO-rv-dom"> // attached listener to 'click'
      <section class="RxO-dom__section"></section>
    </main>
  </div>
 */

/*
  6. Resolving next children
  renderRxDom({
    type: 'header',
    props: {},
    children: [
      of({
        type: 'h1',
        props: {
          className: 'RxO-dom__h1'
        },
        children: [
          mS(__rootComponentState.header, (h: string) => h + ' WOW!')
        ]
      })
    ]
  }, mainElement);

  -> create 'header' element
  -> omit props
  -> subscribe to children - just 'h1' - call renderRxDom for 'h1'
  -> append 'header' to 'main' - just before 'section' as firstChild

  renderRxDom({
    type: Header,
    props: {
      header: 'New Section',
      hElement: 'h2'
    },
    _component: Header
  }, sectionElement)

  -> call Header() with props header ('New Section') and hElement ('h2')
  -> call renderRxDom for Header rv-dom

  renderRxDom({
    type: 'footer',
    props: {},
    children: [
      of({
        type: 'button',
        props: {
          onClick: __rootComponentState.setHeader
        },
        children: [
          'Footer'
        ]
      })
    ]
  }, mainElement)

  -> create 'footer' element
  -> omit props
  -> subscribe to children - just 'button' - call renderRxDom for 'button'
  -> append 'footer' to 'main' - just after 'section' as last child
 */

/*
  7. Next generated rv-dom
  <div id="root">
    <main id="main" class="RxO-rv-dom"> // attached listener to 'click'
      <header></header>
      <section class="RxO-dom__section"></section>
      <footer></footer>
    </main>
  </div>
 */

/*
  8. Resolve next children
  renderRxDom({
    type: 'h1',
    props: {
      className: 'RxO-dom__h1'
    },
    children: [
      mS(__rootComponentState.header, (h: string) => h + ' WOW!')
    ]
  }, headerElement);

  -> create 'h1' element
  -> set class to 'RxO-dom__h1'
  -> subscribe to children - emitting just text - insert text child
  -> append 'h1' to 'header'

  renderRxDom({
    type: 'header',
    props: {},
    children: [
      of({
        type: 'h2',
        props: {
          className: 'RxO-dom__h2'
        },
        children: [
          mS(__rootComponentState.header, (h: string) => h + ' WOW!')
        ]
      })
    ]
  }, sectionElement);

  -> create 'header' element
  -> omit props
  -> subscribe to children - just 'h2' - call renderRxDom for 'h2'
  -> append 'header' to 'section'

  renderRxDom({
    type: 'button',
    props: {
      onClick: __rootComponentState.setHeader
    },
    children: [
      'Footer'
    ]
  })

  -> create 'button' element
  -> set on click observable listener
  -> append children static Text node to 'Footer'
  -> append 'button' to 'footer'
 */

/*
  9. Next generated rv-dom
    <div id="root">
      <main id="main" class="RxO-rv-dom"> // attached listener to 'click'
        <header>
          <h1 class="RxO-dom__h1></h1>
        </header>
        <section class="RxO-dom__section">
          <header></header>
        </section>
        <footer>
          <button>Footer</button> // attached listener to 'click'
        </footer>
      </main>
    </div>
 */

/*
  10. Resolve next children
  -> insert text node to 'RxO-dom__h1'

  renderRxDom({
    type: 'h2',
    props: {
      className: 'RxO-dom__h2'
    },
    children: [
      mS(__rootComponentState.header, (h: string) => h + ' WOW!')
    ]
  }, headerElement);

  -> create 'h2' element
  -> set class to 'RxO-dom__h2'
  -> subscribe to children - emitting just text - insert text child
  -> append 'h2' to 'header'
 */

/*
  11. Final generated rv-dom (after 'h2' text child is inserted)
    <div id="root">
      <main id="main" class="RxO-rv-dom"> // attached listener to 'click'
        <header>
          <h1 class="RxO-dom__h1>RxO UI Suite WOW!</h1>
        </header>
        <section class="RxO-dom__section">
          <header>
            <h2 class="RxO-dom__h2>New Section WOW!</h1>
          </header>
        </section>
        <footer>
          <button>Footer</button> // attached listener to 'click'
        </footer>
      </main>
    </div>
 */

/*
  ACTIONS:
  1. Click footer button
  -> 'click' event is dispatched from rv-dom button element
  -> rxDom rxjs fromEvent listener subscription is called
  -> rxDom element (button in Footer) onClick is called
  -> App components setHeader is called with 'Footer xD' arg
  -> setHeader is calling BehaviorSubject's next method
  -> BehaviorSubject is emitting new values to subscribers
    in our case there is one subscriber - header state is passed
    as prop into first Header component, where is mapped by mapString
    helper function and subscribed as 'ObservableStringChild'
  -> rxDom child subscription is called - old text value is removed
    and new value is inserted
  -> this rxDom operation is asynchronous and atomic
  -> the only one element that is changing is 'RxO UI Suite WOW!'
    which is text content in h1 element

  2. Click main
  -> 'click' event is dispatched from rv-dom main element
  -> rxDom rxjs fromEvent listener subscription is called
  -> rxDom element (main in App) onClick is called
  -> App components setShowFooter is called with false arg
  -> setShowFooter is calling BehaviorSubject's next method
  -> BehaviorSubject is emitting new values to subscribers
    in our case there is one subscriber - it's in observableIf (oIf)
    helper function call - it's subscribed implicitly in switchMap
  -> rxDom observableIf is switch-mapping last 'main' child to null
  -> rxDom child subscription is called - old component rv-dom is removed and
    inner subscriptions unsubscribed
  -> this rxDom operation is asynchronous and atomic
  -> rxDom is removing footer without affecting other elements of UI
  -> when element will be inserted again into rv-dom it also don't affect
    other UI elements
  -> it's reachable cause of rv-dom streaming - all rv-dom elements
 */
