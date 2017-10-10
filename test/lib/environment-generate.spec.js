const { beforeEach, it, expect } = global
const Environment = require("../../lib/environment")
const path = require("path")

describe("Generate Environment", function() {
  beforeEach("setup templatesDir", function() {
    this.templatesDir = path.join(__dirname, "../fixtures/templates")
  })

  context("when generating a single service", function() {
    beforeEach("create environment", function() {
      const values = {
        TESTPATCHER_URI: "some-testpatcher-uri",
        TEST_PATCHER_TOKEN: "some-testpatcher-token",
      }
      this.sut = new Environment({ services: ["testpatcher"], values, templatesDir: this.templatesDir })
    })

    it("should output json", function() {
      const data = this.sut.toJSON()
      expect(data).to.deep.equal({
        testpatcher: {
          TOKEN: "some-testpatcher-token",
          TESTPATCHER_URI: "some-testpatcher-uri",
        },
      })
    })
  })

  context("when generating two services", function() {
    beforeEach("create environment", function() {
      const values = {
        TESTPATCHER_URI: "some-testpatcher-uri",
        TEST_PATCHER_TOKEN: "some-testpatcher-token",
        TEST_PRIVATE_VAR: "some-private-var",
      }
      this.sut = new Environment({ services: ["testpatcher", "testworker"], values, templatesDir: this.templatesDir })
    })

    it("should output json", function() {
      const data = this.sut.toJSON()
      expect(data).to.deep.equal({
        testpatcher: {
          TOKEN: "some-testpatcher-token",
          TESTPATCHER_URI: "some-testpatcher-uri",
        },
        testworker: {
          TESTWORKER_PRIVATE: "some-private-var",
        },
      })
    })
  })
  context("when missing a required env value", function() {
    beforeEach("create environment", function() {
      this.sut = new Environment({ services: ["testpatcher"], values: {}, templatesDir: this.templatesDir })
    })

    it("should output json", function() {
      expect(() => {
        this.sut.toJSON()
      }).to.throw(ReferenceError, "TESTPATCHER_URI is not defined")
    })
  })
})
