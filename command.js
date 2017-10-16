#!/usr/bin/env node

const dashdash = require("dashdash")
const path = require("path")
const fs = require("fs-extra")
const each = require("lodash/each")
const keys = require("lodash/fp/keys")
const map = require("lodash/fp/map")
const Compose = require("./lib/compose")
const Environment = require("./lib/environment")
const parseEnv = require("./lib/helpers/parse-env-file")
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
        names: ["defaults", "d"],
        type: "string",
        completionType: "filename",
        help: "A .json, or .env file containing the default environment variables",
      },
      {
        names: ["output", "o"],
        type: "string",
        help: "Output directory for Octoblu stack files",
      },
      {
        names: ["stacks", "s"],
        type: "arrayOfString",
        help: "A list of docker stacks files to generate",
        default: ["meshblu-core"],
      },
      {
        names: ["stacks-dir"],
        type: "string",
        completionType: "filename",
        help: "Stacks directory",
        default: path.join(__dirname, "stacks"),
      },
      {
        names: ["templates-dir"],
        type: "string",
        completionType: "filename",
        help: "Template directory",
        default: path.join(__dirname, "templates"),
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
    const { init, output, defaults, stacks, stacks_dir, templates_dir } = this.parseOptions()
    if (!output) {
      const help = this.parser.help({ includeEnv: true, includeDefaults: true }).trimRight()
      console.error("usage: octoblu-stack-generator [OPTIONS]\n" + "options:\n" + help)
      console.error("\noctoblu-stack-generator requires --output, -o option")
      process.exit(1)
    }

    const templatesDir = templates_dir
    const outputDirectory = path.resolve(output)
    const defaultsFilePath = defaults ? path.resolve(defaults) : path.join(outputDirectory, "defaults.env")

    const absoluteStacksDir = path.isAbsolute(stacks_dir) ? stacks_dir : path.join(process.cwd(), stacks_dir)
    const stackPaths = map(filePath => `${path.join(absoluteStacksDir, filePath)}.yml`, stacks)
    const compose = Compose.fromYAMLFilesSync(stackPaths)
    const services = keys(compose.toObject().services)

    if (init) return this.init({ outputDirectory, init, defaultsFilePath, services, templatesDir })

    compose.toYAMLFileSync(path.join(outputDirectory, "docker-compose.yml"))
    this.environment({ services, defaultsFilePath, outputDirectory, templatesDir })
  }

  init({ services, defaultsFilePath, templatesDir }) {
    const environment = new Environment({ services, templatesDir })
    if (path.extname(defaultsFilePath) === ".env") {
      fs.writeFileSync(defaultsFilePath, jsonToEnv(environment.defaults()))
      return
    }
    fs.writeJSONSync(defaultsFilePath, environment.defaults(), { spaces: 2 })
  }

  compose({ services, outputDirectory, templatesDir }) {
    const compose = new Compose({ services, templatesDir })
    fs.writeFileSync(path.join(outputDirectory, "docker-compose.yml"), compose.toYAML())
  }

  environment({ services, defaultsFilePath, outputDirectory, templatesDir }) {
    let values
    if (path.extname(defaultsFilePath) === ".env") {
      values = parseEnv(fs.readFileSync(defaultsFilePath, "utf8"))
    } else {
      values = fs.readJSONSync(defaultsFilePath)
    }
    const environment = new Environment({ services, values, templatesDir })
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
