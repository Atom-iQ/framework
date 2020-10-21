import * as ELEMENTS from '../../../../__mocks__/elements'
import {
  childrenArrayToFragment,
  createDomElement,
  getFlattenFragmentChildren
} from '../../../../../src/rv-dom/renderer/utils'
import { CreatedChild } from '../../../../../src/shared/types'
import createChildrenManager from '../../../../../src/rv-dom/renderer/utils/children-manager'
import { _FRAGMENT } from '../../../../../src/shared'
import { RvdChildFlags, RvdElementFlags } from '../../../../../src/shared/flags'

describe('Fragment utils', () => {
  test('childrenArrayToFragment should transform children array to fragment', () => {
    const fragment = childrenArrayToFragment(ELEMENTS.KEYED_CHILDREN_ARRAY)
    expect(fragment).toEqual({
      ...ELEMENTS.KEYED_FRAGMENT,
      elementFlag: RvdElementFlags.Fragment,
      childFlags: RvdChildFlags.HasMultipleUnknownChildren
    })
    const fragment2 = childrenArrayToFragment([ELEMENTS.getFragmentChild('class-1')])
    expect(fragment2).toEqual({
      ...ELEMENTS.NON_KEYED_FRAGMENT_ONE_CHILD,
      elementFlag: RvdElementFlags.Fragment,
      childFlags: RvdChildFlags.HasSingleUnknownChild
    })
  })

  test('getFlattenFragmentChildren should return children from all nested fragments/arrays', () => {
    const createdChildren = createChildrenManager()
    createdChildren.createEmptyFragment('0')
    const fragment = createdChildren.getFragment('0')
    for (let i = 0; i < 10; i++) {
      const index = `0.${i}`
      createdChildren.addFragment(index, {
        element: _FRAGMENT,
        fragmentChildIndexes: [],
        fragmentChildKeys: {},
        fragmentChildrenLength: 0,
        index
      })
      fragment.fragmentChildIndexes.push(index)
      ++fragment.fragmentChildrenLength
      const nestedFragment = createdChildren.getFragment(index)
      for (let j = 0; j < 10; j++) {
        const elIndex = `${index}.${j}`
        createdChildren.add(elIndex, {
          index: elIndex,
          element: createDomElement('div', false)
        })
        nestedFragment.fragmentChildIndexes.push(elIndex)
        ++nestedFragment.fragmentChildrenLength
      }
    }
    let expected = []
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        expected = expected.concat({
          index: `0.${i}.${j}`,
          element: createDomElement('div', false)
        })
      }
    }

    const flatten = fragment.fragmentChildIndexes.reduce<(CreatedChild | string)[]>(
      getFlattenFragmentChildren(createdChildren),
      []
    )
    expect(flatten).toEqual(expected)
  })
})
