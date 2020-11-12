import { EventPropertiesManager } from '../../shared/types/rv-dom/event-delegation'
import { RedEvent } from '../../shared/types'

/**
 * Transform ("synthesize") DOM Event, to RvdSyntheticEvent
 * @param domEvent
 * @param eventPropertiesManager
 */
export function synthesizeRvdEvent<CurrentTarget extends EventTarget = Element>(
  domEvent: Event,
  eventPropertiesManager: EventPropertiesManager
): RedEvent<CurrentTarget> {
  const event = domEvent as RedEvent<CurrentTarget>
  event.isDefaultPrevented = isDefaultPrevented
  event.isPropagationStopped = isPropagationStopped
  event.stopPropagation = stopPropagation
  return Object.defineProperty(event, 'currentTarget', {
    configurable: true,
    get: eventPropertiesManager.getCurrentTarget
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
