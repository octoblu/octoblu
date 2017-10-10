const { beforeEach, it, expect } = global
const path = require("path")
const yaml = require("node-yaml")
const Compose = require("../../lib/compose")

describe("Compose", function() {
  beforeEach("setup templatesDir", function() {
    this.templatesDir = path.join(__dirname, "../fixtures/templates")
  })

  context("when generating a single service", function() {
    beforeEach("create compose", function() {
      this.sut = new Compose({ services: ["testpatcher"], templatesDir: this.templatesDir })
    })

    it("should output json", function() {
      const data = this.sut.toJSON()
      expect(data).to.deep.equal({
        version: "3",
        services: {
          testpatcher: {
            image: "test/patcher:latest",
            env_file: "./env.d/testpatcher.env",
            deploy: {
              replicas: 2,
            },
            networks: ["test"],
          },
        },
      })
    })
    it("should output yaml", function() {
      const data = this.sut.toYAML()
      expect(yaml.parse(data)).to.deep.equal({
        version: "3",
        services: {
          testpatcher: {
            image: "test/patcher:latest",
            env_file: "./env.d/testpatcher.env",
            deploy: {
              replicas: 2,
            },
            networks: ["test"],
          },
        },
      })
    })
  })

  context("when generating two services", function() {
    beforeEach("create compose", function() {
      this.sut = new Compose({ services: ["testpatcher", "testworker"], templatesDir: this.templatesDir })
    })

    it("should output json", function() {
      const data = this.sut.toJSON()
      expect(data).to.deep.equal({
        version: "3",
        services: {
          testpatcher: {
            image: "test/patcher:latest",
            env_file: "./env.d/testpatcher.env",
            deploy: {
              replicas: 2,
            },
            networks: ["test"],
          },
          testworker: {
            image: "test/worker:latest",
            env_file: "./env.d/testworker.env",
            deploy: {
              replicas: 2,
            },
            networks: ["test"],
          },
        },
      })
    })
    it("should output yaml", function() {
      const data = this.sut.toYAML()
      expect(yaml.parse(data)).to.deep.equal({
        version: "3",
        services: {
          testpatcher: {
            image: "test/patcher:latest",
            env_file: "./env.d/testpatcher.env",
            deploy: {
              replicas: 2,
            },
            networks: ["test"],
          },
          testworker: {
            image: "test/worker:latest",
            env_file: "./env.d/testworker.env",
            deploy: {
              replicas: 2,
            },
            networks: ["test"],
          },
        },
      })
    })
  })

  context("when the service does not exist", function() {
    beforeEach("create compose", function() {
      this.sut = new Compose({ services: ["nope"], templatesDir: this.templatesDir })
    })

    describe("when calling toJSON", function() {
      it("should throw an error", function() {
        expect(() => {
          this.sut.toJSON()
        }).to.throw()
      })
    })
    describe("when calling toYAML", function() {
      it("should throw an error", function() {
        expect(() => {
          this.sut.toYAML()
        }).to.throw()
      })
    })
  })
})
