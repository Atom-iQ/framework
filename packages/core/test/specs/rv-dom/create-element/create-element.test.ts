import { normalizeProps } from '../../../../src/reactive-virtual-dom/create-element'
import { RvdElementNode, RvdNode } from '../../../../src/shared/types'
import * as ELEMENTS from '../../../__mocks__/elements'
import { RvdChildFlags, RvdNodeFlags } from '../../../../src/shared/flags'

describe('createElement monomorphic functions', () => {
  test('normalizeProps should return same element for Component and Fragment', () => {
    const Component = () => null
    const component = {
      type: Component,
      flag: RvdNodeFlags.Component,
      props: { className: 'test' }
    }

    const fragment = ELEMENTS.NON_KEYED_FRAGMENT_MULTIPLE_CHILDREN

    expect(normalizeProps(component)).toBe(component)

    expect(normalizeProps(fragment)).toBe(fragment)
  })

  // eslint-disable-next-line max-len
  test('normalizeProps should set className for Element, from class prop, when it has class and className in props - and remove them from props', () => {
    const element: RvdElementNode = {
      flag: RvdNodeFlags.HtmlElement,
      type: 'div',
      className: null,
      props: {
        class: 'mock-div',
        className: 'not-visible'
      }
    }

    const normalized = normalizeProps(element)
    expect(normalized.props['class']).toBeUndefined()
    expect(normalized.props['className']).toBeUndefined()
    expect(normalizeProps(element)).toEqual(ELEMENTS.CLASSNAME_AND_EMPTY_PROPS)
  })
  // eslint-disable-next-line max-len
  test('normalizeProps should set className for Element, from className prop, when it has className in props - and remove it from props', () => {
    const element: RvdElementNode = {
      flag: RvdNodeFlags.HtmlElement,
      type: 'div',
      className: null,
      props: {
        className: 'mock-div'
      }
    }

    const normalized = normalizeProps(element)
    expect(normalized.props['class']).toBeUndefined()
    expect(normalized.props['className']).toBeUndefined()
    expect(normalizeProps(element)).toEqual(ELEMENTS.CLASSNAME_AND_EMPTY_PROPS)
  })
  // eslint-disable-next-line max-len
  test('normalizeProps should set single child for Element, when it has single child in props and has not "normal" children - and remove children from props', () => {
    const element: RvdElementNode = {
      flag: RvdNodeFlags.HtmlElement,
      type: 'div',
      className: null,
      props: {
        children: normalizeProps({
          flag: RvdNodeFlags.HtmlElement,
          type: 'span',
          className: 'mock-child-span',
          props: { children: 'mock child text' }
        })
      }
    }

    const normalized = normalizeProps(element)
    expect(normalized.props['children']).toBeUndefined()
    expect(normalizeProps(element)).toEqual({
      ...ELEMENTS.ONE_CHILD,
      props: {},
      childFlags: RvdChildFlags.HasSingleUnknownChild,
      children: {
        ...(ELEMENTS.ONE_CHILD.children as RvdNode),
        props: {},
        childFlags: RvdChildFlags.HasSingleUnknownChild
      }
    })
  })

  // eslint-disable-next-line max-len
  test('normalizeProps should set children for Element, when it has children in props and has not "normal" children - and remove children from props', () => {
    const element: RvdElementNode = {
      flag: RvdNodeFlags.HtmlElement,
      type: 'div',
      className: null,
      props: {
        children: [
          normalizeProps({
            flag: RvdNodeFlags.HtmlElement,
            type: 'span',
            className: 'mock-child-span',
            props: { children: 'mock child text' }
          }),
          normalizeProps({
            flag: RvdNodeFlags.HtmlElement,
            type: 'span',
            className: 'mock-child-span-2',
            props: { children: 'mock child text 2' }
          })
        ]
      }
    }

    const normalized = normalizeProps(element)
    expect(normalized.props['children']).toBeUndefined()
    expect(normalizeProps(element)).toEqual({
      ...ELEMENTS.ONE_CHILD,
      props: {},
      childFlags: RvdChildFlags.HasMultipleUnknownChildren,
      children: [
        {
          ...(ELEMENTS.ONE_CHILD.children as RvdNode),
          props: {},
          childFlags: RvdChildFlags.HasSingleUnknownChild
        },
        {
          ...(ELEMENTS.ONE_CHILD.children as RvdNode),
          className: 'mock-child-span-2',
          children: 'mock child text 2',
          props: {},
          childFlags: RvdChildFlags.HasSingleUnknownChild
        }
      ]
    })
  })

  // eslint-disable-next-line max-len
  test('normalizeProps should not replace children for Element by children from props', () => {
    const element: RvdElementNode = {
      flag: RvdNodeFlags.HtmlElement,
      type: 'div',
      className: null,
      props: {
        children: normalizeProps({
          flag: RvdNodeFlags.HtmlElement,
          type: 'span',
          className: 'mock-child-span',
          props: { children: 'mock child text' }
        })
      },
      children: {
        flag: RvdNodeFlags.HtmlElement,
        type: 'div',
        className: 'mock-div'
      },
      childFlags: RvdChildFlags.HasSingleStaticChild
    }

    const normalized = normalizeProps(element)
    expect(normalized.props['children']).toBeUndefined()
    expect(normalized).toEqual({
      ...ELEMENTS.ONE_CHILD,
      props: {},
      childFlags: RvdChildFlags.HasSingleStaticChild,
      children: ELEMENTS.CLASSNAME
    })
  })

  // eslint-disable-next-line max-len
  test('normalizeProps should replace empty array Element children for children from props', () => {
    const element: RvdElementNode = {
      flag: RvdNodeFlags.HtmlElement,
      type: 'div',
      className: null,
      props: {
        children: normalizeProps({
          flag: RvdNodeFlags.HtmlElement,
          type: 'span',
          className: 'mock-child-span',
          props: { children: 'mock child text' }
        })
      },
      children: []
    }

    const normalized = normalizeProps(element)
    expect(normalized.props['children']).toBeUndefined()
    expect(normalizeProps(element)).toEqual({
      ...ELEMENTS.ONE_CHILD,
      props: {},
      childFlags: RvdChildFlags.HasSingleUnknownChild,
      children: {
        ...(ELEMENTS.ONE_CHILD.children as RvdNode),
        props: {},
        childFlags: RvdChildFlags.HasSingleUnknownChild
      }
    })
  })
})
