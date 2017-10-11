const bindAll = require("lodash/fp/bindAll")
const isEmpty = require("lodash/isEmpty")
const mapValues = require("lodash/mapValues")
const template = require("lodash/template")
const set = require("lodash/set")
const merge = require("lodash/merge")
const map = require("lodash/map")
const each = require("lodash/each")
const reduce = require("lodash/fp/reduce")
const startsWith = require("lodash/startsWith")
const endsWith = require("lodash/endsWith")
const trimStart = require("lodash/trimStart")
const trimEnd = require("lodash/trimEnd")
const fs = require("fs-extra")
const path = require("path")

class Environment {
  constructor({ services, values, templatesDir }) {
    bindAll(Object.getOwnPropertyNames(Environment.prototype), this)
    if (isEmpty(services)) throw new Error("Environment requires services")
    if (isEmpty(templatesDir)) throw new Error("Environment requires templatesDir")
    this.services = services
    this.values = values
    this.templatesDir = templatesDir
  }

  toJSON() {
    const readServiceEnv = service => fs.readJSONSync(path.join(this.templatesDir, service, "environment.json"))
    const getServiceEnv = reduce((result, service) => {
      result[service] = readServiceEnv(service)
      return result
    }, {})
    return mapValues(getServiceEnv(this.services), this.applyTemplates)
  }

  defaults() {
    return this._detemplateServices()
  }

  applyTemplates(data) {
    return merge(...map(data, this.applyTemplate))
  }

  applyTemplate(value, key) {
    value = template(value, { interpolate: /{{([\s\S]+?)}}/g })(this.values)
    return set({}, key, value)
  }

  _detemplateServices() {
    const config = {}
    each(this.services, serviceName => {
      const envVars = this._detemplateService(serviceName)
      each(envVars, (value, key) => {
        config[key] = value
      })
    })
    return config
  }

  _detemplateService(serviceName) {
    const isTemplated = value => startsWith(value, "{{") && endsWith(value, "}}")
    const detemplate = value => trimEnd(trimStart(value, "{{"), "}}")
    const getKey = (value, key) => {
      return isTemplated(value) ? detemplate(value) : key
    }
    const getValue = value => {
      return isTemplated(value) ? "" : value
    }
    const envVars = fs.readJSONSync(path.join(this.templatesDir, serviceName, "environment.json"))
    const config = {}
    each(envVars, (value, key) => {
      config[getKey(value, key)] = getValue(value)
    })
    return config
  }
}

module.exports = Environment
