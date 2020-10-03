import { createState, RvdComponent, RxO } from '@atom-iq/core'
import './App.scss'
import { distinctUntilChanged, first, map } from 'rxjs/operators'
import { Observable } from 'rxjs'
import { RvdChild } from '../../packages/core/src/shared/types'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import logo from './logo.png'

interface SidebarProps {
  nextHeaderText: (headerText: string) => void
  nextItems: (callback: (items: string[]) => string[]) => void
}

const Sidebar: RvdComponent<SidebarProps> = ({ nextHeaderText, nextItems }) => {
  const handleClick = (text: string, reset = 0) => () => {
    nextHeaderText(text)
    nextItems(items => {
      if (reset === 1) {
        return []
      } else if (reset === 2 && items.length === 4) {
        return [items[3], items[1], items[2], items[0]]
      } else if (reset === 0 && items.includes(text)) {
        return items.filter(item => item !== text)
      } else if (reset === 0) {
        return [text, ...items]
      }
      return items
    })
  }

  return (
    <aside class="App__Sidebar">
      <button type="button" onClick={handleClick('@atom-iq/core preview', 2)}>
        Change order
      </button>
      <button type="button" onClick={handleClick('@atom-iq/core preview', 1)}>
        Reset Header
      </button>
      <button type="button" onClick={handleClick('Header 1')}>
        Set Header 1
      </button>
      <button type="button" onClick={handleClick('Header 2')}>
        Set Header 2
      </button>
      <button type="button" onClick={handleClick('Header 3')}>
        Set Header 3
      </button>
      <button type="button" onClick={handleClick('Header 4')}>
        Set Header 4
      </button>
    </aside>
  )
}

const Center: RvdComponent<{ subHeader: RxO<string> }> = ({ subHeader }) => (
  <section class="App__Center">
    <img src={logo} />
    <h1>v0.0.5 Preview</h1>
    <h2>{subHeader}</h2>
  </section>
)

const iQRxList = (callback: (item: any) => RvdChild) => (source$: Observable<Array<any>>) =>
  source$.pipe(map(items => items.map(callback)))

const List: RvdComponent<{ items: RxO<string[]> }> = ({ items }) => {
  const listItems = iQRxList(item => (item ? <li key={item}>{item}</li> : null))(items)

  return (
    <section class="App__List">
      <h3 class="List__title">List: </h3>
      <ul>{listItems}</ul>
    </section>
  )
}

const App: RvdComponent = () => {
  const [headerText, nextHeaderText] = createState('@atom-iq/core preview')
  const [items, nextItems] = createState<string[]>([])

  return (
    <main class="App">
      <Sidebar nextHeaderText={nextHeaderText} nextItems={nextItems} />
      <Center subHeader={distinctUntilChanged()(headerText)} />
      <List items={items} />
    </main>
  )
}

export default App
