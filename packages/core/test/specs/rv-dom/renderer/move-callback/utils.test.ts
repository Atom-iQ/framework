// TODO: Implement
import { renderChildInIndexPosition } from '../../../../../src/rv-dom/renderer/dom-renderer'
import { createDomElement } from '../../../../../src/rv-dom/renderer/utils'
import { CreatedChildrenManager, RvdDOMElement } from '../../../../../src/shared/types'
import createChildrenManager from '../../../../../src/rv-dom/renderer/utils/children-manager'
import { renderRvdFragment } from '../../../../../src/rv-dom/renderer/fragment'
import { Subscription } from 'rxjs'
import {
  KEYED_FRAGMENT,
  NON_KEYED_FRAGMENT_MULTIPLE_CHILDREN
} from '../../../../__mocks__/elements'
import { renderRvdElement } from '../../../../../src/rv-dom/renderer/element'
import { renderElement } from '../../../../../src/rv-dom/renderer/render-callback/element'
import { reportUnhandledError } from 'rxjs/dist/types/internal/util/reportUnhandledError'
import { removeExistingFragment } from '../../../../../src/rv-dom/renderer/move-callback/utils'

describe('Move callback utils', () => {
  test('removeExistingFragment should remove non-keyed fragment from DOM and rvDOM', () => {
    const createdChildren: CreatedChildrenManager = createChildrenManager()
    const parentElement = createDomElement('div', false)
    const sub = new Subscription()

    createdChildren.createEmptyFragment('0')
    const fragment = createdChildren.getFragment('0')

    const renderChild = (child: RvdDOMElement, index) => {
      const elementNode = renderRvdElement(child)
      fragment.fragmentChildIndexes = fragment.fragmentChildIndexes.concat(index)
      ++fragment.fragmentChildrenLength
      renderElement(elementNode, index, parentElement, createdChildren, sub)()
    }

    renderRvdFragment(
      '0',
      parentElement,
      createdChildren,
      sub,
      renderChild
    )(NON_KEYED_FRAGMENT_MULTIPLE_CHILDREN)

    const createElementWithClassName = className => {
      const el = createDomElement('div', false) as HTMLElement
      el.className = className
      return el
    }

    const renderedChildren = [
      createElementWithClassName('class-1'),
      createElementWithClassName('class-2')
    ]

    expect(parentElement.firstChild).toEqual(renderedChildren[0])
    expect(parentElement.lastChild).toEqual(renderedChildren[1])
    expect(fragment.fragmentChildrenLength).toBe(2)

    removeExistingFragment({}, '0', parentElement, createdChildren)(fragment)

    expect(parentElement.firstChild).toEqual(null)
    expect(parentElement.lastChild).toEqual(null)
    expect(createdChildren.getFragment('0')).toBeUndefined()
  })

  test('removeExistingFragment should remove keyed fragment from DOM and rvDOM', () => {
    const createdChildren: CreatedChildrenManager = createChildrenManager()
    const parentElement = createDomElement('div', false)
    const sub = new Subscription()

    createdChildren.createEmptyFragment('0')
    const fragment = createdChildren.getFragment('0')

    const renderChild = (child: RvdDOMElement, index) => {
      const elementNode = renderRvdElement(child)
      fragment.fragmentChildIndexes = fragment.fragmentChildIndexes.concat(index)
      ++fragment.fragmentChildrenLength
      renderElement(elementNode, index, parentElement, createdChildren, sub)()
    }

    renderRvdFragment('0', parentElement, createdChildren, sub, renderChild)(KEYED_FRAGMENT)

    const createElementWithClassName = className => {
      const el = createDomElement('div', false) as HTMLElement
      el.className = className
      return el
    }

    const renderedChildren = [
      createElementWithClassName('class-1'),
      createElementWithClassName('class-2'),
      createElementWithClassName('class-3')
    ]

    expect(parentElement.firstChild).toEqual(renderedChildren[0])
    expect(parentElement.children[1]).toEqual(renderedChildren[1])
    expect(parentElement.lastChild).toEqual(renderedChildren[2])
    expect(fragment.fragmentChildrenLength).toBe(3)

    removeExistingFragment(fragment.oldKeyElementMap, '0', parentElement, createdChildren)(fragment)

    expect(parentElement.firstChild).toEqual(null)
    expect(parentElement.lastChild).toEqual(null)
    expect(createdChildren.getFragment('0')).toBeUndefined()
  })
})
