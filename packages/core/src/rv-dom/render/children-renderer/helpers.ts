import { switchMap } from 'rxjs/operators'
import {
  RvdObservableComponentNode,
  RvdObservableFragmentNode,
  RvdObservableNode,
  StreamChildFn,
  SwitchMapChildFn
} from '@@types'
import {
  childTypeSwitch,
  nullObservable,
  syncObservable,
  createTextNode,
  childrenArrayToFragment
} from '../utils'
import { renderRvdComponent, renderRvdElement, renderRvdFragment } from '../render'

type ON = RvdObservableNode
type FN = RvdObservableFragmentNode
type CN = RvdObservableComponentNode

export const streamChildToParent: StreamChildFn = childTypeSwitch<ON, FN, CN>(
  nullObservable,
  textChild => syncObservable({
    dom: createTextNode(String(textChild)),
    elementSubscription: null
  }),
  arrayChild => renderRvdFragment(childrenArrayToFragment(arrayChild)),
  renderRvdComponent,
  renderRvdFragment,
  renderRvdElement
)

export const switchMapChild: SwitchMapChildFn = () => switchMap(streamChildToParent)

