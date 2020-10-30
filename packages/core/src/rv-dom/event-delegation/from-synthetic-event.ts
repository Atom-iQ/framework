import { RvdSyntheticEvent, SyntheticEventName } from '../../shared/types'
import { Observable } from 'rxjs'

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
 * @param getCurrentTarget
 * @param isClick
 */
export function fromSyntheticEvent<CurrentTarget extends EventTarget = Element>(
  rootElement: Element,
  eventName: SyntheticEventName,
  getCurrentTarget: () => CurrentTarget,
  isClick = false
): Observable<RvdSyntheticEvent<CurrentTarget>> {
  return new Observable<RvdSyntheticEvent<CurrentTarget>>(subscriber => {
    /** Next Synthetic Event Handler - streaming synthesized RvdSyntheticEvent */
    const nextSynthetic: DOMEventListenerHandler = event =>
      subscriber.next(synthesizeRvdEvent<CurrentTarget>(event, getCurrentTarget))
    /** DOM Event Handler - additional micro-logic for click events, caused by Firefox bug */
    const handler = isClick ? handleFirefoxBug(nextSynthetic) : nextSynthetic
    /** Add Root Level Synthetic Event Handler - on init (first connected handler, not app init) */
    rootElement.addEventListener(eventName, handler)
    /** Remove Root Level Synthetic Event Handler - on complete (all RvDOM handlers disconnected) */
    return () => rootElement.removeEventListener(eventName, handler)
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

/**
 * Transform ("synthesize") DOM Event, to RvdSyntheticEvent
 * @param domEvent
 * @param getCurrentTarget
 */
function synthesizeRvdEvent<CurrentTarget extends EventTarget = Element>(
  domEvent: Event,
  getCurrentTarget: () => CurrentTarget
): RvdSyntheticEvent<CurrentTarget> {
  const event = domEvent as RvdSyntheticEvent<CurrentTarget>
  event.isDefaultPrevented = isDefaultPrevented
  event.isPropagationStopped = isPropagationStopped
  event.stopPropagation = stopPropagation
  return Object.defineProperty(event, 'currentTarget', {
    configurable: true,
    get: getCurrentTarget
  })
}

/**
 * Stop propagation in Atom-iQ Event Delegation System
 */
function stopPropagation(): void {
  this.cancelBubble = true
  if (!this.immediatePropagationStopped) {
    this.stopImmediatePropagation()
  }
}

/**
 * Check if Event has default behavior prevented
 */
function isDefaultPrevented(): boolean {
  return this.defaultPrevented
}

/**
 * Check if propagation is stopped in Atom-iQ Event Delegation System
 */
function isPropagationStopped(): boolean {
  return this.cancelBubble
}
