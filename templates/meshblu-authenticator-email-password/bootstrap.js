const bindAll = require("lodash/fp/bindAll")
const MeshbluHttp = require("meshblu-http")
const NodeRSA = require("node-rsa")
const { promisify } = require("util")

class BootstrapService {
  constructor({ env, meshbluConfig }) {
    bindAll(Object.getOwnPropertyNames(BootstrapService.prototype), this)
    this.deviceCreated = env.EMAIL_PASSWORD_AUTHENTICATOR_UUID != null && env.EMAIL_PASSWORD_AUTHENTICATOR_TOKEN != null
    this.meshbluHttp = new MeshbluHttp(meshbluConfig)
  }

  async run() {
    if (this.deviceCreated) {
      return
    }
    const register = promisify(this.meshbluHttp.register)
    const key = new NodeRSA()
    key.generateKeyPair(1024)
    const privateKey = key.exportKey("private")
    const publicKey = key.exportKey("public")

    const { uuid, token } = await register({
      type: "authenticator:email-password",
      name: "Authenticator Email Password",
      privateKey,
      publicKey,
      discoverWhitelist: [],
      receiveWhitelist: [],
      sendWhitelist: [],
      configureWhitelist: [],
    })

    return {
      EMAIL_PASSWORD_AUTHENTICATOR_UUID: uuid,
      EMAIL_PASSWORD_AUTHENTICATOR_TOKEN: token,
    }
  }
}

module.exports = BootstrapService
