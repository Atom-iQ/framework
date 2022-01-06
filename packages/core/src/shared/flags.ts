export const enum RvdNodeFlags {
  HtmlElement = 1,
  SvgElement = 2,
  InputElement = 4,
  TextareaElement = 8,
  SelectElement = 16,
  FormElement = 28,
  NonSvgElement = 29,
  Element = 31,
  Component = 32,
  Fragment = 64,
  NonKeyedFragment = 128,
  AnyFragment = 192,
  Text = 256,
  ElementOrText = 287,
  List = 512
}

export const enum RvdChildFlags {
  // For checking
  HasSingleChild = 1,
  HasOnlyStaticChildren = 2,
  HasMultipleChildren = 4,
  HasUnknownChildren = 8,
  // For children - determined by 2 factors: single/multi - static/unknown(expression)
  HasSingleStaticChild = 3,
  HasMultipleStaticChildren = 6,
  HasSingleUnknownChild = 9,
  HasMultipleUnknownChildren = 12
}

export const enum RvdListType {
  NonKeyed = 1,
  Keyed
}
