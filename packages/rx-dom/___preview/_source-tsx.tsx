/* eslint-disable */
// @ts-nocheck
import {of} from "rxjs";
import {AnyFunction} from "rx-ui-shared";






const Header = ({ header, hElement }: { header: rx<string>, hElement: string }) => {
  return (
    <header>
      {hElement === 'h1' ? (
        <h1 className={'RX-DOM-' + hElement}>
          {mS(header, h => h + ' WOW!')}
        </h1>
      ) : (
        <h2 className={'RX-DOM-' + hElement}>
          {mS(header, h => h + ' WOW!')}
        </h2>
      )}
    </header>
  );
};

const Footer = ({ setHeader }: { setHeader: AnyFunction }) => {
  return (
    <footer>
      <button onClick={() => setHeader('Footer xD')}>Footer</button>
    </footer>
  );
};

const App = () => {
  const [header, setHeader] = useState('rX UI Suite');
  const [showFooter, setShowFooter] = useState(true);

  return (
    <main
      id="main"
      className={of("Rx-dom")}
      onClick={() => setShowFooter(false)}
    >
      <Header header={header} hElement="h1" />
      <section className="rx-dom__section">
        <Header header="New Section" hElement="h2"/>
      </section>
      {oIf(showFooter, <Footer setHeader={setHeader} />)}
    </main>
  );
};

// App returns








