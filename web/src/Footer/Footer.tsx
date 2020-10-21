import { RvdComponent } from '@atom-iq/core'
import './Footer.scss'
import { WithContext } from '@atom-iq/context'

const Footer: RvdComponent<{}, WithContext> = (_props, { context }) => {
  return (
    <footer class="footer">
      <div class="footer__bar" />
      <section class="footer__content">
        <section class="footer__name">
          created in Atom-iQ Framework {context<string>('atomiqVersion')}
        </section>
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
