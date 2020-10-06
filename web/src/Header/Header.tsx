import { RvdComponent, createState } from '@atom-iq/core'

import './Header.scss'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import logo from './logo.png'
import { interval, pipe } from 'rxjs'
import { map, startWith, withLatestFrom } from 'rxjs/operators'

const subheaderPrefixes: string[] = [
  'Next-gen',
  'Reactive',
  'Declarative',
  'Functional',
  'Scalable',
  'The Fastest'
]

const Header: RvdComponent = () => {
  const [prefixIndex, nextPrefixIndex] = createState(0)

  const subHeaderPrefix = pipe(
    withLatestFrom(prefixIndex),
    map(([_, index]: [null, number]) => {
      if (index === subheaderPrefixes.length - 1) {
        nextPrefixIndex(0)
      } else {
        nextPrefixIndex(i => ++i)
      }
      return subheaderPrefixes[index]
    })
  )(interval(1500))

  return (
    <header class="header">
      <section class="header__menu" />
      <div class="header__bar" />
      <section class="header__logo">
        <img src={logo} class="logo__img" />
      </section>
      <h3 class="header__subheader">
        <span class="subheader__prefix">{startWith('Atom-iQ')(subHeaderPrefix)}</span>
        <span class="subheader__suffix">Front-end Framework</span>
      </h3>
      <div class="header__bar" />
    </header>
  )
}

export default Header
