import { RvdComponent, createState, RxO } from '@atom-iq/core'

import './Header.scss'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import logo from './logo.png'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import gitHubMark from './GitHub-Mark-32px.png'
import { asyncScheduler, interval, pipe, scheduled } from 'rxjs'
import { concatAll, map, withLatestFrom } from 'rxjs/operators'

const subheaderPrefixes: string[] = [
  'Next-gen',
  'Reactive',
  'Declarative',
  'Functional',
  'Scalable',
  'The Fastest'
]

const startWithText = (text: string) => (source: RxO<string>) =>
  concatAll<string>()(scheduled([[text], source], asyncScheduler))

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
      <section class="header__menu">
        <article class="menu__info">
          The Atom-iQ Framework is in an early development stage. It's not ready for production apps
          and need a lot of tests, before it could be considered stable. More info on GitHub.
        </article>
        <section class="menu__right">
          <a href="https://github.com/atom-iq/atom-iq" target="_blank">
            <span>Check Atom-iQ GitHub</span>
            <img src={gitHubMark} />
          </a>
        </section>
      </section>
      <div class="header__bar" />
      <section class="header__logo">
        <img src={logo} class="logo__img" />
      </section>
      <h3 class="header__subheader">
        <span class="subheader__prefix">{startWithText('Atom-iQ')(subHeaderPrefix)}</span>
        <span class="subheader__suffix">Front-end Framework</span>
      </h3>
      <div class="header__bar" />
    </header>
  )
}

export default Header
