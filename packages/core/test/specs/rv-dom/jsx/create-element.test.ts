import createRxElement from '../../../../src/rv-dom/create-element'
import {MOCK_ELEMENT} from '../../../__mocks__/nodes'


describe('createRxElement', () => {
  describe('create DOM Element', () => {
    test(`should return rxNode with props and children set
      to null, if it's element without children and props`, () => {
      // example element <div />
      const element = createRxElement('div', {}, null)
      expect(element).toEqual(MOCK_ELEMENT.EMPTY)
    })

    test(`should return rxNode with one prop and children set
      to null, if it's element with one prop and without children`, () => {
      // example element <div className="mock-div" />
      const element = createRxElement(
        'div',
        { className: 'mock-div' },
        null
      )
      expect(element).toEqual(MOCK_ELEMENT.ONE_PROP)
    })

    test(`should return rxNode with one child and props set
      to null, if it's element with one child and without props`, () => {
      // example element <div><span className="mock-child-span">mock child text</span></div>
      const childSpan = createRxElement(
        'span',
        { className: 'mock-child-span' },
        ['mock child text']
      )

      const element = createRxElement(
        'div',
        {},
        [childSpan])
      expect(element).toEqual(MOCK_ELEMENT.ONE_CHILD)
    })
  })
})

