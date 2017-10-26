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
const assign = require("lodash/assign")
const haveAccessSync = require("./helpers/haveAccessSync")

class Environment {
  constructor({ services, values, templatesDirs }) {
    bindAll(Object.getOwnPropertyNames(Environment.prototype), this)
    if (isEmpty(services)) throw new Error("Environment requires services")
    if (isEmpty(templatesDirs))
      throw new Error("Environment requires templatesDirs")
    this.services = services
    this.values = values
    this.templatesDirs = templatesDirs
  }

  toJSON() {
    const getServiceEnv = reduce((result, service) => {
      result[service] = this._getTemplates(service)
      return result
    }, {})
    return mapValues(getServiceEnv(this.services), this.applyTemplates)
  }

  merge(existing) {
    const defaults = this.defaults()
    return assign(defaults, existing)
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
    const isTemplated = value =>
      startsWith(value, "{{") && endsWith(value, "}}")
    const detemplate = value => trimEnd(trimStart(value, "{{"), "}}")
    const getKey = (value, key) => {
      return isTemplated(value) ? detemplate(value) : key
    }
    const getValue = value => {
      return isTemplated(value) ? "" : value
    }
    const envVars = this._getTemplates(serviceName)
    const config = {}
    each(envVars, (value, key) => {
      config[getKey(value, key)] = getValue(value)
    })
    return config
  }

  _getTemplates(serviceName) {
    const envVars = map(this.templatesDirs, templatesDir => {
      const filename = path.join(templatesDir, serviceName, "environment.json")
      if (!haveAccessSync(filename)) return {}
      return fs.readJSONSync(filename)
    })
    console.log({serviceName, envVars},  this.templatesDirs)
    return merge(...envVars)
  }
}



module.exports = Environment
