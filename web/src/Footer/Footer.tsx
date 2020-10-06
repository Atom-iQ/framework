import { RvdComponent } from '@atom-iq/core'
import './Footer.scss'

const Footer: RvdComponent = () => (
  <footer class="footer">
    <div class="footer__bar" />
    <section class="footer__content">
      <section class="footer__name">Atom-iQ Framework v0.1.0-alpha.7</section>
      <section class="footer__copyright">&copy; 2020 Adam Filipek</section>
    </section>
  </footer>
)

export default Footer
