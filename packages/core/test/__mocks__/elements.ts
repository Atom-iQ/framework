import {
  ElementRefProp,
  HTMLAttributes,
  InputHTMLAttributes,
  RvdElementNode,
  RvdDOMProps,
  RvdFragmentNode,
  RvdHTML,
  RvdObservableChild,
  RvdSVGElementNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from '../../src/shared/types'
import { RvdChildFlags, RvdNodeFlags } from '../../src'
import { Observable } from 'rxjs'
import { _FRAGMENT } from '../../src/shared'

export const EMPTY: RvdElementNode = {
  flag: RvdNodeFlags.HtmlElement,
  type: 'div'
}

export const EMPTY_WITH_KEY: RvdElementNode = {
  flag: RvdNodeFlags.HtmlElement,
  type: 'div',
  className: null,
  props: null,
  children: null,
  childFlags: null,
  key: 'key'
}

export const EMPTY_WITH_REF = (ref: ElementRefProp): RvdElementNode => ({
  flag: RvdNodeFlags.HtmlElement,
  type: 'div',
  className: null,
  props: null,
  children: null,
  childFlags: null,
  key: null,
  ref
})

export const FULL_WITH_KEY_AND_REF = (
  ref: ElementRefProp
): RvdElementNode<HTMLAttributes<HTMLDivElement>> => ({
  flag: RvdNodeFlags.HtmlElement,
  type: 'div',
  className: 'mock-div',
  props: {
    id: '1'
  },
  children: {
    flag: RvdNodeFlags.HtmlElement,
    type: 'span',
    props: null,
    className: 'mock-child-span',
    children: 'mock child text',
    childFlags: RvdChildFlags.HasSingleStaticChild
  },
  childFlags: RvdChildFlags.HasSingleStaticChild,
  key: 'key',
  ref
})

export const CLASSNAME: RvdElementNode<HTMLAttributes<HTMLDivElement>> = {
  flag: RvdNodeFlags.HtmlElement,
  type: 'div',
  className: 'mock-div'
}

export const CLASSNAME_KEY = (key: string): RvdElementNode<HTMLAttributes<HTMLDivElement>> => ({
  flag: RvdNodeFlags.HtmlElement,
  type: 'div',
  className: 'mock-div',
  props: null,
  children: null,
  childFlags: null,
  key
})

export const OBSERVABLE_CLASSNAME: (
  className: Observable<string>
) => RvdElementNode<HTMLAttributes<HTMLDivElement>> = className => ({
  flag: RvdNodeFlags.HtmlElement,
  type: 'div',
  className
})

export const CLASSNAME_AND_EMPTY_PROPS: RvdElementNode<HTMLAttributes<HTMLDivElement>> = {
  flag: RvdNodeFlags.HtmlElement,
  type: 'div',
  className: 'mock-div',
  props: {}
}

export const CLASSNAME_AND_PROPS: RvdElementNode<HTMLAttributes<HTMLDivElement>> = {
  flag: RvdNodeFlags.HtmlElement,
  type: 'div',
  className: 'mock-div',
  props: {
    title: 'mock-title-prop',
    id: 'mock-div-id'
  }
}

export const CLASSNAME_AND_OBSERVABLE_PROPS: (props: {
  [key: string]: Observable<string>
}) => RvdElementNode<HTMLAttributes<HTMLDivElement>> = props => ({
  flag: RvdNodeFlags.HtmlElement,
  type: 'div',
  className: 'mock-div',
  props
})

export const OBSERVABLE_CLASSNAME_AND_OBSERVABLE_PROPS: (
  className: Observable<string>,
  props: {
    [key: string]: Observable<string>
  }
) => RvdElementNode<HTMLAttributes<HTMLDivElement>> = (className, props) => ({
  flag: RvdNodeFlags.HtmlElement,
  type: 'div',
  className,
  props
})

export const ONE_CHILD: RvdElementNode<HTMLAttributes<HTMLDivElement>> = {
  flag: RvdNodeFlags.HtmlElement,
  type: 'div',
  props: null,
  className: null,
  children: {
    flag: RvdNodeFlags.HtmlElement,
    type: 'span',
    props: null,
    className: 'mock-child-span',
    children: 'mock child text',
    childFlags: RvdChildFlags.HasSingleStaticChild
  },
  childFlags: RvdChildFlags.HasSingleStaticChild
}

export const CLASSNAME_AND_ONE_CHILD: RvdElementNode<HTMLAttributes<HTMLDivElement>> = {
  flag: RvdNodeFlags.HtmlElement,
  type: 'div',
  className: 'mock-div',
  props: null,
  children: {
    flag: RvdNodeFlags.HtmlElement,
    type: 'span',
    className: 'mock-child-span',
    props: null,
    children: 'mock child text',
    childFlags: RvdChildFlags.HasSingleStaticChild
  },
  childFlags: RvdChildFlags.HasSingleStaticChild
}

export const CLASSNAME_PROPS_AND_ONE_CHILD: RvdElementNode<HTMLAttributes<HTMLDivElement>> = {
  flag: RvdNodeFlags.HtmlElement,
  type: 'div',
  className: 'mock-div',
  props: {
    id: 'mock-div-id',
    title: 'mock-title-prop'
  },
  children: {
    flag: RvdNodeFlags.HtmlElement,
    type: 'span',
    props: null,
    className: 'mock-child-span',
    children: 'mock child text',
    childFlags: RvdChildFlags.HasSingleStaticChild
  },
  childFlags: RvdChildFlags.HasSingleStaticChild
}

export const OBSERVABLE_CLASSNAME_PROPS_AND_ONE_CHILD: (
  className: Observable<string>,
  props: {
    [key: string]: Observable<string>
  },
  children: RvdObservableChild
) => RvdElementNode<HTMLAttributes<HTMLDivElement>> = (className, props, children) => ({
  flag: RvdNodeFlags.HtmlElement,
  type: 'div',
  className,
  props,
  children,
  childFlags: RvdChildFlags.HasSingleUnknownChild
})

export const MANY_CHILDREN: RvdElementNode<HTMLAttributes<HTMLDivElement>> = {
  flag: RvdNodeFlags.HtmlElement,
  type: 'div',
  props: null,
  children: [
    {
      flag: RvdNodeFlags.HtmlElement,
      type: 'span',
      className: 'mock-child-span',
      children: 'mock span text',
      childFlags: RvdChildFlags.HasSingleStaticChild
    },
    {
      flag: RvdNodeFlags.HtmlElement,
      type: 'section',
      props: null,
      children: 'mock section text',
      childFlags: RvdChildFlags.HasSingleStaticChild
    }
  ],
  childFlags: RvdChildFlags.HasMultipleStaticChildren
}

export const MANY_PROPS_AND_ONE_CHILD: RvdElementNode<HTMLAttributes<HTMLDivElement>> = {
  flag: RvdNodeFlags.HtmlElement,
  type: 'div',
  className: 'mock-div',
  props: {
    title: 'mock-title-prop',
    id: 'mock-div-id'
  },
  children: {
    flag: RvdNodeFlags.HtmlElement,
    type: 'span',
    className: 'mock-child-span',
    children: 'mock child text',
    childFlags: RvdChildFlags.HasSingleStaticChild
  },
  childFlags: RvdChildFlags.HasSingleStaticChild
}

export const ONE_PROP_AND_MANY_CHILDREN: RvdElementNode<HTMLAttributes<HTMLDivElement>> = {
  flag: RvdNodeFlags.HtmlElement,
  type: 'div',
  props: {
    className: 'mock-div'
  },
  children: [
    {
      flag: RvdNodeFlags.HtmlElement,
      type: 'span',
      className: 'mock-child-span',
      children: 'mock span text',
      childFlags: RvdChildFlags.HasSingleStaticChild
    },
    {
      flag: RvdNodeFlags.HtmlElement,
      type: 'section',
      props: null,
      children: 'mock section text',
      childFlags: RvdChildFlags.HasSingleStaticChild
    }
  ],
  childFlags: RvdChildFlags.HasMultipleStaticChildren
}

export const CLASSNAME_MANY_PROPS_AND_MANY_CHILDREN: RvdElementNode<
  HTMLAttributes<HTMLDivElement>
> = {
  flag: RvdNodeFlags.HtmlElement,
  type: 'div',
  className: 'mock-div',
  props: {
    title: 'mock-title-prop',
    id: 'mock-div-id'
  },
  children: [
    {
      flag: RvdNodeFlags.HtmlElement,
      type: 'span',
      className: 'mock-child-span',
      children: 'mock span text',
      childFlags: RvdChildFlags.HasSingleStaticChild
    },
    'mock text center child',
    {
      flag: RvdNodeFlags.HtmlElement,
      type: 'section',
      children: 'mock section text',
      childFlags: RvdChildFlags.HasSingleStaticChild
    }
  ],
  childFlags: RvdChildFlags.HasMultipleStaticChildren
}

export const OBSERVABLE_CLASSNAME_MANY_PROPS_AND_MANY_CHILDREN: (
  className: Observable<string>,
  props: {
    [key: string]: Observable<string>
  },
  children: RvdObservableChild[]
) => RvdElementNode<HTMLAttributes<HTMLDivElement>> = (className, props, children) => ({
  flag: RvdNodeFlags.HtmlElement,
  type: 'div',
  className,
  props,
  children,
  childFlags: RvdChildFlags.HasMultipleUnknownChildren
})

export const SVG: RvdSVGElementNode = {
  flag: RvdNodeFlags.SvgElement,
  type: 'circle',
  className: 'test-svg'
}

export const SVG_OBSERVABLE_CLASS = (className: Observable<string>): RvdSVGElementNode => ({
  flag: RvdNodeFlags.SvgElement,
  type: 'circle',
  className
})

export const STYLE = (
  style: HTMLAttributes<HTMLElement>['style']
): RvdElementNode<HTMLAttributes<HTMLDivElement>> => ({
  flag: RvdNodeFlags.HtmlElement,
  type: 'div',
  className: null,
  props: {
    style
  }
})

export const EVENTS = (eventProps: RvdDOMProps): RvdElementNode => ({
  flag: RvdNodeFlags.HtmlElement,
  type: 'div',
  className: null,
  props: {
    ...eventProps
  }
})

export const getFragmentChild: (className: string, key?: string) => RvdElementNode = (
  className,
  key
) =>
  key
    ? {
        flag: RvdNodeFlags.HtmlElement,
        type: 'div',
        className,
        props: null,
        children: null,
        childFlags: null,
        key
      }
    : {
        flag: RvdNodeFlags.HtmlElement,
        type: 'div',
        className
      }

export const KEYED_CHILDREN_ARRAY = [
  getFragmentChild('class-1', '1'),
  getFragmentChild('class-2', '2'),
  getFragmentChild('class-3', '3')
]

export const NON_KEYED_FRAGMENT_ONE_CHILD: RvdFragmentNode = {
  type: _FRAGMENT,
  flag: RvdNodeFlags.NonKeyedFragment,
  children: [getFragmentChild('class-1')],
  childFlags: RvdChildFlags.HasSingleStaticChild
}

export const NON_KEYED_FRAGMENT_MULTIPLE_CHILDREN: RvdFragmentNode = {
  type: _FRAGMENT,
  flag: RvdNodeFlags.NonKeyedFragment,
  children: [getFragmentChild('class-1'), getFragmentChild('class-2')],
  childFlags: RvdChildFlags.HasMultipleStaticChildren
}

export const NON_KEYED_FRAGMENT_WITH_KEY = {
  ...NON_KEYED_FRAGMENT_MULTIPLE_CHILDREN,
  key: 'testKey'
}

export const KEYED_FRAGMENT: RvdFragmentNode = {
  type: _FRAGMENT,
  flag: RvdNodeFlags.Fragment,
  children: [
    getFragmentChild('class-1', '1'),
    getFragmentChild('class-2', '2'),
    getFragmentChild('class-3', '3')
  ],
  childFlags: RvdChildFlags.HasMultipleStaticChildren
}

export const MIXED_FRAGMENT: RvdFragmentNode = {
  type: _FRAGMENT,
  flag: RvdNodeFlags.Fragment,
  children: [
    getFragmentChild('class-1', '1'),
    getFragmentChild('class-2', '2'),
    getFragmentChild('class-3'),
    getFragmentChild('class-4')
  ],
  childFlags: RvdChildFlags.HasMultipleStaticChildren
}

export const KEYED_FRAGMENT_CHANGED_ORDER: RvdFragmentNode = {
  type: _FRAGMENT,
  flag: RvdNodeFlags.Fragment,
  children: [
    getFragmentChild('class-2', '2'),
    getFragmentChild('class-3', '3'),
    getFragmentChild('class-1', '1')
  ],
  childFlags: RvdChildFlags.HasMultipleStaticChildren
}

export const KEYED_FRAGMENT_ADDED_ITEMS: RvdFragmentNode = {
  type: _FRAGMENT,
  flag: RvdNodeFlags.Fragment,
  children: [
    getFragmentChild('class-1', '1'),
    getFragmentChild('class-2', '2'),
    getFragmentChild('class-3', '3'),
    getFragmentChild('class-4', '4'),
    getFragmentChild('class-5', '5')
  ],
  childFlags: RvdChildFlags.HasMultipleStaticChildren
}

export const KEYED_FRAGMENT_ADDED_ITEMS_FRAGMENT: RvdFragmentNode = {
  type: _FRAGMENT,
  flag: RvdNodeFlags.Fragment,
  children: [
    getFragmentChild('class-1', '1'),
    getFragmentChild('class-2', '2'),
    getFragmentChild('class-3', '3'),
    getFragmentChild('class-4', '4'),
    getFragmentChild('class-5', '5'),
    NON_KEYED_FRAGMENT_WITH_KEY
  ],
  childFlags: RvdChildFlags.HasMultipleStaticChildren
}

export const KEYED_FRAGMENT_REMOVED_ITEMS: RvdFragmentNode = {
  type: _FRAGMENT,
  flag: RvdNodeFlags.Fragment,
  children: [getFragmentChild('class-1', '1'), getFragmentChild('class-2', '2')],
  childFlags: RvdChildFlags.HasMultipleStaticChildren
}

export const UNCONTROLLED_INPUT: RvdHTML['input'] = {
  flag: RvdNodeFlags.InputElement,
  type: 'input',
  className: 'uncontrolled',
  props: { value: 'test', onInput: (): string => 'test' }
}

export const UNCONTROLLED_TEXTAREA: RvdHTML['textarea'] = {
  flag: RvdNodeFlags.TextareaElement,
  type: 'textarea',
  className: 'uncontrolled',
  props: { value: 'test', onInput: (): string => 'test' }
}

export const UNCONTROLLED_SELECT: RvdHTML['select'] = {
  flag: RvdNodeFlags.SelectElement,
  type: 'select',
  className: 'uncontrolled',
  props: { value: 'test', onChange: (): string => 'test' }
}

export const CONTROLLED_INPUT_TEXT = (
  props: InputHTMLAttributes<HTMLInputElement>
): RvdHTML['input'] => ({
  flag: RvdNodeFlags.InputElement,
  type: 'input',
  className: 'controlled',
  props
})

export const CONTROLLED_INPUT_CHECKED = ({
  checked,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>): RvdHTML['input'] => ({
  flag: RvdNodeFlags.InputElement,
  type: 'input',
  className: 'controlled',
  props: { type: 'checkbox', checked, ...rest }
})

export const CONTROLLED_TEXTAREA = (
  props: TextareaHTMLAttributes<HTMLTextAreaElement>
): RvdHTML['textarea'] => ({
  flag: RvdNodeFlags.TextareaElement,
  type: 'textarea',
  className: 'controlled',
  props
})

export const CONTROLLED_SELECT = (
  props: SelectHTMLAttributes<HTMLSelectElement>
): RvdHTML['select'] => ({
  flag: RvdNodeFlags.SelectElement,
  type: 'select',
  className: 'controlled',
  props
})
