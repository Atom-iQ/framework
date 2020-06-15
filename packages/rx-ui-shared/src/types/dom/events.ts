import {
  NativeClipboardEvent,
  NativeCompositionEvent,
  NativeDragEvent,
  NativeFocusEvent
} from './native-events';
import {TOrEmpty} from '../common';
import {RxO, RxSub} from '../rxjs';

/**
 * Inspired by Inferno SemiSyntheticEvent
 */
export interface RxEvent<T> extends Event {
  /**
   * A reference to the element on which the event listener is registered.
   */
  currentTarget: EventTarget & T;
}

export type ClipboardEvent<T> = RxEvent<T> & NativeClipboardEvent;
export type CompositionEvent<T> = RxEvent<T> & NativeCompositionEvent;
export type DragEvent<T> = RxMouseEvent<T> & NativeDragEvent;
export type FocusEvent<T> = RxEvent<T> & NativeFocusEvent;
export type FormEvent<T> = RxEvent<T>;

export interface ChangeEvent<T> extends RxEvent<T> {
  target: EventTarget & T;
}

export type RxKeyboardEvent<T> = RxEvent<T> & KeyboardEvent;
export type RxMouseEvent<T> = RxEvent<T> & MouseEvent;
export type RxTouchEvent<T> = RxEvent<T> & TouchEvent;
export type RxPointerEvent<T> = RxEvent<T> & PointerEvent;
export type RxUIEvent<T> = RxEvent<T> & UIEvent;
export type RxWheelEvent<T> = RxMouseEvent<T> & WheelEvent;
export type RxAnimationEvent<T> = RxEvent<T> & AnimationEvent;
export type RxTransitionEvent<T> = RxEvent<T> & TransitionEvent;

//
// Classic Event Handler Types
// ----------------------------------------------------------------------

export type RxClassicEventHandler<E> = TOrEmpty<(event: E | unknown) => void>;

export type ClipboardEventHandler<T = Element> = RxClassicEventHandler<ClipboardEvent<T>>;
export type CompositionEventHandler<T = Element> = RxClassicEventHandler<CompositionEvent<T>>;
export type DragEventHandler<T = Element> = RxClassicEventHandler<DragEvent<T>>;
export type FocusEventHandler<T = Element> = RxClassicEventHandler<FocusEvent<T>>;
export type FormEventHandler<T = Element> = RxClassicEventHandler<FormEvent<T>>;
export type ChangeEventHandler<T = Element> = RxClassicEventHandler<ChangeEvent<T>>;
export type KeyboardEventHandler<T = Element> = RxClassicEventHandler<RxKeyboardEvent<T>>;
export type MouseEventHandler<T = Element> = RxClassicEventHandler<RxMouseEvent<T>>;
export type TouchEventHandler<T = Element> = RxClassicEventHandler<RxTouchEvent<T>>;
export type PointerEventHandler<T = Element> = RxClassicEventHandler<RxPointerEvent<T>>;
export type UIEventHandler<T = Element> = RxClassicEventHandler<RxUIEvent<T>>;
export type WheelEventHandler<T = Element> = RxClassicEventHandler<RxWheelEvent<T>>;
export type AnimationEventHandler<T = Element> = RxClassicEventHandler<RxAnimationEvent<T>>;
export type TransitionEventHandler<T = Element> = RxClassicEventHandler<RxTransitionEvent<T>>;

//
// Reactive Event Handler Types
// ----------------------------------------------------------------------

export type RxEventHandler<E> = TOrEmpty<(event$: RxO<E>) => RxSub | RxO<E | unknown>>;

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
