export const enum RvdNodeFlags {
  // Dom nodes
  HtmlElement = 1,
  SvgElement = 2,
  Input = 4,
  Textarea = 8,
  Select = 16,
  FormElement = 28, // Input + Textarea + Select
  NonSvgElement = 29, // FormElement + HtmlElement
  Element = 31, // NonSvgElement + SvgElement
  Text = 32,
  DomNode = 63, // Element + Text
  // Container nodes
  Component = 64,
  Fragment = 128,
  List = 256,
  Group = 448 // Component + Fragment + List
}

export const enum RvdListType {
  NonKeyed = 1,
  Keyed
}
