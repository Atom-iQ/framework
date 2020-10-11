import { RvdComponent } from '@atom-iq/core'
import './Footer.scss'

const Footer: RvdComponent = () => (
  <footer class="footer">
    <div class="footer__bar" />
    <section class="footer__content">
      <section class="footer__name">created in Atom-iQ Framework v0.1.0-beta.1</section>
      <section class="footer__copyright">
        <a href="https://github.com/adamf92" target="_blank">
          &copy; 2020 Adam Filipek
        </a>
      </section>
    </section>
  </footer>
)

export default Footer
