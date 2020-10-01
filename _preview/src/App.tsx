import { createState, RvdComponent, RxO } from '@atom-iq/core'
import './App.scss'
import { distinctUntilChanged, first, map } from 'rxjs/operators'
import { Observable } from 'rxjs'
import { RvdChild } from '../../packages/core/src/shared/types'
import logo from './logo.png'

const Header: RvdComponent<{ headerText: RxO<string> }> = ({ headerText }) => {
  console.log('Header init, props: ', headerText)
  return (
    <header class="App__Header">
      <img class="App__Logo" src={logo} />
      <h1>{headerText}</h1>
    </header>
  )
}

interface SidebarProps {
  setHeaderText: (headerText: string) => void
  setItems: (items: string[]) => void
  items: RxO<string[]>
}

const Sidebar: RvdComponent<SidebarProps> = ({ setHeaderText, setItems, items }) => {
  console.log('Sidebar init, props: ', { setHeaderText, setItems })

  const handleClick = (text: string, reset = false) => () => {
    setHeaderText(text)
    items.pipe(first()).subscribe(items => {
      if (reset) {
        setItems([])
      } else if (items.includes(text)) {
        setItems([...items])
      } else {
        setItems([...items, text])
      }
    })
  }

  return (
    <aside class="App__Sidebar">
      <button type="button" onClick={handleClick('@atom-iq/core preview', true)}>
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

const iQRxList = (callback: (item: any) => RvdChild) => (source$: Observable<Array<any>>) =>
  source$.pipe(map(items => items.map(callback)))

const List: RvdComponent<{ items: RxO<string[]> }> = ({ items }) => {
  const listItems = iQRxList(item => (item ? <li key={item}>{item}</li> : null))(items)

  return <ul>{listItems}</ul>
}

const App: RvdComponent = () => {
  const [headerText, setHeaderText] = createState('@atom-iq/core preview')
  const [items, setItems] = createState<string[]>([])

  console.log('App init, state: ', { headerText })
  return (
    <main class="App">
      <Header headerText={distinctUntilChanged<string>()(headerText)} />
      <Sidebar setHeaderText={setHeaderText} setItems={setItems} items={items} />
      <List items={items} />
    </main>
  )
}

export default App
