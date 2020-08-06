import {RvdElement, HTMLAttributes} from '@@shared'

export namespace MOCK_ELEMENT {
  export const EMPTY: RvdElement<{}> = {
    type: 'div',
    props: null,
    children: null
  }

  export const ONE_PROP: RvdElement<HTMLAttributes<HTMLDivElement>> = {
    type: 'div',
    props: {
      className: 'mock-div'
    },
    children: null
  }

  export const ONE_CHILD: RvdElement<HTMLAttributes<HTMLDivElement>> = {
    type: 'div',
    props: null,
    children: [{
      type: 'span',
      props: {
        className: 'mock-child-span'
      },
      children: ['mock child text']
    }]
  }

  export const ONE_PROP_AND_ONE_CHILD: RvdElement<HTMLAttributes<HTMLDivElement>> = {
    type: 'div',
    props: {
      className: 'mock-div'
    },
    children: [{
      type: 'span',
      props: {
        className: 'mock-child-span'
      },
      children: ['mock child text']
    }]
  }

  export const MANY_PROPS: RvdElement<HTMLAttributes<HTMLDivElement>> = {
    type: 'div',
    props: {
      className: 'mock-div',
      title: 'mock-title-prop',
      id: 'mock-div-id'
    },
    children: null
  }

  export const MANY_CHILDREN: RvdElement<HTMLAttributes<HTMLDivElement>> = {
    type: 'div',
    props: null,
    children: [{
      type: 'span',
      props: {
        className: 'mock-child-span'
      },
      children: ['mock span text']
    }, {
      type: 'section',
      props: null,
      children: ['mock section text']
    }]
  }

  export const MANY_PROPS_AND_ONE_CHILD: RvdElement<HTMLAttributes<HTMLDivElement>> = {
    type: 'div',
    props: {
      className: 'mock-div',
      title: 'mock-title-prop',
      id: 'mock-div-id'
    },
    children: [{
      type: 'span',
      props: {
        className: 'mock-child-span'
      },
      children: ['mock child text']
    }]
  }

  export const ONE_PROP_AND_MANY_CHILDREN: RvdElement<HTMLAttributes<HTMLDivElement>> = {
    type: 'div',
    props: {
      className: 'mock-div'
    },
    children: [{
      type: 'span',
      props: {
        className: 'mock-child-span'
      },
      children: ['mock span text']
    }, {
      type: 'section',
      props: null,
      children: ['mock section text']
    }]
  }

  export const MANY_PROPS_AND_MANY_CHILDREN: RvdElement<HTMLAttributes<HTMLDivElement>> = {
    type: 'div',
    props: {
      className: 'mock-div',
      title: 'mock-title-prop',
      id: 'mock-div-id'
    },
    children: [{
      type: 'span',
      props: {
        className: 'mock-child-span'
      },
      children: ['mock span text']
    }, {
      type: 'section',
      props: null,
      children: ['mock section text']
    }]
  }
}


