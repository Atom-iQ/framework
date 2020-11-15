import { contextProvider } from '../src'
import { RvdDOMElement, RvdElementFlags } from '@atom-iq/core'

describe('Context Provider', () => {
  // eslint-disable-next-line max-len
  test('should return Provider component, that`s calling createContext on init with fieldName and fieldValue from args and returning children', () => {
    const Provider = contextProvider('test', 'test')
    const mockCreateContext = jest.fn()
    const mockChildren: RvdDOMElement = {
      type: 'div',
      flag: RvdElementFlags.HtmlElement
    }

    const result = Provider(
      {
        children: mockChildren
      },
      {
        createContext: mockCreateContext
      }
    )

    expect(result).toBe(mockChildren)
    expect(mockCreateContext).toBeCalledWith('test', 'test')
  })

  // eslint-disable-next-line max-len
  test('should return Provider component, that`s calling createContext on init for all fields specified in object in first argument', () => {
    const Provider = contextProvider({
      test: 'test',
      mock: 'mock'
    })
    const mockCreateContext = jest.fn()
    const mockChildren: RvdDOMElement = {
      type: 'div',
      flag: RvdElementFlags.HtmlElement
    }

    const result = Provider(
      {
        children: mockChildren
      },
      {
        createContext: mockCreateContext
      }
    )

    expect(result).toBe(mockChildren)
    expect(mockCreateContext).toBeCalledWith('test', 'test')
    expect(mockCreateContext).toBeCalledWith('mock', 'mock')
    expect(mockCreateContext).toBeCalledTimes(2)
  })

  // eslint-disable-next-line max-len
  test('should return Provider component, that`s calling createContext on init with fieldName and undefined as fieldValue, when first arg is string and second is not passed', () => {
    const Provider = contextProvider('test')
    const mockCreateContext = jest.fn()
    const mockChildren: RvdDOMElement = {
      type: 'div',
      flag: RvdElementFlags.HtmlElement
    }

    const result = Provider(
      {
        children: mockChildren
      },
      {
        createContext: mockCreateContext
      }
    )

    expect(result).toBe(mockChildren)
    expect(mockCreateContext).toBeCalledWith('test', undefined)
  })
})
