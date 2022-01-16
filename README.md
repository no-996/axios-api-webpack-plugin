# axios-api-webpack-plugin

## 目录

- [安装使用](#安装使用)
- [依赖说明](#依赖说明)
- [版本日志](#版本日志)

## 安装使用

```bash
npm install --save @no-996/axios-api-webpack-plugin
```

```js
// webpack.config.js
// ...
const AxiosApiWebpackPlugin = require('@no-996/axios-api-webpack-plugin')
// ...
module.exports = {
  // ...
  plugins: [
    // ...
    new AxiosApiWebpackPlugin({
      // 接口定义文件
      configFile: './src/api/options/index.js',
      // 输出d.ts声明文件（不设置此配置，默认输出至接口定义文件所在的目录）
      declareOutputFile: './src/api/index.d.ts',
    }),
    // ...
  ]
  // ...
}
```

## 依赖说明

```json
"dependencies": {
  "colors": "^1.4.0",
  "lodash": "^4.17.21",
  "prettier": "^2.4.1"
}
```

## 版本日志

### v1.0.0

First release version.

### v1.0.1

Fix file path resolve

### v1.0.2

Add url comment

### v1.0.3

Change url comment placement

### v1.0.4

Change url comment lines

### v1.0.5

Add comment after default data

### v1.0.6

Add method comment

### v1.0.7

Change input file from object to array

### v1.0.8

Support urlParams ts info

### v1.0.9

Fix request comment
