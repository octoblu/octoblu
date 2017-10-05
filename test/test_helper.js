const chai = require('chai')
const chaiSubset = require('chai-subset')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

chai.use(sinonChai)
chai.use(chaiSubset)

global.expect = chai.expect
global.sinon = sinon
