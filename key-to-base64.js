#!/usr/bin/env node

const dashdash = require("dashdash")
const path = require("path")
const fs = require("fs-extra")
const parseEnv = require("./lib/helpers/parse-env-file")
const NodeRSA = require("node-rsa")

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
        "usage: key-to-base64 </path/to/input-file.env>\n" + "options:\n" + help,
      )
      process.exit(0)
    }

    const [input] = opts._args
    if (!input) {
      const help = this.parser.help({ includeEnv: true, includeDefaults: true }).trimRight()
      console.error(
        "usage: key-to-base64  </path/to/input-file.env>\n" + "options:\n" + help,
      )
      console.error("Missing input path")
      process.exit(1)
    }
    const inputFilePath = path.resolve(input)

    return { inputFilePath }
  }

  run() {
    const { inputFilePath } = this.parseOptions()
    const input = fs.readFileSync(inputFilePath, "utf8")
    let format = 'private'
    if (input.match(/PUBLIC KEY/)) format = 'public'
    const key = new NodeRSA(input, format)
    const exportReplace = key.exportKey(format) //.replace(/\n/g, '')
    console.log(Buffer.from(exportReplace).toString('base64'))
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
