const bindAll = require("lodash/fp/bindAll")
const isEmpty = require("lodash/isEmpty")
const fs = require("fs-extra")
const path = require("path")
const flatMap = require("lodash/flatMap")

class Bundle {
  constructor({ bundles, bundlesDir }) {
    bindAll(Object.getOwnPropertyNames(Bundle.prototype), this)
    if (isEmpty(bundles)) throw new Error("Bundle requires bundles")
    if (isEmpty(bundlesDir)) throw new Error("Bundle requires bundlesDir")
    this.bundles = bundles
    this.bundlesDir = bundlesDir
  }

  toJSON() {
    return flatMap(this.bundles, bundle => {
      const data = fs.readJSONSync(path.join(this.bundlesDir, bundle + ".json"))
      return data.services
    })
  }
}

module.exports = Bundle
