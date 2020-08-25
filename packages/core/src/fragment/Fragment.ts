import { RvdComponent } from '../shared/types'
import { createRvdElement } from '../rv-dom/create-element'
import { _FRAGMENT } from '../shared'

export const Fragment: RvdComponent<{ children }> = ({ children }) => {
  return createRvdElement(_FRAGMENT, {}, children)
}
