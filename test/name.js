const fs = require('fs')
const path = require('path')
//
const ts = require('typescript')
const parser = require('../parser.js')
const expect = require('chai').expect
// 配置
const config = require('./config/name')

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
  // 测试
  it(`注释 - ${config.name}`, function () {
    expect(comments.findIndex((o) => o === `${config.name}`)).to.be.above(-1)
  })
  it(`注释 - ${config.children[0].name}`, function () {
    expect(comments.findIndex((o) => o === `${config.children[0].name}`)).to.be.above(-1)
  })
  it(`注释 - ${config.children[1].name} - ${config.children[1].des}`, function () {
    expect(comments.findIndex((o) => o === `${config.children[1].des}`)).to.be.above(-1)
  })
  it(`注释 - ${config.children[2].name} - ${config.children[2].url}`, function () {
    expect(
      comments.findIndex(
        (o) => o === `${config.children[2].name}\n- (${config.children[0].children[0].method || 'get'}) url: ${config.children[2].url}`
      )
    ).to.be.above(-1)
  })
  it(`注释 - ${config.children[3].name} - ${config.children[3].des} - ${config.children[3].url}`, function () {
    expect(
      comments.findIndex(
        (o) => o === `${config.children[3].des}\n- (${config.children[0].children[0].method || 'get'}) url: ${config.children[3].url}`
      )
    ).to.be.above(-1)
  })
  it(`注释 - ${config.children[0].children[0].name} - ${config.children[0].children[0].des} - ${config.children[0].children[0].url}`, function () {
    expect(
      comments.findIndex(
        (o) =>
          o ===
          `${config.children[0].children[0].des}\n- (${config.children[0].children[0].method || 'get'}) url: ${config.children[0].children[0].url}`
      )
    ).to.be.above(-1)
  })
  //
  it(`实例定义 - ${config.name}`, function () {
    expect(identifiers.has(`${config.name[0].toUpperCase() + config.name.slice(1)}Instance`)).to.true
  })
  it(`实例定义 - ${config.children[0].name}`, function () {
    expect(identifiers.has(`${config.children[0].name[0].toUpperCase() + config.children[0].name.slice(1)}Instance`)).to.true
  })
  it(`实例定义 - ${config.children[1].name} - ${config.children[1].des}`, function () {
    expect(identifiers.has(`${config.children[1].name[0].toUpperCase() + config.children[1].name.slice(1)}Instance`)).to.true
  })
  it(`实例定义 - ${config.children[2].name} - ${config.children[2].url}`, function () {
    expect(identifiers.has(`${config.children[2].name[0].toUpperCase() + config.children[2].name.slice(1)}Instance`)).to.true
  })
  it(`实例定义 - ${config.children[3].name} - ${config.children[3].des} - ${config.children[3].url}`, function () {
    expect(identifiers.has(`${config.children[3].name[0].toUpperCase() + config.children[3].name.slice(1)}Instance`)).to.true
  })
  it(`实例定义 - ${config.children[0].children[0].name} - ${config.children[0].children[0].des} - ${config.children[0].children[0].url}`, function () {
    expect(identifiers.has(`${config.children[0].children[0].name[0].toUpperCase() + config.children[0].children[0].name.slice(1)}Instance`)).to.true
  })
})
