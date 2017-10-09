#!/usr/bin/env node

const dashdash = require("dashdash")
const path = require("path")
const fs = require("fs-extra")
const Compose = require("./lib/compose")
const Environment = require("./lib/environment")

class Command {
  parseOptions() {
    var options = [
      {
        names: ["help", "h"],
        type: "bool",
        help: "Print this help and exit.",
      },
      {
        names: ["defaults", "d"],
        type: "string",
        help: "A json file containing the default environment variables",
        default: "./defaults.json",
      },
    ]

    var parser = dashdash.createParser({ options: options })
    var opts = parser.parse(process.argv)

    if (opts.help) {
      var help = parser.help({ includeEnv: true }).trimRight()
      console.log("usage: node command.js [OPTIONS]\n" + "options:\n" + help)
      process.exit(0)
    }
    return opts
  }

  run() {
    const opts = this.parseOptions()
    this.compose(opts)
    this.environment(opts)
  }

  compose() {
    const services = ["meshblu-core-dispatcher", "meshblu-core-worker-webhook"]
    const compose = new Compose({ services })
    console.log(JSON.stringify(compose.toJSON(), null, 2))
  }

  environment({ defaults }) {
    const values = fs.readJSONSync(path.resolve(defaults))
    const services = ["meshblu-core-dispatcher", "meshblu-core-worker-webhook"]
    const environment = new Environment({ services, values })
    console.log(JSON.stringify(environment.toJSON(), null, 2))
  }
}

if (require.main === module) {
  const command = new Command()
  command.run()
} else {
  module.exports = Command
}
