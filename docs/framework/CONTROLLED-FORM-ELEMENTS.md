# Atom-iQ Controlled Form Elements
Atom-iQ has controlled Elements for Input, TextArea and Select Elements. Controlled Form Elements
should have Reactive Event Handler connected or/and Observable `value` prop.

With **Observable** `value` prop, it looks similar to React form elements, and could use both
classic and reactive event handler. With only Reactive Event Handler connected, it (handler)
should return **Observable** with event mapped to value.

```typescript jsx
import { RvdComponent, createState, eventState } from '@atom-iq/core'
import { map } from 'rxjs'

const Form: RvdComponent = () => {
  const [inputValue, nextInputValue] = createState('value')
  const [checkboxValue, connectCheckbox] = eventState(map(e => {
    // do something
    return e.target.checked
  }))
  const [textAreaValue, nextTextAreaValue] = createState('textarea')
  const [selectValue, connectSelect] = eventState(map(e => {
    // do something
    return e.target.value
  }))
  
  return (
   <form>
    <input value={inputValue} onInput={e => nextInputValue(e.target.value)} />
    <input onInput$={map(e => /* do something */  e.target.value)} />
    <input type="checkbox" value={checkboxValue} onChange$={connectCheckbox()} />
    <input type="checkbox" onChange$={map(e => /* do something */  e.target.checked)} />
    <input type="checkbox" onChange$={connectCheckbox()} />
    <textarea value={textAreaValue} onInput$={e$ => map(e => nextTextAreaValue(e.target.value))(e$)} />
    <textarea onInput$={map(e => /* do something */  e.target.value)} />
    <select value={selectValue} onChange$={connectSelect()}>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
    </select>
    <select onChange$={connectSelect()}>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
    </select>
   </form> 
  )
}
```
