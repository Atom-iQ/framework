import { childrenArrayToFragment } from 'renderer/utils'
import { RvdNodeFlags } from 'shared/flags'

import * as ELEMENTS from '../../../../__mocks__/elements'

describe('Fragment utils', () => {
  test('childrenArrayToFragment should transform children array to fragment', () => {
    const fragment = childrenArrayToFragment(ELEMENTS.KEYED_CHILDREN_ARRAY, 0)
    expect(fragment).toEqual({
      ...ELEMENTS.KEYED_FRAGMENT,
      flag: RvdNodeFlags.Fragment,
      index: 0
    })
    const fragment2 = childrenArrayToFragment([ELEMENTS.getFragmentChild('class-1')], 0)
    expect(fragment2).toEqual({
      ...ELEMENTS.NON_KEYED_FRAGMENT_ONE_CHILD,
      flag: RvdNodeFlags.Fragment,
      index: 0
    })
  })
})
