import { RvdComponent, RvdContextFieldUnion } from '@atom-iq/core'
import './Footer.scss'
import { contextProvider, WithContext } from '@atom-iq/context'

const FooterChild: RvdComponent<{}, WithContext> = (_props, { context }) => {
  return context('testStatic') as string
}

FooterChild.useMiddlewares = ['context']

const Footer: RvdComponent<{}, WithContext> = (_props, { context }) => {
  const TestStatic = contextProvider('testStatic', 'new test static')
  return (
    <footer class="footer">
      <div class="footer__bar" />
      <section class="footer__content">
        <section class="footer__name">
          created in Atom-iQ Framework {context<string>('atomiqVersion')}
        </section>
        <TestStatic>
          <FooterChild />
        </TestStatic>
        <section class="footer__copyright">
          <a href="https://github.com/adamf92" target="_blank">
            &copy; 2020 Adam Filipek
          </a>
        </section>
      </section>
    </footer>
  )
}

Footer.useMiddlewares = ['context']

export default Footer
