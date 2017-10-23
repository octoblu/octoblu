const compact = require('lodash/fp/compact')
const countBy = require('lodash/fp/countBy')
const curry = require('lodash/fp/curry')
const every = require('lodash/fp/every')
const first = require('lodash/fp/first')
const flatMap = require('lodash/fp/flatMap')
const flow = require('lodash/fp/flow')
const identity = require('lodash/fp/identity')
const isEqual = require('lodash/fp/isEqual')
const keys = require('lodash/fp/keys')
const map = require('lodash/fp/map')
const pickBy = require('lodash/fp/pickBy')
const reject = require('lodash/fp/reject')

const pickKeysWhereValueGreaterThanOne = flow(pickBy(n => n > 1), keys)
const pluckKeysFromArrayOfObjects = flatMap(keys)
const pluckServices = map('services')
const pluckServiceNamesFromDependencies = flow(pluckServices, pluckKeysFromArrayOfObjects)

const duplicateServices = (dependencies) => {
  const serviceNames = pluckServiceNamesFromDependencies(dependencies)
  const duplicateServiceNames = pickKeysWhereValueGreaterThanOne(countBy(identity, serviceNames))

  return rejectIdenticalDuplicates(dependencies, duplicateServiceNames)
}

const duplicateIsIdentical = curry((dependencies, serviceName) => {
  const allServices = map('services', dependencies)
  const services = compact(map(serviceName, allServices))

  return every(isEqual(first(services)), services)
})

const rejectIdenticalDuplicates = (dependencies, duplicateServiceNames) => {
  return reject(duplicateIsIdentical(dependencies), duplicateServiceNames)
}

module.exports = duplicateServices
