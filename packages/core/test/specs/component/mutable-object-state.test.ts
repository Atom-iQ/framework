import { mutableObjectState } from '../../../src/component/state/mutable-object-state'

describe('mutable object state', () => {
  it('should track mutations of state object', done => {
    let initSub = true

    const staticNum = 2

    const initial = {
      first: 'test',
      second: 'of mutations',
      third: null,
      num: 100,
      id: 123,
      done: false
    }

    const [state, connect] = mutableObjectState(initial)

    const concatStrings = () => {
      state.third = state.first + ' ' + state.second
    }

    const mathOperation = (num: number) => {
      state.num = state.num + state.id + num
    }

    const setDone = () => {
      state.done = true
    }

    connect('third').subscribe(v => {
      console.log(v)
      if (initSub) {
        expect(v).toBeNull()
      } else {
        expect(v).toEqual('test of mutations')
      }
    })

    connect('num').subscribe(v => {
      console.log(v)
      if (initSub) {
        expect(v).toBe(100)
      } else {
        expect(v).toEqual(223 + staticNum)
      }
    })

    connect('done').subscribe(v => {
      console.log(v)
      if (initSub) {
        expect(v).toBeFalsy()
      } else if (v) {
        expect(v).toBeTruthy()
        done()
      }
    })

    initSub = false
    concatStrings()
    mathOperation(staticNum)
    setDone()
  })
})
