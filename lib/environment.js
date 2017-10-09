const bindAll = require("lodash/fp/bindAll")
const isEmpty = require("lodash/isEmpty")
const zipObject = require("lodash/zipObject")
const map = require("lodash/map")
const mapValues = require("lodash/mapValues")
const template = require("lodash/template")
const set = require("lodash/set")
const size = require("lodash/size")
const merge = require("lodash/merge")
const { getFlatEnvValues, getServiceEnv } = require("./helpers/environment-helper")

class Environment {
  constructor({ services, values }) {
    bindAll(Object.getOwnPropertyNames(Environment.prototype), this)
    if (isEmpty(services)) throw new Error("Environment requires services")
    this.services = services
    this.values = values
  }

  toJSON() {
    return mapValues(getServiceEnv(this.services), this.applyTemplates)
  }

  defaults() {
    const defaults = getFlatEnvValues(this.services)
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
}

module.exports = Environment
