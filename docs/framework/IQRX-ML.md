# iQRxML
##### Atom-iQ Reactive eXtended Markup (micro) Language
```typescript jsx
import { createState, RvdComponent, RxO, iQStaticHtml } from '@atom-iq/core'
import { iQRxIf, iQRxList, iQRxDistinctMap } from '@atom-iq/rx'
import iQRxML from '@atom-iq/rx-ml'
import { map } from "rxjs/operators"

import { TestOne, TestTwo, TestThree } from './test-components'

interface ExampleProps {
  propsNumber: RxO<number>
  propsStrings: RxO<string[]>
  shouldRenderAdditionalStatic: RxO<boolean>
}

iQRxML(registeredComponents => ({
  ...registeredComponents,
  TestOne,
  TestTwo,
  TestThree
}))

const IQRxMLExample: RvdComponent<ExampleProps> = ({ propsNumber, propsStrings, shouldRenderAdditionalStatic }) => {
  const [header, nextHeader] = createState('iQRxML')
  
  const shouldShowP = iQRxDistinctMap(propsNumber)(number => number >= 7)

  const third = iQRxML`<TestThree />`

  const JSXinIQRxML = <div class="JSX">JSX IN iQRxML</div>

  return iQRxML`
    <TestOne language=${header}>
      <header class="iQRxML__HEADER">${header}</header>
      <iQRx ${shouldShowP} |> iQRxIf ->
        <p class="iQRxML__NUMBER">${propsNumber}</p>
      <->
        <span class="iQRxML__NUMBER">${propsNumber}</span>
      </iQRx>
      <section class="iQRxML__ARRAY">
        <iQRx ${propsStrings} |> ${map(aS => [...aS, ...aS])} |> iQRxList -> str => 
          <TestTwo text={str} />
        </iQRx>
      </section>
      <iQRx ${shouldRenderAdditionalStatic} |> iQRxIf ->
        ${iQStaticHtml`
          <section class="iQRxML__STATIC-HTML">
            <header>
              <h2>STATIC HTML IN</h3>
              <h3>${header}</h3>
            </header>
            <div class="iQRxML__INTERPOLATED">
              ${third}
            </div>
          </section>
        `}
      </iQRx>
      ${JSXinIQRxML}
    </TestOne>
  `
}
```
