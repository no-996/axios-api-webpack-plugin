# axios-api-webpack-plugin

此 webpack 插件是服务于[axios-api](https://github.com/no-996/axios-api)的 d.ts 生成工具

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
      // 输出d.ts声明文件（与实例输出文件所在目录一致、文件名一致）
      declareOutputFile: './src/api/index.d.ts',
    }),
    // ...
  ],
  // ...
}
```

接口定义文件示例：

```js
// src/api/options/index.js
export default [
  {
    name: 'posts',
    des: '帖子',
    url: '/posts',
    params: {
      userId: undefined,
    },
    children: [
      {
        name: 'comments',
        des: '评论',
        url: '/posts/{postId}/comments',
        urlParams: {
          postId: undefined,
        },
        metadata: {
          urlParams: {
            postId: {
              name: '帖子id',
              required: true,
            },
          },
        },
      },
    ],
    metadata: {
      params: {
        userId: {
          name: '用户id',
          des: '用户唯一标识',
          type: 'string',
        },
      },
    },
  },
  {
    name: 'albums',
    url: '/albums',
    des: '专辑',
    params: {
      id: undefined,
    },
    children: [],
  },
  {
    name: 'photos',
    url: '/photos',
    des: '相片',
    params: {},
    children: [],
    cache: 3000,
  },
  {
    name: 'todos',
    url: '/todos',
    des: '待办事项',
    params: {},
    children: [],
    cancel: 'current',
  },
  {
    name: 'users',
    url: '/users',
    des: '用户',
    params: {},
    children: [],
    cancel: 'previous',
  },
]
```

实例输出文件示例：

```js
// src/api/index.js
import ApiModule from '@no-996/axios-api'

import options from './options'

export default new ApiModule(
  // 接口定义
  options,
  // axios配置
  {
    baseURL: 'https://jsonplaceholder.typicode.com',
    onUploadProgress: (progressEvent, percentCompleted) => {
      console.log(percentCompleted)
    },
  },
  // axios-api配置
  {
    cacheStorage: localStorage,
    debug: true,
  }
)
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

### v1.1.6

Mix parent declare name

### v1.1.5

bug fix

### v1.1.4

bug fix

### v1.1.3

Add axios instance declear

### v1.1.2

Add console words

### v1.1.1

Use webpack instead async import

### v1.0.11

Fix param declare missing when without metadata

### v1.0.10

Fix ApiModuleOptions import

### v1.0.9

Fix request comment

### v1.0.8

Support urlParams ts info

### v1.0.7

Change input file from object to array

### v1.0.6

Add method comment

### v1.0.5

Add comment after default data

### v1.0.4

Change url comment lines

### v1.0.3

Change url comment placement

### v1.0.2

Add url comment

### v1.0.1

Fix file path resolve

### v1.0.0

First release version.
