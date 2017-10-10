#!/usr/bin/env node

const dashdash = require("dashdash")
const path = require("path")
const fs = require("fs-extra")
const each = require("lodash/each")
const Compose = require("./lib/compose")
const Environment = require("./lib/environment")
const { jsonToEnv } = require("./lib/helpers/environment-helper")

class Command {
  parseOptions() {
    const options = [
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
      },
      {
        names: ["output", "o"],
        type: "string",
        help: "Output directory for Octoblu stack files",
      },
      {
        names: ["services", "s"],
        type: "arrayOfString",
        help: "A list of services to generators",
        default: ["meshblu-core-dispatcher", "meshblu-core-worker-webhook"],
      },
    ]

    this.parser = dashdash.createParser({ options: options })
    const opts = this.parser.parse(process.argv)

    if (opts.help) {
      const help = this.parser.help({ includeEnv: true, includeDefaults: true }).trimRight()
      console.error("usage: octoblu-stack-generator [OPTIONS]\n" + "options:\n" + help)
      process.exit(0)
    }
    return opts
  }

  run() {
    const { init, output, defaults_file, services } = this.parseOptions()
    if (!output) {
      const help = this.parser.help({ includeEnv: true, includeDefaults: true }).trimRight()
      console.error("usage: octoblu-stack-generator [OPTIONS]\n" + "options:\n" + help)
      console.error("\noctoblu-stack-generator requires --output, -o option")
      process.exit(1)
    }
    const outputDirectory = path.resolve(output)
    const defaultsFilePath = defaults_file ? path.resolve(defaults_file) : path.join(outputDirectory, "defaults.json")
    if (init) return this.init({ outputDirectory, init, defaultsFilePath, services })
    this.compose({ services, outputDirectory })
    this.environment({ services, defaultsFilePath, outputDirectory })
  }

  init({ services, defaultsFilePath }) {
    const environment = new Environment({ services })
    return fs.writeJSONSync(defaultsFilePath, environment.defaults(), { spaces: 2 })
  }

  compose({ services, outputDirectory }) {
    const compose = new Compose({ services })
    fs.writeFileSync(path.join(outputDirectory, "docker-compose.yml"), compose.toYAML())
  }

  environment({ services, defaultsFilePath, outputDirectory }) {
    const values = fs.readJSONSync(defaultsFilePath)
    const environment = new Environment({ services, values })
    const envDir = path.join(outputDirectory, "env.d")
    fs.ensureDirSync(envDir)
    each(environment.toJSON(), (serviceEnv, serviceName) => {
      fs.writeFileSync(path.join(envDir, serviceName + ".env"), jsonToEnv(serviceEnv))
    })
  }
}

if (require.main === module) {
  const command = new Command()
  command.run()
} else {
  module.exports = Command
}
