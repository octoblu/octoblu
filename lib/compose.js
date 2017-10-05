const bindAll = require("lodash/fp/bindAll")
const isEmpty = require("lodash/isEmpty")
const each = require("lodash/each")
const fs = require("fs-extra")
const path = require("path")

class Compose {
  constructor({ services }) {
    bindAll(Object.getOwnPropertyNames(Compose.prototype), this)
    if (isEmpty(services)) throw new Error("Compose requires services")
    this.services = services
  }

  toJSON() {
    const config = {
      version: "3",
      services: {},
    }
    each(this.services, service => {
      config.services[service] = fs.readJSONSync(path.join(__dirname, "../templates", service, "service.json"))
    })
    return config
  }
}

module.exports = Compose
