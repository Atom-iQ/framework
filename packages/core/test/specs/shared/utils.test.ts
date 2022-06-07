import { isFunction } from '@atom-iq/fx'
import { isArray, isStringOrNumber, isNullOrUndef, isString, isBoolean } from 'shared'

const testObject = { testField: 'test' }
const testArray = ['test', 'test2']
const testString = 'test string'
const testNumber = 21

describe('Shared utils - type checks', () => {
  test('isArray should return true for array', () => {
    expect(isArray(testObject)).toBeFalsy()
    expect(isArray(null)).toBeFalsy()
    expect(isArray(testArray)).toBeTruthy()
  })

  test('isStringOrNumber should return true for string or number', () => {
    expect(isStringOrNumber(testObject)).toBeFalsy()
    expect(isStringOrNumber(null)).toBeFalsy()
    expect(isStringOrNumber(testString)).toBeTruthy()
    expect(isStringOrNumber(testNumber)).toBeTruthy()
  })

  test('isNullOrUndef should return true for null or undefined', () => {
    expect(isNullOrUndef(testObject)).toBeFalsy()
    expect(isNullOrUndef(testString)).toBeFalsy()
    expect(isNullOrUndef(null)).toBeTruthy()
    expect(isNullOrUndef(undefined)).toBeTruthy()
  })

  test('isFunction should return true for function', () => {
    expect(isFunction(testObject)).toBeFalsy()
    expect(isFunction(testString)).toBeFalsy()
    expect(isFunction(null)).toBeFalsy()
    expect(isFunction(() => 'test')).toBeTruthy()
  })

  test('isString should return true for string', () => {
    expect(isString(testObject)).toBeFalsy()
    expect(isString(null)).toBeFalsy()
    expect(isString(testNumber)).toBeFalsy()
    expect(isString(testString)).toBeTruthy()
  })

  test('isBoolean should return true for boolean', () => {
    expect(isBoolean(testObject)).toBeFalsy()
    expect(isBoolean(null)).toBeFalsy()
    expect(isBoolean(testNumber)).toBeFalsy()
    expect(isBoolean(testString)).toBeFalsy()
    expect(isBoolean(true)).toBeTruthy()
    expect(isBoolean(false)).toBeTruthy()
  })
})
