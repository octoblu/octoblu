#!/usr/bin/env node

const dashdash = require("dashdash")
const Compose = require("./lib/compose")

class Command {
  parseOptions() {
    var options = [
      {
        names: ["help", "h"],
        type: "bool",
        help: "Print this help and exit.",
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
  }

  compose() {
    const services = ["meshblu-core-dispatcher"]
    const compose = new Compose({ services })
    console.log(compose.toJSON())
  }
}

if (require.main === module) {
  const command = new Command()
  command.run()
} else {
  module.exports = Command
}
