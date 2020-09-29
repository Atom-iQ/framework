import {
  NativeClipboardEvent,
  NativeCompositionEvent,
  NativeDragEvent,
  NativeFocusEvent
} from './native-events'
import { RxO } from '../rxjs'

/**
 * Inspired by Inferno SemiSyntheticEvent
 */
export interface RvdEvent<T> extends Event {
  element: T
}

export type ClipboardEvent<T> = RvdEvent<T> & NativeClipboardEvent
export type CompositionEvent<T> = RvdEvent<T> & NativeCompositionEvent
export type DragEvent<T> = RvdMouseEvent<T> & NativeDragEvent
export type FocusEvent<T> = RvdEvent<T> & NativeFocusEvent
export type FormEvent<T> = RvdEvent<T>

export interface ChangeEvent<T> extends RvdEvent<T> {
  target: EventTarget & T
}

export type RvdKeyboardEvent<T> = RvdEvent<T> & KeyboardEvent
export type RvdMouseEvent<T> = RvdEvent<T> & MouseEvent
export type RvdTouchEvent<T> = RvdEvent<T> & TouchEvent
export type RvdPointerEvent<T> = RvdEvent<T> & PointerEvent
export type RvdUIEvent<T> = RvdEvent<T> & UIEvent
export type RvdWheelEvent<T> = RvdMouseEvent<T> & WheelEvent
export type RvdAnimationEvent<T> = RvdEvent<T> & AnimationEvent
export type RvdTransitionEvent<T> = RvdEvent<T> & TransitionEvent

//
// Classic Event Handler Types
// ----------------------------------------------------------------------

export type ClassicEventHandlerFn<E = RvdEvent<Element>> = (event: E | unknown) => void
export type ClassicEventHandler<E = RvdEvent<Element>> = ClassicEventHandlerFn<E> | null | undefined

export type ClipboardEventHandler<T = Element> = ClassicEventHandler<ClipboardEvent<T>>
export type CompositionEventHandler<T = Element> = ClassicEventHandler<CompositionEvent<T>>
export type DragEventHandler<T = Element> = ClassicEventHandler<DragEvent<T>>
export type FocusEventHandler<T = Element> = ClassicEventHandler<FocusEvent<T>>
export type FormEventHandler<T = Element> = ClassicEventHandler<FormEvent<T>>
export type ChangeEventHandler<T = Element> = ClassicEventHandler<ChangeEvent<T>>
export type KeyboardEventHandler<T = Element> = ClassicEventHandler<RvdKeyboardEvent<T>>
export type MouseEventHandler<T = Element> = ClassicEventHandler<RvdMouseEvent<T>>
export type TouchEventHandler<T = Element> = ClassicEventHandler<RvdTouchEvent<T>>
export type PointerEventHandler<T = Element> = ClassicEventHandler<RvdPointerEvent<T>>
export type UIEventHandler<T = Element> = ClassicEventHandler<RvdUIEvent<T>>
export type WheelEventHandler<T = Element> = ClassicEventHandler<RvdWheelEvent<T>>
export type AnimationEventHandler<T = Element> = ClassicEventHandler<RvdAnimationEvent<T>>
export type TransitionEventHandler<T = Element> = ClassicEventHandler<RvdTransitionEvent<T>>

//
// Reactive Event Handler Types
// ----------------------------------------------------------------------
export type RxEventHandlerFn<E = RvdEvent<Element>> = (event$: RxO<E>) => RxO<E | unknown>
export type RxEventHandler<E = RvdEvent<Element>> = RxEventHandlerFn<E> | null | undefined

export type RxClipboardEventHandler<T = Element> = RxEventHandler<ClipboardEvent<T>>
export type RxCompositionEventHandler<T = Element> = RxEventHandler<CompositionEvent<T>>
export type RxDragEventHandler<T = Element> = RxEventHandler<DragEvent<T>>
export type RxFocusEventHandler<T = Element> = RxEventHandler<FocusEvent<T>>
export type RxFormEventHandler<T = Element> = RxEventHandler<FormEvent<T>>
export type RxChangeEventHandler<T = Element> = RxEventHandler<ChangeEvent<T>>
export type RxKeyboardEventHandler<T = Element> = RxEventHandler<RvdKeyboardEvent<T>>
export type RxMouseEventHandler<T = Element> = RxEventHandler<RvdMouseEvent<T>>
export type RxTouchEventHandler<T = Element> = RxEventHandler<RvdTouchEvent<T>>
export type RxPointerEventHandler<T = Element> = RxEventHandler<RvdPointerEvent<T>>
export type RxUIEventHandler<T = Element> = RxEventHandler<RvdUIEvent<T>>
export type RxWheelEventHandler<T = Element> = RxEventHandler<RvdWheelEvent<T>>
export type RxAnimationEventHandler<T = Element> = RxEventHandler<RvdAnimationEvent<T>>
export type RxTransitionEventHandler<T = Element> = RxEventHandler<RvdTransitionEvent<T>>
