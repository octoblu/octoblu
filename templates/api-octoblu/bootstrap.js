const bindAll = require("lodash/fp/bindAll")
const MeshbluHttp = require("meshblu-http")
const { promisify } = require("util")

class BootstrapService {
  constructor({ env: { OCTOBLU_UUID, OCTOBLU_TOKEN }, meshbluConfig }) {
    bindAll(Object.getOwnPropertyNames(BootstrapService.prototype), this)
    this.deviceCreated = OCTOBLU_UUID != null && OCTOBLU_TOKEN != null
    this.meshbluHttp = new MeshbluHttp(meshbluConfig)
  }

  async run() {
    if (this.deviceCreated) {
      return
    }
    const register = promisify(this.meshbluHttp.register)
    const { uuid, token } = await register({
      type: "service:octoblu",
      meshblu: {
        version: "2.0.0",
        whitelists: {},
      },
    })

    return {
      OCTOBLU_UUID: uuid,
      OCTOBLU_TOKEN: token,
    }
  }
}

module.exports = BootstrapService
