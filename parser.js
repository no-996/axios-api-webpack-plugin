const fs = require('fs')
const path = require('path')

const prettier = require('prettier')

function parseName(cfg) {
  if (cfg.name) {
    let name = cfg.name
    name = name.replace(/[\s\-]/g, '_')
    return name[0].toUpperCase() + name.slice(1)
  }
  return cfg.name
}

function parseComment(str, isSub) {
  return str ? `* ${isSub ? '- ' : ''}${str}\n` : ''
}

function parseRequestOptionsData(data, p, isRoot = false) {
  let lines = []
  let { name, des, type, isArray, required } = data
  if (name || des) {
    lines.push(`/**\n ${parseComment(name)}${parseComment(des, name)} */`)
  }
  if (isRoot) {
    if (typeof type === 'string') {
      lines.push(`${p}${required ? '' : '?'}:${type}${isArray ? '[]' : ''}`)
    } else if (typeof type === 'object') {
      lines.push(`${p}${required ? '' : '?'}:{`)
      for (let n in type) {
        lines = [...lines, ...parseRequestOptionsData(type[n], n)]
      }
      lines.push(`}${isArray ? '[]' : ''}`)
    } else {
      lines.push(`${p}${required ? '' : '?'}:{`)
      for (let n in data) {
        lines = [...lines, ...parseRequestOptionsData(data[n], n)]
      }
      lines.push(`}`)
    }
  } else {
    if (typeof type === 'string') {
      lines.push(`${p}${required ? '' : '?'}:${type}${isArray ? '[]' : ''}`)
    } else if (typeof type === 'object') {
      lines.push(`${p}${required ? '' : '?'}:{`)
      for (let n in type) {
        lines = [...lines, ...parseRequestOptionsData(type[n], n)]
      }
      lines.push(`}${isArray ? '[]' : ''}`)
    }
  }
  return lines
}

function parseRequestOptions(cfg) {
  let lines = []
  lines.push('{')
  if (cfg.metadata) {
    if (cfg.metadata.data) {
      lines = [...lines, ...parseRequestOptionsData(cfg.metadata.data, 'data', true)]
    } else if (typeof cfg.data !== 'undefined') {
      lines.push(`data:any`)
    }
  }
  if (cfg.metadata) {
    if (cfg.metadata.params) {
      lines = [...lines, ...parseRequestOptionsData(cfg.metadata.params, 'params', true)]
    } else if (typeof cfg.params !== 'undefined') {
      lines.push(`params:any`)
    }
  }
  lines.push('}')
  return lines.join('\n')
}

function parse(cfg, parent = [], pName = '') {
  if (cfg) {
    parent.push(`\n/* ${new Array(25).fill('↓').join('')} ${pName}${cfg.name} ${new Array(25).fill('↓').join('')} */\n`)
    parent.push(`/**\n ${parseComment(cfg.des || cfg.name)}${parseComment(cfg.url ? 'url: ' + cfg.url : '', true)} */`)
    parent.push(`interface ${parseName(cfg)}Instance {`)
    if (cfg.children) {
      cfg.children.forEach((o) => {
        parent.push(`/**\n ${parseComment(o.des || o.name)}${parseComment(o.url ? 'url: ' + o.url : '', true)} */`)
        parent.push(`${o.name}:${parseName(o)}Instance`)
      })
    }
    let hasData = cfg.data || cfg.params || (cfg.metadata && (cfg.metadata.data || cfg.metadata.params))
    let defs = ''
    if (cfg.data || cfg.params) {
      let opts = {
        data: cfg.data,
        params: cfg.params,
      }
      defs = `${' * ```\n * // 默认请求参数\n * // default request data \n' + JSON.stringify(opts, null, 2).replace(/^/gm, ' * ')}\n` + ' * ```\n'
    }
    parent.push(`/**\n * 请求方法 / Request function\n${parseComment(cfg.url ? 'url: ' + cfg.url : '', true)}${defs} */`)
    if (hasData) {
      parent.push(`request(options: ${parseRequestOptions(cfg)}): Promise<any>`)
    } else {
      parent.push(`request(options: ApiModuleOptions): Promise<any>`)
    }
    parent.push(`}`)

    if (cfg.children) {
      cfg.children.forEach((o) => {
        parent = [...parent, ...parse(o, [], `${pName}${cfg.name}.`)]
      })
    }
    parent.push(`\n/* ${new Array(25).fill('↑').join('')} ${pName}${cfg.name} ${new Array(25).fill('↑').join('')} */\n`)
  }
  return parent
}

module.exports = function (config) {
  let lines = parse(config)

  let code = [
    `import { ApiModule, ApiModuleOptions } from '../ApiModule'`,
    ...lines,
    `/**\n ${parseComment(config.des || config.name || 'root')} */`,
    `declare const instance: ${parseName(config)}Instance`,
    `export default instance`,
  ].join('\n')

  // console.log(code)

  let format = prettier.format(code, {
    parser: 'typescript',
    singleQuote: true,
    semi: false,
    arrowParens: 'always',
    printWidth: 150,
  })

  // console.log(format)
  // console.log(format.substr(0, 200))
  // fs.writeFileSync(declareOutputFile, format, { flag: 'w' })
  return format
}
