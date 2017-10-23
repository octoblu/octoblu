const bindAll = require("lodash/fp/bindAll")

class BootstrapService {
  constructor({ MESHBLU_UUID }) {
    bindAll(Object.getOwnPropertyNames(BootstrapService.prototype), this)
    this.MESHBLU_UUID = MESHBLU_UUID
  }

  run() {
    return {
      SOME_NEW_ENV: "hello",
    }
  }
}

module.exports = BootstrapService
