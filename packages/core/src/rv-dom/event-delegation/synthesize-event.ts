import { EventPropertiesManager } from '../../shared/types/rv-dom/event-delegation'
import { RvdSyntheticEvent } from '../../shared/types'

/**
 * Transform ("synthesize") DOM Event, to RvdSyntheticEvent
 * @param domEvent
 * @param eventPropertiesManager
 */
export function synthesizeRvdEvent<CurrentTarget extends EventTarget = Element>(
  domEvent: Event,
  eventPropertiesManager: EventPropertiesManager
): RvdSyntheticEvent<CurrentTarget> {
  const event = domEvent as RvdSyntheticEvent<CurrentTarget>
  event.isDefaultPrevented = isDefaultPrevented
  event.isPropagationStopped = isPropagationStopped
  event.stopPropagation = stopPropagation
  eventPropertiesManager.setEventPhase(event.eventPhase)
  Object.defineProperty(event, 'eventPhase', {
    configurable: true,
    get: eventPropertiesManager.getEventPhase
  })
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
