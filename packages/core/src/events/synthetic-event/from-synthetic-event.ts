import { Observable, Observer, Subscription, teardownSub } from '@atom-iq/rx'
import type {
  RvdEventHandlerOptions,
  RvdEvent,
  RvdSyntheticEventName,
  EventTargetManager
} from 'types'

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
 * @param getCurrentTarget
 * @param isClick
 * @param options
 */
export function fromSyntheticEvent<CurrentTarget extends EventTarget = EventTarget>(
  rootElement: Element,
  eventName: RvdSyntheticEventName,
  getCurrentTarget: EventTargetManager['get'],
  isClick = false,
  options?: RvdEventHandlerOptions
): Observable<RvdEvent<CurrentTarget>> {
  return new SyntheticEventObservable<CurrentTarget>(
    rootElement,
    eventName,
    getCurrentTarget,
    isClick,
    options
  )
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

class SyntheticEventObservable<CurrentTarget extends EventTarget = EventTarget>
  implements Observable<RvdEvent<CurrentTarget>>
{
  private readonly n: RvdSyntheticEventName
  private readonly t: EventTargetManager['get']
  private readonly c: boolean
  private readonly e: Element
  private readonly o: RvdEventHandlerOptions | undefined

  constructor(
    rootElement: Element,
    eventName: RvdSyntheticEventName,
    getCurrentTarget: EventTargetManager['get'],
    isClick: boolean,
    options: RvdEventHandlerOptions | undefined
  ) {
    this.e = rootElement
    this.n = eventName
    this.t = getCurrentTarget
    this.c = isClick
    this.o = options
  }

  subscribe(observer: Observer<RvdEvent<CurrentTarget>>): Subscription {
    /** Next Synthetic Event Handler - streaming synthesized RvdSyntheticEvent */
    const nextSynthetic: DOMEventListenerHandler = event =>
      observer.next(synthesizeRvdEvent<CurrentTarget>(event, this.t))
    /** DOM Event Handler - additional micro-logic for click events, caused by Firefox bug */
    const handler = this.c ? handleFirefoxBug(nextSynthetic) : nextSynthetic
    /** Add Root Level Synthetic Event Handler - on init (first connected handler, not app init) */
    this.e.addEventListener(this.n, handler, this.o)
    /** Remove Root Level Synthetic Event Handler - on complete (all RvDOM handlers disconnected) */
    return teardownSub(() => this.e.removeEventListener(this.n, handler, this.o))
  }
}
