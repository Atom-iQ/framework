import type {
  NativeClipboardEvent,
  NativeCompositionEvent,
  NativeDragEvent,
  NativeFocusEvent
} from './native-events'
import { Observable } from 'rxjs'

/** --------------------------------------------------------------------- **
 **  Reactive Virtual DOM Synthetic Events
 ** --------------------------------------------------------------------- **/

/**
 * Base Atom-iQ Reactive Virtual DOM Synthetic Event interface, that extends base DOM Event.
 *
 * After finishing the Reactive Event Delegation System logic, Synthetic Event abstraction should be
 * constantly developed and improved, to provide the best performance and development experience
 */
export interface RvdSyntheticEvent<CT extends EventTarget = Element> extends Event {
  readonly currentTarget: CT

  isDefaultPrevented(): boolean

  stopPropagation(): void

  isPropagationStopped(): boolean
}

/**
 * Synthetic Clipboard Event
 */
export type RvdClipboardEvent<CT extends EventTarget> = RvdSyntheticEvent<CT> & NativeClipboardEvent
/**
 * Synthetic Composition Event
 */
export type RvdCompositionEvent<CT extends EventTarget> = RvdSyntheticEvent<CT> &
  NativeCompositionEvent
/**
 * Synthetic Drag Event
 */
export type RvdDragEvent<CT extends EventTarget> = RvdMouseEvent<CT> & NativeDragEvent
/**
 * Synthetic Focus Event
 */
export type RvdFocusEvent<CT extends EventTarget> = RvdSyntheticEvent<CT> & NativeFocusEvent
/**
 * Synthetic Form Event
 * TODO: Improve Form Events for better user experience
 */
export type RvdFormEvent<CT extends EventTarget> = RvdSyntheticEvent<CT> & InputEvent
/**
 * Synthetic Change Event
 * TODO: Improve Change Events for better user experience
 */
export type RvdChangeEvent<CT extends EventTarget> = RvdSyntheticEvent<CT>
/**
 * Synthetic Keyboard Event
 */
export type RvdKeyboardEvent<CT extends EventTarget = Element> = RvdSyntheticEvent<CT> &
  KeyboardEvent
/**
 * Synthetic Mouse Event
 */
export type RvdMouseEvent<CT extends EventTarget = Element> = RvdSyntheticEvent<CT> & MouseEvent
/**
 * Synthetic Touch Event
 */
export type RvdTouchEvent<CT extends EventTarget = Element> = RvdSyntheticEvent<CT> & TouchEvent
/**
 * Synthetic PointerEvent
 */
export type RvdPointerEvent<CT extends EventTarget = Element> = RvdSyntheticEvent<CT> & PointerEvent
/**
 * Synthetic UI Event
 */
export type RvdUIEvent<CT extends EventTarget = Element> = RvdSyntheticEvent<CT> & UIEvent
/**
 * Synthetic Wheel Event
 */
export type RvdWheelEvent<CT extends EventTarget = Element> = RvdMouseEvent<CT> & WheelEvent
/**
 * Synthetic Animation Event
 */
export type RvdAnimationEvent<CT extends EventTarget = Element> = RvdSyntheticEvent<CT> &
  AnimationEvent
/**
 * Synthetic Transition Event
 */
export type RvdTransitionEvent<CT extends EventTarget = Element> = RvdSyntheticEvent<CT> &
  TransitionEvent

/** ===================================== ** ------------------------------------------------------- **
 **    Atom-iQ Classic Event Handlers     **
 ** ===================================== **
 ** Inspired by React & Virtual DOM Event Handlers. As they are really easy to use, some may prefer
 ** Classic Handlers, over new Reactive Event Handlers (they are more advanced technology, could be
 ** harder to learn, but they are also more powerful and feature-rich).
 **
 ** Atom-iQ is elastic with handlers, both types are using Synthetic Events and Reactive Event
 ** Delegation System. Both handlers could be also used on one RvdElement, at once. Developer has
 ** safe choice, it should also depend on use case. However, Reactive Event Handlers have some
 ** additional, modern features, not available for Classic Handlers
 ** ------------------------------------------------------------------------------------------------ **/

/**
 * Base Atom-iQ Classic Event Handler Function Type
 *
 * It could return Synthetic Event (could be modified), but don't have to return anything as well
 */
export type ClassicEventHandlerFn<
  SE extends RvdSyntheticEvent<CT>,
  CT extends EventTarget = Element
> = (event: SE) => void | SE
/**
 * Base Classic Event Handler Union, with possible null or undefined event handler props values
 */
export type ClassicEventHandler<
  SE extends RvdSyntheticEvent<CT>,
  CT extends EventTarget = Element
> = ClassicEventHandlerFn<SE, CT> | null | undefined
/**
 * Atom-iQ Classic Clipboard Synthetic Event Handler
 */
export type ClipboardEventHandler<CT extends EventTarget = Element> = ClassicEventHandler<
  RvdClipboardEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Composition Synthetic Event Handler
 */
export type CompositionEventHandler<CT extends EventTarget = Element> = ClassicEventHandler<
  RvdCompositionEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Drag Synthetic Event Handler
 */
export type DragEventHandler<CT extends EventTarget = Element> = ClassicEventHandler<
  RvdDragEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Focus Synthetic Event Handler
 */
export type FocusEventHandler<CT extends EventTarget = Element> = ClassicEventHandler<
  RvdFocusEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Form Synthetic Event Handler
 */
export type FormEventHandler<CT extends EventTarget = Element> = ClassicEventHandler<
  RvdFormEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Change Synthetic Event Handler
 */
export type ChangeEventHandler<CT extends EventTarget = Element> = ClassicEventHandler<
  RvdChangeEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Keyboard Synthetic Event Handler
 */
export type KeyboardEventHandler<CT extends EventTarget = Element> = ClassicEventHandler<
  RvdKeyboardEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Mouse Synthetic Event Handler
 */
export type MouseEventHandler<CT extends EventTarget = Element> = ClassicEventHandler<
  RvdMouseEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Touch Synthetic Event Handler
 */
export type TouchEventHandler<CT extends EventTarget = Element> = ClassicEventHandler<
  RvdTouchEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Pointer Synthetic Event Handler
 */
export type PointerEventHandler<CT extends EventTarget = Element> = ClassicEventHandler<
  RvdPointerEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic UI Synthetic Event Handler
 */
export type UIEventHandler<CT extends EventTarget = Element> = ClassicEventHandler<
  RvdUIEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Wheel Synthetic Event Handler
 */
export type WheelEventHandler<CT extends EventTarget = Element> = ClassicEventHandler<
  RvdWheelEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Animation Synthetic Event Handler
 */
export type AnimationEventHandler<CT extends EventTarget = Element> = ClassicEventHandler<
  RvdAnimationEvent<CT>,
  CT
>
/**
 * Atom-iQ Classic Transition Synthetic Event Handler
 */
export type TransitionEventHandler<CT extends EventTarget = Element> = ClassicEventHandler<
  RvdTransitionEvent<CT>,
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
export type RxEventHandlerFn<E = RvdSyntheticEvent> = (event$: Observable<E>) => Observable<E>
/**
 * Reactive Event Handler Type
 */
export type RxEventHandler<E = RvdSyntheticEvent> = RxEventHandlerFn<E> | null | undefined

export type RxClipboardEventHandler<CT extends EventTarget = Element> = RxEventHandler<
  RvdClipboardEvent<CT>
>
export type RxCompositionEventHandler<CT extends EventTarget = Element> = RxEventHandler<
  RvdCompositionEvent<CT>
>
export type RxDragEventHandler<CT extends EventTarget = Element> = RxEventHandler<RvdDragEvent<CT>>
export type RxFocusEventHandler<CT extends EventTarget = Element> = RxEventHandler<
  RvdFocusEvent<CT>
>
export type RxFormEventHandler<CT extends EventTarget = Element> = RxEventHandler<RvdFormEvent<CT>>
export type RxChangeEventHandler<CT extends EventTarget = Element> = RxEventHandler<
  RvdChangeEvent<CT>
>
export type RxKeyboardEventHandler<CT extends EventTarget = Element> = RxEventHandler<
  RvdKeyboardEvent<CT>
>
export type RxMouseEventHandler<CT extends EventTarget = Element> = RxEventHandler<
  RvdMouseEvent<CT>
>
export type RxTouchEventHandler<CT extends EventTarget = Element> = RxEventHandler<
  RvdTouchEvent<CT>
>
export type RxPointerEventHandler<CT extends EventTarget = Element> = RxEventHandler<
  RvdPointerEvent<CT>
>
export type RxUIEventHandler<CT extends EventTarget = Element> = RxEventHandler<RvdUIEvent<CT>>
export type RxWheelEventHandler<CT extends EventTarget = Element> = RxEventHandler<
  RvdWheelEvent<CT>
>
export type RxAnimationEventHandler<CT extends EventTarget = Element> = RxEventHandler<
  RvdAnimationEvent<CT>
>
export type RxTransitionEventHandler<CT extends EventTarget = Element> = RxEventHandler<
  RvdTransitionEvent<CT>
>

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
