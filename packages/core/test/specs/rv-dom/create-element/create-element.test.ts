import {
  createRvdComponent,
  createRvdElement,
  createRvdFragment,
  normalizeProps
} from '../../../../src/rv-dom/create-element'
import {
  RvdChildFlags,
  RvdComponent,
  RvdDOMElement,
  RvdElement,
  RvdElementFlags
} from '../../../../src/shared/types'
import * as ELEMENTS from '../../../__mocks__/elements'

describe('createElement monomorphic functions', () => {
  test('createRvdElement should return new RvdDOMElement, depending on arguments', () => {
    const emptyDiv = createRvdElement(RvdElementFlags.HtmlElement, 'div')
    expect(emptyDiv).toEqual(ELEMENTS.EMPTY)

    const withClass = createRvdElement(RvdElementFlags.HtmlElement, 'div', 'mock-div')
    expect(withClass).toEqual(ELEMENTS.CLASSNAME)

    const withClassAndProps = createRvdElement(RvdElementFlags.HtmlElement, 'div', 'mock-div', {
      title: 'mock-title-prop',
      id: 'mock-div-id'
    })
    expect(withClassAndProps).toEqual(ELEMENTS.CLASSNAME_AND_PROPS)

    const withClassPropsAndChildren = createRvdElement(
      RvdElementFlags.HtmlElement,
      'div',
      'mock-div',
      { id: 'mock-div-id', title: 'mock-title-prop' },
      createRvdElement(
        RvdElementFlags.HtmlElement,
        'span',
        'mock-child-span',
        null,
        'mock child text',
        RvdChildFlags.HasSingleStaticChild
      ),
      RvdChildFlags.HasSingleStaticChild
    )

    expect(withClassPropsAndChildren).toEqual(ELEMENTS.CLASSNAME_PROPS_AND_ONE_CHILD)

    const fullWithKeyAndRef = createRvdElement(
      RvdElementFlags.HtmlElement,
      'div',
      'mock-div',
      { id: '1' },
      createRvdElement(
        RvdElementFlags.HtmlElement,
        'span',
        'mock-child-span',
        null,
        'mock child text',
        RvdChildFlags.HasSingleStaticChild
      ),
      RvdChildFlags.HasSingleStaticChild,
      'key',
      {}
    )

    expect(fullWithKeyAndRef).toEqual(ELEMENTS.FULL_WITH_KEY_AND_REF)

    const emptyWithKey = createRvdElement(
      RvdElementFlags.HtmlElement,
      'div',
      null,
      null,
      null,
      null,
      'key'
    )

    expect(emptyWithKey).toEqual(ELEMENTS.EMPTY_WITH_KEY)

    const emptyWithRef = createRvdElement(
      RvdElementFlags.HtmlElement,
      'div',
      null,
      null,
      null,
      null,
      null,
      {}
    )

    expect(emptyWithRef).toEqual(ELEMENTS.EMPTY_WITH_REF)
  })

  test("createRvdFragment should return null, when childFlags aren't set (has not children)", () => {
    const results = [
      createRvdFragment(RvdElementFlags.Fragment),
      createRvdFragment(RvdElementFlags.Fragment, null, null),
      createRvdFragment(RvdElementFlags.Fragment, [], null),
      createRvdFragment(RvdElementFlags.Fragment, ['abc', 'def'], null)
    ]
    results.forEach(expected => expect(expected).toBeNull())
  })

  test('createRvdFragment should return RvdFragmentElement, when has children', () => {
    const fragment = createRvdFragment(
      RvdElementFlags.NonKeyedFragment,
      [
        createRvdElement(RvdElementFlags.HtmlElement, 'div', 'class-1'),
        createRvdElement(RvdElementFlags.HtmlElement, 'div', 'class-2')
      ],
      RvdChildFlags.HasMultipleStaticChildren
    )
    const fragmentWithKey = createRvdFragment(
      RvdElementFlags.NonKeyedFragment,
      [
        createRvdElement(RvdElementFlags.HtmlElement, 'div', 'class-1'),
        createRvdElement(RvdElementFlags.HtmlElement, 'div', 'class-2')
      ],
      RvdChildFlags.HasMultipleStaticChildren,
      'key'
    )

    expect(fragment).toEqual(ELEMENTS.NON_KEYED_FRAGMENT_MULTIPLE_CHILDREN)
    expect(fragmentWithKey).toEqual(ELEMENTS.NON_KEYED_FRAGMENT_WITH_KEY)
  })

  const Component: RvdComponent<{ className: string }> = ({ className }) =>
    createRvdElement(RvdElementFlags.HtmlElement, 'div', className)

  test('createRvdComponent should return RvdComponentElement', () => {
    const simple = createRvdComponent(Component)
    const withProps = createRvdComponent(Component, { className: 'test' })
    const withPropsAndKey = createRvdComponent(Component, { className: 'test' }, 'key')
    const withPropsKeyAndRef = createRvdComponent(Component, { className: 'test' }, 'key', {})

    expect(simple).toEqual({ type: Component, elementFlag: RvdElementFlags.Component })
    expect(withProps).toEqual({
      type: Component,
      elementFlag: RvdElementFlags.Component,
      props: { className: 'test' }
    })
    expect(withPropsAndKey).toEqual({
      type: Component,
      elementFlag: RvdElementFlags.Component,
      props: { className: 'test' },
      key: 'key'
    })
    expect(withPropsKeyAndRef).toEqual({
      type: Component,
      elementFlag: RvdElementFlags.Component,
      props: { className: 'test' },
      key: 'key',
      ref: {}
    })
  })

  test('normalizeProps should return same element for Component and Fragment', () => {
    const component = {
      type: Component,
      elementFlag: RvdElementFlags.Component,
      props: { className: 'test' }
    }

    const fragment = ELEMENTS.NON_KEYED_FRAGMENT_MULTIPLE_CHILDREN

    expect(normalizeProps(component)).toBe(component)

    expect(normalizeProps(fragment)).toBe(fragment)
  })

  // eslint-disable-next-line max-len
  test('normalizeProps should set className for Element, when it has class or className in props (if has both, use class) - and remove it from props', () => {
    const element: RvdDOMElement = {
      elementFlag: RvdElementFlags.HtmlElement,
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
  test('normalizeProps should set children for Element, when it has class children in props and has not "normal" children - and remove children from props', () => {
    const element: RvdDOMElement = {
      elementFlag: RvdElementFlags.HtmlElement,
      type: 'div',
      className: null,
      props: {
        children: normalizeProps(
          createRvdElement(RvdElementFlags.HtmlElement, 'span', 'mock-child-span', {
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
        ...(ELEMENTS.ONE_CHILD.children as RvdElement),
        props: {},
        childFlags: RvdChildFlags.HasSingleUnknownChild
      }
    })
  })
})
