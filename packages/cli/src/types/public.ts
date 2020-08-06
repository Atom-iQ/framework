export interface ReactiveUiCliConfig {
  entryFile: string
  stylesType: 'css' | 'scss' | 'sass'
  typescript: boolean
  environments: {
    development: EnvironmentConfig
    production: EnvironmentConfig
    [key: string]: EnvironmentConfig
  }
}

export interface EnvironmentConfig {
  outputDirectory?: string;
}
