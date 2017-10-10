const fs = require("fs-extra")
const path = require("path")
const reduce = require("lodash/fp/reduce")
const map = require("lodash/fp/map")
const flatMap = require("lodash/fp/flatMap")
const join = require("lodash/fp/join")
const pipe = require("lodash/fp/pipe")
const uniq = require("lodash/fp/uniq")
const trimCharsStart = require("lodash/fp/trimCharsStart")
const trimCharsEnd = require("lodash/fp/trimCharsEnd")
const values = require("lodash/values")
const objectMap = require("lodash/fp/map").convert({ cap: false })

const detemplate = pipe(trimCharsStart("{{"), trimCharsEnd("}}"))
const readServiceEnv = service => fs.readJSONSync(path.join(__dirname, "../../templates", service, "environment.json"))
const detemplateService = pipe(readServiceEnv, values, map(detemplate))
const getFlatEnvValues = pipe(flatMap(detemplateService), uniq)
const getServiceEnv = reduce((result, service) => {
  result[service] = readServiceEnv(service)
  return result
}, {})

const jsonToEnv = pipe(objectMap((value, key) => `${key}=${value}`), join("\n"))

module.exports = {
  getServiceEnv,
  getFlatEnvValues,
  jsonToEnv,
}
