const countBy = require('lodash/fp/countBy')
const flatMap = require('lodash/fp/flatMap')
const flow = require('lodash/fp/flow')
const identity = require('lodash/fp/identity')
const keys = require('lodash/fp/keys')
const map = require('lodash/fp/map')
const pickBy = require('lodash/fp/pickBy')

const pickKeysWhereValueGreaterThanOne = flow(pickBy(n => n > 1), keys)
const pluckKeysFromArrayOfObjects = flatMap(keys)
const pluckServices = map('services')
const pluckServiceNamesFromDependencies = flow(pluckServices, pluckKeysFromArrayOfObjects)

const duplicateServices = (dependencies) => {
  const serviceNames = pluckServiceNamesFromDependencies(dependencies)
  return pickKeysWhereValueGreaterThanOne(countBy(identity, serviceNames))
}

module.exports = duplicateServices
