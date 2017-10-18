const bindAll = require("lodash/fp/bindAll")
const defaultsDeepAll = require("lodash/fp/defaultsDeepAll")
const flow = require("lodash/fp/flow")
const get = require("lodash/fp/get")
const isEmpty = require("lodash/fp/isEmpty")
const map = require("lodash/fp/map")
const negate = require("lodash/fp/negate")
const omit = require("lodash/fp/omit")
const omitBy = require("lodash/fp/omitBy")
const yaml = require("node-yaml")
const path = require("path")

const notEmpty = negate(isEmpty)
const omitDependencies = flow(omit("volumes.dependencies"), omitBy(isEmpty))

const duplicateServices = require("./helpers/duplicateServices")

class Compose {
  constructor({ data, filename }) {
    bindAll(Object.getOwnPropertyNames(Compose.prototype), this)
    if (isEmpty(filename)) throw new Error("Cannot be constructed without a filename")

    this.data = data
    this.filename = filename
  }

  static fromYAMLFileSync(filename) {
    const data = yaml.readSync(filename)
    return new Compose({ data, filename })
  }

  static fromYAMLFilesSync(filenames) {
    return new Compose({
      filename: "/dev/null",
      data: {
        volumes: {
          dependencies: {
            labels: filenames,
          },
        },
      },
    })
  }

  absoluteDependencyPath(dependencyPath) {
    if (path.isAbsolute(dependencyPath)) return dependencyPath

    const dirname = path.dirname(this.filename)
    return path.join(dirname, dependencyPath)
  }

  resolveDepency(dependencyPath) {
    const absolutePath = this.absoluteDependencyPath(dependencyPath)

    const compose = Compose.fromYAMLFileSync(absolutePath)
    return compose.toObject()
  }

  toObject() {
    const dependencyPaths = get("volumes.dependencies.labels", this.data)
    const dependencies = [this.data, ...map(this.resolveDepency, dependencyPaths)]

    if (notEmpty(duplicateServices(dependencies))) {
      throw new Error(
        `Dependency tree contained duplicate services: ${JSON.stringify(duplicateServices(dependencies))}`,
      )
    }

    return omitDependencies(defaultsDeepAll(dependencies))
  }

  toYAMLFileSync(filename) {
    yaml.writeSync(filename, this.toObject())
  }
}

module.exports = Compose
