import App from './App'
import { combineMiddlewares, createRvDOM } from '@atom-iq/core'
import { refMiddleware } from '@atom-iq/ref'
import { contextMiddleware } from '@atom-iq/context'

const middlewares = combineMiddlewares(
  refMiddleware(),
  contextMiddleware({
    atomiqVersion: 'v0.2.0-alpha'
  })
)()

try {
  createRvDOM(middlewares)(<App />, document.querySelector('#root'))
} catch (e) {
  console.error(e)
}
