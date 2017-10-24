const bindAll = require("lodash/fp/bindAll")
const MeshbluHttp = require("meshblu-http")
const { promisify } = require("util")

class BootstrapService {
  constructor({ env, meshbluConfig }) {
    bindAll(Object.getOwnPropertyNames(BootstrapService.prototype), this)
    this.deviceCreated = env.INTERVAL_SERVICE_UUID != null && env.INTERVAL_SERVICE_TOKEN != null
    this.meshbluHttp = new MeshbluHttp(meshbluConfig)
  }

  async run() {
    if (this.deviceCreated) {
      return
    }
    const INTERVAL_SERVICE_URI = "https://interval.octoblu.com"
    const register = promisify(this.meshbluHttp.register)

    const { uuid, token } = await register({
      type: "interval-service",
      name: "Interval Service",
      meshblu: {
        messageHooks: [
          {
            url: INTERVAL_SERVICE_URI,
            method: "POST",
            generateAndForwardMeshbluCredentials: true,
          },
        ],
      },
      discoverWhitelist: ["*"],
      receiveWhitelist: ["*"],
      sendWhitelist: ["*"],
      configureWhitelist: [],
    })

    return {
      INTERVAL_SERVICE_UUID: uuid,
      INTERVAL_SERVICE_TOKEN: token,
      INTERVAL_SERVICE_URI,
    }
  }
}

module.exports = BootstrapService
