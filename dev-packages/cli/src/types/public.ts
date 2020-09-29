export interface ReactiveUiCliConfig {
  entryFile: string
  stylesType: 'css' | 'scss' | 'sass'
  typescript: boolean
  htmlTemplate: string
  environments: {
    development: EnvironmentConfig
    production: EnvironmentConfig
    [key: string]: EnvironmentConfig
  }
}

export interface EnvironmentConfig {
  outputDirectory?: string;
  appBaseUrl?: string
}
