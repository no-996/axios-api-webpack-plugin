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

function parseRequestOptionsData(data, meta, p, isRoot = false) {
  let lines = []
  let { name, des, type, isArray, required } = meta

  if (name || des) {
    lines.push(`/**\n ${parseComment(name)}${parseComment(des, name)} */`)
  }

  if (isRoot) {
    if (typeof type === 'string') {
      lines.push(`${p}${required ? '' : '?'}:${type}${isArray ? '[]' : ''}`)
    } else if (typeof type === 'object') {
      lines.push(`${p}${required ? '' : '?'}:{`)

      for (let n in type) {
        lines = [...lines, ...parseRequestOptionsData(data, type[n], n)]
      }

      lines.push(`}${isArray ? '[]' : ''}`)
    } else {
      lines.push(`${p}${required ? '' : '?'}:{`)

      for (let n in data) {
        // 即使没有定义meta，至少要定义参数（类型any）
        lines = [...lines, ...parseRequestOptionsData(data, meta[n] || 'any', n)]
      }

      lines.push(`}`)
    }
  } else {
    if (typeof type === 'string') {
      lines.push(`${p}${required ? '' : '?'}:${type}${isArray ? '[]' : ''}`)
    } else if (typeof type === 'object') {
      lines.push(`${p}${required ? '' : '?'}:{`)

      for (let n in type) {
        lines = [...lines, ...parseRequestOptionsData(data, type[n], n)]
      }

      lines.push(`}${isArray ? '[]' : ''}`)
    } else {
      lines.push(`${p}${required ? '' : '?'}:any`)
    }
  }

  return lines
}

function parseRequestOptions(cfg) {
  let lines = []
  lines.push('{')

  if (cfg.metadata) {
    if (cfg.metadata.data) {
      lines = [...lines, ...parseRequestOptionsData(cfg.data, cfg.metadata.data, 'data', true)]
    } else if (typeof cfg.data !== 'undefined') {
      lines.push(`data:any`)
    }
  }

  if (cfg.metadata) {
    if (cfg.metadata.params) {
      lines = [...lines, ...parseRequestOptionsData(cfg.params, cfg.metadata.params, 'params', true)]
    } else if (typeof cfg.params !== 'undefined') {
      lines.push(`params:any`)
    }
  }

  if (cfg.metadata) {
    if (cfg.metadata.urlParams) {
      lines = [...lines, ...parseRequestOptionsData(cfg.urlParams, cfg.metadata.urlParams, 'urlParams', true)]
    } else if (typeof cfg.urlParams !== 'undefined') {
      lines.push(`urlParams:any`)
    }
  }

  lines.push('}')
  return lines.join('\n')
}

function parseRequestOptionsDefaultData(opts, metadata = {}, root = true, level = 0, lines = []) {
  const blank1 = new Array(level * 2).fill(' ').join('')
  const blank2 = new Array(level * 2 + 2).fill(' ').join('')
  const blank3 = new Array(level * 2 + 4).fill(' ').join('')
  lines.push(level > 0 ? `{` : blank1 + ` * {`)

  for (let p in opts) {
    var _metadata$p, _metadata$p2, _metadata$p3

    const des = ((_metadata$p = metadata[p]) === null || _metadata$p === void 0 ? void 0 : _metadata$p.des) || ''
    const comment =
      (_metadata$p2 = metadata[p]) !== null && _metadata$p2 !== void 0 && _metadata$p2.name
        ? `// ${(_metadata$p3 = metadata[p]) === null || _metadata$p3 === void 0 ? void 0 : _metadata$p3.name}${des ? ' - ' + des : ''}`
        : ''

    if (Array.isArray(opts[p])) {
      lines.push(' * ' + blank2 + `"${p}": [`)
      opts[p].forEach((o) => {
        if (typeof o === 'object') {
          var _metadata$p4

          lines.push(
            ' * ' +
              blank3 +
              parseRequestOptionsDefaultData(
                o,
                typeof ((_metadata$p4 = metadata[p]) === null || _metadata$p4 === void 0 ? void 0 : _metadata$p4.type) === 'object'
                  ? metadata[p].type
                  : metadata[p],
                false,
                level + 2
              )
          )
        } else {
          lines.push(' * ' + blank3 + (typeof o === 'number' ? o : `"${o}"`) + ',')
        }
      })
      lines.push(' * ' + blank2 + `], ${comment}`)
    } else if (typeof opts[p] === 'object') {
      var _metadata$p5

      lines.push(
        ' * ' +
          blank2 +
          `"${p}": ${parseRequestOptionsDefaultData(
            opts[p],
            typeof ((_metadata$p5 = metadata[p]) === null || _metadata$p5 === void 0 ? void 0 : _metadata$p5.type) === 'object'
              ? metadata[p].type
              : metadata[p],
            false,
            level + 1
          )}, ${comment}`
      )
    } else if (typeof opts[p] === 'number') {
      lines.push(' * ' + blank2 + `"${p}": ${opts[p]}, ${comment}`)
    } else if (typeof opts[p] === 'undefined') {
      if (!root) {
        lines.push(' * ' + blank2 + `"${p}": undefined, ${comment}`)
      }
    } else {
      lines.push(' * ' + blank2 + `"${p}": "${opts[p].toString()}", ${comment}`)
    }
  }

  lines.push(' * ' + blank1 + `}`)
  return lines.join('\n')
}

function parse(cfg, parent = [], pName = '') {
  if (cfg) {
    const prefix = pName
      .split('.')
      .filter((o) => o) // 去除最后一级空
      .slice(1) // 去除Root
      .map((o) => o[0].toUpperCase() + o.substring(1)) // 首字母大写
      .join('')
    parent.push(`\n/* ${new Array(25).fill('↓').join('')} ${pName}${cfg.name || 'empty'} ${new Array(25).fill('↓').join('')} */\n`)
    parent.push(
      `/**\n ${parseComment((cfg.name || 'empty') + (cfg.des ? ' - ' + cfg.des : ''))}${parseComment(
        cfg.url ? `(${cfg.method || 'get'}) ${'url: ' + cfg.url}` : '',
        true
      )} */`
    ) // 增加父级

    parent.push(`interface ${prefix}${parseName(cfg)}Instance {`)

    if (cfg.children) {
      cfg.children.forEach((o) => {
        parent.push(
          `/**\n ${parseComment((o.name || 'empty') + (o.des ? ' - ' + o.des : ''))}${parseComment(
            o.url ? `(${o.method || 'get'}) ${'url: ' + o.url}` : '',
            true
          )} */`
        ) // 增加父级

        let parentName = parseName(cfg)
        let pre = parentName === 'Root' ? '' : `${prefix}${parentName}`
        parent.push(`${o.name}:${pre}${parseName(o)}Instance`)
      })
    }

    let hasData = cfg.data || cfg.params || cfg.urlParams || (cfg.metadata && (cfg.metadata.data || cfg.metadata.params || cfg.metadata.urlParams))
    let defs = ''

    if (cfg.data || cfg.params || cfg.urlParams) {
      let opts = {
        data: cfg.data,
        params: cfg.params,
        urlParams: cfg.urlParams,
      } // defs = `${' * ```\n * // 默认请求参数\n * // default request data \n' + JSON.stringify(opts, null, 2).replace(/^/gm, ' * ')}\n` + ' * ```\n'

      defs = `${' * ```\n * // 默认请求参数\n * // default request data \n' + parseRequestOptionsDefaultData(opts, cfg.metadata)}\n` + ' * ```\n'
    }

    parent.push(
      `/**\n * 请求方法 / Request function\n${parseComment(cfg.url ? `(${cfg.method || 'get'}) ${'url: ' + cfg.url}` : '', true)} *\n${defs} */`
    )

    if (hasData) {
      parent.push(`request(options: ${parseRequestOptions(cfg)}): Promise<any>`)
    } else {
      parent.push(`request(options: ApiModuleOptions): Promise<any>`)
    }

    parent.push(`/**\n * Axios 实例 / Axios instance\n */`)
    parent.push(`axiosInstance: AxiosInstance`)
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

module.exports = function (options) {
  const config = {
    name: 'root',
    des: '根模块/root module',
    children: options,
  }
  let lines = parse(config)
  let code = [
    `import { AxiosInstance } from 'axios'`,
    `import { ApiModuleOptions } from '@no-996/axios-api'`,
    ...lines,
    `/**\n ${parseComment(config.des || config.name || 'root')} */`,
    `declare const instance: ${parseName(config)}Instance`,
    `export default instance`,
  ].join('\n') // console.log(code)

  let format = prettier.format(code, {
    parser: 'typescript',
    singleQuote: true,
    semi: false,
    arrowParens: 'always',
    printWidth: 150,
  }) // console.log(format)
  // console.log(format.substr(0, 200))
  // fs.writeFileSync(declareOutputFile, format, { flag: 'w' })

  return format
}
