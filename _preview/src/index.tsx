import App from './App'
import { createRvDOM } from '@atom-iq/core'

try {
  createRvDOM()(<App />, document.querySelector('#root'))
} catch (e) {
  console.error(e)
}
