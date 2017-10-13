#!/usr/bin/env node

const dashdash = require("dashdash")
const path = require("path")
const fs = require("fs-extra")
const each = require("lodash/each")
const map = require("lodash/map")
const Compose = require("./lib/compose")
const Environment = require("./lib/environment")
// const Bundle = require("./lib/bundle")
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
        names: ["stacks", "s"],
        type: "arrayOfString",
        help: "A list of docker stacks files to generate",
        default: ["meshblu-core"],
      },
      {
        names: ["stacks-dir"],
        type: "string",
        completionType: "filename",
        help: "Bundles directory",
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
    const { init, output, defaults_file, stacks, stacks_dir, templates_dir } = this.parseOptions()
    if (!output) {
      const help = this.parser.help({ includeEnv: true, includeDefaults: true }).trimRight()
      console.error("usage: octoblu-stack-generator [OPTIONS]\n" + "options:\n" + help)
      console.error("\noctoblu-stack-generator requires --output, -o option")
      process.exit(1)
    }

    // const templatesDir = templates_dir
    const outputDirectory = path.resolve(output)
    // const defaultsFilePath = defaults_file ? path.resolve(defaults_file) : path.join(outputDirectory, "defaults.json")

    const stackPaths = map((filePath) => `${path.join(stacks_dir, filePath)}.yml`, stacks)
    const compose = Compose.fromYAMLFilesSync(stackPaths)
    compose.toYAMLFileSync(path.join(outputDirectory, 'docker-compose.yml'))
    // const bundle = new Bundle({ bundles, bundlesDir })
    // const services = bundle.toJSON()
    //
    // if (init) return this.init({ outputDirectory, init, defaultsFilePath, services, templatesDir })

    // this.compose({ services, outputDirectory, templatesDir })
    // this.environment({ services, defaultsFilePath, outputDirectory, templatesDir })
  }

  init({ services, defaultsFilePath, templatesDir }) {
    const environment = new Environment({ services, templatesDir })
    return fs.writeJSONSync(defaultsFilePath, environment.defaults(), { spaces: 2 })
  }

  compose({ services, outputDirectory, templatesDir }) {
    const compose = new Compose({ services, templatesDir })
    fs.writeFileSync(path.join(outputDirectory, "docker-compose.yml"), compose.toYAML())
  }

  environment({ services, defaultsFilePath, outputDirectory, templatesDir }) {
    const values = fs.readJSONSync(defaultsFilePath)
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
