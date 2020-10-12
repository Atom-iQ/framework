import { eventState, RvdChangeEvent, RvdComponent, RvdFormEvent } from '@atom-iq/core'
import Header from './Header/Header'

import './App.scss'
import Performance from './Performance/Performance'
import Footer from './Footer/Footer'
import Intro from './Intro/Intro'
import Details from './Details/Details'
import { concatAll, map, switchMap } from 'rxjs/operators'
import { animationFrameScheduler, scheduled } from 'rxjs'

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
  const mapSelectChange = map((e: RvdChangeEvent<HTMLSelectElement>) => {
    console.log(e.target.value)
    if (e.target.value === 'test-1') {
      return 'test-5'
    }
    return e.target.value
  })

  const [textareaValue, connectTextarea] = eventState<RvdFormEvent<HTMLTextAreaElement>, string>(
    map(e => e.target.value)
  )

  const options = scheduled([[''], textareaValue], animationFrameScheduler).pipe(
    concatAll(),
    map(value => {
      return !value ? (
        <>
          <option key="test-1" value="test-1">
            Test 1
          </option>
          <option key="test-2" value="test-2">
            Test 2
          </option>
          <option key="test-3" value="test-3">
            Test 3
          </option>
          <option key="test-4" value="test-4">
            Test 4
          </option>
          <option key="test-5" value="test-5">
            Test 5
          </option>
        </>
      ) : value === '1' ? (
        <>
          <option key="test-1" value="test-1">
            Test 1
          </option>
          <option key="test-4" value="test-4">
            Test 4
          </option>
          <option key="test-5" value="test-5">
            Test 5
          </option>
          <option key="test-2" value="test-2">
            Test 2
          </option>
          <option key="test-3" value="test-3">
            Test 3
          </option>
          <option key="test-6" value="test-6">
            Test 6
          </option>
        </>
      ) : (
        <>
          <option key="test-6" value="test-6">
            Test 6
          </option>
          <option key="test-1" value="test-1">
            Test 1
          </option>
          <option key="test-4" value="test-4">
            Test 4
          </option>
          <option key="test-3" value="test-3">
            Test 3
          </option>
        </>
      )
    })
  )

  return (
    <main class="app">
      <Header />
      <Intro />
      <section>
        <input onInput$={map(e => e.target.value.toLocaleLowerCase())} />
        <select style={{ width: '200px' }} onChange$={mapSelectChange}>
          {options}
        </select>
        <textarea onInput$={connectTextarea()} value={textareaValue} />
      </section>
      <section class="app__benchmarks">
        <header class="benchmarks__header">
          <h4>Atom-iQ's Reactive Virtual DOM vs Virtual DOM in benchmarks</h4>
          <h6>
            Benchmark results updated - previously search-result benchmark was incorrect for Atom-iQ
            (~10x faster than Inferno) - Atom-iQ could update the state that fast, but not the UI
            (backpressure) - with correct UI rendering it's still about 3x faster than Inferno (one
            of the fastest frameworks in the market, probably the most performant Virtual DOM). With
            this results, Atom-iQ is probably the new performance leader!
          </h6>
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
