import {
  NativeClipboardEvent,
  NativeCompositionEvent,
  NativeDragEvent,
  NativeFocusEvent
} from './native-events'
import {RxO} from '../rxjs'

/**
 * Inspired by Inferno SemiSyntheticEvent
 */
export interface RvdEvent<T> extends Event {
  element: Element
}

export type ClipboardEvent<T> = RvdEvent<T> & NativeClipboardEvent;
export type CompositionEvent<T> = RvdEvent<T> & NativeCompositionEvent;
export type DragEvent<T> = RxMouseEvent<T> & NativeDragEvent;
export type FocusEvent<T> = RvdEvent<T> & NativeFocusEvent;
export type FormEvent<T> = RvdEvent<T>;

export interface ChangeEvent<T> extends RvdEvent<T> {
  target: EventTarget & T;
}

export type RxKeyboardEvent<T> = RvdEvent<T> & KeyboardEvent;
export type RxMouseEvent<T> = RvdEvent<T> & MouseEvent;
export type RxTouchEvent<T> = RvdEvent<T> & TouchEvent;
export type RxPointerEvent<T> = RvdEvent<T> & PointerEvent;
export type RxUIEvent<T> = RvdEvent<T> & UIEvent;
export type RxWheelEvent<T> = RxMouseEvent<T> & WheelEvent;
export type RxAnimationEvent<T> = RvdEvent<T> & AnimationEvent;
export type RxTransitionEvent<T> = RvdEvent<T> & TransitionEvent;

//
// Classic Event Handler Types
// ----------------------------------------------------------------------

export type ClassicEventHandlerFn<E = RvdEvent<Element>> = (event: E | unknown) => void;
export type ClassicEventHandler<E = RvdEvent<Element>> =
  ClassicEventHandlerFn<E> | null | undefined;

export type ClipboardEventHandler<T = Element> = ClassicEventHandler<ClipboardEvent<T>>;
export type CompositionEventHandler<T = Element> = ClassicEventHandler<CompositionEvent<T>>;
export type DragEventHandler<T = Element> = ClassicEventHandler<DragEvent<T>>;
export type FocusEventHandler<T = Element> = ClassicEventHandler<FocusEvent<T>>;
export type FormEventHandler<T = Element> = ClassicEventHandler<FormEvent<T>>;
export type ChangeEventHandler<T = Element> = ClassicEventHandler<ChangeEvent<T>>;
export type KeyboardEventHandler<T = Element> = ClassicEventHandler<RxKeyboardEvent<T>>;
export type MouseEventHandler<T = Element> = ClassicEventHandler<RxMouseEvent<T>>;
export type TouchEventHandler<T = Element> = ClassicEventHandler<RxTouchEvent<T>>;
export type PointerEventHandler<T = Element> = ClassicEventHandler<RxPointerEvent<T>>;
export type UIEventHandler<T = Element> = ClassicEventHandler<RxUIEvent<T>>;
export type WheelEventHandler<T = Element> = ClassicEventHandler<RxWheelEvent<T>>;
export type AnimationEventHandler<T = Element> = ClassicEventHandler<RxAnimationEvent<T>>;
export type TransitionEventHandler<T = Element> = ClassicEventHandler<RxTransitionEvent<T>>;

//
// Reactive Event Handler Types
// ----------------------------------------------------------------------
export type RxEventHandlerFn<E = RvdEvent<Element>> = (event$: RxO<E>) => RxO<E | unknown>
export type RxEventHandler<E = RvdEvent<Element>> = RxEventHandlerFn<E> | null | undefined;

export type RxClipboardEventHandler<T = Element> = RxEventHandler<ClipboardEvent<T>>;
export type RxCompositionEventHandler<T = Element> = RxEventHandler<CompositionEvent<T>>;
export type RxDragEventHandler<T = Element> = RxEventHandler<DragEvent<T>>;
export type RxFocusEventHandler<T = Element> = RxEventHandler<FocusEvent<T>>;
export type RxFormEventHandler<T = Element> = RxEventHandler<FormEvent<T>>;
export type RxChangeEventHandler<T = Element> = RxEventHandler<ChangeEvent<T>>;
export type RxKeyboardEventHandler<T = Element> = RxEventHandler<RxKeyboardEvent<T>>;
export type RxMouseEventHandler<T = Element> = RxEventHandler<RxMouseEvent<T>>;
export type RxTouchEventHandler<T = Element> = RxEventHandler<RxTouchEvent<T>>;
export type RxPointerEventHandler<T = Element> = RxEventHandler<RxPointerEvent<T>>;
export type RxUIEventHandler<T = Element> = RxEventHandler<RxUIEvent<T>>;
export type RxWheelEventHandler<T = Element> = RxEventHandler<RxWheelEvent<T>>;
export type RxAnimationEventHandler<T = Element> = RxEventHandler<RxAnimationEvent<T>>;
export type RxTransitionEventHandler<T = Element> = RxEventHandler<RxTransitionEvent<T>>;
