import { ElementRef, RvdComponent } from '@atom-iq/core'
import { elementRef } from '@atom-iq/ref'
import Header from './Header/Header'

import './App.scss'
import Performance from './Performance/Performance'
import Footer from './Footer/Footer'
import Intro from './Intro/Intro'
import Details from './Details/Details'
import { first } from 'rxjs/operators'

const colorPicker = {
  header: 'Color picker benchmark',
  subheader: 'Dynamically change className of 2 DOM Elements',
  description: `*Average result from 3 benchmark runs with 266 colors/elements (x2 compared to
    original benchmark) - on Chrome - the fastest browser for all libs`,
  results: {
    'Atom-iQ': 29170,
    Inferno: 7041,
    React: 2938,
    Preact: 2376,
    Vue: 1935
  },
  scoreToPxDivider: 200
}

const searchResults = {
  header: 'Search results benchmark',
  subheader: 'Dynamically change content of 200 DOM Elements',
  description: `*Average result from 3 benchmark runs with 200 Elements (x2 compared to original
    benchmark) - on Safari - the fastest browser for all libs`,
  results: {
    'Atom-iQ': 659,
    Inferno: 235,
    React: 205,
    Preact: 107,
    Vue: 94
  },
  scoreToPxDivider: 5
}

const App: RvdComponent = () => {
  const [mainRef, connectMainRef] = elementRef(['className'])

  first<ElementRef>()(mainRef).subscribe(ref => {
    console.log('Element Ref: ', ref)
    ref.props.className[1]('app test')
  })

  return (
    <main ref={connectMainRef()} class="app">
      <Header />
      <Intro />
      <section class="app__benchmarks">
        <header class="benchmarks__header">
          <h4>Atom-iQ's Reactive Virtual DOM vs Virtual DOM in benchmarks</h4>
        </header>
        <section class="benchmarks__content">
          <Performance {...colorPicker} />
          <Performance {...searchResults} />
        </section>
      </section>
      <Details />
      <Footer />
    </main>
  )
}

export default App
