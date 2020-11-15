import * as ELEMENTS from '../../../../__mocks__/elements'
import { childrenArrayToFragment } from '../../../../../src/reactive-virtual-dom/renderer/utils'
import { RvdChildFlags, RvdNodeFlags } from '../../../../../src/shared/flags'

describe('Fragment utils', () => {
  test('childrenArrayToFragment should transform children array to fragment', () => {
    const fragment = childrenArrayToFragment(ELEMENTS.KEYED_CHILDREN_ARRAY)
    expect(fragment).toEqual({
      ...ELEMENTS.KEYED_FRAGMENT,
      flag: RvdNodeFlags.Fragment,
      childFlags: RvdChildFlags.HasMultipleUnknownChildren
    })
    const fragment2 = childrenArrayToFragment([ELEMENTS.getFragmentChild('class-1')])
    expect(fragment2).toEqual({
      ...ELEMENTS.NON_KEYED_FRAGMENT_ONE_CHILD,
      flag: RvdNodeFlags.Fragment,
      childFlags: RvdChildFlags.HasSingleUnknownChild
    })
  })
})
