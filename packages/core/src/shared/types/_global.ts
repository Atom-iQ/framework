import {
  RvdChild,
  RvdComponent,
  RvdElement,
  RvdHTMLProps,
  RvdProps,
  RvdSVGProps,
  attributes
} from './rv-dom/rv-dom'

type RvdJSXElement = RvdElement;
type RvdJSXComponent = RvdComponent;
type RvdJSXProps = RvdProps;
type RvdJSXChild = RvdChild;
type RvdJSXHTMLProps<A, E> = RvdHTMLProps<A, E>;
type RvdJSXSVGProps<E> = RvdSVGProps<E>;


declare global {
  // Based on Type definitions for Inferno 16.4 http://facebook.github.io/Inferno/
  interface AbstractView {
    styleMedia: StyleMedia;
    document: Document;
  }

  namespace JSX {
    import JSXAttributes = attributes;

    type Element = RvdJSXElement;

    type ElementClass = RvdJSXComponent;
    type FunctionalElement = RvdJSXComponent;

    interface ElementAttributesProperty {
      props: RvdJSXProps;
    }

    interface ElementChildrenAttribute {
      children: RvdJSXChild[];
    }

    interface IntrinsicAttributes<P> {
      ref?: {}
    }

    interface IntrinsicClassAttributes<T>  {
      ref?: {};
    }

    interface IntrinsicElements {
      // HTML
      a: RvdJSXHTMLProps<JSXAttributes.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
      abbr: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      address: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      area: RvdJSXHTMLProps<JSXAttributes.AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>;
      article: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      aside: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      audio: RvdJSXHTMLProps<JSXAttributes.AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>;
      b: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      base: RvdJSXHTMLProps<JSXAttributes.BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>;
      bdi: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      bdo: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      big: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      blockquote: RvdJSXHTMLProps<JSXAttributes.BlockquoteHTMLAttributes<HTMLElement>, HTMLElement>;
      body: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>;
      br: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
      button: RvdJSXHTMLProps<
        JSXAttributes.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement
        >;
      canvas: RvdJSXHTMLProps<
        JSXAttributes.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement
        >;
      caption: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      cite: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      code: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      col: RvdJSXHTMLProps<
        JSXAttributes.ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement
        >;
      colgroup: RvdJSXHTMLProps<
        JSXAttributes.ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement
        >;
      data: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      datalist: RvdJSXHTMLProps<
        JSXAttributes.HTMLAttributes<HTMLDataListElement>, HTMLDataListElement
        >;
      dd: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      del: RvdJSXHTMLProps<JSXAttributes.DelHTMLAttributes<HTMLElement>, HTMLElement>;
      details: RvdJSXHTMLProps<JSXAttributes.DetailsHTMLAttributes<HTMLElement>, HTMLElement>;
      dfn: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      dialog: RvdJSXHTMLProps<
        JSXAttributes.DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement
        >;
      div: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      dl: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLDListElement>, HTMLDListElement>;
      dt: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      em: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      embed: RvdJSXHTMLProps<JSXAttributes.EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>;
      fieldset: RvdJSXHTMLProps<
        JSXAttributes.FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement
        >;
      figcaption: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      figure: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      footer: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      form: RvdJSXHTMLProps<JSXAttributes.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
      h1: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h2: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h3: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h4: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h5: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h6: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      head: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLHeadElement>, HTMLHeadElement>;
      header: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      hgroup: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      hr: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLHRElement>, HTMLHRElement>;
      html: RvdJSXHTMLProps<JSXAttributes.HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>;
      i: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      iframe: RvdJSXHTMLProps<
        JSXAttributes.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement
        >;
      img: RvdJSXHTMLProps<JSXAttributes.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
      input: RvdJSXHTMLProps<JSXAttributes.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
      ins: RvdJSXHTMLProps<JSXAttributes.InsHTMLAttributes<HTMLModElement>, HTMLModElement>;
      kbd: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      keygen: RvdJSXHTMLProps<JSXAttributes.KeygenHTMLAttributes<HTMLElement>, HTMLElement>;
      label: RvdJSXHTMLProps<JSXAttributes.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
      legend: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>;
      li: RvdJSXHTMLProps<JSXAttributes.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
      link: RvdJSXHTMLProps<JSXAttributes.LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>;
      main: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      map: RvdJSXHTMLProps<JSXAttributes.MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>;
      mark: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      menu: RvdJSXHTMLProps<JSXAttributes.MenuHTMLAttributes<HTMLElement>, HTMLElement>;
      menuitem: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      meta: RvdJSXHTMLProps<JSXAttributes.MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>;
      meter: RvdJSXHTMLProps<JSXAttributes.MeterHTMLAttributes<HTMLElement>, HTMLElement>;
      nav: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      noindex: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      noscript: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      object: RvdJSXHTMLProps<
        JSXAttributes.ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement
        >;
      ol: RvdJSXHTMLProps<JSXAttributes.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
      optgroup: RvdJSXHTMLProps<
        JSXAttributes.OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement
        >;
      option: RvdJSXHTMLProps<
        JSXAttributes.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement
        >;
      output: RvdJSXHTMLProps<JSXAttributes.OutputHTMLAttributes<HTMLElement>, HTMLElement>;
      p: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
      param: RvdJSXHTMLProps<JSXAttributes.ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>;
      picture: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      pre: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
      progress: RvdJSXHTMLProps<
        JSXAttributes.ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement
        >;
      q: RvdJSXHTMLProps<JSXAttributes.QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
      rp: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      rt: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      ruby: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      s: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      samp: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      script: RvdJSXHTMLProps<
        JSXAttributes.ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement
        >;
      section: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      select: RvdJSXHTMLProps<
        JSXAttributes.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement
        >;
      small: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      source: RvdJSXHTMLProps<
        JSXAttributes.SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement
        >;
      span: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
      strong: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      style: RvdJSXHTMLProps<JSXAttributes.StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>;
      sub: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      summary: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      sup: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      table: RvdJSXHTMLProps<JSXAttributes.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
      tbody: RvdJSXHTMLProps<
        JSXAttributes.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement
        >;
      td: RvdJSXHTMLProps<
        JSXAttributes.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement
        >;
      textarea: RvdJSXHTMLProps<
        JSXAttributes.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement
        >;
      tfoot: RvdJSXHTMLProps<
        JSXAttributes.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement
        >;
      th: RvdJSXHTMLProps<
        JSXAttributes.ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement
        >;
      thead: RvdJSXHTMLProps<
        JSXAttributes.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement
        >;
      time: RvdJSXHTMLProps<JSXAttributes.TimeHTMLAttributes<HTMLElement>, HTMLElement>;
      title: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>;
      tr: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
      track: RvdJSXHTMLProps<JSXAttributes.TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>;
      u: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      ul: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
      var: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      video: RvdJSXHTMLProps<JSXAttributes.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
      wbr: RvdJSXHTMLProps<JSXAttributes.HTMLAttributes<HTMLElement>, HTMLElement>;
      // webview: RvdJSXHTMLProps<
      // JSXAttributes.WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement
      // >;

      // SVG
      svg: RvdJSXSVGProps<SVGSVGElement>;

      animate: RvdJSXSVGProps<SVGElement>;
      animateTransform: RvdJSXSVGProps<SVGElement>;
      circle: RvdJSXSVGProps<SVGCircleElement>;
      clipPath: RvdJSXSVGProps<SVGClipPathElement>;
      defs: RvdJSXSVGProps<SVGDefsElement>;
      desc: RvdJSXSVGProps<SVGDescElement>;
      ellipse: RvdJSXSVGProps<SVGEllipseElement>;
      feBlend: RvdJSXSVGProps<SVGFEBlendElement>;
      feColorMatrix: RvdJSXSVGProps<SVGFEColorMatrixElement>;
      feComponentTransfer: RvdJSXSVGProps<SVGFEComponentTransferElement>;
      feComposite: RvdJSXSVGProps<SVGFECompositeElement>;
      feConvolveMatrix: RvdJSXSVGProps<SVGFEConvolveMatrixElement>;
      feDiffuseLighting: RvdJSXSVGProps<SVGFEDiffuseLightingElement>;
      feDisplacementMap: RvdJSXSVGProps<SVGFEDisplacementMapElement>;
      feDistantLight: RvdJSXSVGProps<SVGFEDistantLightElement>;
      feFlood: RvdJSXSVGProps<SVGFEFloodElement>;
      feFuncA: RvdJSXSVGProps<SVGFEFuncAElement>;
      feFuncB: RvdJSXSVGProps<SVGFEFuncBElement>;
      feFuncG: RvdJSXSVGProps<SVGFEFuncGElement>;
      feFuncR: RvdJSXSVGProps<SVGFEFuncRElement>;
      feGaussianBlur: RvdJSXSVGProps<SVGFEGaussianBlurElement>;
      feImage: RvdJSXSVGProps<SVGFEImageElement>;
      feMerge: RvdJSXSVGProps<SVGFEMergeElement>;
      feMergeNode: RvdJSXSVGProps<SVGFEMergeNodeElement>;
      feMorphology: RvdJSXSVGProps<SVGFEMorphologyElement>;
      feOffset: RvdJSXSVGProps<SVGFEOffsetElement>;
      fePointLight: RvdJSXSVGProps<SVGFEPointLightElement>;
      feSpecularLighting: RvdJSXSVGProps<SVGFESpecularLightingElement>;
      feSpotLight: RvdJSXSVGProps<SVGFESpotLightElement>;
      feTile: RvdJSXSVGProps<SVGFETileElement>;
      feTurbulence: RvdJSXSVGProps<SVGFETurbulenceElement>;
      filter: RvdJSXSVGProps<SVGFilterElement>;
      foreignObject: RvdJSXSVGProps<SVGForeignObjectElement>;
      g: RvdJSXSVGProps<SVGGElement>;
      image: RvdJSXSVGProps<SVGImageElement>;
      line: RvdJSXSVGProps<SVGLineElement>;
      linearGradient: RvdJSXSVGProps<SVGLinearGradientElement>;
      marker: RvdJSXSVGProps<SVGMarkerElement>;
      mask: RvdJSXSVGProps<SVGMaskElement>;
      metadata: RvdJSXSVGProps<SVGMetadataElement>;
      path: RvdJSXSVGProps<SVGPathElement>;
      pattern: RvdJSXSVGProps<SVGPatternElement>;
      polygon: RvdJSXSVGProps<SVGPolygonElement>;
      polyline: RvdJSXSVGProps<SVGPolylineElement>;
      radialGradient: RvdJSXSVGProps<SVGRadialGradientElement>;
      rect: RvdJSXSVGProps<SVGRectElement>;
      stop: RvdJSXSVGProps<SVGStopElement>;
      switch: RvdJSXSVGProps<SVGSwitchElement>;
      symbol: RvdJSXSVGProps<SVGSymbolElement>;
      text: RvdJSXSVGProps<SVGTextElement>;
      textPath: RvdJSXSVGProps<SVGTextPathElement>;
      tspan: RvdJSXSVGProps<SVGTSpanElement>;
      use: RvdJSXSVGProps<SVGUseElement>;
      view: RvdJSXSVGProps<SVGViewElement>;
    }
  }
}
