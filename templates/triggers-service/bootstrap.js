const bindAll = require("lodash/fp/bindAll")
const MeshbluHttp = require("meshblu-http")
const { promisify } = require("util")

class BootstrapService {
  constructor({ env, meshbluConfig }) {
    bindAll(Object.getOwnPropertyNames(BootstrapService.prototype), this)
    this.deviceCreated = env.TRIGGER_SERVICE_UUID != null && env.TRIGGER_SERVICE_TOKEN != null
    this.meshbluHttp = new MeshbluHttp(meshbluConfig)
  }

  async run() {
    if (this.deviceCreated) {
      return
    }
    const register = promisify(this.meshbluHttp.register)

    const { uuid, token } = await register({
      type: "trigger-service",
      name: "Trigger Service",
      discoverWhitelist: ["*"],
      receiveWhitelist: [],
      sendWhitelist: [],
      configureWhitelist: [],
    })

    return {
      TRIGGER_SERVICE_UUID: uuid,
      TRIGGER_SERVICE_TOKEN: token,
    }
  }
}

module.exports = BootstrapService
