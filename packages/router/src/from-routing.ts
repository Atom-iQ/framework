import { Observable } from 'rxjs'

export interface RouterConfig {
  useHistory: boolean
}

export const isHistorySupported = window.history && 'pushState' in window.history

export const routerConfig: RouterConfig = {
  useHistory: true
}

// Current location - saved globally, as fromRouting() could be used many times
// and we don't need to emit initial location everytime it's subscribed
let currentLocation: string = null

/**
 * From Routing
 *
 * Creates Observable of current location
 */
export function fromRouting(): Observable<string> {
  return new Observable(subscriber => {
    // Use History API when it's supported
    const isUsingHistory = routerConfig.useHistory && isHistorySupported
    // Location change event handler
    const locationChangeHandler = () => {
      const newLocation = isUsingHistory
        ? location.pathname.replace(/^\/*/, '/')
        : location.hash.replace(/^#!?\/*/, '/')

      if (newLocation !== currentLocation) {
        currentLocation = newLocation
        subscriber.next(newLocation)
      }
    }
    // Save and emit initial location
    locationChangeHandler()

    if (isUsingHistory) {
      // Add History API event listeners
      window.addEventListener('popstate', locationChangeHandler)
      window.addEventListener('pushstate', locationChangeHandler)

      // Cleanup function
      return function onUnsubscribe() {
        window.removeEventListener('popstate', locationChangeHandler)
        window.removeEventListener('pushstate', locationChangeHandler)
      }
    } else {
      // Add Hash API event listeners
      window.addEventListener('hashchange', locationChangeHandler)

      // Cleanup function
      return function onUnsubscribe() {
        window.removeEventListener('hashchange', locationChangeHandler)
      }
    }
  })
}
