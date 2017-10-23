const bindAll = require("lodash/fp/bindAll")
const cloneDeep = require("lodash/cloneDeep")
const defaults = require("lodash/defaults")
const path = require("path")
const fs = require("fs-extra")
const Promise = require("bluebird")

class Bootstrap {
  constructor({ services, templatesDir, env = {} }) {
    bindAll(Object.getOwnPropertyNames(Bootstrap.prototype), this)
    this.services = services
    this.templatesDir = templatesDir
    this.env = env
  }

  run() {
    return Promise.reduce(this.services, this._bootstrapService, this.env)
  }

  async _bootstrapService(env, serviceName) {
    const bootstrapFilePath = path.join(this.templatesDir, serviceName, "bootstrap.js")
    try {
      fs.accessSync(bootstrapFilePath, fs.constants.R_OK)
    } catch (err) {
      return env
    }
    const Service = require(bootstrapFilePath)
    const service = new Service(cloneDeep(env))
    const result = await service.run()
    return defaults(env, result)
  }
}

module.exports = Bootstrap
