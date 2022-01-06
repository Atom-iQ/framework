import { _FRAGMENT } from 'shared'

describe('Shared constant - to be sure it`s not changed unintentionally', () => {
  test('_FRAGMENT constant should have "_F_" value', () => {
    expect(_FRAGMENT).toBe('_F_')
  })
})
