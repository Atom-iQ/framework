import {
  _FRAGMENT,
  HTMLAttributes,
  RvdChildFlags,
  RvdDOMElement,
  RvdDOMProps,
  RvdElementFlags,
  RvdFragmentElement,
  RxO
} from '../../src/shared'
import { asapScheduler, scheduled } from 'rxjs'

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

export const WITH_CLASSNAME: RvdDOMElement<HTMLAttributes<HTMLDivElement>> = {
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  className: 'mock-div'
}

export const WITH_OBSERVABLE_CLASSNAME: (
  className: RxO<string>
) => RvdDOMElement<HTMLAttributes<HTMLDivElement>> = className => ({
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  className
})

export const WITH_CLASSNAME_AND_PROPS: RvdDOMElement<HTMLAttributes<HTMLDivElement>> = {
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  className: 'mock-div',
  props: {
    id: '1'
  }
}

export const WITH_CLASSNAME_PROPS_AND_CHILDREN: RvdDOMElement<HTMLAttributes<HTMLDivElement>> = {
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
  childFlags: RvdChildFlags.HasSingleStaticChild
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

export const MANY_PROPS_AND_MANY_CHILDREN: RvdDOMElement<HTMLAttributes<HTMLDivElement>> = {
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
    {
      elementFlag: RvdElementFlags.HtmlElement,
      type: 'section',
      children: 'mock section text',
      childFlags: RvdChildFlags.HasSingleStaticChild
    }
  ],
  childFlags: RvdChildFlags.HasMultipleStaticChildren
}

export const WITH_CLASSNAME_AND_EMPTY_PROPS: RvdDOMElement<HTMLAttributes<HTMLDivElement>> = {
  elementFlag: RvdElementFlags.HtmlElement,
  type: 'div',
  className: 'mock-div',
  props: {}
}

export const NON_KEYED_FRAGMENT: RvdFragmentElement = {
  type: _FRAGMENT,
  elementFlag: RvdElementFlags.NonKeyedFragment,
  children: [EMPTY, EMPTY],
  childFlags: RvdChildFlags.HasMultipleStaticChildren
}

export const NON_KEYED_FRAGMENT_WITH_KEY = {
  ...NON_KEYED_FRAGMENT,
  key: 'key'
}
