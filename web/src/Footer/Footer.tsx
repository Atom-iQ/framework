import { RvdComponent, useContext } from '@atom-iq/core'
import './Footer.scss'

const Footer: RvdComponent = () => {
  const version = useContext<string>('atomiqVersion')

  return (
    <footer class="footer">
      <div class="footer__bar" />
      <section class="footer__content">
        <section class="footer__name">
          created in Atom-iQ Framework {version}
        </section>
        <section class="footer__copyright">
          <a href="https://github.com/adamf92" target="_blank">
            &copy; 2020 - 2021 Adam Filipek
          </a>
        </section>
      </section>
    </footer>
  )
}

export default Footer
