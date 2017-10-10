const bindAll = require("lodash/fp/bindAll")
const isEmpty = require("lodash/isEmpty")
const zipObject = require("lodash/zipObject")
const mapValues = require("lodash/mapValues")
const template = require("lodash/template")
const set = require("lodash/set")
const size = require("lodash/size")
const merge = require("lodash/merge")
const uniq = require("lodash/uniq")
const map = require("lodash/map")
const reduce = require("lodash/fp/reduce")
const pipe = require("lodash/fp/pipe")
const flatMap = require("lodash/flatMap")
const trimCharsStart = require("lodash/fp/trimCharsStart")
const trimCharsEnd = require("lodash/fp/trimCharsEnd")
const values = require("lodash/values")
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
    const defaults = this._detemplateServices()
    const defaultValues = Array(size(defaults)).fill("")
    return zipObject(defaults, defaultValues)
  }

  applyTemplates(data) {
    return merge(...map(data, this.applyTemplate))
  }

  applyTemplate(value, key) {
    value = template(value, { interpolate: /{{([\s\S]+?)}}/g })(this.values)
    return set({}, key, value)
  }

  _detemplateServices() {
    return uniq(flatMap(this.services, this._detemplateService))
  }

  _detemplateService(serviceName) {
    const detemplate = pipe(trimCharsStart("{{"), trimCharsEnd("}}"))
    const envVars = fs.readJSONSync(path.join(this.templatesDir, serviceName, "environment.json"))
    return map(values(envVars), detemplate)
  }
}

module.exports = Environment
