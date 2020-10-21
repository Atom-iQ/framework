import { RvdChild, RvdComponent, RvdContextFieldUnion } from '@atom-iq/core'

export type ContextMiddlewareProp = <T extends RvdContextFieldUnion>(fieldName: string) => T

export interface WithContext {
  context: ContextMiddlewareProp
}

export type CreateContextMiddlewareProp = (fieldName: string, value: RvdContextFieldUnion) => void

export interface WithCreateContext {
  createContext: CreateContextMiddlewareProp
}

export type ContextProviderComponent = RvdComponent<{ children: RvdChild }, WithCreateContext>
