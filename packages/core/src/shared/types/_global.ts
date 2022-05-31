/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  AnchorHTMLAttributes,
  AreaHTMLAttributes,
  AudioHTMLAttributes,
  BaseHTMLAttributes,
  BlockquoteHTMLAttributes,
  ButtonHTMLAttributes,
  CanvasHTMLAttributes,
  ColgroupHTMLAttributes,
  ColHTMLAttributes,
  DelHTMLAttributes,
  DetailsHTMLAttributes,
  DialogHTMLAttributes,
  EmbedHTMLAttributes,
  FieldsetHTMLAttributes,
  FormHTMLAttributes,
  HTMLAttributes,
  HtmlHTMLAttributes,
  IframeHTMLAttributes,
  ImgHTMLAttributes,
  InputHTMLAttributes,
  InsHTMLAttributes,
  KeygenHTMLAttributes,
  LabelHTMLAttributes,
  LiHTMLAttributes,
  LinkHTMLAttributes,
  MapHTMLAttributes,
  MenuHTMLAttributes,
  MetaHTMLAttributes,
  MeterHTMLAttributes,
  ObjectHTMLAttributes,
  OlHTMLAttributes,
  OptgroupHTMLAttributes,
  OptionHTMLAttributes,
  OutputHTMLAttributes,
  ParamHTMLAttributes,
  ProgressHTMLAttributes,
  QuoteHTMLAttributes,
  RvdChild,
  RvdComponent,
  RvdHTMLProps,
  RvdListProps,
  RvdProps,
  RvdRefObject,
  RvdSVGProps,
  ScriptHTMLAttributes,
  SelectHTMLAttributes,
  SourceHTMLAttributes,
  StyleHTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  TextareaHTMLAttributes,
  ThHTMLAttributes,
  TimeHTMLAttributes,
  TrackHTMLAttributes,
  VideoHTMLAttributes
} from './reactive-virtual-dom/rv-dom'
/* eslint-enable @typescript-eslint/no-unused-vars */

declare global {
  // Based on Type definitions for Inferno 16.4 http://facebook.github.io/Inferno/
  interface AbstractView {
    styleMedia: StyleMedia
    document: Document
  }

  namespace JSX {
    type Element = RvdChild

    type ElementClass = null
    type FunctionalElement = RvdComponent

    interface ElementAttributesProperty {
      props: RvdProps
    }

    interface ElementChildrenAttribute {
      children: RvdChild | RvdChild[] | RvdListProps['children']
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface IntrinsicAttributes<P> {
      ref?: RvdRefObject
      key?: string | number
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type IntrinsicClassAttributes<T> = null

    interface IntrinsicElements {
      // List
      'iq-for': Partial<RvdListProps>
      $for: Partial<RvdListProps>
      // HTML
      a: RvdHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>
      abbr: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      address: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      area: RvdHTMLProps<AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>
      article: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      aside: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      audio: RvdHTMLProps<AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>
      b: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      base: RvdHTMLProps<BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>
      bdi: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      bdo: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      big: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      blockquote: RvdHTMLProps<BlockquoteHTMLAttributes<HTMLElement>, HTMLElement>
      body: RvdHTMLProps<HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>
      br: RvdHTMLProps<HTMLAttributes<HTMLBRElement>, HTMLBRElement>
      button: RvdHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
      canvas: RvdHTMLProps<CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>
      caption: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      cite: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      code: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      col: RvdHTMLProps<ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>
      colgroup: RvdHTMLProps<ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>
      data: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      datalist: RvdHTMLProps<HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>
      dd: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      del: RvdHTMLProps<DelHTMLAttributes<HTMLElement>, HTMLElement>
      details: RvdHTMLProps<DetailsHTMLAttributes<HTMLElement>, HTMLElement>
      dfn: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      dialog: RvdHTMLProps<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>
      div: RvdHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
      dl: RvdHTMLProps<HTMLAttributes<HTMLDListElement>, HTMLDListElement>
      dt: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      em: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      embed: RvdHTMLProps<EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>
      fieldset: RvdHTMLProps<FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>
      figcaption: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      figure: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      footer: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      form: RvdHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>
      h1: RvdHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
      h2: RvdHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
      h3: RvdHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
      h4: RvdHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
      h5: RvdHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
      h6: RvdHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
      head: RvdHTMLProps<HTMLAttributes<HTMLHeadElement>, HTMLHeadElement>
      header: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      hgroup: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      hr: RvdHTMLProps<HTMLAttributes<HTMLHRElement>, HTMLHRElement>
      html: RvdHTMLProps<HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>
      i: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      iframe: RvdHTMLProps<IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>
      img: RvdHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>
      input: RvdHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
      ins: RvdHTMLProps<InsHTMLAttributes<HTMLModElement>, HTMLModElement>
      kbd: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      keygen: RvdHTMLProps<KeygenHTMLAttributes<HTMLElement>, HTMLElement>
      label: RvdHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>
      legend: RvdHTMLProps<HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>
      li: RvdHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>
      link: RvdHTMLProps<LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>
      main: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      map: RvdHTMLProps<MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>
      mark: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      menu: RvdHTMLProps<MenuHTMLAttributes<HTMLElement>, HTMLElement>
      menuitem: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      meta: RvdHTMLProps<MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>
      meter: RvdHTMLProps<MeterHTMLAttributes<HTMLElement>, HTMLElement>
      nav: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      noindex: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      noscript: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      object: RvdHTMLProps<ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>
      ol: RvdHTMLProps<OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>
      optgroup: RvdHTMLProps<OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>
      option: RvdHTMLProps<OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>
      output: RvdHTMLProps<OutputHTMLAttributes<HTMLElement>, HTMLElement>
      p: RvdHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>
      param: RvdHTMLProps<ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>
      picture: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      pre: RvdHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement>
      progress: RvdHTMLProps<ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>
      q: RvdHTMLProps<QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>
      rp: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      rt: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      ruby: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      s: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      samp: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      script: RvdHTMLProps<ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>
      section: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      select: RvdHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>
      small: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      source: RvdHTMLProps<SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>
      span: RvdHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>
      strong: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      style: RvdHTMLProps<StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>
      sub: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      summary: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      sup: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      table: RvdHTMLProps<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>
      tbody: RvdHTMLProps<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>
      td: RvdHTMLProps<TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>
      textarea: RvdHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>
      tfoot: RvdHTMLProps<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>
      th: RvdHTMLProps<ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>
      thead: RvdHTMLProps<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>
      time: RvdHTMLProps<TimeHTMLAttributes<HTMLElement>, HTMLElement>
      title: RvdHTMLProps<HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>
      tr: RvdHTMLProps<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>
      track: RvdHTMLProps<TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>
      u: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      ul: RvdHTMLProps<HTMLAttributes<HTMLUListElement>, HTMLUListElement>
      var: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      video: RvdHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>
      wbr: RvdHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      // webview: RvdHTMLProps<
      // JSXAttributes.WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement
      // >

      // SVG
      svg: RvdSVGProps<SVGSVGElement>

      animate: RvdSVGProps<SVGElement>
      animateTransform: RvdSVGProps<SVGElement>
      circle: RvdSVGProps<SVGCircleElement>
      clipPath: RvdSVGProps<SVGClipPathElement>
      defs: RvdSVGProps<SVGDefsElement>
      desc: RvdSVGProps<SVGDescElement>
      ellipse: RvdSVGProps<SVGEllipseElement>
      feBlend: RvdSVGProps<SVGFEBlendElement>
      feColorMatrix: RvdSVGProps<SVGFEColorMatrixElement>
      feComponentTransfer: RvdSVGProps<SVGFEComponentTransferElement>
      feComposite: RvdSVGProps<SVGFECompositeElement>
      feConvolveMatrix: RvdSVGProps<SVGFEConvolveMatrixElement>
      feDiffuseLighting: RvdSVGProps<SVGFEDiffuseLightingElement>
      feDisplacementMap: RvdSVGProps<SVGFEDisplacementMapElement>
      feDistantLight: RvdSVGProps<SVGFEDistantLightElement>
      feFlood: RvdSVGProps<SVGFEFloodElement>
      feFuncA: RvdSVGProps<SVGFEFuncAElement>
      feFuncB: RvdSVGProps<SVGFEFuncBElement>
      feFuncG: RvdSVGProps<SVGFEFuncGElement>
      feFuncR: RvdSVGProps<SVGFEFuncRElement>
      feGaussianBlur: RvdSVGProps<SVGFEGaussianBlurElement>
      feImage: RvdSVGProps<SVGFEImageElement>
      feMerge: RvdSVGProps<SVGFEMergeElement>
      feMergeNode: RvdSVGProps<SVGFEMergeNodeElement>
      feMorphology: RvdSVGProps<SVGFEMorphologyElement>
      feOffset: RvdSVGProps<SVGFEOffsetElement>
      fePointLight: RvdSVGProps<SVGFEPointLightElement>
      feSpecularLighting: RvdSVGProps<SVGFESpecularLightingElement>
      feSpotLight: RvdSVGProps<SVGFESpotLightElement>
      feTile: RvdSVGProps<SVGFETileElement>
      feTurbulence: RvdSVGProps<SVGFETurbulenceElement>
      filter: RvdSVGProps<SVGFilterElement>
      foreignObject: RvdSVGProps<SVGForeignObjectElement>
      g: RvdSVGProps<SVGGElement>
      image: RvdSVGProps<SVGImageElement>
      line: RvdSVGProps<SVGLineElement>
      linearGradient: RvdSVGProps<SVGLinearGradientElement>
      marker: RvdSVGProps<SVGMarkerElement>
      mask: RvdSVGProps<SVGMaskElement>
      metadata: RvdSVGProps<SVGMetadataElement>
      path: RvdSVGProps<SVGPathElement>
      pattern: RvdSVGProps<SVGPatternElement>
      polygon: RvdSVGProps<SVGPolygonElement>
      polyline: RvdSVGProps<SVGPolylineElement>
      radialGradient: RvdSVGProps<SVGRadialGradientElement>
      rect: RvdSVGProps<SVGRectElement>
      stop: RvdSVGProps<SVGStopElement>
      switch: RvdSVGProps<SVGSwitchElement>
      symbol: RvdSVGProps<SVGSymbolElement>
      text: RvdSVGProps<SVGTextElement>
      textPath: RvdSVGProps<SVGTextPathElement>
      tspan: RvdSVGProps<SVGTSpanElement>
      use: RvdSVGProps<SVGUseElement>
      view: RvdSVGProps<SVGViewElement>
    }
  }
}
