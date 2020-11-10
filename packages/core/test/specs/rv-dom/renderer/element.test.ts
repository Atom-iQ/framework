import { renderRvdElement } from '../../../../src/reactive-virtual-dom/renderer/element'
import * as ELEMENTS from '../../../__mocks__/elements'
import * as COMPONENTS from '../../../__mocks__/components'
import {
  createDomElement,
  createTextNode
} from '../../../../src/reactive-virtual-dom/renderer/utils'
import { Subscription } from 'rxjs'
import { RvdComponentElement, RvdDOMElement } from '../../../../src/shared/types'
import { createState } from '../../../../src/component/state'
import { map } from 'rxjs/operators'
import { createRvdElement } from '../../../../src/reactive-virtual-dom/create-element'
import { RvdChildFlags, RvdElementFlags } from '../../../../src/shared/flags'
/* eslint-disable max-len */
describe('Element renderer', () => {
  describe('renderRvdElement should create DOM element, render children, call render callback with dom element and element subscription and connect props', () => {
    // Empty
    test('Empty element - should call render callback with created element', () => {
      const rvdElement = ELEMENTS.EMPTY
      const callback = (element, elementSubscription) => {
        expect(element).toEqual(createDomElement(rvdElement.type, false))
        expect(elementSubscription instanceof Subscription).toBeTruthy()
      }
      renderRvdElement(rvdElement, {}, callback)
    })

    // Static props/children
    test('Element with static className - should call render callback with created element with added className', () => {
      const rvdElement = ELEMENTS.CLASSNAME
      const callback = (element, elementSubscription) => {
        const mockDomElement = createDomElement(rvdElement.type, false) as HTMLElement
        mockDomElement.className = 'mock-div'

        expect(element).toEqual(mockDomElement)
        expect(elementSubscription instanceof Subscription).toBeTruthy()
      }
      renderRvdElement(rvdElement, {}, callback)
    })

    test('Element with static props (with id) and className - should call render callback with created element with added attributes, id and className', done => {
      const rvdElement = ELEMENTS.CLASSNAME_AND_PROPS
      const callback = (element, elementSubscription) => {
        const mockDomElement = createDomElement(rvdElement.type, false) as HTMLElement
        mockDomElement.className = 'mock-div'
        mockDomElement.id = 'mock-div-id'
        mockDomElement.setAttribute('title', 'mock-title-prop')

        // Props are connected after calling render callback
        setTimeout(() => {
          expect(element).toEqual(mockDomElement)
          expect(elementSubscription instanceof Subscription).toBeTruthy()
          done()
        })
      }
      renderRvdElement(rvdElement, {}, callback)
    })

    test('Element with static props (with id), className and one static Element child - should call render callback with created element, with rendered child and added attributes, id and className', done => {
      const rvdElement = ELEMENTS.CLASSNAME_PROPS_AND_ONE_CHILD
      const callback = (element, elementSubscription) => {
        const mockDomElement = createDomElement(rvdElement.type, false) as HTMLElement
        mockDomElement.className = 'mock-div'
        mockDomElement.id = 'mock-div-id'
        mockDomElement.setAttribute('title', 'mock-title-prop')

        const childRvdElement = rvdElement.children as RvdDOMElement
        const mockChildDomElement = createDomElement(childRvdElement.type, false) as HTMLElement
        mockChildDomElement.className = 'mock-child-span'
        mockChildDomElement.appendChild(createTextNode('mock child text'))

        mockDomElement.appendChild(mockChildDomElement)

        // Props are connected after calling render callback
        setTimeout(() => {
          expect(element).toEqual(mockDomElement)
          expect(elementSubscription instanceof Subscription).toBeTruthy()
          done()
        })
      }
      renderRvdElement(rvdElement, {}, callback)
    })

    test('Element with static props (with id), className and many static Element/Text/Component children - should call render callback with created element, with rendered children and added attributes, id and className', done => {
      const rvdElement = {
        ...ELEMENTS.CLASSNAME_MANY_PROPS_AND_MANY_CHILDREN,
        children: [
          ...(ELEMENTS.CLASSNAME_MANY_PROPS_AND_MANY_CHILDREN.children as (
            | RvdDOMElement
            | string
            | RvdComponentElement
          )[]),
          COMPONENTS.COMPONENT_ELEMENT
        ]
      }
      const callback = (element, elementSubscription) => {
        const mockDomElement = createDomElement(rvdElement.type, false) as HTMLElement
        mockDomElement.className = 'mock-div'
        mockDomElement.id = 'mock-div-id'
        mockDomElement.setAttribute('title', 'mock-title-prop')

        const children = rvdElement.children as (RvdDOMElement | string | RvdComponentElement)[]

        children.forEach(child => {
          if (typeof child === 'string') {
            mockDomElement.appendChild(createTextNode(child))
          } else if (
            child.elementFlag === RvdElementFlags.Component &&
            typeof child.type === 'function'
          ) {
            const componentElement = child.type({})
            const innerCallback = element => {
              mockDomElement.appendChild(element)
            }
            renderRvdElement(componentElement as RvdDOMElement, {}, innerCallback)
          } else if (typeof child.type === 'string') {
            const mockChildDomElement = createDomElement(child.type, false) as HTMLElement
            if (child.className) {
              mockChildDomElement.className = child.className as string
            }

            mockChildDomElement.appendChild(createTextNode(child.children as string))

            mockDomElement.appendChild(mockChildDomElement)
          }
        })

        // Props are connected after calling render callback
        setTimeout(() => {
          expect(element).toEqual(mockDomElement)
          expect(elementSubscription instanceof Subscription).toBeTruthy()
          done()
        })
      }
      renderRvdElement(rvdElement, {}, callback)
    })

    // Observable props/children
    test('Element with Observable className - should create Observer on className (connect), updating it on every next value, and call render callback with created element', () => {
      const [className, nextClassName] = createState<string>('mock-div')
      const rvdElement = ELEMENTS.OBSERVABLE_CLASSNAME(className)
      const callback = (element, elementSubscription) => {
        const mockDomElement = createDomElement(rvdElement.type, false) as HTMLElement
        mockDomElement.className = 'mock-div'

        const createdDomElement = element as HTMLElement
        // Initial
        expect(createdDomElement).toEqual(mockDomElement)
        expect(elementSubscription instanceof Subscription).toBeTruthy()
        // First update
        nextClassName('updated-mock-div')
        expect(createdDomElement.className).toBe('updated-mock-div')
        // Second update
        nextClassName('updated-again-mock-div')
        expect(createdDomElement.className).toBe('updated-again-mock-div')
        // Unsubscribe and not visible update
        elementSubscription.unsubscribe()
        nextClassName('not-visible')
        expect(createdDomElement.className).not.toBe('not-visible')
      }
      renderRvdElement(rvdElement, {}, callback)
    })

    test('Element with Observable props (with id) and className - should create Observer on props (with className), updating them on every next value, and call render callback with created element', done => {
      const [className, nextClassName] = createState<string>('mock-div')
      const [id, nextId] = createState<string>('mock-div-id')
      const [title, nextTitle] = createState<string>('mock-title-prop')
      const rvdElement = ELEMENTS.OBSERVABLE_CLASSNAME_AND_OBSERVABLE_PROPS(className, {
        id,
        title
      })
      const callback = (element, elementSubscription) => {
        const mockDomElement = createDomElement(rvdElement.type, false) as HTMLElement

        const updateRvdNodeAndMock = (updatesSetNumber: 0 | 1 | 2 | null) => {
          const baseProps = {
            className: 'mock-div',
            id: 'mock-div-id',
            title: 'mock-title-prop'
          }

          const newProps = {
            className: '',
            id: '',
            title: ''
          }

          switch (updatesSetNumber) {
            case 0:
              mockDomElement.className = baseProps.className
              mockDomElement.id = baseProps.id
              mockDomElement.setAttribute('title', baseProps.title)
              return
            case 1:
              for (const propName in newProps) {
                newProps[propName] = `updated-${baseProps[propName]}`
              }
              break
            case 2:
              for (const propName in newProps) {
                newProps[propName] = `updated-again-${baseProps[propName]}`
              }
              break
            default:
              for (const propName in newProps) {
                newProps[propName] = `not-visible`
              }
              break
          }

          nextClassName(newProps.className)
          nextId(newProps.id)
          nextTitle(newProps.title)
          if (updatesSetNumber) {
            mockDomElement.className = newProps.className
            mockDomElement.id = newProps.id
            mockDomElement.setAttribute('title', newProps.title)
          }
        }

        const createdDomElement = element as HTMLElement

        // Props are connected after calling render callback
        setTimeout(() => {
          // Initial
          updateRvdNodeAndMock(0)
          expect(createdDomElement).toEqual(mockDomElement)
          expect(elementSubscription instanceof Subscription).toBeTruthy()
          // First set of updates
          updateRvdNodeAndMock(1)
          expect(createdDomElement).toEqual(mockDomElement)
          // Second set of updates
          updateRvdNodeAndMock(2)
          expect(createdDomElement).toEqual(mockDomElement)
          // Unsubscribe and set of not visible updates
          elementSubscription.unsubscribe()
          updateRvdNodeAndMock(null)
          expect(createdDomElement).toEqual(mockDomElement)
          expect(createdDomElement.className).not.toBe('not-visible')
          expect(createdDomElement.id).not.toBe('not-visible')
          expect(createdDomElement.getAttribute('title')).not.toBe('not-visible')
          done()
        })
      }
      renderRvdElement(rvdElement, {}, callback)
    })

    test('Element with Observable props (with id), className and one Observable Element child - should create Observer on props (with className) and on child node, updating them on every next value, and call render callback with created element', done => {
      const [className, nextClassName] = createState<string>('mock-div')
      const [id, nextId] = createState<string>('mock-div-id')
      const [title, nextTitle] = createState<string>('mock-title-prop')
      const [updatesNumber, nextUpdatesNumber] = createState<number | null>(0)
      const baseMockChildClassName = 'mock-child-span'
      const baseMockChildText = 'mock child text'

      const rvdElement = ELEMENTS.OBSERVABLE_CLASSNAME_PROPS_AND_ONE_CHILD(
        className,
        {
          id,
          title
        },
        map(updatesSetNumber => {
          switch (updatesSetNumber) {
            case 0:
              return createRvdElement(
                RvdElementFlags.HtmlElement,
                'span',
                baseMockChildClassName,
                null,
                'mock child text',
                RvdChildFlags.HasSingleStaticChild
              )
            case 1:
              return createRvdElement(
                RvdElementFlags.HtmlElement,
                'span',
                `updated-${baseMockChildClassName}`,
                null,
                `updated ${baseMockChildText}`,
                RvdChildFlags.HasSingleStaticChild
              )
            case 2:
              return createRvdElement(
                RvdElementFlags.HtmlElement,
                'span',
                `updated-again-${baseMockChildClassName}`,
                null,
                `updated again ${baseMockChildText}`,
                RvdChildFlags.HasSingleStaticChild
              )
            default:
              return 'not-visible'
          }
        })(updatesNumber)
      )
      const callback = (element, elementSubscription) => {
        const mockDomElement = createDomElement(rvdElement.type, false) as HTMLElement

        const updateRvdNodeAndMock = (updatesSetNumber: 0 | 1 | 2 | null) => {
          const baseProps = {
            className: 'mock-div',
            id: 'mock-div-id',
            title: 'mock-title-prop'
          }

          const baseMockChild = createDomElement('span', false) as HTMLElement
          baseMockChild.className = baseMockChildClassName
          baseMockChild.appendChild(createTextNode(baseMockChildText))

          const newProps = {
            className: '',
            id: '',
            title: ''
          }

          let newMockChild = null

          switch (updatesSetNumber) {
            case 0:
              mockDomElement.className = baseProps.className
              mockDomElement.id = baseProps.id
              mockDomElement.setAttribute('title', baseProps.title)
              mockDomElement.appendChild(baseMockChild)
              return
            case 1:
              for (const propName in newProps) {
                newProps[propName] = `updated-${baseProps[propName]}`
              }
              nextUpdatesNumber(1)
              newMockChild = createDomElement('span', false) as HTMLElement
              newMockChild.className = `updated-${baseMockChildClassName}`
              newMockChild.appendChild(createTextNode(`updated ${baseMockChildText}`))
              mockDomElement.removeChild(mockDomElement.firstChild)
              mockDomElement.appendChild(newMockChild)
              break
            case 2: {
              for (const propName in newProps) {
                newProps[propName] = `updated-again-${baseProps[propName]}`
              }
              nextUpdatesNumber(2)
              const secondMockChild = createDomElement('span', false) as HTMLElement

              secondMockChild.className = `updated-again-${baseMockChildClassName}`
              secondMockChild.appendChild(createTextNode(`updated again ${baseMockChildText}`))
              mockDomElement.removeChild(mockDomElement.firstChild)
              mockDomElement.appendChild(secondMockChild)
              break
            }
            default:
              for (const propName in newProps) {
                newProps[propName] = `not-visible`
              }
              break
          }

          nextClassName(newProps.className)
          nextId(newProps.id)
          nextTitle(newProps.title)
          if (updatesSetNumber) {
            mockDomElement.className = newProps.className
            mockDomElement.id = newProps.id
            mockDomElement.setAttribute('title', newProps.title)
          }
        }

        const createdDomElement = element as HTMLElement
        // Props are connected after calling render callback
        setTimeout(() => {
          // Initial
          updateRvdNodeAndMock(0)
          expect(createdDomElement).toEqual(mockDomElement)
          expect(elementSubscription instanceof Subscription).toBeTruthy()
          // First set of updates
          updateRvdNodeAndMock(1)
          expect(createdDomElement).toEqual(mockDomElement)
          // Second set of updates
          updateRvdNodeAndMock(2)
          expect(createdDomElement).toEqual(mockDomElement)
          // Unsubscribe and set of not visible updates
          elementSubscription.unsubscribe()
          updateRvdNodeAndMock(null)
          expect(createdDomElement).toEqual(mockDomElement)
          expect(createdDomElement.className).not.toBe('not-visible')
          expect(createdDomElement.id).not.toBe('not-visible')
          expect(createdDomElement.getAttribute('title')).not.toBe('not-visible')
          expect(createdDomElement.firstChild).not.toBe('not-visible')
          done()
        })
      }
      renderRvdElement(rvdElement, {}, callback)
    })

    test('Element with Observable props (with id), className and many Observable Element/Text children - should return created element, with rendered children and added attributes, id and className', done => {
      const [className, nextClassName] = createState<string>('mock-div')
      const [id, nextId] = createState<string>('mock-div-id')
      const [title, nextTitle] = createState<string>('mock-title-prop')
      const [updatesNumber, nextUpdatesNumber] = createState<number | null>(0)
      const baseMockChildClassName = 'mock-child-span'
      const baseMockChildText = 'mock child text'

      const mapElement = (className, text) =>
        map(updatesSetNumber => {
          switch (updatesSetNumber) {
            case 0:
              return createRvdElement(
                RvdElementFlags.HtmlElement,
                'span',
                className,
                null,
                text,
                RvdChildFlags.HasSingleStaticChild
              )
            case 1:
              return createRvdElement(
                RvdElementFlags.HtmlElement,
                'span',
                `updated-${className}`,
                null,
                `updated ${text}`,
                RvdChildFlags.HasSingleStaticChild
              )
            case 2:
              return createRvdElement(
                RvdElementFlags.HtmlElement,
                'span',
                `updated-again-${className}`,
                null,
                `updated again ${text}`,
                RvdChildFlags.HasSingleStaticChild
              )
            default:
              return 'not-visible'
          }
        })(updatesNumber)

      const rvdElement = ELEMENTS.OBSERVABLE_CLASSNAME_MANY_PROPS_AND_MANY_CHILDREN(
        className,
        {
          id,
          title
        },
        [
          mapElement(`${baseMockChildClassName}-1`, `${baseMockChildText}-1`),
          map(updatesSetNumber => `mock text center child ${updatesSetNumber}`)(updatesNumber),
          mapElement(`${baseMockChildClassName}-2`, `${baseMockChildText}-2`)
        ]
      )
      const callback = (element, elementSubscription) => {
        const mockDomElement = createDomElement(rvdElement.type, false) as HTMLElement

        const updateRvdNodeAndMock = (updatesSetNumber: 0 | 1 | 2 | null) => {
          const baseProps = {
            className: 'mock-div',
            id: 'mock-div-id',
            title: 'mock-title-prop'
          }

          const createMockChild = (number: 1 | 2, prefix?: string) => {
            const mockChild = createDomElement('span', false) as HTMLElement
            mockChild.className = `${prefix ? `${prefix}-` : ''}${baseMockChildClassName}-${number}`
            mockChild.appendChild(
              createTextNode(
                `${prefix ? `${prefix.replace('-', ' ')} ` : ''}${baseMockChildText}-${number}`
              )
            )
            return mockChild
          }

          const baseMockChildren = [
            createMockChild(1),
            createTextNode('mock text center child 0'),
            createMockChild(2)
          ]

          const newProps = {
            className: '',
            id: '',
            title: ''
          }

          switch (updatesSetNumber) {
            case 0:
              mockDomElement.className = baseProps.className
              mockDomElement.id = baseProps.id
              mockDomElement.setAttribute('title', baseProps.title)
              baseMockChildren.forEach(child => {
                mockDomElement.appendChild(child)
              })
              return
            case 1: {
              for (const propName in newProps) {
                newProps[propName] = `updated-${baseProps[propName]}`
              }
              nextUpdatesNumber(1)
              const newMockChildren = [
                createMockChild(1, 'updated'),
                createTextNode('mock text center child 1'),
                createMockChild(2, 'updated')
              ]
              while (mockDomElement.firstChild) {
                mockDomElement.removeChild(mockDomElement.firstChild)
              }

              newMockChildren.forEach(child => {
                mockDomElement.appendChild(child)
              })
              break
            }
            case 2: {
              for (const propName in newProps) {
                newProps[propName] = `updated-again-${baseProps[propName]}`
              }
              nextUpdatesNumber(2)
              const secondMockChildren = [
                createMockChild(1, 'updated-again'),
                createTextNode('mock text center child 2'),
                createMockChild(2, 'updated-again')
              ]
              while (mockDomElement.firstChild) {
                mockDomElement.removeChild(mockDomElement.firstChild)
              }

              secondMockChildren.forEach(child => {
                mockDomElement.appendChild(child)
              })
              break
            }
            default:
              for (const propName in newProps) {
                newProps[propName] = `not-visible`
              }
              break
          }

          nextClassName(newProps.className)
          nextId(newProps.id)
          nextTitle(newProps.title)
          if (updatesSetNumber) {
            mockDomElement.className = newProps.className
            mockDomElement.id = newProps.id
            mockDomElement.setAttribute('title', newProps.title)
          }
        }

        const createdDomElement = element as HTMLElement
        // Props are connected after calling render callback
        setTimeout(() => {
          // Initial
          updateRvdNodeAndMock(0)
          expect(createdDomElement).toEqual(mockDomElement)
          expect(elementSubscription instanceof Subscription).toBeTruthy()
          // First set of updates
          updateRvdNodeAndMock(1)
          expect(createdDomElement).toEqual(mockDomElement)
          // Second set of updates
          updateRvdNodeAndMock(2)
          expect(createdDomElement).toEqual(mockDomElement)
          // Unsubscribe and set of not visible updates
          elementSubscription.unsubscribe()
          updateRvdNodeAndMock(null)
          expect(createdDomElement).toEqual(mockDomElement)
          expect(createdDomElement.className).not.toBe('not-visible')
          expect(createdDomElement.id).not.toBe('not-visible')
          expect(createdDomElement.getAttribute('title')).not.toBe('not-visible')
          expect(createdDomElement.firstChild).not.toBe('not-visible')
          done()
        })
      }
      renderRvdElement(rvdElement, {}, callback)
    })
  })
})
