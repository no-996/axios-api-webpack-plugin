const fs = require('fs')
const path = require('path')

const prettier = require('prettier')

function parseName(cfg) {
  if (cfg.name) {
    let name = cfg.name
    name = name.replace(/[\s\-]/g, '_')
    return name[0].toUpperCase() + name.slice(1)
  }
  return 'empty'
}

function parseComment(str, isSub) {
  return str ? `${isSub ? ' *' : '*'} ${isSub ? '- ' : ''}${str}\n` : ''
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

function parseRequestOptionsDefaultData(opts, metadata = {}, level = 0, lines = []) {
  const blank1 = new Array(level * 2).fill(' ').join('')
  const blank2 = new Array(level * 2 + 2).fill(' ').join('')
  const blank3 = new Array(level * 2 + 4).fill(' ').join('')
  lines.push(level > 0 ? `{` : blank1 + ` * {`)
  for (let p in opts) {
    const des = metadata[p]?.des || ''
    const comment = metadata[p]?.name ? `// ${metadata[p]?.name}${des ? ' - ' + des : ''}` : ''
    if (Array.isArray(opts[p])) {
      lines.push(' * ' + blank2 + `"${p}": [`)
      opts[p].forEach((o) => {
        if (typeof o === 'object') {
          lines.push(
            ' * ' + blank3 + parseRequestOptionsDefaultData(o, typeof metadata[p]?.type === 'object' ? metadata[p].type : metadata[p], level + 2)
          )
        } else {
          lines.push(' * ' + blank3 + (typeof o === 'number' ? o : `"${o}"`) + ',')
        }
      })
      lines.push(' * ' + blank2 + `], ${comment}`)
    } else if (typeof opts[p] === 'object') {
      lines.push(
        ' * ' +
          blank2 +
          `"${p}": ${parseRequestOptionsDefaultData(
            opts[p],
            typeof metadata[p]?.type === 'object' ? metadata[p].type : metadata[p],
            level + 1
          )}, ${comment}`
      )
    } else if (typeof opts[p] === 'number') {
      lines.push(' * ' + blank2 + `"${p}": ${opts[p]}, ${comment}`)
    } else if (typeof opts[p] === 'undefined') {
      lines.push(' * ' + blank2 + `"${p}": undefined, ${comment}`)
    } else {
      lines.push(' * ' + blank2 + `"${p}": "${opts[p].toString()}", ${comment}`)
    }
  }
  lines.push(' * ' + blank1 + `}`)
  return lines.join('\n')
}

function parse(cfg, parent = [], pName = '') {
  if (cfg) {
    parent.push(`\n/* ${new Array(25).fill('↓').join('')} ${pName}${cfg.name || 'empty'} ${new Array(25).fill('↓').join('')} */\n`)
    parent.push(`/**\n ${parseComment(cfg.des || cfg.name || 'empty')}${parseComment(cfg.url ? 'url: ' + cfg.url : '', true)} */`)
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
      // defs = `${' * ```\n * // 默认请求参数\n * // default request data \n' + JSON.stringify(opts, null, 2).replace(/^/gm, ' * ')}\n` + ' * ```\n'
      defs = `${' * ```\n * // 默认请求参数\n * // default request data \n' + parseRequestOptionsDefaultData(opts, cfg.metadata)}\n` + ' * ```\n'
    }
    parent.push(`/**\n * 请求方法 / Request function\n${parseComment(cfg.url ? 'url: ' + cfg.url : '', true)} *\n${defs} */`)
    if (hasData) {
      parent.push(`request(options: ${parseRequestOptions(cfg)}): Promise<any>`)
    } else {
      parent.push(`request(options: ApiModuleOptions): Promise<any>`)
    }
    parent.push(`}`)

    if (cfg.children) {
      cfg.children.forEach((o) => {
        parent = [...parent, ...parse(o, [], `${pName}${cfg.name || 'empty'}.`)]
      })
    }
    parent.push(`\n/* ${new Array(25).fill('↑').join('')} ${pName}${cfg.name || 'empty'} ${new Array(25).fill('↑').join('')} */\n`)
  }
  return parent
}

module.exports = function (config) {
  let lines = parse(config)

  let code = [
    `import { ApiModuleOptions } from '../ApiModule'`,
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
