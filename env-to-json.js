#!/usr/bin/env node

const dashdash = require("dashdash")
const path = require("path")
const fs = require("fs-extra")
const parseEnv = require("./lib/helpers/parse-env-file")

class Command {
  parseOptions() {
    const options = [
      {
        names: ["help", "h"],
        type: "bool",
        help: "Print this help and exit.",
      },
    ]

    this.parser = dashdash.createParser({ options: options })
    const opts = this.parser.parse(process.argv)

    if (opts.help) {
      const help = this.parser.help({ includeEnv: true, includeDefaults: true }).trimRight()
      console.error(
        "usage: env-to-json </path/to/input-file.env> [</path/to/output-file.json>]\n" + "options:\n" + help,
      )
      process.exit(0)
    }

    const [input, output] = opts._args
    if (!input) {
      const help = this.parser.help({ includeEnv: true, includeDefaults: true }).trimRight()
      console.error(
        "usage: env-to-json </path/to/input-file.env> [</path/to/output-file.json>]\n" + "options:\n" + help,
      )
      console.error("Missing input path")
      process.exit(1)
    }
    let outputFilePath
    if (output) {
      outputFilePath = path.resolve(output)
    }
    const inputFilePath = path.resolve(input)

    return { inputFilePath, outputFilePath }
  }

  run() {
    const { inputFilePath, outputFilePath } = this.parseOptions()
    const input = fs.readFileSync(inputFilePath, "utf8")
    const output = this.convert(input)
    if (outputFilePath) {
      fs.writeJSONSync(outputFilePath, output)
    } else {
      console.log(JSON.stringify(output, null, 2))
    }
  }

  convert(input) {
    return parseEnv(input)
  }
}

if (require.main === module) {
  const command = new Command()
  command.run()
} else {
  module.exports = Command
}
