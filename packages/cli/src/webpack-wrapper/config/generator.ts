type WebpackConfigGeneratorFn = (params: WebpackConfigGeneratorParams) => {}

interface WebpackConfigGeneratorParams {
  entryPath: string
  outputPath: string
  isSass: boolean
}

interface Rule {
  test: RegExp
  exclude?: RegExp
  loader?: string
  use?: string[]
  options?: {}
}

module.exports = (): WebpackConfigGeneratorFn => ({
  entryPath,
  outputPath,
  isSass
}) => {
  let rules: Rule[] = [
    {
      test: /\.(ts|js)x?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
    },
    {
      test: /\.css$/i,
      use: ['style-loader', 'css-loader'],
    },

  ]

  if (isSass) {
    rules = [
      ...rules,
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ]
  }

  rules = [
    ...rules ,
    {
      test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
      loader: 'url-loader',
      options: {
        limit: 8192,
      },
    },
  ]

  return ({
    entry: entryPath,
    module: {
      rules
    },
    output: {
      path: outputPath,
      filename: 'main.bundle.js'
    }
  })
}
