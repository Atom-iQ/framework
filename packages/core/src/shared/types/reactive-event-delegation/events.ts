/** --------------------------------------------------------------------- **
 **  Atom-iQ Reactive Event Delegation Synthetic Events
 ** --------------------------------------------------------------------- **/

import { RvdDOMEventHandlerName } from 'shared/types'

/**
 * Base Atom-iQ Reactive Event Delegation Synthetic Event interface, that extends base DOM Event.
 *
 * After finishing the Reactive Event Delegation System logic, Synthetic Event abstraction should be
 * constantly developed and improved, to provide the best performance and development experience
 */
export interface RvdEvent<CurrentTarget extends EventTarget = EventTarget> extends Event {
  readonly currentTarget: CurrentTarget

  isDefaultPrevented(): boolean

  stopPropagation(): void

  isPropagationStopped(): boolean
}

/**
 * Synthetic Clipboard Event
 */
export type RvdClipboardEvent<CT extends EventTarget = EventTarget> = RvdEvent<CT> & ClipboardEvent
/**
 * Synthetic Composition Event
 */
export type RvdCompositionEvent<CT extends EventTarget = EventTarget> = RvdEvent<CT> &
  CompositionEvent
/**
 * Synthetic Drag Event
 */
export type RvdDragEvent<CT extends EventTarget = EventTarget> = RvdMouseEvent<CT> & DragEvent
/**
 * Synthetic Focus Event
 */
export type RvdFocusEvent<CT extends EventTarget = EventTarget> = RvdEvent<CT> & FocusEvent
/**
 * Synthetic Form Event
 * TODO: Improve Form Events for better user experience
 */
export type RvdFormEvent<CT extends EventTarget = EventTarget> = RvdEvent<CT> & InputEvent
/**
 * Synthetic Change Event
 * TODO: Improve Change Events for better user experience
 */
export type RvdChangeEvent<CT extends EventTarget = EventTarget> = RvdEvent<CT>
/**
 * Synthetic Keyboard Event
 */
export type RvdKeyboardEvent<CT extends EventTarget = EventTarget> = RvdEvent<CT> & KeyboardEvent
/**
 * Synthetic Mouse Event
 */
export type RvdMouseEvent<CT extends EventTarget = EventTarget> = RvdEvent<CT> & MouseEvent
/**
 * Synthetic Touch Event
 */
export type RvdTouchEvent<CT extends EventTarget = EventTarget> = RvdEvent<CT> & TouchEvent
/**
 * Synthetic PointerEvent
 */
export type RvdPointerEvent<CT extends EventTarget = EventTarget> = RvdEvent<CT> & PointerEvent
/**
 * Synthetic UI Event
 */
export type RvdUIEvent<CT extends EventTarget = EventTarget> = RvdEvent<CT> & UIEvent
/**
 * Synthetic Wheel Event
 */
export type RvdWheelEvent<CT extends EventTarget = EventTarget> = RvdMouseEvent<CT> & WheelEvent
/**
 * Synthetic Animation Event
 */
export type RvdAnimationEvent<CT extends EventTarget = EventTarget> = RvdEvent<CT> & AnimationEvent
/**
 * Synthetic Transition Event
 */
export type RvdTransitionEvent<CT extends EventTarget = EventTarget> = RvdEvent<CT> &
  TransitionEvent

/** ------------------------------------------------------------------------------------------------ **
 ** Atom-iQ Reactive Event Delegation & Reactive Virtual DOM Event Handlers
 **
 ** Event Handlers are part of both Reactive Event Delegation and Reactive Virtual DOM, acts as
 ** connection point between two abstraction layers - declared as props in RVD, passed to RED
 ** delegation handlers.
 ** ------------------------------------------------------------------------------------------------ **/
export interface RvdEventHandlerOptions {
  capture?: boolean
  passive?: boolean
  once?: boolean
}
/** =============================================== ** --------------------------------------------- **
 **    Atom-iQ RVD Event Handlers     **
 ** =============================================== **
 **
 ** Atom-iQ is elastic with handlers, both types are using Synthetic Events and Reactive Event
 ** Delegation System. Both handlers could be also used on one RVD Element, at once. Developer has
 ** safe choice, it should also depend on use case. However, Reactive Event Handlers have some
 ** additional, modern features, not available for Classic Handlers
 ** ------------------------------------------------------------------------------------------------ **/

/**
 * Base Atom-iQ Classic Event Handler Function Type
 */
export interface RvdEventHandlerFn<SE extends RvdEvent<CT>, CT extends EventTarget = EventTarget> {
  (event: SE): void
  (event: SE, currentTarget: CT): void
  options?: RvdEventHandlerOptions
}
/**
 * Base Classic Event Handler Union, with possible null or undefined event handler props values
 */
export type RvdEventHandler<SE extends RvdEvent<CT>, CT extends EventTarget = EventTarget> =
  | RvdEventHandlerFn<SE, CT>
  | null
  | undefined
/**
 * Common type for any event handler
 */
export type RvdAnyEventHandler<CT extends EventTarget = EventTarget> = RvdEventHandler<
  RvdEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Clipboard Synthetic Event Handler
 */
export type RvdClipboardEventHandler<CT extends EventTarget = EventTarget> = RvdEventHandler<
  RvdClipboardEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Composition Synthetic Event Handler
 */
export type RvdCompositionEventHandler<CT extends EventTarget = EventTarget> = RvdEventHandler<
  RvdCompositionEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Drag Synthetic Event Handler
 */
export type RvdDragEventHandler<CT extends EventTarget = EventTarget> = RvdEventHandler<
  RvdDragEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Focus Synthetic Event Handler
 */
export type RvdFocusEventHandler<CT extends EventTarget = EventTarget> = RvdEventHandler<
  RvdFocusEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Form Synthetic Event Handler
 */
export type RvdFormEventHandler<CT extends EventTarget = EventTarget> = RvdEventHandler<
  RvdFormEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Change Synthetic Event Handler
 */
export type RvdChangeEventHandler<CT extends EventTarget = EventTarget> = RvdEventHandler<
  RvdChangeEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Keyboard Synthetic Event Handler
 */
export type RvdKeyboardEventHandler<CT extends EventTarget = EventTarget> = RvdEventHandler<
  RvdKeyboardEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Mouse Synthetic Event Handler
 */
export type RvdMouseEventHandler<CT extends EventTarget = EventTarget> = RvdEventHandler<
  RvdMouseEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Touch Synthetic Event Handler
 */
export type RvdTouchEventHandler<CT extends EventTarget = EventTarget> = RvdEventHandler<
  RvdTouchEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Pointer Synthetic Event Handler
 */
export type RvdPointerEventHandler<CT extends EventTarget = EventTarget> = RvdEventHandler<
  RvdPointerEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic UI Synthetic Event Handler
 */
export type RvdUIEventHandler<CT extends EventTarget = EventTarget> = RvdEventHandler<
  RvdUIEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Wheel Synthetic Event Handler
 */
export type RvdWheelEventHandler<CT extends EventTarget = EventTarget> = RvdEventHandler<
  RvdWheelEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Animation Synthetic Event Handler
 */
export type RvdAnimationEventHandler<CT extends EventTarget = EventTarget> = RvdEventHandler<
  RvdAnimationEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Transition Synthetic Event Handler
 */
export type RvdTransitionEventHandler<CT extends EventTarget = EventTarget> = RvdEventHandler<
  RvdTransitionEvent<CT>,
  CT
>

export type RvdSyntheticEventName<
  HandlerName extends RvdDOMEventHandlerName = RvdDOMEventHandlerName
> = TransformEventPropName<HandlerName>

type TransformEventPropName<EventPropName extends string> =
  EventPropName extends `on${infer EventName}` ? Lowercase<EventName> : never

export type EventPropName = `$$${RvdSyntheticEventName}`
export type EventCapturePropName = `$$${RvdSyntheticEventName}Capture`
