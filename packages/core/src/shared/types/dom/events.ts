import type {
  NativeClipboardEvent,
  NativeCompositionEvent,
  NativeDragEvent,
  NativeFocusEvent
} from './native-events'
import type { RxO } from '../rxjs'

/**
 * Inspired by Inferno SemiSyntheticEvent
 */
export interface RvdEvent<T extends EventTarget> extends Event {
  target: T
}

export type RvdClipboardEvent<T extends EventTarget> = RvdEvent<T> & NativeClipboardEvent
export type RvdCompositionEvent<T extends EventTarget> = RvdEvent<T> & NativeCompositionEvent
export type RvdDragEvent<T extends EventTarget> = RvdMouseEvent<T> & NativeDragEvent
export type RvdFocusEvent<T extends EventTarget> = RvdEvent<T> & NativeFocusEvent

export type RvdFormEvent<T extends EventTarget> = RvdEvent<T>

export type RvdChangeEvent<T extends EventTarget> = RvdEvent<T>

export type RvdKeyboardEvent<T extends EventTarget = Element> = RvdEvent<T> & KeyboardEvent
export type RvdMouseEvent<T extends EventTarget = Element> = RvdEvent<T> & MouseEvent
export type RvdTouchEvent<T extends EventTarget = Element> = RvdEvent<T> & TouchEvent
export type RvdPointerEvent<T extends EventTarget = Element> = RvdEvent<T> & PointerEvent
export type RvdUIEvent<T extends EventTarget = Element> = RvdEvent<T> & UIEvent
export type RvdWheelEvent<T extends EventTarget = Element> = RvdMouseEvent<T> & WheelEvent
export type RvdAnimationEvent<T extends EventTarget = Element> = RvdEvent<T> & AnimationEvent
export type RvdTransitionEvent<T extends EventTarget = Element> = RvdEvent<T> & TransitionEvent

//
// Classic Event Handler Types
// ----------------------------------------------------------------------

export type ClassicEventHandlerFn<E = RvdEvent<Element>> = (event: E | unknown) => void
export type ClassicEventHandler<E = RvdEvent<Element>> = ClassicEventHandlerFn<E> | null | undefined

export type ClipboardEventHandler<T extends EventTarget = Element> = ClassicEventHandler<
  RvdClipboardEvent<T>
>
export type CompositionEventHandler<T extends EventTarget = Element> = ClassicEventHandler<
  RvdCompositionEvent<T>
>
export type DragEventHandler<T extends EventTarget = Element> = ClassicEventHandler<RvdDragEvent<T>>
export type FocusEventHandler<T extends EventTarget = Element> = ClassicEventHandler<
  RvdFocusEvent<T>
>
export type FormEventHandler<T extends EventTarget = Element> = ClassicEventHandler<RvdFormEvent<T>>
export type ChangeEventHandler<T extends EventTarget = Element> = ClassicEventHandler<
  RvdChangeEvent<T>
>
export type KeyboardEventHandler<T extends EventTarget = Element> = ClassicEventHandler<
  RvdKeyboardEvent<T>
>
export type MouseEventHandler<T extends EventTarget = Element> = ClassicEventHandler<
  RvdMouseEvent<T>
>
export type TouchEventHandler<T extends EventTarget = Element> = ClassicEventHandler<
  RvdTouchEvent<T>
>
export type PointerEventHandler<T extends EventTarget = Element> = ClassicEventHandler<
  RvdPointerEvent<T>
>
export type UIEventHandler<T extends EventTarget = Element> = ClassicEventHandler<RvdUIEvent<T>>
export type WheelEventHandler<T extends EventTarget = Element> = ClassicEventHandler<
  RvdWheelEvent<T>
>
export type AnimationEventHandler<T extends EventTarget = Element> = ClassicEventHandler<
  RvdAnimationEvent<T>
>
export type TransitionEventHandler<T extends EventTarget = Element> = ClassicEventHandler<
  RvdTransitionEvent<T>
>

//
// Reactive Event Handler Types
// ----------------------------------------------------------------------
export type RxEventHandlerFn<E = RvdEvent<Element>> = (event$: RxO<E>) => RxO<E | unknown>
export type RxEventHandler<E = RvdEvent<Element>> = RxEventHandlerFn<E> | null | undefined

export type RxClipboardEventHandler<T extends EventTarget = Element> = RxEventHandler<
  RvdClipboardEvent<T>
>
export type RxCompositionEventHandler<T extends EventTarget = Element> = RxEventHandler<
  RvdCompositionEvent<T>
>
export type RxDragEventHandler<T extends EventTarget = Element> = RxEventHandler<RvdDragEvent<T>>
export type RxFocusEventHandler<T extends EventTarget = Element> = RxEventHandler<RvdFocusEvent<T>>
export type RxFormEventHandler<T extends EventTarget = Element> = RxEventHandler<RvdFormEvent<T>>
export type RxChangeEventHandler<T extends EventTarget = Element> = RxEventHandler<
  RvdChangeEvent<T>
>
export type RxKeyboardEventHandler<T extends EventTarget = Element> = RxEventHandler<
  RvdKeyboardEvent<T>
>
export type RxMouseEventHandler<T extends EventTarget = Element> = RxEventHandler<RvdMouseEvent<T>>
export type RxTouchEventHandler<T extends EventTarget = Element> = RxEventHandler<RvdTouchEvent<T>>
export type RxPointerEventHandler<T extends EventTarget = Element> = RxEventHandler<
  RvdPointerEvent<T>
>
export type RxUIEventHandler<T extends EventTarget = Element> = RxEventHandler<RvdUIEvent<T>>
export type RxWheelEventHandler<T extends EventTarget = Element> = RxEventHandler<RvdWheelEvent<T>>
export type RxAnimationEventHandler<T extends EventTarget = Element> = RxEventHandler<
  RvdAnimationEvent<T>
>
export type RxTransitionEventHandler<T extends EventTarget = Element> = RxEventHandler<
  RvdTransitionEvent<T>
>
