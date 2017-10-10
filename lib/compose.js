const bindAll = require("lodash/fp/bindAll")
const isEmpty = require("lodash/isEmpty")
const each = require("lodash/each")
const yaml = require("node-yaml")
const fs = require("fs-extra")
const path = require("path")

class Compose {
  constructor({ services, templatesDir }) {
    bindAll(Object.getOwnPropertyNames(Compose.prototype), this)
    if (isEmpty(services)) throw new Error("Compose requires services")
    if (isEmpty(templatesDir)) throw new Error("Compose requires templatesDir")
    this.services = services
    this.templatesDir = templatesDir
  }

  toJSON() {
    const config = {
      version: "3",
      services: {},
    }
    each(this.services, service => {
      config.services[service] = fs.readJSONSync(path.join(this.templatesDir, service, "service.json"))
    })
    return config
  }

  toYAML() {
    return yaml.dump(this.toJSON())
  }
}

module.exports = Compose
