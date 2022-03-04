const vm = require('vm')
const memfs = require('memfs')
const Webpack = require('webpack')
const fs = require('fs')
const colors = require('colors')
colors.setTheme({
  root: 'blue',
  error: 'red',
  ignored: 'magenta',
  format: 'cyan',
  pass: 'yellow',
  changed: 'green',
})
//
const parser = require('./parser.js')

module.exports = class {
  compileStart() {
    console.log(`Watching: `.root + `${this.configFile}`)
    //
    const compiler = Webpack(
      {
        entry: {
          options: this.configFile,
        },
        output: {
          path: '/',
          filename: '[name].js',
          library: 'options',
          libraryTarget: 'umd',
          umdNamedDefine: true,
          globalObject: 'this',
          publicPath: './',
        },
        watch: true,
        module: {
          rules: [
            {
              test: /\.js$/,
              loader: 'babel-loader',
              options: { plugins: ['@babel/plugin-proposal-optional-chaining'] },
              exclude: /node_modules/,
            },
          ],
        },
        plugins: [
          new Webpack.EnvironmentPlugin({
            ...process.env,
          }),
        ],
        resolve: {
          extensions: ['*', '.ts', '.js', '.json'],
          alias: {
            fs: 'memfs',
          },
        },
        node: {
          __filename: true,
        },
      },
      (err) => {
        if (err) {
          console.log(err.toString().error)
        } else {
          if (memfs.fs.existsSync('/options.js')) {
            // 获取编译后的代码（内存中）
            const code = memfs.fs.readFileSync('/options.js').toString()
            //
            const contextObject = {}
            try {
              // 执行代码，获得对象
              vm.createContext(contextObject)
              const script = new vm.Script(code)
              script.runInContext(contextObject)
            } catch (e) {
              console.log('代码执行失败：'.error)
              console.log(e)
            }
            try {
              // 生成声明文件
              let declares = parser(contextObject.options.default)
              fs.writeFileSync(this.declareOutputFile, declares, { flag: 'w' })
            } catch (e) {
              console.log('生成声明文件失败：'.error)
              console.log(e)
            }
          }
        }
      }
    )

    compiler.inputFileSystem = fs
    compiler.outputFileSystem = memfs.fs
  }
  constructor({ configFile, declareOutputFile }) {
    this.configFile = configFile
    this.declareOutputFile = declareOutputFile
    this.compileStart()
  }
  apply() {}
}
