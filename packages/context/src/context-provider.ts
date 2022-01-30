import type { RvdContextFieldUnion } from '@atom-iq/core'

import type { ContextProviderComponent } from './types'

/**
 * Context Provider
 *
 * Factory function for Provider. Takes field name and value, or object with
 * names and values and provides access to the new context for children.
 * @param fieldNameOrFieldsObject
 * @param fieldValue
 */
export const contextProvider = (
  fieldNameOrFieldsObject: string | { [fieldName: string]: RvdContextFieldUnion },
  fieldValue?: RvdContextFieldUnion
): ContextProviderComponent => {
  const Provider: ContextProviderComponent = ({ children }, { createContext }) => {
    if (typeof fieldNameOrFieldsObject === 'string') {
      createContext(fieldNameOrFieldsObject, fieldValue)
    } else {
      for (const fieldName in fieldNameOrFieldsObject) {
        const fieldValue = fieldNameOrFieldsObject[fieldName]
        createContext(fieldName, fieldValue)
      }
    }

    return children
  }

  Provider.useMiddlewares = ['createContext']

  return Provider
}
