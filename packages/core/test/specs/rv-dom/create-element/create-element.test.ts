import {
  createRvdComponent,
  createRvdElement,
  createRvdFragment,
  normalizeProps
} from '../../../../src/reactive-virtual-dom/create-element'
import {
  ComponentRefProp,
  ElementRefProp,
  RvdComponent,
  RvdElementNode,
  RvdNode
} from '../../../../src/shared/types'
import * as ELEMENTS from '../../../__mocks__/elements'
import { RvdChildFlags, RvdNodeFlags } from '../../../../src/shared/flags'

describe('createElement monomorphic functions', () => {
  test('createRvdElement should return new RvdDOMElement, depending on arguments', () => {
    const emptyDiv = createRvdElement(RvdNodeFlags.HtmlElement, 'div')
    expect(emptyDiv).toEqual(ELEMENTS.EMPTY)

    const withClass = createRvdElement(RvdNodeFlags.HtmlElement, 'div', 'mock-div')
    expect(withClass).toEqual(ELEMENTS.CLASSNAME)

    const withClassAndProps = createRvdElement(RvdNodeFlags.HtmlElement, 'div', 'mock-div', {
      title: 'mock-title-prop',
      id: 'mock-div-id'
    })
    expect(withClassAndProps).toEqual(ELEMENTS.CLASSNAME_AND_PROPS)

    const withClassPropsAndChildren = createRvdElement(
      RvdNodeFlags.HtmlElement,
      'div',
      'mock-div',
      { id: 'mock-div-id', title: 'mock-title-prop' },
      createRvdElement(
        RvdNodeFlags.HtmlElement,
        'span',
        'mock-child-span',
        null,
        'mock child text',
        RvdChildFlags.HasSingleStaticChild
      ),
      RvdChildFlags.HasSingleStaticChild
    )

    expect(withClassPropsAndChildren).toEqual(ELEMENTS.CLASSNAME_PROPS_AND_ONE_CHILD)

    const elementRef = (jest.fn() as unknown) as ElementRefProp

    const fullWithKeyAndRef = createRvdElement(
      RvdNodeFlags.HtmlElement,
      'div',
      'mock-div',
      { id: '1' },
      createRvdElement(
        RvdNodeFlags.HtmlElement,
        'span',
        'mock-child-span',
        null,
        'mock child text',
        RvdChildFlags.HasSingleStaticChild
      ),
      RvdChildFlags.HasSingleStaticChild,
      'key',
      elementRef
    )

    expect(fullWithKeyAndRef).toEqual(ELEMENTS.FULL_WITH_KEY_AND_REF(elementRef))

    const emptyWithKey = createRvdElement(
      RvdNodeFlags.HtmlElement,
      'div',
      null,
      null,
      null,
      null,
      'key'
    )

    expect(emptyWithKey).toEqual(ELEMENTS.EMPTY_WITH_KEY)

    const emptyWithRef = createRvdElement(
      RvdNodeFlags.HtmlElement,
      'div',
      null,
      null,
      null,
      null,
      null,
      elementRef
    )

    expect(emptyWithRef).toEqual(ELEMENTS.EMPTY_WITH_REF(elementRef))
  })

  test("createRvdFragment should return null, when childFlags aren't set (has not children)", () => {
    const results = [
      createRvdFragment(RvdNodeFlags.Fragment),
      createRvdFragment(RvdNodeFlags.Fragment, null, null),
      createRvdFragment(RvdNodeFlags.Fragment, [], null),
      createRvdFragment(RvdNodeFlags.Fragment, ['abc', 'def'], null)
    ]
    results.forEach(expected => expect(expected).toBeNull())
  })

  test('createRvdFragment should return RvdFragmentElement, when has children', () => {
    const fragment = createRvdFragment(
      RvdNodeFlags.NonKeyedFragment,
      [
        createRvdElement(RvdNodeFlags.HtmlElement, 'div', 'class-1'),
        createRvdElement(RvdNodeFlags.HtmlElement, 'div', 'class-2')
      ],
      RvdChildFlags.HasMultipleStaticChildren
    )
    const fragmentWithKey = createRvdFragment(
      RvdNodeFlags.NonKeyedFragment,
      [
        createRvdElement(RvdNodeFlags.HtmlElement, 'div', 'class-1'),
        createRvdElement(RvdNodeFlags.HtmlElement, 'div', 'class-2')
      ],
      RvdChildFlags.HasMultipleStaticChildren,
      'testKey'
    )

    expect(fragment).toEqual(ELEMENTS.NON_KEYED_FRAGMENT_MULTIPLE_CHILDREN)
    expect(fragmentWithKey).toEqual(ELEMENTS.NON_KEYED_FRAGMENT_WITH_KEY)
  })

  const Component: RvdComponent<{ className: string }> = ({ className }) =>
    createRvdElement(RvdNodeFlags.HtmlElement, 'div', className)

  test('createRvdComponent should return RvdComponentElement', () => {
    const simple = createRvdComponent(Component)
    const withProps = createRvdComponent(Component, { className: 'test' })
    const withPropsAndKey = createRvdComponent(Component, { className: 'test' }, 'key')

    const componentRef = jest.fn() as ComponentRefProp
    const withPropsKeyAndRef = createRvdComponent(
      Component,
      { className: 'test' },
      'key',
      componentRef
    )

    expect(simple).toEqual({ type: Component, elementFlag: RvdNodeFlags.Component })
    expect(withProps).toEqual({
      type: Component,
      elementFlag: RvdNodeFlags.Component,
      props: { className: 'test' }
    })
    expect(withPropsAndKey).toEqual({
      type: Component,
      elementFlag: RvdNodeFlags.Component,
      props: { className: 'test' },
      key: 'key'
    })
    expect(withPropsKeyAndRef).toEqual({
      type: Component,
      elementFlag: RvdNodeFlags.Component,
      props: { className: 'test' },
      key: 'key',
      ref: componentRef
    })
  })

  test('normalizeProps should return same element for Component and Fragment', () => {
    const component = {
      type: Component,
      elementFlag: RvdNodeFlags.Component,
      props: { className: 'test' }
    }

    const fragment = ELEMENTS.NON_KEYED_FRAGMENT_MULTIPLE_CHILDREN

    expect(normalizeProps(component)).toBe(component)

    expect(normalizeProps(fragment)).toBe(fragment)
  })

  // eslint-disable-next-line max-len
  test('normalizeProps should set className for Element, from class prop, when it has class and className in props - and remove them from props', () => {
    const element: RvdElementNode = {
      elementFlag: RvdNodeFlags.HtmlElement,
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
      elementFlag: RvdNodeFlags.HtmlElement,
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
      elementFlag: RvdNodeFlags.HtmlElement,
      type: 'div',
      className: null,
      props: {
        children: normalizeProps(
          createRvdElement(RvdNodeFlags.HtmlElement, 'span', 'mock-child-span', {
            children: 'mock child text'
          })
        )
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
      elementFlag: RvdNodeFlags.HtmlElement,
      type: 'div',
      className: null,
      props: {
        children: [
          normalizeProps(
            createRvdElement(RvdNodeFlags.HtmlElement, 'span', 'mock-child-span', {
              children: 'mock child text'
            })
          ),
          normalizeProps(
            createRvdElement(RvdNodeFlags.HtmlElement, 'span', 'mock-child-span-2', {
              children: 'mock child text 2'
            })
          )
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
      elementFlag: RvdNodeFlags.HtmlElement,
      type: 'div',
      className: null,
      props: {
        children: normalizeProps(
          createRvdElement(RvdNodeFlags.HtmlElement, 'span', 'mock-child-span', {
            children: 'mock child text'
          })
        )
      },
      children: createRvdElement(RvdNodeFlags.HtmlElement, 'div', 'mock-div'),
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
      elementFlag: RvdNodeFlags.HtmlElement,
      type: 'div',
      className: null,
      props: {
        children: normalizeProps(
          createRvdElement(RvdNodeFlags.HtmlElement, 'span', 'mock-child-span', {
            children: 'mock child text'
          })
        )
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
