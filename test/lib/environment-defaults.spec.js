const { beforeEach, it, expect } = global
const Environment = require("../../lib/environment")
const path = require("path")

describe("Environment Defaults", function() {
  beforeEach("setup templatesDir", function() {
    this.templatesDir = path.join(__dirname, "../fixtures/templates")
  })

  context("when getting the defaults for a single service", function() {
    beforeEach("create environment", function() {
      this.sut = new Environment({ services: ["testworker"], templatesDirs: [this.templatesDir] })
    })

    it("should output json", function() {
      const data = this.sut.defaults()
      expect(data).to.deep.equal({
        TEST_PRIVATE_VAR: "",
      })
    })
  })

  context("when getting the service contains a non-templated env", function() {
    beforeEach("create environment", function() {
      this.sut = new Environment({ services: ["testoddcase"], templatesDirs: [this.templatesDir] })
    })

    it("should output json", function() {
      const data = this.sut.defaults()
      expect(data).to.deep.equal({
        TEST_ODD_CASE: "works",
      })
    })
  })

  context("when getting the defaults for a multiple services", function() {
    beforeEach("create environment", function() {
      this.sut = new Environment({ services: ["testpatcher", "testworker"], templatesDirs: [this.templatesDir] })
    })

    it("should output json", function() {
      const data = this.sut.defaults()
      expect(data).to.deep.equal({
        TEST_PATCHER_TOKEN: "",
        TEST_PRIVATE_VAR: "",
        TESTPATCHER_URI: "",
      })
    })
  })
})
