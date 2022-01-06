import { createState } from 'component/state'
import { first } from 'rxjs/operators'

describe('createState function', () => {
  test('should return Observable with initial value as first element', done => {
    const [state] = createState<string>('test')
    first<string>()(state).subscribe(value => {
      expect(value).toBe('test')
      done()
    })
  })

  test('calling nextState (2nd return element) should emit next value', done => {
    const [state, nextState] = createState<string>('test')
    let count = 0
    const sub = state.subscribe(value => {
      if (count === 0) {
        expect(value).toBe('test')
        count++
      } else if (count === 1) {
        expect(value).toBe('new test')
        count++
      } else if (count === 2) {
        expect(value).toBe('second new test')
        sub.unsubscribe()
        done()
      }
    })
    nextState('new test')
    nextState(state => `second ${state}`)
  })
})
