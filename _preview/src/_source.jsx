import {useState} from 'rx-component/index';


const App = () => {
  const [name, setName] = useState('App');

  const changeName = () => setName('Changed Name');

  return (
    <main className="app">
      <button type="button" onClick={changeName}>Change Name</button>
      <Layout name={name} />
    </main>
  );
};

const Layout = ({ name }) => (
  <section className="app-layout">
    <Header>{name}</Header>
    <Footer name={name} />
  </section>
);

const Header = ({ children }) => (
  <h1>{children}</h1>
);

const Footer = ({ name }) => (
  <footer className="app-footer" title={name}>
    <h2 className="app-footer__h2">{name}</h2>
    <h3 className="app-footer__h3">Footer</h3>
  </footer>
);


