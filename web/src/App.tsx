import { RvdComponent } from '@atom-iq/core'
import Header from './Header/Header'
import Footer from './Footer/Footer'
import Intro from './Intro/Intro'
import Details from './Details/Details'
import './App.scss'

const App: RvdComponent = () => {
  return (
    <main class="app">
      <Header />
      <Intro />
      <Details />
      <Footer />
    </main>
  )
}

export default App
