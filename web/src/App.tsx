import { RvdComponent } from '@atom-iq/core'
import Header from './Header/Header'

import './App.scss'
import Performance from './Performance/Performance'
import Footer from './Footer/Footer'
import Intro from './Intro/Intro'
import Details from './Details/Details'

const colorPicker = {
  header: 'Color picker benchmark',
  subheader: 'Dynamically change className of 2 DOM Elements',
  description: `*Average result from 3 benchmark runs with 266, 532, 1064 and 2118 colors (Elements) - on
    Chrome - the fastest browser for all libs (except Atom-iQ, which is faster on Safari)`,
  results: {
    'Atom-iQ': 14388,
    Inferno: 3524,
    React: 1712,
    Preact: 1197,
    Vue: 929
  },
  scoreToPxDivider: 100
}

const searchResults = {
  header: 'Search results benchmark',
  subheader: 'Dynamically change content of 300 DOM Elements',
  description: `*Average result from 3 benchmark runs with 300 Elements (x3 compared to original benchmark) on
    Safari - the fastest browser for all libs`,
  results: {
    'Atom-iQ': 1402,
    Inferno: 147,
    React: 126,
    Preact: 67,
    Vue: 62
  },
  scoreToPxDivider: 10
}

const App: RvdComponent = () => {
  return (
    <main class="app">
      <Header />
      <Intro />
      <section class="app__benchmarks">
        <header class="benchmarks__header">
          <h4>
            Atom-iQ's Reactive Virtual DOM vs Virtual DOM in benchmarks (click on benchmark header
            to replay animation)
          </h4>
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
