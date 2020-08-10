import 'rx-ui-shared/src/types/_global'
/**
 * Source .tsx of preview example - the
 * starting point
 *
 * Disabled ts and eslint checks, as rX DOM is
 * not compatible with create-element plugins at this moment
 *
 * RxO<T> type is shorthand for Observable<T>
 */
import {of} from 'rxjs'
import {tap} from 'rxjs/operators'
import {RxMouseEventHandler, RxO, RvdComponent} from '@reactive-ui/core'

interface HeaderProps {
  header: RxO<string>;
  hElement: string;
}

/**
 * Header component
 */
const Header: RvdComponent<HeaderProps> = ({
  header,
  hElement
}) => {
  return (
    <header>
      {hElement === 'h1' ? (
        <h1 className={'RX-DOM-' + hElement}>
          {mS(header, h => h + ' WOW!')}
        </h1>
      ) : (
        <h2 className={'RX-DOM-' + hElement}>
          <>
            {mS(header, h => h + ' WOW!')}
            {mS(header, () => 'Double WOW!')}
          </>
        </h2>
      )}
    </header>
  );
};

interface FooterProps {
  setHeader: rxComponent.RxSetStateFn<string>
}

const Footer: rxComponent.RxComponent<FooterProps> = ({ setHeader }) => {
  return (
    <footer>
      <button onClick={() => setHeader('Footer xD')}>Footer</button>
    </footer>
  );
};

const App = () => {
  const [header, setHeader] = rxState('rX UI Suite');
  const [showFooter, setShowFooter] = rxState(true);

  const handleToggleFooter: RxMouseEventHandler = event$ => event$.pipe(
    tap(() => {
      setShowFooter(show => !show);
    })
  );

  const arrayOne = ['test1', 'test2', 'test3'];
  const arrayStream = of(['test4', 'test5']);

  return (
    <main
      id="main"
      class={of('Rx-rv-dom')}
      onClick={() => setShowFooter(false)}
    >
      <>
        {arrayOne.map(item => (<div class={`main__${item}`}>{item}</div>) )}
      </>
      <Header header={header} hElement="h1" />
      <section class="rx-dom__section">
        <Header header={mS(header, h => `${h} - New Section`)} hElement="h2"/>
      </section>
      <button onClick$={handleToggleFooter} type="button">Show Footer</button>
      {oIf(showFooter, <Footer setHeader={setHeader} />)}
    </main>
  );
};

const appRxDom = <App />;

console.log(appRxDom);


