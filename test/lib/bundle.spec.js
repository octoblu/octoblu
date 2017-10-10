const { beforeEach, it, expect } = global
const Bundle = require("../../lib/bundle")
const path = require("path")

describe("Bundle", function() {
  beforeEach("setup bundlesDir", function() {
    this.bundlesDir = path.join(__dirname, "../fixtures/bundles")
  })

  context("when generating a single bundle", function() {
    beforeEach("create bundle", function() {
      this.sut = new Bundle({ bundles: ["bumble-a"], bundlesDir: this.bundlesDir })
    })

    it("should output json", function() {
      const data = this.sut.toJSON()
      expect(data).to.deep.equal(["testpatcher"])
    })
  })

  context("when generating multiple bundles", function() {
    beforeEach("create bundle", function() {
      this.sut = new Bundle({ bundles: ["bumble-a", "bumble-b"], bundlesDir: this.bundlesDir })
    })

    it("should output json", function() {
      const data = this.sut.toJSON()
      expect(data).to.deep.equal(["testpatcher", "testworker"])
    })
  })
})
