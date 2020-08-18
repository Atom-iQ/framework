import {RvdComponentProps, RvdChild, RvdComponentElement} from '@@types'

const getComponentProps = (
  rvdComponent: RvdComponentElement
): RvdComponentProps => {
  const componentProps = rvdComponent.props
  if (rvdComponent.children) {
    componentProps.children = rvdComponent.children
  }
  return componentProps
}

const createComponent = (
  rvdComponent: RvdComponentElement
): RvdChild | RvdChild[] => {
  return rvdComponent._component(getComponentProps(rvdComponent))
}

export default createComponent
