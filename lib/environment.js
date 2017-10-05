const bindAll = require("lodash/fp/bindAll")
const isEmpty = require("lodash/isEmpty")
const each = require("lodash/each")
const map = require("lodash/map")
const template = require("lodash/template")
const set = require("lodash/set")
const merge = require("lodash/merge")
const fs = require("fs-extra")
const path = require("path")

class Environment {
  constructor({ services, values }) {
    bindAll(Object.getOwnPropertyNames(Environment.prototype), this)
    if (isEmpty(services)) throw new Error("Environment requires services")
    this.services = services
    this.values = values
  }

  toJSON() {
    const config = {}
    each(this.services, service => {
      const data = this.mapValues(fs.readJSONSync(path.join(__dirname, "../templates", service, "environment.json")))
      config[service] = data
    })
    return config
  }

  mapValues(data) {
    return merge(...map(data, this.mapValue))
  }

  mapValue(value, key) {
    value = template(value, { interpolate: /{{([\s\S]+?)}}/g })(this.values)
    return set({}, key, value)
  }
}

module.exports = Environment
