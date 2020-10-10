import {
  _FRAGMENT,
  HTMLAttributes,
  RvdChildFlags,
  RvdDOMElement,
  RvdDOMProps,
  RvdElementFlags,
  RvdFragmentElement,
  RvdObservableChild,
  RxO
} from '../../src/shared'

export const EMPTY: RvdDOMElement = {
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div'
}

export const EMPTY_WITH_KEY: RvdDOMElement = {
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  className: null,
  props: null,
  children: null,
  childFlags: null,
  key: 'key'
}

export const EMPTY_WITH_REF: RvdDOMElement = {
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  className: null,
  props: null,
  children: null,
  childFlags: null,
  key: null,
  ref: {}
}

export const FULL_WITH_KEY_AND_REF: RvdDOMElement<HTMLAttributes<HTMLDivElement>> = {
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  className: 'mock-div',
  props: {
    id: '1'
  },
  children: {
    elementFlag: RvdElementFlags.HtmlElement,
    type: 'span',
    props: null,
    className: 'mock-child-span',
    children: 'mock child text',
    childFlags: RvdChildFlags.HasSingleStaticChild
  },
  childFlags: RvdChildFlags.HasSingleStaticChild,
  key: 'key',
  ref: {}
}

export const CLASSNAME: RvdDOMElement<HTMLAttributes<HTMLDivElement>> = {
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  className: 'mock-div'
}

export const OBSERVABLE_CLASSNAME: (
  className: RxO<string>
) => RvdDOMElement<HTMLAttributes<HTMLDivElement>> = className => ({
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  className
})

export const CLASSNAME_AND_EMPTY_PROPS: RvdDOMElement<HTMLAttributes<HTMLDivElement>> = {
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  className: 'mock-div',
  props: {}
}

export const CLASSNAME_AND_PROPS: RvdDOMElement<HTMLAttributes<HTMLDivElement>> = {
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  className: 'mock-div',
  props: {
    title: 'mock-title-prop',
    id: 'mock-div-id'
  }
}

export const CLASSNAME_AND_OBSERVABLE_PROPS: (props: {
  [key: string]: RxO<string>
}) => RvdDOMElement<HTMLAttributes<HTMLDivElement>> = props => ({
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  className: 'mock-div',
  props
})

export const OBSERVABLE_CLASSNAME_AND_OBSERVABLE_PROPS: (
  className: RxO<string>,
  props: {
    [key: string]: RxO<string>
  }
) => RvdDOMElement<HTMLAttributes<HTMLDivElement>> = (className, props) => ({
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  className,
  props
})

export const ONE_CHILD: RvdDOMElement<HTMLAttributes<HTMLDivElement>> = {
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  props: null,
  className: null,
  children: {
    elementFlag: RvdElementFlags.HtmlElement,
    type: 'span',
    props: null,
    className: 'mock-child-span',
    children: 'mock child text',
    childFlags: RvdChildFlags.HasSingleStaticChild
  },
  childFlags: RvdChildFlags.HasSingleStaticChild
}

export const CLASSNAME_AND_ONE_CHILD: RvdDOMElement<HTMLAttributes<HTMLDivElement>> = {
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  className: 'mock-div',
  props: null,
  children: {
    elementFlag: RvdElementFlags.HtmlElement,
    type: 'span',
    className: 'mock-child-span',
    props: null,
    children: 'mock child text',
    childFlags: RvdChildFlags.HasSingleStaticChild
  },
  childFlags: RvdChildFlags.HasSingleStaticChild
}

export const CLASSNAME_PROPS_AND_ONE_CHILD: RvdDOMElement<HTMLAttributes<HTMLDivElement>> = {
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  className: 'mock-div',
  props: {
    id: 'mock-div-id',
    title: 'mock-title-prop'
  },
  children: {
    elementFlag: RvdElementFlags.HtmlElement,
    type: 'span',
    props: null,
    className: 'mock-child-span',
    children: 'mock child text',
    childFlags: RvdChildFlags.HasSingleStaticChild
  },
  childFlags: RvdChildFlags.HasSingleStaticChild
}

export const OBSERVABLE_CLASSNAME_PROPS_AND_ONE_CHILD: (
  className: RxO<string>,
  props: {
    [key: string]: RxO<string>
  },
  children: RvdObservableChild
) => RvdDOMElement<HTMLAttributes<HTMLDivElement>> = (className, props, children) => ({
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  className,
  props,
  children,
  childFlags: RvdChildFlags.HasSingleUnknownChild
})

export const MANY_CHILDREN: RvdDOMElement<HTMLAttributes<HTMLDivElement>> = {
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  props: null,
  children: [
    {
      elementFlag: RvdElementFlags.HtmlElement,
      type: 'span',
      className: 'mock-child-span',
      children: 'mock span text',
      childFlags: RvdChildFlags.HasSingleStaticChild
    },
    {
      elementFlag: RvdElementFlags.HtmlElement,
      type: 'section',
      props: null,
      children: 'mock section text',
      childFlags: RvdChildFlags.HasSingleStaticChild
    }
  ],
  childFlags: RvdChildFlags.HasMultipleStaticChildren
}

export const MANY_PROPS_AND_ONE_CHILD: RvdDOMElement<HTMLAttributes<HTMLDivElement>> = {
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  className: 'mock-div',
  props: {
    title: 'mock-title-prop',
    id: 'mock-div-id'
  },
  children: {
    elementFlag: RvdElementFlags.HtmlElement,
    type: 'span',
    className: 'mock-child-span',
    children: 'mock child text',
    childFlags: RvdChildFlags.HasSingleStaticChild
  },
  childFlags: RvdChildFlags.HasSingleStaticChild
}

export const ONE_PROP_AND_MANY_CHILDREN: RvdDOMElement<HTMLAttributes<HTMLDivElement>> = {
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  props: {
    className: 'mock-div'
  },
  children: [
    {
      elementFlag: RvdElementFlags.HtmlElement,
      type: 'span',
      className: 'mock-child-span',
      children: 'mock span text',
      childFlags: RvdChildFlags.HasSingleStaticChild
    },
    {
      elementFlag: RvdElementFlags.HtmlElement,
      type: 'section',
      props: null,
      children: 'mock section text',
      childFlags: RvdChildFlags.HasSingleStaticChild
    }
  ],
  childFlags: RvdChildFlags.HasMultipleStaticChildren
}

export const CLASSNAME_MANY_PROPS_AND_MANY_CHILDREN: RvdDOMElement<HTMLAttributes<
  HTMLDivElement
>> = {
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  className: 'mock-div',
  props: {
    title: 'mock-title-prop',
    id: 'mock-div-id'
  },
  children: [
    {
      elementFlag: RvdElementFlags.HtmlElement,
      type: 'span',
      className: 'mock-child-span',
      children: 'mock span text',
      childFlags: RvdChildFlags.HasSingleStaticChild
    },
    'mock text center child',
    {
      elementFlag: RvdElementFlags.HtmlElement,
      type: 'section',
      children: 'mock section text',
      childFlags: RvdChildFlags.HasSingleStaticChild
    }
  ],
  childFlags: RvdChildFlags.HasMultipleStaticChildren
}

export const OBSERVABLE_CLASSNAME_MANY_PROPS_AND_MANY_CHILDREN: (
  className: RxO<string>,
  props: {
    [key: string]: RxO<string>
  },
  children: RvdObservableChild[]
) => RvdDOMElement<HTMLAttributes<HTMLDivElement>> = (className, props, children) => ({
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  className,
  props,
  children,
  childFlags: RvdChildFlags.HasMultipleUnknownChildren
})

export const STYLE = (
  style: HTMLAttributes<HTMLElement>['style']
): RvdDOMElement<HTMLAttributes<HTMLDivElement>> => ({
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  className: null,
  props: {
    style
  }
})

export const EVENTS = (eventProps: RvdDOMProps): RvdDOMElement => ({
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  className: null,
  props: {
    ...eventProps
  }
})

export const getFragmentChild: (className: string, key?: string) => RvdDOMElement = (
  className,
  key
) =>
  key
    ? {
        elementFlag: RvdElementFlags.HtmlElement,
        type: 'div',
        className,
        props: null,
        children: null,
        childFlags: null,
        key
      }
    : {
        elementFlag: RvdElementFlags.HtmlElement,
        type: 'div',
        className
      }

export const KEYED_CHILDREN_ARRAY = [
  getFragmentChild('class-1', '1'),
  getFragmentChild('class-2', '2'),
  getFragmentChild('class-3', '3')
]

export const NON_KEYED_FRAGMENT_ONE_CHILD: RvdFragmentElement = {
  type: _FRAGMENT,
  elementFlag: RvdElementFlags.NonKeyedFragment,
  children: [getFragmentChild('class-1')],
  childFlags: RvdChildFlags.HasSingleStaticChild
}

export const NON_KEYED_FRAGMENT_MULTIPLE_CHILDREN: RvdFragmentElement = {
  type: _FRAGMENT,
  elementFlag: RvdElementFlags.NonKeyedFragment,
  children: [getFragmentChild('class-1'), getFragmentChild('class-2')],
  childFlags: RvdChildFlags.HasMultipleStaticChildren
}

export const NON_KEYED_FRAGMENT_WITH_KEY = {
  ...NON_KEYED_FRAGMENT_MULTIPLE_CHILDREN,
  key: 'key'
}

export const KEYED_FRAGMENT: RvdFragmentElement = {
  type: _FRAGMENT,
  elementFlag: RvdElementFlags.Fragment,
  children: [
    getFragmentChild('class-1', '1'),
    getFragmentChild('class-2', '2'),
    getFragmentChild('class-3', '3')
  ],
  childFlags: RvdChildFlags.HasMultipleStaticChildren
}

export const KEYED_FRAGMENT_CHANGED_ORDER: RvdFragmentElement = {
  type: _FRAGMENT,
  elementFlag: RvdElementFlags.Fragment,
  children: [
    getFragmentChild('class-2', '2'),
    getFragmentChild('class-3', '3'),
    getFragmentChild('class-1', '1')
  ],
  childFlags: RvdChildFlags.HasMultipleStaticChildren
}

export const KEYED_FRAGMENT_ADDED_ITEMS: RvdFragmentElement = {
  type: _FRAGMENT,
  elementFlag: RvdElementFlags.Fragment,
  children: [
    getFragmentChild('class-1', '1'),
    getFragmentChild('class-2', '2'),
    getFragmentChild('class-3', '3'),
    getFragmentChild('class-4', '4'),
    getFragmentChild('class-5', '5')
  ],
  childFlags: RvdChildFlags.HasMultipleStaticChildren
}

export const KEYED_FRAGMENT_REMOVED_ITEMS: RvdFragmentElement = {
  type: _FRAGMENT,
  elementFlag: RvdElementFlags.Fragment,
  children: [getFragmentChild('class-1', '1'), getFragmentChild('class-2', '2')],
  childFlags: RvdChildFlags.HasMultipleStaticChildren
}
