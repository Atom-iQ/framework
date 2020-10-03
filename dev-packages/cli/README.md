# Atom-iQ iQ CLI
###### `@atom-iq/cli`
The main build & development tool for **Atom-iQ**

#### Installing
- npm - `npm install --save-dev @atom-iq/cli` / `npm install -G @atom-iq/cli`
- yarn - `yarn add -D @atom-iq/cli` / `yarn global add @atom-iq/cli`

It could run without a config or with (recommended) config file:
- `iq.cli.json` / `.iq.cli.json`
- `iq.cli.js` / `.iq.cli.js`

### Config file interface
```typescript
interface IQCliConfig {
  entryFile: string // main application file - default './src/index.ts'
  stylesType: 'css' | 'scss' | 'sass' // stylesheets extensions - default 'scss'
  typescript: boolean // using typescript - default true
  htmlTemplate: string // html template - compiler generate main app html file based on this template - default `./public/index.html` 
  environments: {
    development: EnvironmentConfig // DEV environment config
    production: EnvironmentConfig // PROD environment config
    [key: string]: EnvironmentConfig // Custom environment config
  }
}

interface EnvironmentConfig {
  outputDirectory?: string; // default './dist' for production, null for development
  appBaseUrl?: string // default '/'
}
```

### Commands
- `iq start [-p --port <port>]` - compile the app in development mode, run development server and watch for file changes.
  Optionally port can be specified, default is `7777`
- `iq build [-e --env <environment>]` - compile the app in production mode (default) and save the
  output in a directory specified in a config (`/dist` is default for production environment). Optionally other
  environment can be specified.
