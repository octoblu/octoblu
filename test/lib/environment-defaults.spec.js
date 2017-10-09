const { beforeEach, it, expect } = global
const Environment = require("../../lib/environment")

describe("Environment Defaults", function() {
  context("when getting the defaults for a single service", function() {
    beforeEach("create environment", function() {
      this.sut = new Environment({ services: ["meshblu-core-worker-webhook"] })
    })

    it("should output json", function() {
      const data = this.sut.defaults()
      expect(data).to.deep.equal({
        MESHBLU_PRIVATE_KEY_BASE64: "",
        REDIS_URI: "",
      })
    })
  })

  context("when getting the defaults for a multiple services", function() {
    beforeEach("create environment", function() {
      this.sut = new Environment({ services: ["meshblu-core-dispatcher", "meshblu-core-worker-webhook"] })
    })

    it("should output json", function() {
      const data = this.sut.defaults()
      expect(data).to.deep.equal({
        MONGODB_URI: "",
        MESHBLU_PRIVATE_KEY_BASE64: "",
        MESHBLU_PUBLIC_KEY_BASE64: "",
        REDIS_URI: "",
        MESHBLU_CORE_TOKEN: "",
      })
    })
  })
})
