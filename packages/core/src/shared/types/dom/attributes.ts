import {
  AnimationEventHandler,
  ChangeEventHandler,
  ClipboardEventHandler,
  CompositionEventHandler,
  DragEventHandler,
  FocusEventHandler,
  FormEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  PointerEventHandler,
  RxAnimationEventHandler,
  RxChangeEventHandler,
  RxClassicEventHandler,
  RxClipboardEventHandler,
  RxCompositionEventHandler,
  RxDragEventHandler,
  RxEventHandler,
  RxFocusEventHandler,
  RxFormEventHandler,
  RxKeyboardEventHandler,
  RxMouseEventHandler,
  RxPointerEventHandler, RxTouchEventHandler,
  RxTransitionEventHandler,
  RxUIEventHandler,
  RxWheelEventHandler,
  TouchEventHandler,
  TransitionEventHandler,
  UIEventHandler,
  WheelEventHandler
} from './events';

import {RxChildren} from './props';
import {RxO} from '../rxjs';
import css from './css';


namespace attributes {
  export interface RxDOMAttributes<T> {
    children?: RxChildren;
    dangerouslySetInnerHTML?: {
      __html: string | RxO<string>;
    };

    //
    // Classic Event Handlers
    // ----------------------------------------------------

    // Clipboard Events
    onCopy?: ClipboardEventHandler<T>;
    onCut?: ClipboardEventHandler<T>;
    onPaste?: ClipboardEventHandler<T>;

    // Composition Events
    onCompositionEnd?: CompositionEventHandler<T>;
    onCompositionStart?: CompositionEventHandler<T>;
    onCompositionUpdate?: CompositionEventHandler<T>;

    // Focus Events
    onFocus?: FocusEventHandler<T>;
    onBlur?: FocusEventHandler<T>;

    // Form Events
    onChange?: ChangeEventHandler<T>;
    onInput?: FormEventHandler<T>;
    onReset?: FormEventHandler<T>;
    onSubmit?: FormEventHandler<T>;
    onInvalid?: FormEventHandler<T>;

    // Image Events
    onLoad?: RxClassicEventHandler<T>;
    onError?: RxClassicEventHandler<T>; // also a Media Event

    // Keyboard Events
    onKeyDown?: KeyboardEventHandler<T>;
    onKeyPress?: KeyboardEventHandler<T>;
    onKeyUp?: KeyboardEventHandler<T>;

    // Media Events
    onAbort?: RxClassicEventHandler<T>;
    onCanPlay?: RxClassicEventHandler<T>;
    onCanPlayThrough?: RxClassicEventHandler<T>;
    onDurationChange?: RxClassicEventHandler<T>;
    onEmptied?: RxClassicEventHandler<T>;
    onEncrypted?: RxClassicEventHandler<T>;
    onEnded?: RxClassicEventHandler<T>;
    onLoadedData?: RxClassicEventHandler<T>;
    onLoadedMetadata?: RxClassicEventHandler<T>;
    onLoadStart?: RxClassicEventHandler<T>;
    onPause?: RxClassicEventHandler<T>;
    onPlay?: RxClassicEventHandler<T>;
    onPlaying?: RxClassicEventHandler<T>;
    onProgress?: RxClassicEventHandler<T>;
    onRateChange?: RxClassicEventHandler<T>;
    onSeeked?: RxClassicEventHandler<T>;
    onSeeking?: RxClassicEventHandler<T>;
    onStalled?: RxClassicEventHandler<T>;
    onSuspend?: RxClassicEventHandler<T>;
    onTimeUpdate?: RxClassicEventHandler<T>;
    onVolumeChange?: RxClassicEventHandler<T>;
    onWaiting?: RxClassicEventHandler<T>;

    // MouseEvents
    onClick?: MouseEventHandler<T>;
    onContextMenu?: MouseEventHandler<T>;
    onDblClick?: MouseEventHandler<T>;
    onDrag?: DragEventHandler<T>;
    onDragEnd?: DragEventHandler<T>;
    onDragEnter?: DragEventHandler<T>;
    onDragExit?: DragEventHandler<T>;
    onDragLeave?: DragEventHandler<T>;
    onDragOver?: DragEventHandler<T>;
    onDragStart?: DragEventHandler<T>;
    onDrop?: DragEventHandler<T>;
    onMouseDown?: MouseEventHandler<T>;
    onMouseEnter?: MouseEventHandler<T>;
    onMouseLeave?: MouseEventHandler<T>;
    onMouseMove?: MouseEventHandler<T>;
    onMouseOut?: MouseEventHandler<T>;
    onMouseOver?: MouseEventHandler<T>;
    onMouseUp?: MouseEventHandler<T>;

    // Selection Events
    onSelect?: RxClassicEventHandler<T>;

    // Touch Events
    onTouchCancel?: TouchEventHandler<T>;
    onTouchEnd?: TouchEventHandler<T>;
    onTouchMove?: TouchEventHandler<T>;
    onTouchStart?: TouchEventHandler<T>;

    // Pointer events
    onPointerDown?: PointerEventHandler<T>;
    onPointerMove?: PointerEventHandler<T>;
    onPointerUp?: PointerEventHandler<T>;
    onPointerCancel?: PointerEventHandler<T>;
    onPointerEnter?: PointerEventHandler<T>;
    onPointerLeave?: PointerEventHandler<T>;
    onPointerOver?: PointerEventHandler<T>;
    onPointerOut?: PointerEventHandler<T>;

    // UI Events
    onScroll?: UIEventHandler<T>;

    // Wheel Events
    onWheel?: WheelEventHandler<T>;

    // Animation Events
    onAnimationStart?: AnimationEventHandler<T>;
    onAnimationEnd?: AnimationEventHandler<T>;
    onAnimationIteration?: AnimationEventHandler<T>;

    // Transition Events
    onTransitionEnd?: TransitionEventHandler<T>;

    //
    // Reactive Event Handlers
    // ----------------------------------------------------

    // Clipboard Events
    onCopy$?: RxClipboardEventHandler<T>;
    onCut$?: RxClipboardEventHandler<T>;
    onPaste$?: RxClipboardEventHandler<T>;

    // Composition Events
    onCompositionEnd$?: RxCompositionEventHandler<T>;
    onCompositionStart$?: RxCompositionEventHandler<T>;
    onCompositionUpdate$?: RxCompositionEventHandler<T>;

    // Focus Events
    onFocus$?: RxFocusEventHandler<T>;
    onBlur$?: RxFocusEventHandler<T>;

    // Form Events
    onChange$?: RxChangeEventHandler<T>;
    onInput$?: RxFormEventHandler<T>;
    onReset$?: RxFormEventHandler<T>;
    onSubmit$?: RxFormEventHandler<T>;
    onInvalid$?: RxFormEventHandler<T>;

    // Image Events
    onLoad$?: RxEventHandler<T>;
    onError$?: RxEventHandler<T>; // also a Media Event

    // Keyboard Events
    onKeyDown$?: RxKeyboardEventHandler<T>;
    onKeyPress$?: RxKeyboardEventHandler<T>;
    onKeyUp$?: RxKeyboardEventHandler<T>;

    // Media Events
    onAbort$?: RxEventHandler<T>;
    onCanPlay$?: RxEventHandler<T>;
    onCanPlayThrough$?: RxEventHandler<T>;
    onDurationChange$?: RxEventHandler<T>;
    onEmptied$?: RxEventHandler<T>;
    onEncrypted$?: RxEventHandler<T>;
    onEnded$?: RxEventHandler<T>;
    onLoadedData$?: RxEventHandler<T>;
    onLoadedMetadata$?: RxEventHandler<T>;
    onLoadStart$?: RxEventHandler<T>;
    onPause$?: RxEventHandler<T>;
    onPlay$?: RxEventHandler<T>;
    onPlaying$?: RxEventHandler<T>;
    onProgress$?: RxEventHandler<T>;
    onRateChange$?: RxEventHandler<T>;
    onSeeked$?: RxEventHandler<T>;
    onSeeking$?: RxEventHandler<T>;
    onStalled$?: RxEventHandler<T>;
    onSuspend$?: RxEventHandler<T>;
    onTimeUpdate$?: RxEventHandler<T>;
    onVolumeChange$?: RxEventHandler<T>;
    onWaiting$?: RxEventHandler<T>;

    // MouseEvents
    onClick$?: RxMouseEventHandler<T>;
    onContextMenu$?: RxMouseEventHandler<T>;
    onDblClick$?: RxMouseEventHandler<T>;
    onDrag$?: RxDragEventHandler<T>;
    onDragEnd$?: RxDragEventHandler<T>;
    onDragEnter$?: RxDragEventHandler<T>;
    onDragExit$?: RxDragEventHandler<T>;
    onDragLeave$?: RxDragEventHandler<T>;
    onDragOver$?: RxDragEventHandler<T>;
    onDragStart$?: RxDragEventHandler<T>;
    onDrop$?: RxDragEventHandler<T>;
    onMouseDown$?: RxMouseEventHandler<T>;
    onMouseEnter$?: RxMouseEventHandler<T>;
    onMouseLeave$?: RxMouseEventHandler<T>;
    onMouseMove$?: RxMouseEventHandler<T>;
    onMouseOut$?: RxMouseEventHandler<T>;
    onMouseOver$?: RxMouseEventHandler<T>;
    onMouseUp$?: RxMouseEventHandler<T>;

    // Selection Events
    onSelect$?: RxEventHandler<T>;

    // Touch Events
    onTouchCancel$?: RxTouchEventHandler<T>;
    onTouchEnd$?: RxTouchEventHandler<T>;
    onTouchMove$?: RxTouchEventHandler<T>;
    onTouchStart$?: RxTouchEventHandler<T>;

    // Pointer events
    onPointerDown$?: RxPointerEventHandler<T>;
    onPointerMove$?: RxPointerEventHandler<T>;
    onPointerUp$?: RxPointerEventHandler<T>;
    onPointerCancel$?: RxPointerEventHandler<T>;
    onPointerEnter$?: RxPointerEventHandler<T>;
    onPointerLeave$?: RxPointerEventHandler<T>;
    onPointerOver$?: RxPointerEventHandler<T>;
    onPointerOut$?: RxPointerEventHandler<T>;

    // UI Events
    onScroll$?: RxUIEventHandler<T>;

    // Wheel Events
    onWheel$?: RxWheelEventHandler<T>;

    // Animation Events
    onAnimationStart$?: RxAnimationEventHandler<T>;
    onAnimationEnd$?: RxAnimationEventHandler<T>;
    onAnimationIteration$?: RxAnimationEventHandler<T>;

    // Transition Events
    onTransitionEnd$?: RxTransitionEventHandler<T>;


    /**
     * NON SYNTHETIC EVENTS ARE ACTUALLY SAME
     */
    // Clipboard Events
    oncopy?: ClipboardEventHandler<T>;
    oncut?: ClipboardEventHandler<T>;
    onpaste?: ClipboardEventHandler<T>;

    // Composition Events
    oncompositionend?: CompositionEventHandler<T>;
    oncompositionstart?: CompositionEventHandler<T>;
    oncompositionupdate?: CompositionEventHandler<T>;

    // Focus Events
    onfocus?: FocusEventHandler<T>;
    onblur?: FocusEventHandler<T>;

    // Form Events
    onchange?: ChangeEventHandler<T>;
    oninput?: FormEventHandler<T>;
    onreset?: FormEventHandler<T>;
    onsubmit?: FormEventHandler<T>;
    oninvalid?: FormEventHandler<T>;

    // Image Events
    onload?: RxClassicEventHandler<T>;
    onerror?: RxClassicEventHandler<T>; // also a Media Event

    // Keyboard Events
    onkeydown?: KeyboardEventHandler<T>;
    onkeypress?: KeyboardEventHandler<T>;
    onkeyup?: KeyboardEventHandler<T>;

    // Media Events
    onabort?: RxClassicEventHandler<T>;
    oncanplay?: RxClassicEventHandler<T>;
    oncanplaythrough?: RxClassicEventHandler<T>;
    ondurationchange?: RxClassicEventHandler<T>;
    onemptied?: RxClassicEventHandler<T>;
    onencrypted?: RxClassicEventHandler<T>;
    onended?: RxClassicEventHandler<T>;
    onloadeddata?: RxClassicEventHandler<T>;
    onloadedmetadata?: RxClassicEventHandler<T>;
    onloadstart?: RxClassicEventHandler<T>;
    onpause?: RxClassicEventHandler<T>;
    onplay?: RxClassicEventHandler<T>;
    onplaying?: RxClassicEventHandler<T>;
    onprogress?: RxClassicEventHandler<T>;
    onratechange?: RxClassicEventHandler<T>;
    onseeked?: RxClassicEventHandler<T>;
    onseeking?: RxClassicEventHandler<T>;
    onstalled?: RxClassicEventHandler<T>;
    onsuspend?: RxClassicEventHandler<T>;
    ontimeupdate?: RxClassicEventHandler<T>;
    onvolumechange?: RxClassicEventHandler<T>;
    onwaiting?: RxClassicEventHandler<T>;

    // MouseEvents
    onclick?: MouseEventHandler<T>;
    oncontextmenu?: MouseEventHandler<T>;
    ondblclick?: MouseEventHandler<T>;
    ondrag?: DragEventHandler<T>;
    ondragend?: DragEventHandler<T>;
    ondragenter?: DragEventHandler<T>;
    ondragexit?: DragEventHandler<T>;
    ondragleave?: DragEventHandler<T>;
    ondragover?: DragEventHandler<T>;
    ondragstart?: DragEventHandler<T>;
    ondrop?: DragEventHandler<T>;
    onmousedown?: MouseEventHandler<T>;
    onmouseenter?: MouseEventHandler<T>;
    onmouseleave?: MouseEventHandler<T>;
    onmousemove?: MouseEventHandler<T>;
    onmouseout?: MouseEventHandler<T>;
    onmouseover?: MouseEventHandler<T>;
    onmouseup?: MouseEventHandler<T>;

    // Selection Events
    onselect?: RxClassicEventHandler<T>;

    // Touch Events
    ontouchcancel?: TouchEventHandler<T>;
    ontouchend?: TouchEventHandler<T>;
    ontouchmove?: TouchEventHandler<T>;
    ontouchstart?: TouchEventHandler<T>;

    // Pointer events
    onpointerdown?: PointerEventHandler<T>;
    onpointermove?: PointerEventHandler<T>;
    onpointerup?: PointerEventHandler<T>;
    onpointercancel?: PointerEventHandler<T>;
    onpointerenter?: PointerEventHandler<T>;
    onpointerleave?: PointerEventHandler<T>;
    onpointerover?: PointerEventHandler<T>;
    onpointerout?: PointerEventHandler<T>;

    // UI Events
    onscroll?: UIEventHandler<T>;

    // Wheel Events
    onwheel?: WheelEventHandler<T>;

    // Animation Events
    onanimationstart?: AnimationEventHandler<T>;
    onanimationend?: AnimationEventHandler<T>;
    onanimationiteration?: AnimationEventHandler<T>;

    // Transition Events
    ontransitionend?: TransitionEventHandler<T>;
  }

  export interface RxHTMLAttributes<T> extends RxDOMAttributes<T> {
    // Standard HTML Attributes
    accessKey?: string | RxO<string>;
    class?: string | RxO<string>;
    className?: string | RxO<string>;
    contentEditable?: boolean | RxO<boolean>;
    contextMenu?: string | RxO<string>;
    dir?: string | RxO<string>;
    draggable?: boolean | RxO<boolean>;
    hidden?: boolean | RxO<boolean>;
    id?: string | RxO<string>;
    lang?: string | RxO<string>;
    slot?: string | RxO<string>;
    spellCheck?: boolean | RxO<boolean>;
    style?: css.CSSProperties | string | RxO<css.CSSProperties | string>;
    styleName?: string | RxO<string>; // CSS Modules support
    tabIndex?: number | RxO<number>;
    title?: string | RxO<string>;

    // Unknown
    inputMode?: string | RxO<string>;
    is?: string | RxO<string>;
    radioGroup?: string | RxO<string>; // <command>, <menuitem>

    // WAI-ARIA
    role?: string | RxO<string>;

    // RDFa Attributes
    about?: string | RxO<string>;
    datatype?: string | RxO<string>;
    inlist?: unknown | RxO<unknown>;
    prefix?: string | RxO<string>;
    property?: string | RxO<string>;
    resource?: string | RxO<string>;
    typeof?: string | RxO<string>;
    vocab?: string | RxO<string>;

    // Non-standard Attributes
    autoCapitalize?: string | RxO<string>;
    autoCorrect?: string | RxO<string>;
    autoSave?: string | RxO<string>;
    color?: string | RxO<string>;
    itemProp?: string | RxO<string>;
    itemScope?: boolean | RxO<boolean>;
    itemType?: string | RxO<string>;
    itemID?: string | RxO<string>;
    itemRef?: string | RxO<string>;
    results?: number | RxO<number>;
    security?: string | RxO<string>;
    unselectable?: boolean | RxO<boolean>;

    /**
     * Identifies the currently active element when DOM focus is
     * on a composite widget, textbox, group, or application.
     */
    'aria-activedescendant'?: string | RxO<string>;
    /**
     * Indicates whether assistive technologies will present all,
     * or only parts of, the changed region based on the change
     * notifications defined by the aria-relevant attribute.
     */
    'aria-atomic'?: boolean | 'false' | 'true' | RxO<boolean | 'false' | 'true'>;
    /**
     * Indicates whether inputting text could trigger display of
     * one or more predictions of the user's intended value for an
     * input and specifies how predictions would be
     * presented if they are made.
     */
    'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both' |
      RxO<'none' | 'inline' | 'list' | 'both'>;
    /**
     * Indicates an element is being modified and that assistive technologies
     * MAY want to wait until the modifications are complete before exposing them to the user.
     */
    'aria-busy'?: boolean | 'false' | 'true';
    /**
     * Indicates the current "checked" state of checkboxes,
     * radio buttons, and other widgets.
     * @see aria-pressed @see aria-selected.
     */
    'aria-checked'?: boolean | 'false' | 'mixed' | 'true';
    /**
     * Defines the total number of columns in a table, grid, or treegrid.
     * @see aria-colindex.
     */
    'aria-colcount'?: number | RxO<number>;
    /**
     * Defines an element's column index or position with respect to the
     * total number of columns within a table, grid, or treegrid.
     * @see aria-colcount @see aria-colspan.
     */
    'aria-colindex'?: number | RxO<number>;
    /**
     * Defines the number of columns spanned by a cell or gridcell
     * within a table, grid, or treegrid.
     * @see aria-colindex @see aria-rowspan.
     */
    'aria-colspan'?: number | RxO<number>;
    /**
     * Indicates the element that represents the current item within
     * a container or set of related elements.
     */
    'aria-current'?: boolean | 'false' | 'true' | 'page' | 'step' | 'location' | 'date' | 'time';
    /**
     * Identifies the element (or elements) that describes the object.
     * @see aria-labelledby
     */
    'aria-describedby'?: string | RxO<string>;
    /**
     * Identifies the element that provides a detailed, extended description for the object.
     * @see aria-describedby.
     */
    'aria-details'?: string | RxO<string>;
    /**
     * Indicates that the element is perceivable but disabled,
     * so it is not editable or otherwise operable.
     * @see aria-hidden @see aria-readonly.
     */
    'aria-disabled'?: boolean | 'false' | 'true';
    /**
     * Indicates what functions can be performed when
     * a dragged object is released on the drop target.
     * @deprecated in ARIA 1.1
     */
    'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup';
    /**
     * Identifies the element that provides an error message for the object.
     * @see aria-invalid @see aria-describedby.
     */
    'aria-errormessage'?: string | RxO<string>;
    /**
     * Indicates whether the element, or another grouping
     * element it controls, is currently expanded or collapsed.
     */
    'aria-expanded'?: boolean | 'false' | 'true';
    /**
     * Identifies the next element (or elements) in an alternate
     * reading order of content which, at the user's discretion,
     * allows assistive technology to override the general
     * default of reading in document source order.
     */
    'aria-flowto'?: string | RxO<string>;
    /**
     * Indicates an element's "grabbed" state in a drag-and-drop operation.
     * @deprecated in ARIA 1.1
     */
    'aria-grabbed'?: boolean | 'false' | 'true';
    /**
     * Indicates the availability and type of interactive
     * popup element, such as menu or dialog, that can be
     * triggered by an element.
     */
    'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
    /**
     * Indicates whether the element is exposed to an accessibility API.
     * @see aria-disabled.
     */
    'aria-hidden'?: boolean | 'false' | 'true';
    /**
     * Indicates the entered value does not conform to the format expected by the application.
     * @see aria-errormessage.
     */
    'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
    /**
     * Indicates keyboard shortcuts that an author has
     * implemented to activate or give focus to an element.
     */
    'aria-keyshortcuts'?: string | RxO<string>;
    /**
     * Defines a string value that labels the current element.
     * @see aria-labelledby.
     */
    'aria-label'?: string | RxO<string>;
    /**
     * Identifies the element (or elements) that labels the current element.
     * @see aria-describedby.
     */
    'aria-labelledby'?: string | RxO<string>;
    /** Defines the hierarchical level of an element within a structure. */
    'aria-level'?: number | RxO<number>;
    /**
     * Indicates that an element will be updated, and describes the types
     * of updates the user agents, assistive technologies, and user can expect
     * from the live region.
     */
    'aria-live'?: 'off' | 'assertive' | 'polite';
    /** Indicates whether an element is modal when displayed. */
    'aria-modal'?: boolean | 'false' | 'true';
    /** Indicates whether a text box accepts multiple lines of input or only a single line. */
    'aria-multiline'?: boolean | 'false' | 'true';
    /**
     * Indicates that the user may select more
     * than one item from the current selectable descendants.
     */
    'aria-multiselectable'?: boolean | 'false' | 'true';
    /**
     * Indicates whether the element's orientation is horizontal,
     * vertical, or unknown/ambiguous.
     */
    'aria-orientation'?: 'horizontal' | 'vertical';
    /**
     * Identifies an element (or elements) in order to define a visual,
     * functional, or contextual parent/child relationship
     * between DOM elements where the DOM hierarchy cannot be used
     * to represent the relationship.
     * @see aria-controls.
     */
    'aria-owns'?: string | RxO<string>;
    /**
     * Defines a short hint (a word or short phrase) intended
     * to aid the user with data entry when the control has no value.
     * A hint could be a sample value or a brief description of the expected format.
     */
    'aria-placeholder'?: string | RxO<string>;
    /**
     * Defines an element's number or position in the current set of listitems
     * or treeitems. Not required if all elements in the set are present in the DOM.
     * @see aria-setsize.
     */
    'aria-posinset'?: number | RxO<number>;
    /**
     * Indicates the current "pressed" state of toggle buttons.
     * @see aria-checked @see aria-selected.
     */
    'aria-pressed'?: boolean | 'false' | 'mixed' | 'true';
    /**
     * Indicates that the element is not editable, but is otherwise operable.
     * @see aria-disabled.
     */
    'aria-readonly'?: boolean | 'false' | 'true';
    /**
     * Indicates what notifications the user agent will trigger when
     * the accessibility tree within a live region is modified.
     * @see aria-atomic.
     */
    'aria-relevant'?: 'additions' | 'additions text' | 'all' | 'removals' | 'text';
    /** Indicates that user input is required on the element before a form may be submitted. */
    'aria-required'?: boolean | 'false' | 'true';
    /** Defines a human-readable, author-localized description for the role of an element. */
    'aria-roledescription'?: string | RxO<string>;
    /**
     * Defines the total number of rows in a table, grid, or treegrid.
     * @see aria-rowindex.
     */
    'aria-rowcount'?: number | RxO<number>;
    /**
     * Defines an element's row index or position with respect to
     * the total number of rows within a table, grid, or treegrid.
     * @see aria-rowcount @see aria-rowspan.
     */
    'aria-rowindex'?: number | RxO<number>;
    /**
     * Defines the number of rows spanned by a cell
     * or gridcell within a table, grid, or treegrid.
     * @see aria-rowindex @see aria-colspan.
     */
    'aria-rowspan'?: number | RxO<number>;
    /**
     * Indicates the current "selected" state of various widgets.
     * @see aria-checked @see aria-pressed.
     */
    'aria-selected'?: boolean | 'false' | 'true';
    /**
     * Defines the number of items in the current set of listitems
     * or treeitems. Not required if all elements in the set are present in the DOM.
     * @see aria-posinset.
     */
    'aria-setsize'?: number | RxO<number>;
    /** Indicates if items in a table or grid are sorted in ascending or descending order. */
    'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other';
    /** Defines the maximum allowed value for a range widget. */
    'aria-valuemax'?: number | RxO<number>;
    /** Defines the minimum allowed value for a range widget. */
    'aria-valuemin'?: number | RxO<number>;
    /**
     * Defines the current value for a range widget.
     * @see aria-valuetext.
     */
    'aria-valuenow'?: number | RxO<number>;
    /** Defines the human readable text alternative of aria-valuenow for a range widget. */
    'aria-valuetext'?: string | RxO<string>;
  }

  export interface AnchorHTMLAttributes<T> extends RxHTMLAttributes<T> {
    download?: unknown | RxO<unknown>;
    href?: string | RxO<string>;
    hrefLang?: string | RxO<string>;
    media?: string | RxO<string>;
    rel?: string | RxO<string>;
    target?: string | RxO<string>;
    type?: string | RxO<string>;
    as?: string | RxO<string>;
  }

  export type AudioHTMLAttributes<T> = MediaHTMLAttributes<T>;

  export interface AreaHTMLAttributes<T> extends RxHTMLAttributes<T> {
    alt?: string | RxO<string>;
    coords?: string | RxO<string>;
    download?: unknown | RxO<unknown>;
    href?: string | RxO<string>;
    hrefLang?: string | RxO<string>;
    media?: string | RxO<string>;
    rel?: string | RxO<string>;
    shape?: string | RxO<string>;
    target?: string | RxO<string>;
  }

  export interface BaseHTMLAttributes<T> extends RxHTMLAttributes<T> {
    href?: string | RxO<string>;
    target?: string | RxO<string>;
  }

  export interface BlockquoteHTMLAttributes<T> extends RxHTMLAttributes<T> {
    cite?: string | RxO<string>;
  }

  export interface ButtonHTMLAttributes<T> extends RxHTMLAttributes<T> {
    autoFocus?: boolean | RxO<boolean>;
    disabled?: boolean | RxO<boolean>;
    form?: string | RxO<string>;
    formAction?: string | RxO<string>;
    formEncType?: string | RxO<string>;
    formMethod?: string | RxO<string>;
    formNoValidate?: boolean | RxO<boolean>;
    formTarget?: string | RxO<string>;
    name?: string | RxO<string>;
    type?: string | RxO<string>;
    value?: string | RxO<string | string[] | number>;
  }

  export interface CanvasHTMLAttributes<T> extends RxHTMLAttributes<T> {
    height?: number | string | RxO<number | string>;
    width?: number | string | RxO<number | string>;
  }

  export interface ColHTMLAttributes<T> extends RxHTMLAttributes<T> {
    span?: number | RxO<number>;
    width?: number | string | RxO<number | string>;
  }

  export interface ColgroupHTMLAttributes<T> extends RxHTMLAttributes<T> {
    span?: number | RxO<number>;
  }

  export interface DetailsHTMLAttributes<T> extends RxHTMLAttributes<T> {
    open?: boolean | RxO<boolean>;
  }

  export interface DelHTMLAttributes<T> extends RxHTMLAttributes<T> {
    cite?: string | RxO<string>;
    dateTime?: string | RxO<string>;
  }

  export interface DialogHTMLAttributes<T> extends RxHTMLAttributes<T> {
    open?: boolean | RxO<boolean>;
  }

  export interface EmbedHTMLAttributes<T> extends RxHTMLAttributes<T> {
    height?: number | string | RxO<number | string>;
    src?: string | RxO<string>;
    type?: string | RxO<string>;
    width?: number | string | RxO<number | string>;
  }

  export interface FieldsetHTMLAttributes<T> extends RxHTMLAttributes<T> {
    disabled?: boolean | RxO<boolean>;
    form?: string | RxO<string>;
    name?: string | RxO<string>;
  }

  export interface FormHTMLAttributes<T> extends RxHTMLAttributes<T> {
    acceptCharset?: string | RxO<string>;
    action?: string | RxO<string>;
    autoComplete?: string | RxO<string>;
    encType?: string | RxO<string>;
    method?: string | RxO<string>;
    name?: string | RxO<string>;
    noValidate?: boolean | RxO<boolean>;
    target?: string | RxO<string>;
  }

  export interface HtmlHTMLAttributes<T> extends RxHTMLAttributes<T> {
    manifest?: string | RxO<string>;
  }

  export interface IframeHTMLAttributes<T> extends RxHTMLAttributes<T> {
    allowFullScreen?: boolean | RxO<boolean>;
    allowTransparency?: boolean | RxO<boolean>;
    frameBorder?: number | string | RxO<number | string>;
    height?: number | string | RxO<number | string>;
    marginHeight?: number | RxO<number>;
    marginWidth?: number | RxO<number>;
    name?: string | RxO<string>;
    sandbox?: string | RxO<string>;
    scrolling?: string | RxO<string>;
    seamless?: boolean | RxO<boolean>;
    src?: string | RxO<string>;
    srcDoc?: string | RxO<string>;
    width?: number | string | RxO<number | string>;
  }

  export interface ImgHTMLAttributes<T> extends RxHTMLAttributes<T> {
    alt?: string | RxO<string>;
    crossOrigin?: 'anonymous' | 'use-credentials' | '' |
      RxO<'anonymous' | 'use-credentials' | ''>;
    height?: number | string | RxO<number | string>;
    sizes?: string | RxO<string>;
    src?: string | RxO<string>;
    srcSet?: string | RxO<string>;
    useMap?: string | RxO<string>;
    width?: number | string | RxO<number | string>;
  }

  export interface InsHTMLAttributes<T> extends RxHTMLAttributes<T> {
    cite?: string | RxO<string>;
    dateTime?: string | RxO<string>;
  }

  export interface InputHTMLAttributes<T> extends RxHTMLAttributes<T> {
    accept?: string | RxO<string>;
    alt?: string | RxO<string>;
    autoComplete?: string | RxO<string>;
    autoFocus?: boolean | RxO<boolean>;
    capture?: boolean | RxO<boolean>;
    checked?: boolean | RxO<boolean>;
    crossOrigin?: string | RxO<string>;
    disabled?: boolean | RxO<boolean>;
    form?: string | RxO<string>;
    formAction?: string | RxO<string>;
    formEncType?: string | RxO<string>;
    formMethod?: string | RxO<string>;
    formNoValidate?: boolean | RxO<boolean>;
    formTarget?: string | RxO<string>;
    height?: number | string | RxO<number | string>;
    list?: string | RxO<string>;
    max?: number | string | RxO<number | string>;
    maxLength?: number | RxO<number>;
    min?: number | string | RxO<number | string>;
    minLength?: number | RxO<number>;
    multiple?: boolean | RxO<boolean>;
    name?: string | RxO<string>;
    pattern?: string | RxO<string>;
    placeholder?: string | RxO<string>;
    readOnly?: boolean | RxO<boolean>;
    required?: boolean | RxO<boolean>;
    size?: number | RxO<number>;
    src?: string | RxO<string>;
    step?: number | string | RxO<number | string>;
    type?: string | RxO<string>;
    value?: string | string[] | number | RxO<number | string | string[]>;
    width?: number | string | RxO<number | string>;

    onChange?: ChangeEventHandler<T>;
    onChange$?: RxChangeEventHandler<T>;
  }

  export interface KeygenHTMLAttributes<T> extends RxHTMLAttributes<T> {
    autoFocus?: boolean | RxO<boolean>;
    challenge?: string | RxO<string>;
    disabled?: boolean | RxO<boolean>;
    form?: string | RxO<string>;
    keyType?: string | RxO<string>;
    keyParams?: string | RxO<string>;
    name?: string | RxO<string>;
  }

  export interface LabelHTMLAttributes<T> extends RxHTMLAttributes<T> {
    form?: string | RxO<string>;
    htmlFor?: string | RxO<string>;
  }

  export interface LiHTMLAttributes<T> extends RxHTMLAttributes<T> {
    value?: string | string[] | number | RxO<number | string | string[]>;
  }

  export interface LinkHTMLAttributes<T> extends RxHTMLAttributes<T> {
    as?: string | RxO<string>;
    crossOrigin?: string | RxO<string>;
    href?: string | RxO<string>;
    hrefLang?: string | RxO<string>;
    integrity?: string | RxO<string>;
    media?: string | RxO<string>;
    rel?: string | RxO<string>;
    sizes?: string | RxO<string>;
    type?: string | RxO<string>;
  }

  export interface MapHTMLAttributes<T> extends RxHTMLAttributes<T> {
    name?: string | RxO<string>;
  }

  export interface MenuHTMLAttributes<T> extends RxHTMLAttributes<T> {
    type?: string | RxO<string>;
  }

  export interface MediaHTMLAttributes<T> extends RxHTMLAttributes<T> {
    autoPlay?: boolean | RxO<boolean>;
    controls?: boolean | RxO<boolean>;
    controlsList?: string | RxO<string>;
    crossOrigin?: string | RxO<string>;
    loop?: boolean | RxO<boolean>;
    mediaGroup?: string | RxO<string>;
    muted?: boolean | RxO<boolean>;
    playsinline?: boolean | RxO<boolean>;
    preload?: string | RxO<string>;
    src?: string | RxO<string>;
  }

  export interface MetaHTMLAttributes<T> extends RxHTMLAttributes<T> {
    charSet?: string | RxO<string>;
    content?: string | RxO<string>;
    httpEquiv?: string | RxO<string>;
    name?: string | RxO<string>;
  }

  export interface MeterHTMLAttributes<T> extends RxHTMLAttributes<T> {
    form?: string | RxO<string>;
    high?: number | RxO<number>;
    low?: number | RxO<number>;
    max?: number | string | RxO<number | string>;
    min?: number | string | RxO<number | string>;
    optimum?: number | RxO<number>;
    value?: string | string[] | number | RxO<number | string | string[]>;
  }

  export interface QuoteHTMLAttributes<T> extends RxHTMLAttributes<T> {
    cite?: string | RxO<string>;
  }

  export interface ObjectHTMLAttributes<T> extends RxHTMLAttributes<T> {
    classID?: string | RxO<string>;
    data?: string | RxO<string>;
    form?: string | RxO<string>;
    height?: number | string | RxO<number | string>;
    name?: string | RxO<string>;
    type?: string | RxO<string>;
    useMap?: string | RxO<string>;
    width?: number | string | RxO<number | string>;
    wmode?: string | RxO<string>;
  }

  export interface OlHTMLAttributes<T> extends RxHTMLAttributes<T> {
    reversed?: boolean | RxO<boolean>;
    start?: number | RxO<number>;
  }

  export interface OptgroupHTMLAttributes<T> extends RxHTMLAttributes<T> {
    disabled?: boolean | RxO<boolean>;
    label?: string | RxO<string>;
  }

  export interface OptionHTMLAttributes<T> extends RxHTMLAttributes<T> {
    disabled?: boolean | RxO<boolean>;
    label?: string | RxO<string>;
    selected?: boolean | RxO<boolean>;
    value?: string | RxO<string> | string[] | number;
  }

  export interface OutputHTMLAttributes<T> extends RxHTMLAttributes<T> {
    form?: string | RxO<string>;
    htmlFor?: string | RxO<string>;
    name?: string | RxO<string>;
  }

  export interface ParamHTMLAttributes<T> extends RxHTMLAttributes<T> {
    name?: string | RxO<string>;
    value?: string | RxO<string> | string[] | number;
  }

  export interface ProgressHTMLAttributes<T> extends RxHTMLAttributes<T> {
    max?: number | string | RxO<number | string>;
    value?: string | RxO<string> | string[] | number;
  }

  export interface ScriptHTMLAttributes<T> extends RxHTMLAttributes<T> {
    async?: boolean | RxO<boolean>;
    charSet?: string | RxO<string>;
    crossOrigin?: string | RxO<string>;
    defer?: boolean | RxO<boolean>;
    integrity?: string | RxO<string>;
    nonce?: string | RxO<string>;
    src?: string | RxO<string>;
    type?: string | RxO<string>;
  }

  export interface SelectHTMLAttributes<T> extends RxHTMLAttributes<T> {
    autoFocus?: boolean | RxO<boolean>;
    disabled?: boolean | RxO<boolean>;
    form?: string | RxO<string>;
    multiple?: boolean | RxO<boolean>;
    name?: string | RxO<string>;
    required?: boolean | RxO<boolean>;
    size?: number | RxO<number>;
    value?: string | RxO<string> | string[] | number;
    onChange?: ChangeEventHandler<T>;
    onChange$?: RxChangeEventHandler<T>;
  }

  export interface SourceHTMLAttributes<T> extends RxHTMLAttributes<T> {
    media?: string | RxO<string>;
    sizes?: string | RxO<string>;
    src?: string | RxO<string>;
    srcSet?: string | RxO<string>;
    type?: string | RxO<string>;
  }

  export interface StyleHTMLAttributes<T> extends RxHTMLAttributes<T> {
    media?: string | RxO<string>;
    nonce?: string | RxO<string>;
    scoped?: boolean | RxO<boolean>;
    type?: string | RxO<string>;
  }

  export interface TableHTMLAttributes<T> extends RxHTMLAttributes<T> {
    cellPadding?: number | string | RxO<number | string>;
    cellSpacing?: number | string | RxO<number | string>;
    summary?: string | RxO<string>;
  }

  export interface TextareaHTMLAttributes<T> extends RxHTMLAttributes<T> {
    autoComplete?: string | RxO<string>;
    autoFocus?: boolean | RxO<boolean>;
    cols?: number | RxO<number>;
    dirName?: string | RxO<string>;
    disabled?: boolean | RxO<boolean>;
    form?: string | RxO<string>;
    maxLength?: number | RxO<number>;
    minLength?: number | RxO<number>;
    name?: string | RxO<string>;
    placeholder?: string | RxO<string>;
    readOnly?: boolean | RxO<boolean>;
    required?: boolean | RxO<boolean>;
    rows?: number | RxO<number>;
    value?: string | string[] | number | RxO<number | string | string[]>;
    wrap?: string | RxO<string>;

    onChange?: ChangeEventHandler<T>;
    onChange$?: RxChangeEventHandler<T>;
  }

  export interface TdHTMLAttributes<T> extends RxHTMLAttributes<T> {
    colSpan?: number | RxO<number>;
    headers?: string | RxO<string>;
    rowSpan?: number | RxO<number>;
    scope?: string | RxO<string>;
  }

  export interface ThHTMLAttributes<T> extends RxHTMLAttributes<T> {
    colSpan?: number | RxO<number>;
    headers?: string | RxO<string>;
    rowSpan?: number | RxO<number>;
    scope?: string | RxO<string>;
  }

  export interface TimeHTMLAttributes<T> extends RxHTMLAttributes<T> {
    dateTime?: string | RxO<string>;
  }

  export interface TrackHTMLAttributes<T> extends RxHTMLAttributes<T> {
    default?: boolean | RxO<boolean>;
    kind?: string | RxO<string>;
    label?: string | RxO<string>;
    src?: string | RxO<string>;
    srcLang?: string | RxO<string>;
  }

  export interface VideoHTMLAttributes<T> extends MediaHTMLAttributes<T> {
    height?: number | string | RxO<number | string>;
    playsInline?: boolean | RxO<boolean>;
    poster?: string | RxO<string>;
    width?: number | string | RxO<number | string>;
  }

  // this list is "complete" in that it contains every SVG attribute
  // that Inferno supports, but the types can be improved.
  // Full list here: https://facebook.github.io/Inferno/docs/dom-elements.html
  //
  // The three broad type categories are (in order of restrictiveness):
  //   - "number | string"
  //   - "string"
  //   - union of string literals
  export interface SVGAttributes<T> extends RxDOMAttributes<T> {
    // Attributes which also defined in RxHTMLAttributes
    // See comment in SVGDOMPropertyConfig.js
    class?: string | RxO<string>;
    className?: string | RxO<string>;
    color?: string | RxO<string>;
    height?: number | string | RxO<number | string>;
    id?: string | RxO<string>;
    lang?: string | RxO<string>;
    max?: number | string | RxO<number | string>;
    media?: string | RxO<string>;
    method?: string | RxO<string>;
    min?: number | string | RxO<number | string>;
    name?: string | RxO<string>;
    style?: CSSProperties;
    target?: string | RxO<string>;
    type?: string | RxO<string>;
    width?: number | string | RxO<number | string>;

    // Other HTML properties supported by SVG elements in browsers
    role?: string | RxO<string>;
    tabIndex?: number | RxO<number>;

    // SVG Specific attributes
    accentHeight?: number | string | RxO<number | string>;
    accumulate?: 'none' | 'sum';
    additive?: 'replace' | 'sum';
    alignmentBaseline?:
      | 'auto'
      | 'baseline'
      | 'before-edge'
      | 'text-before-edge'
      | 'middle'
      | 'central'
      | 'after-edge'
      | 'text-after-edge'
      | 'ideographic'
      | 'alphabetic'
      | 'hanging'
      | 'mathematical'
      | 'inherit';
    allowReorder?: 'no' | 'yes';
    alphabetic?: number | string | RxO<number | string>;
    amplitude?: number | string | RxO<number | string>;
    arabicForm?: 'initial' | 'medial' | 'terminal' | 'isolated';
    ascent?: number | string | RxO<number | string>;
    attributeName?: string | RxO<string>;
    attributeType?: string | RxO<string>;
    autoReverse?: number | string | RxO<number | string>;
    azimuth?: number | string | RxO<number | string>;
    baseFrequency?: number | string | RxO<number | string>;
    baselineShift?: number | string | RxO<number | string>;
    baseProfile?: number | string | RxO<number | string>;
    bbox?: number | string | RxO<number | string>;
    begin?: number | string | RxO<number | string>;
    bias?: number | string | RxO<number | string>;
    by?: number | string | RxO<number | string>;
    calcMode?: number | string | RxO<number | string>;
    capHeight?: number | string | RxO<number | string>;
    clip?: number | string | RxO<number | string>;
    clipPath?: string | RxO<string>;
    clipPathUnits?: number | string | RxO<number | string>;
    clipRule?: number | string | RxO<number | string>;
    colorInterpolation?: number | string | RxO<number | string>;
    colorInterpolationFilters?: 'auto' | 'sRGB' | 'linearRGB' | 'inherit';
    colorProfile?: number | string | RxO<number | string>;
    colorRendering?: number | string | RxO<number | string>;
    contentScriptType?: number | string | RxO<number | string>;
    contentStyleType?: number | string | RxO<number | string>;
    cursor?: number | string | RxO<number | string>;
    cx?: number | string | RxO<number | string>;
    cy?: number | string | RxO<number | string>;
    d?: string | RxO<string>;
    decelerate?: number | string | RxO<number | string>;
    descent?: number | string | RxO<number | string>;
    diffuseConstant?: number | string | RxO<number | string>;
    direction?: number | string | RxO<number | string>;
    display?: number | string | RxO<number | string>;
    divisor?: number | string | RxO<number | string>;
    dominantBaseline?: number | string | RxO<number | string>;
    dur?: number | string | RxO<number | string>;
    dx?: number | string | RxO<number | string>;
    dy?: number | string | RxO<number | string>;
    edgeMode?: number | string | RxO<number | string>;
    elevation?: number | string | RxO<number | string>;
    enableBackground?: number | string | RxO<number | string>;
    end?: number | string | RxO<number | string>;
    exponent?: number | string | RxO<number | string>;
    externalResourcesRequired?: number | string | RxO<number | string>;
    fill?: string | RxO<string>;
    fillOpacity?: number | string | RxO<number | string>;
    fillRule?: 'nonzero' | 'evenodd' | 'inherit';
    filter?: string | RxO<string>;
    filterRes?: number | string | RxO<number | string>;
    filterUnits?: number | string | RxO<number | string>;
    floodColor?: number | string | RxO<number | string>;
    floodOpacity?: number | string | RxO<number | string>;
    focusable?: number | string | RxO<number | string>;
    fontFamily?: string | RxO<string>;
    fontSize?: number | string | RxO<number | string>;
    fontSizeAdjust?: number | string | RxO<number | string>;
    fontStretch?: number | string | RxO<number | string>;
    fontStyle?: number | string | RxO<number | string>;
    fontVariant?: number | string | RxO<number | string>;
    fontWeight?: number | string | RxO<number | string>;
    format?: number | string | RxO<number | string>;
    from?: number | string | RxO<number | string>;
    fx?: number | string | RxO<number | string>;
    fy?: number | string | RxO<number | string>;
    g1?: number | string | RxO<number | string>;
    g2?: number | string | RxO<number | string>;
    glyphName?: number | string | RxO<number | string>;
    glyphOrientationHorizontal?: number | string | RxO<number | string>;
    glyphOrientationVertical?: number | string | RxO<number | string>;
    glyphRef?: number | string | RxO<number | string>;
    gradientTransform?: string | RxO<string>;
    gradientUnits?: string | RxO<string>;
    hanging?: number | string | RxO<number | string>;
    horizAdvX?: number | string | RxO<number | string>;
    horizOriginX?: number | string | RxO<number | string>;
    ideographic?: number | string | RxO<number | string>;
    imageRendering?: number | string | RxO<number | string>;
    in2?: number | string | RxO<number | string>;
    in?: string | RxO<string>;
    intercept?: number | string | RxO<number | string>;
    k1?: number | string | RxO<number | string>;
    k2?: number | string | RxO<number | string>;
    k3?: number | string | RxO<number | string>;
    k4?: number | string | RxO<number | string>;
    k?: number | string | RxO<number | string>;
    kernelMatrix?: number | string | RxO<number | string>;
    kernelUnitLength?: number | string | RxO<number | string>;
    kerning?: number | string | RxO<number | string>;
    keyPoints?: number | string | RxO<number | string>;
    keySplines?: number | string | RxO<number | string>;
    keyTimes?: number | string | RxO<number | string>;
    lengthAdjust?: number | string | RxO<number | string>;
    letterSpacing?: number | string | RxO<number | string>;
    lightingColor?: number | string | RxO<number | string>;
    limitingConeAngle?: number | string | RxO<number | string>;
    local?: number | string | RxO<number | string>;
    markerEnd?: string | RxO<string>;
    markerHeight?: number | string | RxO<number | string>;
    markerMid?: string | RxO<string>;
    markerStart?: string | RxO<string>;
    markerUnits?: number | string | RxO<number | string>;
    markerWidth?: number | string | RxO<number | string>;
    mask?: string | RxO<string>;
    maskContentUnits?: number | string | RxO<number | string>;
    maskUnits?: number | string | RxO<number | string>;
    mathematical?: number | string | RxO<number | string>;
    mode?: number | string | RxO<number | string>;
    numOctaves?: number | string | RxO<number | string>;
    offset?: number | string | RxO<number | string>;
    opacity?: number | string | RxO<number | string>;
    operator?: number | string | RxO<number | string>;
    order?: number | string | RxO<number | string>;
    orient?: number | string | RxO<number | string>;
    orientation?: number | string | RxO<number | string>;
    origin?: number | string | RxO<number | string>;
    overflow?: number | string | RxO<number | string>;
    overlinePosition?: number | string | RxO<number | string>;
    overlineThickness?: number | string | RxO<number | string>;
    paintOrder?: number | string | RxO<number | string>;
    panose1?: number | string | RxO<number | string>;
    pathLength?: number | string | RxO<number | string>;
    patternContentUnits?: string | RxO<string>;
    patternTransform?: number | string | RxO<number | string>;
    patternUnits?: string | RxO<string>;
    pointerEvents?: number | string | RxO<number | string>;
    points?: string | RxO<string>;
    pointsAtX?: number | string | RxO<number | string>;
    pointsAtY?: number | string | RxO<number | string>;
    pointsAtZ?: number | string | RxO<number | string>;
    preserveAlpha?: number | string | RxO<number | string>;
    preserveAspectRatio?: string | RxO<string>;
    primitiveUnits?: number | string | RxO<number | string>;
    r?: number | string | RxO<number | string>;
    radius?: number | string | RxO<number | string>;
    refX?: number | string | RxO<number | string>;
    refY?: number | string | RxO<number | string>;
    renderingIntent?: number | string | RxO<number | string>;
    repeatCount?: number | string | RxO<number | string>;
    repeatDur?: number | string | RxO<number | string>;
    requiredExtensions?: number | string | RxO<number | string>;
    requiredFeatures?: number | string | RxO<number | string>;
    restart?: number | string | RxO<number | string>;
    result?: string | RxO<string>;
    rotate?: number | string | RxO<number | string>;
    rx?: number | string | RxO<number | string>;
    ry?: number | string | RxO<number | string>;
    scale?: number | string | RxO<number | string>;
    seed?: number | string | RxO<number | string>;
    shapeRendering?: number | string | RxO<number | string>;
    slope?: number | string | RxO<number | string>;
    spacing?: number | string | RxO<number | string>;
    specularConstant?: number | string | RxO<number | string>;
    specularExponent?: number | string | RxO<number | string>;
    speed?: number | string | RxO<number | string>;
    spreadMethod?: string | RxO<string>;
    startOffset?: number | string | RxO<number | string>;
    stdDeviation?: number | string | RxO<number | string>;
    stemh?: number | string | RxO<number | string>;
    stemv?: number | string | RxO<number | string>;
    stitchTiles?: number | string | RxO<number | string>;
    stopColor?: string | RxO<string>;
    stopOpacity?: number | string | RxO<number | string>;
    strikethroughPosition?: number | string | RxO<number | string>;
    strikethroughThickness?: number | string | RxO<number | string>;
    string?: number | string | RxO<number | string>;
    stroke?: string | RxO<string>;
    strokeDasharray?: string | RxO<string> | number;
    strokeDashoffset?: string | RxO<string> | number;
    strokeLinecap?: 'butt' | 'round' | 'square' | 'inherit';
    strokeLinejoin?: 'miter' | 'round' | 'bevel' | 'inherit';
    strokeMiterlimit?: number | string | RxO<number | string>;
    strokeOpacity?: number | string | RxO<number | string>;
    strokeWidth?: number | string | RxO<number | string>;
    surfaceScale?: number | string | RxO<number | string>;
    systemLanguage?: number | string | RxO<number | string>;
    tableValues?: number | string | RxO<number | string>;
    targetX?: number | string | RxO<number | string>;
    targetY?: number | string | RxO<number | string>;
    textAnchor?: string | RxO<string>;
    textDecoration?: number | string | RxO<number | string>;
    textLength?: number | string | RxO<number | string>;
    textRendering?: number | string | RxO<number | string>;
    to?: number | string | RxO<number | string>;
    transform?: string | RxO<string>;
    u1?: number | string | RxO<number | string>;
    u2?: number | string | RxO<number | string>;
    underlinePosition?: number | string | RxO<number | string>;
    underlineThickness?: number | string | RxO<number | string>;
    unicode?: number | string | RxO<number | string>;
    unicodeBidi?: number | string | RxO<number | string>;
    unicodeRange?: number | string | RxO<number | string>;
    unitsPerEm?: number | string | RxO<number | string>;
    vAlphabetic?: number | string | RxO<number | string>;
    values?: string | RxO<string>;
    vectorEffect?: number | string | RxO<number | string>;
    version?: string | RxO<string>;
    vertAdvY?: number | string | RxO<number | string>;
    vertOriginX?: number | string | RxO<number | string>;
    vertOriginY?: number | string | RxO<number | string>;
    vHanging?: number | string | RxO<number | string>;
    vIdeographic?: number | string | RxO<number | string>;
    viewBox?: string | RxO<string>;
    viewTarget?: number | string | RxO<number | string>;
    visibility?: number | string | RxO<number | string>;
    vMathematical?: number | string | RxO<number | string>;
    widths?: number | string | RxO<number | string>;
    wordSpacing?: number | string | RxO<number | string>;
    writingMode?: number | string | RxO<number | string>;
    x1?: number | string | RxO<number | string>;
    x2?: number | string | RxO<number | string>;
    x?: number | string | RxO<number | string>;
    xChannelSelector?: string | RxO<string>;
    xHeight?: number | string | RxO<number | string>;
    xlinkActuate?: string | RxO<string>;
    xlinkArcrole?: string | RxO<string>;
    xlinkHref?: string | RxO<string>;
    xlinkRole?: string | RxO<string>;
    xlinkShow?: string | RxO<string>;
    xlinkTitle?: string | RxO<string>;
    xlinkType?: string | RxO<string>;
    xmlBase?: string | RxO<string>;
    xmlLang?: string | RxO<string>;
    xmlns?: string | RxO<string>;
    xmlnsXlink?: string | RxO<string>;
    xmlSpace?: string | RxO<string>;
    y1?: number | string | RxO<number | string>;
    y2?: number | string | RxO<number | string>;
    y?: number | string | RxO<number | string>;
    yChannelSelector?: string | RxO<string>;
    z?: number | string | RxO<number | string>;
    zoomAndPan?: string | RxO<string>;
  }

  export interface WebViewHTMLAttributes<T> extends RxHTMLAttributes<T> {
    allowFullScreen?: boolean | RxO<boolean>;
    allowpopups?: boolean | RxO<boolean>;
    autoFocus?: boolean | RxO<boolean>;
    autosize?: boolean | RxO<boolean>;
    blinkfeatures?: string | RxO<string>;
    disableblinkfeatures?: string | RxO<string>;
    disableguestresize?: boolean | RxO<boolean>;
    disablewebsecurity?: boolean | RxO<boolean>;
    guestinstance?: string | RxO<string>;
    httpreferrer?: string | RxO<string>;
    nodeintegration?: boolean | RxO<boolean>;
    partition?: string | RxO<string>;
    plugins?: boolean | RxO<boolean>;
    preload?: string | RxO<string>;
    src?: string | RxO<string>;
    useragent?: string | RxO<string>;
    webpreferences?: string | RxO<string>;
  }
}

export default attributes;
