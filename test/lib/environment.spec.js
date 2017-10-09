const { beforeEach, it, expect } = global
const Environment = require("../../lib/environment")

describe("Environment", function() {
  context("when generating a single service", function() {
    beforeEach("create environment", function() {
      const values = {
        MESHBLU_CORE_TOKEN: "meshblu-pepper",
        MESHBLU_PRIVATE_KEY_BASE64: "meshblu-private-key-base64",
        MESHBLU_PUBLIC_KEY_BASE64: "meshblu-public-key-base64",
        MONGODB_URI: "mongodb://localhost",
        REDIS_URI: "redis://localhost",
      }
      this.sut = new Environment({ services: ["meshblu-core-dispatcher"], values })
    })

    it("should output json", function() {
      const data = this.sut.toJSON()
      expect(data).to.deep.equal({
        "meshblu-core-dispatcher": {
          MONGODB_URI: "mongodb://localhost",
          PRIVATE_KEY_BASE64: "meshblu-private-key-base64",
          PUBLIC_KEY_BASE64: "meshblu-public-key-base64",
          REDIS_URI: "redis://localhost",
          TOKEN: "meshblu-pepper",
        },
      })
    })
  })

  context("when generating two services", function() {
    beforeEach("create environment", function() {
      const values = {
        MESHBLU_CORE_TOKEN: "meshblu-pepper",
        MESHBLU_PRIVATE_KEY_BASE64: "meshblu-private-key-base64",
        MESHBLU_PUBLIC_KEY_BASE64: "meshblu-public-key-base64",
        MONGODB_URI: "mongodb://localhost",
        REDIS_URI: "redis://localhost",
      }
      this.sut = new Environment({ services: ["meshblu-core-dispatcher", "meshblu-core-worker-webhook"], values })
    })

    it("should output json", function() {
      const data = this.sut.toJSON()
      expect(data).to.deep.equal({
        "meshblu-core-dispatcher": {
          MONGODB_URI: "mongodb://localhost",
          PRIVATE_KEY_BASE64: "meshblu-private-key-base64",
          PUBLIC_KEY_BASE64: "meshblu-public-key-base64",
          REDIS_URI: "redis://localhost",
          TOKEN: "meshblu-pepper",
        },
        "meshblu-core-worker-webhook": {
          PRIVATE_KEY_BASE64: "meshblu-private-key-base64",
          REDIS_URI: "redis://localhost",
        },
      })
    })
  })
  context("when missing a required env value", function() {
    beforeEach("create environment", function() {
      this.sut = new Environment({ services: ["meshblu-core-dispatcher"], values: {} })
    })

    it("should output json", function() {
      expect(() => {
        this.sut.toJSON()
      }).to.throw(ReferenceError, "MONGODB_URI is not defined")
    })
  })
})
