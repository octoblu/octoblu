const bindAll = require("lodash/fp/bindAll")
const MeshbluHttp = require("meshblu-http")
const { promisify } = require("util")

class BootstrapService {
  constructor({ env, meshbluConfig }) {
    bindAll(Object.getOwnPropertyNames(BootstrapService.prototype), this)
    this.deviceCreated = env.OAUTH_PROVIDER_UUID != null && env.OAUTH_PROVIDER_TOKEN != null
    this.meshbluHttp = new MeshbluHttp(meshbluConfig)
  }

  async run() {
    if (this.deviceCreated) {
      return
    }
    const register = promisify(this.meshbluHttp.register)

    const { uuid, token } = await register({
      type: "octoblu:oauth-service",
      name: "Octoblu Oauth Service",
      discoverWhitelist: [],
      receiveWhitelist: [],
      sendWhitelist: [],
      configureWhitelist: [],
    })

    return {
      OAUTH_PROVIDER_UUID: uuid,
      OAUTH_PROVIDER_TOKEN: token,
    }
  }
}

module.exports = BootstrapService
