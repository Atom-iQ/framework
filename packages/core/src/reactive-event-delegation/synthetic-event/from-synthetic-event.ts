import { EventHandlerOptions, RedEvent, SyntheticEventName } from '../../shared/types'
import { Observable } from 'rxjs'
import { EventPropertiesManager } from '../../shared/types/reactive-event-delegation/event-delegation'
import { synthesizeRvdEvent } from './synthesize-event'

/**
 * DOM Event Listener Function Type
 */
type DOMEventListenerHandler = (event: Event) => void

/**
 * Creates Observable of Reactive Virtual DOM Synthetic Event.
 *
 * Attaches specific event to root DOM Element - following one of latest ideas from React - instead
 * attaching handlers to Document, allowing a separate event delegation context for single Atom-iQ
 * Reactive Virtual DOM instance (in multiple Renderer instances setting).
 * @param rootElement
 * @param eventName
 * @param eventPropertiesManager
 * @param isClick
 * @param options
 */
export function fromSyntheticEvent<CurrentTarget extends EventTarget = EventTarget>(
  rootElement: Element,
  eventName: SyntheticEventName,
  eventPropertiesManager: EventPropertiesManager,
  isClick = false,
  options?: EventHandlerOptions
): Observable<RedEvent<CurrentTarget>> {
  return new Observable<RedEvent<CurrentTarget>>(subscriber => {
    /** Next Synthetic Event Handler - streaming synthesized RvdSyntheticEvent */
    const nextSynthetic: DOMEventListenerHandler = event =>
      subscriber.next(synthesizeRvdEvent<CurrentTarget>(event, eventPropertiesManager))
    /** DOM Event Handler - additional micro-logic for click events, caused by Firefox bug */
    const handler = isClick ? handleFirefoxBug(nextSynthetic) : nextSynthetic
    /** Add Root Level Synthetic Event Handler - on init (first connected handler, not app init) */
    rootElement.addEventListener(eventName, handler, options)
    /** Remove Root Level Synthetic Event Handler - on complete (all RvDOM handlers disconnected) */
    return () => rootElement.removeEventListener(eventName, handler, options)
  })
}

/**
 * Firefox workaround - used code and comment from Inferno.js repository
 *
 * Firefox incorrectly triggers click event for mid/right mouse buttons.
 * This bug has been active for 17 years.
 * https://bugzilla.mozilla.org/show_bug.cgi?id=184051
 * @param callback
 */
function handleFirefoxBug(callback: (event: MouseEvent) => void) {
  return (event: MouseEvent) => {
    if (event.button !== 0) {
      event.stopPropagation()
      return
    }
    callback(event)
  }
}
