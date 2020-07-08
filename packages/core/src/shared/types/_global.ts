import css from './dom/css';
import attributes from './dom/attributes';
import rxComponent from './rx-component';
import {RxRefProp} from './rx-ref';
import {RxChildren, RxSpecialProps} from './dom/props';
import rxDom from './dom/rx-dom';
import {RxO} from './rxjs';

declare global {
  // Based on Type definitions for Inferno 16.4
  // Project: http://facebook.github.io/Inferno/
  // Definitions by: Asana <https://asana.com>
  //                 AssureSign <http://www.assuresign.com>
  //                 Microsoft <https://microsoft.com>
  //                 John Reilly <https://github.com/johnnyreilly>
  //                 Benoit Benezech <https://github.com/bbenezech>
  //                 Patricio Zavolinsky <https://github.com/pzavolinsky>
  //                 Digiguru <https://github.com/digiguru>
  //                 Eric Anderson <https://github.com/ericanderson>
  //                 Albert Kurniawan <https://github.com/morcerf>
  //                 Tanguy Krotoff <https://github.com/tkrotoff>
  //                 Dovydas Navickas <https://github.com/DovydasNavickas>
  //                 Stéphane Goetz <https://github.com/onigoetz>
  //                 Rich Seviora <https://github.com/richseviora>
  //                 Josh Rutherford <https://github.com/theruther4d>
  // Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
  // TypeScript Version: 2.6

  //
  // Inferno Elements
  // ----------------------------------------------------------------------

  type RxDomElement<P extends RxProps = RxProps> = rxDom.RxNode<P>;

  interface RxHTMLElement<
    P extends HTMLAttributes<T>,
    T extends HTMLElement
  > extends RxDomElement<P> {
    type: keyof RxHTML;
  }

  // RxSVG for RxSVGElement
  interface RxSVGElement extends RxDomElement<SVGAttributes<SVGElement>> {
    type: keyof RxSVG;
  }
  interface ClassAttributes<T>  {

    ref?: RxRefProp;
  }


  type RxProps = rxComponent.RxComponentProps |
    RxHTMLProps<HTMLAttributes<Element>, Element> |
    SVGProps<SVGElement>;

  type RxHTMLProps<E extends HTMLAttributes<T>, T> = ClassAttributes<T> & E

  interface SVGProps<T> extends SVGAttributes<T>, ClassAttributes<T> {}

  type CSSWideKeyword = css.CSSWideKeyword;
  type CSSPercentage = css.CSSPercentage;
  type CSSLength = css.CSSLength;
  type CSSProperties = css.CSSProperties;

  type DOMAttributes<T> = attributes.RxDOMAttributes<T>;
  type HTMLAttributes<T> = attributes.RxHTMLAttributes<T>;

  type AnchorHTMLAttributes<T> = attributes.AnchorHTMLAttributes<T>;
  type AudioHTMLAttributes<T> = attributes.AudioHTMLAttributes<T>;
  type AreaHTMLAttributes<T> = attributes.AreaHTMLAttributes<T>;
  type BaseHTMLAttributes<T> = attributes.BaseHTMLAttributes<T>;
  type BlockquoteHTMLAttributes<T> = attributes.BlockquoteHTMLAttributes<T>;
  type ButtonHTMLAttributes<T> = attributes.ButtonHTMLAttributes<T>;
  type CanvasHTMLAttributes<T> = attributes.CanvasHTMLAttributes<T>;
  type ColHTMLAttributes<T> = attributes.ColHTMLAttributes<T>;
  type ColgroupHTMLAttributes<T> = attributes.ColgroupHTMLAttributes<T>;
  type DetailsHTMLAttributes<T> = attributes.DetailsHTMLAttributes<T>;
  type DelHTMLAttributes<T> = attributes.DelHTMLAttributes<T>;
  type DialogHTMLAttributes<T> = attributes.DialogHTMLAttributes<T>;
  type EmbedHTMLAttributes<T> = attributes.EmbedHTMLAttributes<T>;
  type FieldsetHTMLAttributes<T> = attributes.FieldsetHTMLAttributes<T>;
  type FormHTMLAttributes<T> = attributes.FormHTMLAttributes<T>;
  type HtmlHTMLAttributes<T> = attributes.HtmlHTMLAttributes<T>;
  type IframeHTMLAttributes<T> = attributes.IframeHTMLAttributes<T>;
  type ImgHTMLAttributes<T> = attributes.ImgHTMLAttributes<T>;
  type InsHTMLAttributes<T> = attributes.InsHTMLAttributes<T>;
  type InputHTMLAttributes<T> = attributes.InputHTMLAttributes<T>;
  type KeygenHTMLAttributes<T> = attributes.KeygenHTMLAttributes<T>;
  type LabelHTMLAttributes<T> = attributes.LabelHTMLAttributes<T>;
  type LiHTMLAttributes<T> = attributes.LiHTMLAttributes<T>;
  type LinkHTMLAttributes<T> = attributes.LinkHTMLAttributes<T>;
  type MapHTMLAttributes<T> = attributes.MapHTMLAttributes<T>;
  type MenuHTMLAttributes<T> = attributes.MenuHTMLAttributes<T>;
  type MediaHTMLAttributes<T> = attributes.MediaHTMLAttributes<T>;
  type MetaHTMLAttributes<T> = attributes.MetaHTMLAttributes<T>;
  type MeterHTMLAttributes<T> = attributes.MeterHTMLAttributes<T>;
  type QuoteHTMLAttributes<T> = attributes.QuoteHTMLAttributes<T>;
  type ObjectHTMLAttributes<T> = attributes.ObjectHTMLAttributes<T>;
  type OlHTMLAttributes<T> = attributes.OlHTMLAttributes<T>;
  type OptgroupHTMLAttributes<T> = attributes.OptgroupHTMLAttributes<T>;
  type OptionHTMLAttributes<T> = attributes.OptionHTMLAttributes<T>;
  type OutputHTMLAttributes<T> = attributes.OutputHTMLAttributes<T>;
  type ParamHTMLAttributes<T> = attributes.ParamHTMLAttributes<T>;
  type ProgressHTMLAttributes<T> = attributes.ProgressHTMLAttributes<T>;
  type ScriptHTMLAttributes<T> = attributes.ScriptHTMLAttributes<T>;
  type SelectHTMLAttributes<T> = attributes.SelectHTMLAttributes<T>;
  type SourceHTMLAttributes<T> = attributes.SourceHTMLAttributes<T>;
  type StyleHTMLAttributes<T> = attributes.StyleHTMLAttributes<T>;
  type TableHTMLAttributes<T> = attributes.TableHTMLAttributes<T>;
  type TextareaHTMLAttributes<T> = attributes.TextareaHTMLAttributes<T>;
  type TdHTMLAttributes<T> = attributes.TdHTMLAttributes<T>;
  type ThHTMLAttributes<T> = attributes.ThHTMLAttributes<T>;
  type TimeHTMLAttributes<T> = attributes.TimeHTMLAttributes<T>;
  type TrackHTMLAttributes<T> = attributes.TrackHTMLAttributes<T>;
  type VideoHTMLAttributes<T> = attributes.VideoHTMLAttributes<T>;
  type SVGAttributes<T> = attributes.SVGAttributes<T>;
  type WebViewHTMLAttributes<T> = attributes.WebViewHTMLAttributes<T>;

  //
  // Inferno.DOM
  // ----------------------------------------------------------------------

  interface RxHTML {
    a: RxHTMLElement<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
    abbr: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    address: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    area: RxHTMLElement<AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>;
    article: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    aside: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    audio: RxHTMLElement<AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>;
    b: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    base: RxHTMLElement<BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>;
    bdi: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    bdo: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    big: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    blockquote: RxHTMLElement<BlockquoteHTMLAttributes<HTMLElement>, HTMLElement>;
    body: RxHTMLElement<HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>;
    br: RxHTMLElement<HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
    button: RxHTMLElement<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
    canvas: RxHTMLElement<CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
    caption: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    cite: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    code: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    col: RxHTMLElement<ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
    colgroup: RxHTMLElement<ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
    data: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    datalist: RxHTMLElement<HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>;
    dd: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    del: RxHTMLElement<DelHTMLAttributes<HTMLElement>, HTMLElement>;
    details: RxHTMLElement<DetailsHTMLAttributes<HTMLElement>, HTMLElement>;
    dfn: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    dialog: RxHTMLElement<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>;
    div: RxHTMLElement<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    dl: RxHTMLElement<HTMLAttributes<HTMLDListElement>, HTMLDListElement>;
    dt: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    em: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    embed: RxHTMLElement<EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>;
    fieldset: RxHTMLElement<FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>;
    figcaption: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    figure: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    footer: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    form: RxHTMLElement<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
    h1: RxHTMLElement<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h2: RxHTMLElement<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h3: RxHTMLElement<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h4: RxHTMLElement<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h5: RxHTMLElement<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h6: RxHTMLElement<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    head: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLHeadElement>;
    header: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    hgroup: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    hr: RxHTMLElement<HTMLAttributes<HTMLHRElement>, HTMLHRElement>;
    html: RxHTMLElement<HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>;
    i: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    iframe: RxHTMLElement<IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;
    img: RxHTMLElement<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
    input: RxHTMLElement<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    ins: RxHTMLElement<InsHTMLAttributes<HTMLModElement>, HTMLModElement>;
    kbd: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    keygen: RxHTMLElement<KeygenHTMLAttributes<HTMLElement>, HTMLElement>;
    label: RxHTMLElement<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
    legend: RxHTMLElement<HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>;
    li: RxHTMLElement<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
    link: RxHTMLElement<LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>;
    main: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    map: RxHTMLElement<MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>;
    mark: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    menu: RxHTMLElement<MenuHTMLAttributes<HTMLElement>, HTMLElement>;
    menuitem: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    meta: RxHTMLElement<MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>;
    meter: RxHTMLElement<MeterHTMLAttributes<HTMLElement>, HTMLElement>;
    nav: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    noscript: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    object: RxHTMLElement<ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>;
    ol: RxHTMLElement<OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
    optgroup: RxHTMLElement<OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>;
    option: RxHTMLElement<OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
    output: RxHTMLElement<OutputHTMLAttributes<HTMLElement>, HTMLElement>;
    p: RxHTMLElement<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
    param: RxHTMLElement<ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>;
    picture: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    pre: RxHTMLElement<HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
    progress: RxHTMLElement<ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>;
    q: RxHTMLElement<QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
    rp: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    rt: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    ruby: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    s: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    samp: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    script: RxHTMLElement<ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>;
    section: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    select: RxHTMLElement<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
    small: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    source: RxHTMLElement<SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>;
    span: RxHTMLElement<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
    strong: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    style: RxHTMLElement<StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>;
    sub: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    summary: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    sup: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    table: RxHTMLElement<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
    tbody: RxHTMLElement<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
    td: RxHTMLElement<TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
    textarea: RxHTMLElement<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
    tfoot: RxHTMLElement<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
    th: RxHTMLElement<ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
    thead: RxHTMLElement<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
    time: RxHTMLElement<TimeHTMLAttributes<HTMLElement>, HTMLElement>;
    title: RxHTMLElement<HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>;
    tr: RxHTMLElement<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
    track: RxHTMLElement<TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>;
    u: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    ul: RxHTMLElement<HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
    var: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    video: RxHTMLElement<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
    wbr: RxHTMLElement<HTMLAttributes<HTMLElement>, HTMLElement>;
    // webview: RxHTMLElement<WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement>;
  }

  interface RxSVG {
    animate: RxSVGElement;
    circle: RxSVGElement;
    clipPath: RxSVGElement;
    defs: RxSVGElement;
    desc: RxSVGElement;
    ellipse: RxSVGElement;
    feBlend: RxSVGElement;
    feColorMatrix: RxSVGElement;
    feComponentTransfer: RxSVGElement;
    feComposite: RxSVGElement;
    feConvolveMatrix: RxSVGElement;
    feDiffuseLighting: RxSVGElement;
    feDisplacementMap: RxSVGElement;
    feDistantLight: RxSVGElement;
    feDropShadow: RxSVGElement;
    feFlood: RxSVGElement;
    feFuncA: RxSVGElement;
    feFuncB: RxSVGElement;
    feFuncG: RxSVGElement;
    feFuncR: RxSVGElement;
    feGaussianBlur: RxSVGElement;
    feImage: RxSVGElement;
    feMerge: RxSVGElement;
    feMergeNode: RxSVGElement;
    feMorphology: RxSVGElement;
    feOffset: RxSVGElement;
    fePointLight: RxSVGElement;
    feSpecularLighting: RxSVGElement;
    feSpotLight: RxSVGElement;
    feTile: RxSVGElement;
    feTurbulence: RxSVGElement;
    filter: RxSVGElement;
    foreignObject: RxSVGElement;
    g: RxSVGElement;
    image: RxSVGElement;
    line: RxSVGElement;
    linearGradient: RxSVGElement;
    marker: RxSVGElement;
    mask: RxSVGElement;
    metadata: RxSVGElement;
    path: RxSVGElement;
    pattern: RxSVGElement;
    polygon: RxSVGElement;
    polyline: RxSVGElement;
    radialGradient: RxSVGElement;
    rect: RxSVGElement;
    stop: RxSVGElement;
    svg: RxSVGElement;
    switch: RxSVGElement;
    symbol: RxSVGElement;
    text: RxSVGElement;
    textPath: RxSVGElement;
    tspan: RxSVGElement;
    use: RxSVGElement;
    view: RxSVGElement;
  }

  //
  // Browser Interfaces
  // https://github.com/nikeee/2048-typescript/blob/master/2048/js/touch.d.ts
  // ----------------------------------------------------------------------

  interface AbstractView {
    styleMedia: StyleMedia;
    document: Document;
  }

  namespace JSX {
    type Element = RxDomElement | RxO<RxDomElement>;
    type ElementClass = rxComponent.RxComponent;
    type FunctionalElement = rxComponent.RxComponent;
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: RxChildren;
    }
    type IntrinsicAttributes<P> = RxSpecialProps;
    interface IntrinsicClassAttributes<T>  {
      ref?: RxRefProp;
    }

    interface IntrinsicElements {
      // HTML
      a: RxHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
      abbr: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      address: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      area: RxHTMLProps<AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>;
      article: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      aside: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      audio: RxHTMLProps<AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>;
      b: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      base: RxHTMLProps<BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>;
      bdi: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      bdo: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      big: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      blockquote: RxHTMLProps<BlockquoteHTMLAttributes<HTMLElement>, HTMLElement>;
      body: RxHTMLProps<HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>;
      br: RxHTMLProps<HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
      button: RxHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
      canvas: RxHTMLProps<CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
      caption: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      cite: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      code: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      col: RxHTMLProps<ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
      colgroup: RxHTMLProps<ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
      data: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      datalist: RxHTMLProps<HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>;
      dd: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      del: RxHTMLProps<DelHTMLAttributes<HTMLElement>, HTMLElement>;
      details: RxHTMLProps<DetailsHTMLAttributes<HTMLElement>, HTMLElement>;
      dfn: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      dialog: RxHTMLProps<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>;
      div: RxHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      dl: RxHTMLProps<HTMLAttributes<HTMLDListElement>, HTMLDListElement>;
      dt: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      em: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      embed: RxHTMLProps<EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>;
      fieldset: RxHTMLProps<FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>;
      figcaption: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      figure: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      footer: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      form: RxHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
      h1: RxHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h2: RxHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h3: RxHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h4: RxHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h5: RxHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h6: RxHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      head: RxHTMLProps<HTMLAttributes<HTMLHeadElement>, HTMLHeadElement>;
      header: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      hgroup: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      hr: RxHTMLProps<HTMLAttributes<HTMLHRElement>, HTMLHRElement>;
      html: RxHTMLProps<HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>;
      i: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      iframe: RxHTMLProps<IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;
      img: RxHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
      input: RxHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
      ins: RxHTMLProps<InsHTMLAttributes<HTMLModElement>, HTMLModElement>;
      kbd: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      keygen: RxHTMLProps<KeygenHTMLAttributes<HTMLElement>, HTMLElement>;
      label: RxHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
      legend: RxHTMLProps<HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>;
      li: RxHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
      link: RxHTMLProps<LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>;
      main: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      map: RxHTMLProps<MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>;
      mark: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      menu: RxHTMLProps<MenuHTMLAttributes<HTMLElement>, HTMLElement>;
      menuitem: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      meta: RxHTMLProps<MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>;
      meter: RxHTMLProps<MeterHTMLAttributes<HTMLElement>, HTMLElement>;
      nav: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      noindex: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      noscript: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      object: RxHTMLProps<ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>;
      ol: RxHTMLProps<OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
      optgroup: RxHTMLProps<OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>;
      option: RxHTMLProps<OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
      output: RxHTMLProps<OutputHTMLAttributes<HTMLElement>, HTMLElement>;
      p: RxHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
      param: RxHTMLProps<ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>;
      picture: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      pre: RxHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
      progress: RxHTMLProps<ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>;
      q: RxHTMLProps<QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
      rp: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      rt: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      ruby: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      s: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      samp: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      script: RxHTMLProps<ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>;
      section: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      select: RxHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
      small: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      source: RxHTMLProps<SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>;
      span: RxHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
      strong: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      style: RxHTMLProps<StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>;
      sub: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      summary: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      sup: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      table: RxHTMLProps<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
      tbody: RxHTMLProps<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
      td: RxHTMLProps<TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
      textarea: RxHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
      tfoot: RxHTMLProps<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
      th: RxHTMLProps<ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
      thead: RxHTMLProps<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
      time: RxHTMLProps<TimeHTMLAttributes<HTMLElement>, HTMLElement>;
      title: RxHTMLProps<HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>;
      tr: RxHTMLProps<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
      track: RxHTMLProps<TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>;
      u: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      ul: RxHTMLProps<HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
      var: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      video: RxHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
      wbr: RxHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      // webview: RxHTMLProps<WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement>;

      // SVG
      svg: SVGProps<SVGSVGElement>;

      animate: SVGProps<SVGElement>;
      animateTransform: SVGProps<SVGElement>;
      circle: SVGProps<SVGCircleElement>;
      clipPath: SVGProps<SVGClipPathElement>;
      defs: SVGProps<SVGDefsElement>;
      desc: SVGProps<SVGDescElement>;
      ellipse: SVGProps<SVGEllipseElement>;
      feBlend: SVGProps<SVGFEBlendElement>;
      feColorMatrix: SVGProps<SVGFEColorMatrixElement>;
      feComponentTransfer: SVGProps<SVGFEComponentTransferElement>;
      feComposite: SVGProps<SVGFECompositeElement>;
      feConvolveMatrix: SVGProps<SVGFEConvolveMatrixElement>;
      feDiffuseLighting: SVGProps<SVGFEDiffuseLightingElement>;
      feDisplacementMap: SVGProps<SVGFEDisplacementMapElement>;
      feDistantLight: SVGProps<SVGFEDistantLightElement>;
      feFlood: SVGProps<SVGFEFloodElement>;
      feFuncA: SVGProps<SVGFEFuncAElement>;
      feFuncB: SVGProps<SVGFEFuncBElement>;
      feFuncG: SVGProps<SVGFEFuncGElement>;
      feFuncR: SVGProps<SVGFEFuncRElement>;
      feGaussianBlur: SVGProps<SVGFEGaussianBlurElement>;
      feImage: SVGProps<SVGFEImageElement>;
      feMerge: SVGProps<SVGFEMergeElement>;
      feMergeNode: SVGProps<SVGFEMergeNodeElement>;
      feMorphology: SVGProps<SVGFEMorphologyElement>;
      feOffset: SVGProps<SVGFEOffsetElement>;
      fePointLight: SVGProps<SVGFEPointLightElement>;
      feSpecularLighting: SVGProps<SVGFESpecularLightingElement>;
      feSpotLight: SVGProps<SVGFESpotLightElement>;
      feTile: SVGProps<SVGFETileElement>;
      feTurbulence: SVGProps<SVGFETurbulenceElement>;
      filter: SVGProps<SVGFilterElement>;
      foreignObject: SVGProps<SVGForeignObjectElement>;
      g: SVGProps<SVGGElement>;
      image: SVGProps<SVGImageElement>;
      line: SVGProps<SVGLineElement>;
      linearGradient: SVGProps<SVGLinearGradientElement>;
      marker: SVGProps<SVGMarkerElement>;
      mask: SVGProps<SVGMaskElement>;
      metadata: SVGProps<SVGMetadataElement>;
      path: SVGProps<SVGPathElement>;
      pattern: SVGProps<SVGPatternElement>;
      polygon: SVGProps<SVGPolygonElement>;
      polyline: SVGProps<SVGPolylineElement>;
      radialGradient: SVGProps<SVGRadialGradientElement>;
      rect: SVGProps<SVGRectElement>;
      stop: SVGProps<SVGStopElement>;
      switch: SVGProps<SVGSwitchElement>;
      symbol: SVGProps<SVGSymbolElement>;
      text: SVGProps<SVGTextElement>;
      textPath: SVGProps<SVGTextPathElement>;
      tspan: SVGProps<SVGTSpanElement>;
      use: SVGProps<SVGUseElement>;
      view: SVGProps<SVGViewElement>;
    }
  }
}
