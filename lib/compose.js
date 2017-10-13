const bindAll = require("lodash/fp/bindAll")
const compose = require("lodash/fp/compose")
const extendAll = require("lodash/fp/extendAll")
const get = require("lodash/fp/get")
const isEmpty = require("lodash/fp/isEmpty")
const map = require("lodash/fp/map")
const negate = require("lodash/fp/negate")
const yaml = require("node-yaml")
const path = require("path")

const notEmpty = negate(isEmpty)

const duplicateServices = require('./helpers/duplicateServices')

class Compose {
  constructor({ data, filePath }) {
    bindAll(Object.getOwnPropertyNames(Compose.prototype), this)
    if (isEmpty(filePath)) throw new Error('Missing required parameter: filePath')

    this.data = data
    this.filePath = filePath
  }

  static fromYAMLFileSync(filePath) {
    const data = yaml.readSync(filePath)
    return new Compose({ data, filePath })
  }

  resolveDepency(dependencyPath) {
    const dirname = path.dirname(this.filePath)
    const absolutePath = path.join(dirname, dependencyPath)

    const compose = Compose.fromYAMLFileSync(absolutePath)
    return compose.toYAML()
  }

  toYAML() {
    const dependencyPaths = get('volumes.dependencies.labels', this.data)
    const dependencies = [this.data, ...map(this.resolveDepency, dependencyPaths)]

    if (notEmpty(duplicateServices(dependencies))) {
      throw new Error(`Dependency tree contained duplicate services: ${JSON.stringify(duplicateServices(dependencies))}`)
    }

    return extendAll(dependencies)
  }

  toYAMLFileSync(filePath) {
    yaml.writeSync(filePath, this.toYAML())
  }
}

module.exports = Compose
