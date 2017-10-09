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
        names: ["init"],
        type: "bool",
        help: "Generate defaults json file",
      },
      {
        names: ["defaults-file", "d"],
        type: "string",
        completionType: "filename",
        help: "A json file containing the default environment variables",
        default: "./defaults.json",
      },
      {
        names: ["services", "s"],
        type: "arrayOfString",
        help: "A list of services to generators",
        default: ["meshblu-core-dispatcher", "meshblu-core-worker-webhook"],
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
    if (opts.init) return this.init(opts)
    this.compose(opts)
    this.environment(opts)
  }

  init({ services, defaults_file }) {
    const environment = new Environment({ services })
    return fs.writeJSONSync(path.resolve(defaults_file), environment.defaults(), { spaces: 2 })
  }

  compose({ services }) {
    const compose = new Compose({ services })
    console.log(JSON.stringify(compose.toJSON(), null, 2))
  }

  environment({ services, defaults_file }) {
    const values = fs.readJSONSync(path.resolve(defaults_file))
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
