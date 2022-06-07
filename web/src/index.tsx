import App from './App'
import { start } from '@atom-iq/core'

const initContext = () => ({
  atomiqVersion: 'v0.3.0-alpha',
  npmScopeUrl: 'https://www.npmjs.com/package/@atom-iq'
})

try {
  start(<App />, initContext)(document.querySelector('#root'))
} catch (e) {
  console.error(e)
}
