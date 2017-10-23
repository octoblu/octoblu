const defaults = require("lodash/fp/defaults")
const mapValues = require("lodash/fp/mapValues")
const omit = require("lodash/fp/omit")

const stripConstraints = (dependencies) => {
  const services = mapValues(omit('deploy.placement.constraints'), dependencies.services)
  return defaults(dependencies, { services })
}

module.exports = stripConstraints
