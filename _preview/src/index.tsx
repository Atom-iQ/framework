import App from './App'
import { createRvDOM } from '@atom-iq/core'

try {
  createRvDOM()(<App />, '#root')
} catch (e) {
  console.error(e)
}
