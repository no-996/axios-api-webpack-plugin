const fs = require('fs')
const path = require('path')
//
const ts = require('typescript')
const parser = require('../parser.js')
const expect = require('chai').expect
// 配置
const config = require('./config/data')

describe('声明', function () {
  const code = parser(config)
  const outputName = __filename.match(/[^\\/]+\.js$/)[0].replace(/\.js$/, '.d.ts')
  fs.writeFileSync(path.resolve(__dirname, './code', outputName), code)
  // 解析
  const sourceFile = ts.createSourceFile('test.ts', code, ts.ScriptTarget.Latest)
  // 注释
  const comments = sourceFile.statements
    .filter((o) => o.jsDoc)
    .reduce((p, c, i) => {
      return [...p, ...c.jsDoc.map((j) => j.comment)]
    }, [])
  // 定义
  const identifiers = sourceFile.identifiers
})
