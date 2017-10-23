const { expect } = require('chai')
const duplicateServices = require('../../../lib/helpers/duplicateServices')

describe('->duplicateServices', () => {
  describe('when called with an empty array', () => {
    it('should return an empty array', () => {
      expect(duplicateServices([])).to.deep.equal([])
    })
  })

  describe('when called with a two dependencies that have a duplicate, identical service', () => {
    it('should return an empty array', () => {
      const dependencies = [{
        services: {
          foo: 1
        },
      }, {
        services: {
          foo: 1
        },
      }]
      expect(duplicateServices(dependencies)).to.deep.equal([])
    })
  })

  describe('when called with a two dependencies that have a duplicate, non-identical service', () => {
    it('should return an empty array', () => {
      const dependencies = [{
        services: {
          foo: 1
        },
      }, {
        services: {
          foo: 2
        },
      }]
      expect(duplicateServices(dependencies)).to.deep.equal(['foo'])
    })
  })

  describe('when called with a two dependencies that have no duplicate service', () => {
    it('should return an empty array', () => {
      const dependencies = [{
        services: {
          foo: null
        },
      }, {
        services: {
          bar: null
        },
      }]
      expect(duplicateServices(dependencies)).to.deep.equal([])
    })
  })
})
