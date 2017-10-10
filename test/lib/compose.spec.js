const { beforeEach, it, expect } = global
const yaml = require("node-yaml")
const Compose = require("../../lib/compose")

describe("Compose", function() {
  context("when generating a single service", function() {
    beforeEach("create compose", function() {
      this.sut = new Compose({ services: ["meshblu-core-dispatcher"] })
    })

    it("should output json", function() {
      const data = this.sut.toJSON()
      expect(data).to.deep.equal({
        version: "3",
        services: {
          "meshblu-core-dispatcher": {
            image: "octoblu/meshblu-core-dispatcher:latest",
            env_file: "./env.d/meshblu-core-dispatcher.env",
            deploy: {
              replicas: 2,
            },
            networks: ["meshblu"],
          },
        },
      })
    })
    it("should output yaml", function() {
      const data = this.sut.toYAML()
      expect(yaml.parse(data)).to.deep.equal({
        version: "3",
        services: {
          "meshblu-core-dispatcher": {
            image: "octoblu/meshblu-core-dispatcher:latest",
            env_file: "./env.d/meshblu-core-dispatcher.env",
            deploy: {
              replicas: 2,
            },
            networks: ["meshblu"],
          },
        },
      })
    })
  })

  context("when generating two services", function() {
    beforeEach("create compose", function() {
      this.sut = new Compose({ services: ["meshblu-core-dispatcher", "meshblu-core-worker-webhook"] })
    })

    it("should output json", function() {
      const data = this.sut.toJSON()
      expect(data).to.deep.equal({
        version: "3",
        services: {
          "meshblu-core-dispatcher": {
            image: "octoblu/meshblu-core-dispatcher:latest",
            env_file: "./env.d/meshblu-core-dispatcher.env",
            deploy: {
              replicas: 2,
            },
            networks: ["meshblu"],
          },
          "meshblu-core-worker-webhook": {
            image: "octoblu/meshblu-core-worker-webhook:latest",
            env_file: "./env.d/meshblu-core-worker-webhook.env",
            deploy: {
              replicas: 2,
            },
            networks: ["meshblu"],
          },
        },
      })
    })
    it("should output yaml", function() {
      const data = this.sut.toYAML()
      expect(yaml.parse(data)).to.deep.equal({
        version: "3",
        services: {
          "meshblu-core-dispatcher": {
            image: "octoblu/meshblu-core-dispatcher:latest",
            env_file: "./env.d/meshblu-core-dispatcher.env",
            deploy: {
              replicas: 2,
            },
            networks: ["meshblu"],
          },
          "meshblu-core-worker-webhook": {
            image: "octoblu/meshblu-core-worker-webhook:latest",
            env_file: "./env.d/meshblu-core-worker-webhook.env",
            deploy: {
              replicas: 2,
            },
            networks: ["meshblu"],
          },
        },
      })
    })
  })

  context("when the service does not exist", function() {
    beforeEach("create compose", function() {
      this.sut = new Compose({ services: ["nope"] })
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
