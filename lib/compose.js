const bindAll = require("lodash/fp/bindAll")
const compact = require("lodash/fp/compact")
const defaultsDeepAll = require("lodash/fp/defaultsDeepAll")
const flatten = require("lodash/fp/flatten")
const flow = require("lodash/fp/flow")
const get = require("lodash/fp/get")
const isEmpty = require("lodash/fp/isEmpty")
const map = require("lodash/fp/map")
const negate = require("lodash/fp/negate")
const omit = require("lodash/fp/omit")
const omitBy = require("lodash/fp/omitBy")
const replace = require("lodash/fp/replace")
const yaml = require("node-yaml")
const path = require("path")

const notEmpty = negate(isEmpty)
const omitDependencies = flow(omit("volumes.dependencies"), omitBy(isEmpty))

const duplicateServices = require("./helpers/duplicateServices")
const stripConstraints = require("./helpers/stripConstraints")

class Compose {
  constructor({ data, filename, stripConstraints }) {
    bindAll(Object.getOwnPropertyNames(Compose.prototype), this)
    if (isEmpty(filename)) throw new Error("Cannot be constructed without a filename")

    this.data = data
    this.filename = filename
    this.stripConstraints = stripConstraints
  }

  static fromYAMLFileSync(filename, { stripConstraints = false } = {}) {
    const data = yaml.readSync(filename)
    return new Compose({ data, filename, stripConstraints })
  }

  static fromYAMLFilesSync(filenames, { stripConstraints = false } = {}) {
    return new Compose({
      filename: "/dev/null",
      stripConstraints,
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

    const compose = Compose.fromYAMLFileSync(absolutePath, { stripConstraints: this.stripConstraints })
    return compose.toObject()
  }

  toObject() {
    const dependencyPaths = get("volumes.dependencies.labels", this.data)
    let dependencies = [this.data, ...map(this.resolveDepency, dependencyPaths)]

    if (notEmpty(duplicateServices(dependencies))) {
      throw new Error(
        `Dependency tree contained duplicate services: ${JSON.stringify(duplicateServices(dependencies))}`,
      )
    }

    const object = omitDependencies(defaultsDeepAll(dependencies))

    if (this.stripConstraints) return stripConstraints(object)

    return object
  }

  toYAMLFileSync(filename) {
    yaml.writeSync(filename, this.toObject())
  }

  volumes() {
    const { services } = this.toObject()
    const volumeStrings = flatten(compact(map('volumes', services))) // ['./foo:/data', './bar:/opt']
    const localPaths = map(replace(/:.*$/, ''), volumeStrings) // ['./foo', './bar']
    return map(localPath => ({ localPath }), localPaths) // [{ localPath: './foo' }, { localPath: './bar' }]
  }
}

module.exports = Compose
