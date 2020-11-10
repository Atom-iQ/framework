import type {
  NativeClipboardEvent,
  NativeCompositionEvent,
  NativeDragEvent,
  NativeFocusEvent
} from './native-events'
import { Observable } from 'rxjs'

/** --------------------------------------------------------------------- **
 **  Atom-iQ Reactive Event Delegation Synthetic Events
 ** --------------------------------------------------------------------- **/

/**
 * Base Atom-iQ Reactive Event Delegation Synthetic Event interface, that extends base DOM Event.
 *
 * After finishing the Reactive Event Delegation System logic, Synthetic Event abstraction should be
 * constantly developed and improved, to provide the best performance and development experience
 */
export interface RedEvent<CT extends EventTarget = EventTarget> extends Event {
  readonly currentTarget: CT

  isDefaultPrevented(): boolean

  stopPropagation(): void

  isPropagationStopped(): boolean
}

/**
 * Synthetic Clipboard Event
 */
export type RedClipboardEvent<CT extends EventTarget = EventTarget> = RedEvent<CT> &
  NativeClipboardEvent
/**
 * Synthetic Composition Event
 */
export type RedCompositionEvent<CT extends EventTarget = EventTarget> = RedEvent<CT> &
  NativeCompositionEvent
/**
 * Synthetic Drag Event
 */
export type RedDragEvent<CT extends EventTarget = EventTarget> = RedMouseEvent<CT> & NativeDragEvent
/**
 * Synthetic Focus Event
 */
export type RedFocusEvent<CT extends EventTarget = EventTarget> = RedEvent<CT> & NativeFocusEvent
/**
 * Synthetic Form Event
 * TODO: Improve Form Events for better user experience
 */
export type RedFormEvent<CT extends EventTarget = EventTarget> = RedEvent<CT> & InputEvent
/**
 * Synthetic Change Event
 * TODO: Improve Change Events for better user experience
 */
export type RedChangeEvent<CT extends EventTarget = EventTarget> = RedEvent<CT>
/**
 * Synthetic Keyboard Event
 */
export type RedKeyboardEvent<CT extends EventTarget = EventTarget> = RedEvent<CT> & KeyboardEvent
/**
 * Synthetic Mouse Event
 */
export type RedMouseEvent<CT extends EventTarget = EventTarget> = RedEvent<CT> & MouseEvent
/**
 * Synthetic Touch Event
 */
export type RedTouchEvent<CT extends EventTarget = EventTarget> = RedEvent<CT> & TouchEvent
/**
 * Synthetic PointerEvent
 */
export type RedPointerEvent<CT extends EventTarget = EventTarget> = RedEvent<CT> & PointerEvent
/**
 * Synthetic UI Event
 */
export type RedUIEvent<CT extends EventTarget = EventTarget> = RedEvent<CT> & UIEvent
/**
 * Synthetic Wheel Event
 */
export type RedWheelEvent<CT extends EventTarget = EventTarget> = RedMouseEvent<CT> & WheelEvent
/**
 * Synthetic Animation Event
 */
export type RedAnimationEvent<CT extends EventTarget = EventTarget> = RedEvent<CT> & AnimationEvent
/**
 * Synthetic Transition Event
 */
export type RedTransitionEvent<CT extends EventTarget = EventTarget> = RedEvent<CT> &
  TransitionEvent

/** ------------------------------------------------------------------------------------------------ **
 ** Atom-iQ Reactive Event Delegation & Reactive Virtual DOM Event Handlers
 **
 ** Event Handlers are part of both Reactive Event Delegation and Reactive Virtual DOM, acts as
 ** connection point between two abstraction layers - declared as props in RVD, passed to RED
 ** delegation handlers.
 ** ------------------------------------------------------------------------------------------------ **/
export interface EventHandlerOptions {
  capture?: boolean
  passive?: boolean
  once?: boolean
}
/** =============================================== ** --------------------------------------------- **
 **    Atom-iQ RED & RVD Classic Event Handlers     **
 ** =============================================== **
 ** Inspired by React & Virtual DOM Event Handlers. As they are really easy to use, some may prefer
 ** Classic Handlers, over new Reactive Event Handlers (they are more advanced technology, could be
 ** harder to learn, but they are also more powerful and feature-rich).
 **
 ** Atom-iQ is elastic with handlers, both types are using Synthetic Events and Reactive Event
 ** Delegation System. Both handlers could be also used on one RVD Element, at once. Developer has
 ** safe choice, it should also depend on use case. However, Reactive Event Handlers have some
 ** additional, modern features, not available for Classic Handlers
 ** ------------------------------------------------------------------------------------------------ **/

/**
 * Base Atom-iQ Classic Event Handler Function Type
 */
export interface ClassicEventHandlerFn<
  SE extends RedEvent<CT>,
  CT extends EventTarget = EventTarget
> {
  (event: SE): void
  options?: EventHandlerOptions
}
/**
 * Base Classic Event Handler Union, with possible null or undefined event handler props values
 */
export type ClassicEventHandler<SE extends RedEvent<CT>, CT extends EventTarget = EventTarget> =
  | ClassicEventHandlerFn<SE, CT>
  | null
  | undefined
/**
 * Atom-iQ Classic Clipboard Synthetic Event Handler
 */
export type ClipboardEventHandler<CT extends EventTarget = EventTarget> = ClassicEventHandler<
  RedClipboardEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Composition Synthetic Event Handler
 */
export type CompositionEventHandler<CT extends EventTarget = EventTarget> = ClassicEventHandler<
  RedCompositionEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Drag Synthetic Event Handler
 */
export type DragEventHandler<CT extends EventTarget = EventTarget> = ClassicEventHandler<
  RedDragEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Focus Synthetic Event Handler
 */
export type FocusEventHandler<CT extends EventTarget = EventTarget> = ClassicEventHandler<
  RedFocusEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Form Synthetic Event Handler
 */
export type FormEventHandler<CT extends EventTarget = EventTarget> = ClassicEventHandler<
  RedFormEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Change Synthetic Event Handler
 */
export type ChangeEventHandler<CT extends EventTarget = EventTarget> = ClassicEventHandler<
  RedChangeEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Keyboard Synthetic Event Handler
 */
export type KeyboardEventHandler<CT extends EventTarget = EventTarget> = ClassicEventHandler<
  RedKeyboardEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Mouse Synthetic Event Handler
 */
export type MouseEventHandler<CT extends EventTarget = EventTarget> = ClassicEventHandler<
  RedMouseEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Touch Synthetic Event Handler
 */
export type TouchEventHandler<CT extends EventTarget = EventTarget> = ClassicEventHandler<
  RedTouchEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Pointer Synthetic Event Handler
 */
export type PointerEventHandler<CT extends EventTarget = EventTarget> = ClassicEventHandler<
  RedPointerEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic UI Synthetic Event Handler
 */
export type UIEventHandler<CT extends EventTarget = EventTarget> = ClassicEventHandler<
  RedUIEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Wheel Synthetic Event Handler
 */
export type WheelEventHandler<CT extends EventTarget = EventTarget> = ClassicEventHandler<
  RedWheelEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Animation Synthetic Event Handler
 */
export type AnimationEventHandler<CT extends EventTarget = EventTarget> = ClassicEventHandler<
  RedAnimationEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Transition Synthetic Event Handler
 */
export type TransitionEventHandler<CT extends EventTarget = EventTarget> = ClassicEventHandler<
  RedTransitionEvent<CT>,
  CT
>

/** ====================================== ** ------------------------------------------------------ **
 **    Atom-iQ Reactive Event Handlers     **
 ** ====================================== **
 ** Reactive Event Handlers are a new type of Event Handlers, their props looks similar, but ending
 ** with '$'. They are callback functions, takes RvdSyntheticEvent stream as argument and have to
 ** also return stream (Observable) with Synthetic Event (or with null, more below).
 **
 ** Synthetic Event could be modified/mapped in Reactive Handler, but should have compatible interface,
 ** it's allowed only to extend base Event - the reason is that returned Event stream will be passed
 ** to the next handler, somewhere above, until the event.stopPropagation() call or returning null Observable.
 **
 ** That's Reactive Event Delegation - The Atom-iQ Reactive Synthetic Event is bubbling up in a single
 ** stream, that's passed between connected handlers, like between RxJS operators, from target to root.
 **
 ** Atom-iQ has also special, 100% declarative eventState() - made for reactive state updates,
 ** without imperative nextState() calls - eventState is returning [state, connectEvent],
 ** connectEvent() is made for Reactive Event Handlers.
 **
 ** They have also special use case with Controlled Form Elements - the Observable value returned
 ** from ie. onInput$ (with HTMLInputElement), could act as Element `value` prop, without need to
 ** keep data in intermediate state field
 ** ------------------------------------------------------------------------------------------------ **/

/**
 * Base Reactive Event Handler Function Type
 */
export interface ReactiveEventHandlerFn<
  SE extends RedEvent<CT>,
  CT extends EventTarget = EventTarget
> {
  (event$: Observable<SE>): Observable<SE>
  options?: EventHandlerOptions
}
/**
 * Reactive Event Handler Type
 */
export type ReactiveEventHandler<SE extends RedEvent<CT>, CT extends EventTarget = EventTarget> =
  | ReactiveEventHandlerFn<SE, CT>
  | null
  | undefined
/**
 * Atom-iQ Reactive Controlled Form Event Handler
 * Special Event Handler type for Controlled Form Elements - used when
 * form Element is controlled only by handler (without value prop)
 */
export type ReactiveControlledFormEventHandler<
  SE extends RedFormEvent<CT> | RedChangeEvent<CT>,
  CT extends EventTarget = EventTarget
> = (event$: Observable<SE>) => Observable<string | number | boolean | Array<string | number>>
/**
 * Atom-iQ Reactive Clipboard Synthetic Event Handler
 */
export type ReactiveClipboardEventHandler<
  CT extends EventTarget = EventTarget
> = ReactiveEventHandler<RedClipboardEvent<CT>, CT>
/**
 * Atom-iQ Reactive Composition Synthetic Event Handler
 */
export type ReactiveCompositionEventHandler<
  CT extends EventTarget = EventTarget
> = ReactiveEventHandler<RedCompositionEvent<CT>, CT>
/**
 * Atom-iQ Reactive Drag Synthetic Event Handler
 */
export type ReactiveDragEventHandler<CT extends EventTarget = EventTarget> = ReactiveEventHandler<
  RedDragEvent<CT>,
  CT
>
/**
 * Atom-iQ Reactive Focus Synthetic Event Handler
 */
export type ReactiveFocusEventHandler<CT extends EventTarget = EventTarget> = ReactiveEventHandler<
  RedFocusEvent<CT>,
  CT
>
/**
 * Atom-iQ Reactive Form Synthetic Event Handler
 */
export type ReactiveFormEventHandler<CT extends EventTarget = EventTarget> = ReactiveEventHandler<
  RedFormEvent<CT>,
  CT
>
/**
 * Atom-iQ Reactive Change Synthetic Event Handler
 */
export type ReactiveChangeEventHandler<CT extends EventTarget = EventTarget> = ReactiveEventHandler<
  RedChangeEvent<CT>,
  CT
>
/**
 * Atom-iQ Reactive Keyboard Synthetic Event Handler
 */
export type ReactiveKeyboardEventHandler<
  CT extends EventTarget = EventTarget
> = ReactiveEventHandler<RedKeyboardEvent<CT>, CT>
/**
 * Atom-iQ Reactive Mouse Synthetic Event Handler
 */
export type ReactiveMouseEventHandler<CT extends EventTarget = EventTarget> = ReactiveEventHandler<
  RedMouseEvent<CT>,
  CT
>
/**
 * Atom-iQ Reactive Touch Synthetic Event Handler
 */
export type ReactiveTouchEventHandler<CT extends EventTarget = EventTarget> = ReactiveEventHandler<
  RedTouchEvent<CT>,
  CT
>
/**
 * Atom-iQ Reactive Pointer Synthetic Event Handler
 */
export type ReactivePointerEventHandler<
  CT extends EventTarget = EventTarget
> = ReactiveEventHandler<RedPointerEvent<CT>, CT>
/**
 * Atom-iQ Reactive UI Synthetic Event Handler
 */
export type ReactiveUIEventHandler<CT extends EventTarget = EventTarget> = ReactiveEventHandler<
  RedUIEvent<CT>,
  CT
>
/**
 * Atom-iQ Reactive Wheel Synthetic Event Handler
 */
export type ReactiveWheelEventHandler<CT extends EventTarget = EventTarget> = ReactiveEventHandler<
  RedWheelEvent<CT>,
  CT
>
/**
 * Atom-iQ Reactive Animation Synthetic Event Handler
 */
export type ReactiveAnimationEventHandler<
  CT extends EventTarget = EventTarget
> = ReactiveEventHandler<RedAnimationEvent<CT>, CT>
/**
 * Atom-iQ Reactive Transition Synthetic Event Handler
 */
export type ReactiveTransitionEventHandler<
  CT extends EventTarget = EventTarget
> = ReactiveEventHandler<RedTransitionEvent<CT>, CT>

export type SyntheticEventName =
  | 'copy'
  | 'cut'
  | 'paste'
  | 'compositionend'
  | 'compositionstart'
  | 'compositionupdate'
  | 'focus'
  | 'blur'
  | 'change'
  | 'input'
  | 'reset'
  | 'submit'
  | 'invalid'
  | 'load'
  | 'error'
  | 'keydown'
  | 'keypress'
  | 'keyup'
  | 'abort'
  | 'canplay'
  | 'canplaythrough'
  | 'durationchange'
  | 'emptied'
  | 'encrypted'
  | 'ended'
  | 'loadeddata'
  | 'loadedmetadata'
  | 'loadstart'
  | 'pause'
  | 'play'
  | 'playing'
  | 'progress'
  | 'ratechange'
  | 'seeked'
  | 'seeking'
  | 'stalled'
  | 'suspend'
  | 'timeupdate'
  | 'volumechange'
  | 'waiting'
  | 'click'
  | 'contextmenu'
  | 'dblclick'
  | 'drag'
  | 'dragend'
  | 'dragenter'
  | 'dragexit'
  | 'dragleave'
  | 'dragover'
  | 'dragstart'
  | 'drop'
  | 'mousedown'
  | 'mouseenter'
  | 'mouseleave'
  | 'mousemove'
  | 'mouseout'
  | 'mouseover'
  | 'mouseup'
  | 'select'
  | 'touchcancel'
  | 'touchend'
  | 'touchmove'
  | 'touchstart'
  | 'pointerdown'
  | 'pointermove'
  | 'pointerup'
  | 'pointercancel'
  | 'pointerenter'
  | 'pointerleave'
  | 'pointerover'
  | 'pointerout'
  | 'scroll'
  | 'wheel'
  | 'animationstart'
  | 'animationend'
  | 'animationiteration'
  | 'transitionend'
