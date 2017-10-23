const bindAll = require("lodash/fp/bindAll")
const cloneDeep = require("lodash/cloneDeep")
const defaults = require("lodash/defaults")
const random = require("lodash/random")
const path = require("path")
const fs = require("fs-extra")
const Promise = require("bluebird")
const MeshbluServer = require("meshblu-server")

class Bootstrap {
  constructor({ services, templatesDir, existingDefaults = {} }) {
    bindAll(Object.getOwnPropertyNames(Bootstrap.prototype), this)
    this.services = services
    this.templatesDir = templatesDir
    this.existingDefaults = existingDefaults
    this.meshbluConfig = {
      protocol: "http",
      hostname: "localhost",
      port: random(49152, 61000),
      keepAlive: true,
    }
  }

  async run() {
    await this._startMeshblu()
    const env = cloneDeep(this.existingDefaults)
    const result = await Promise.reduce(this.services, this._bootstrapService, env)
    await this._stopMeshblu()
    return result
  }

  async _bootstrapService(env, serviceName) {
    const bootstrapFilePath = path.join(this.templatesDir, serviceName, "bootstrap.js")
    try {
      fs.accessSync(bootstrapFilePath, fs.constants.R_OK)
    } catch (err) {
      return env
    }
    const Service = require(bootstrapFilePath)
    const service = new Service({ env: cloneDeep(env), meshbluConfig: this.meshbluConfig })
    const result = await service.run()
    return defaults(env, result)
  }

  async _startMeshblu() {
    const {
      REDIS_URI,
      MONGODB_URI,
      MESHBLU_PRIVATE_KEY_BASE64,
      MESHBLU_PUBLIC_KEY_BASE64,
      MESHBLU_CORE_TOKEN,
    } = this.existingDefaults
    if (!REDIS_URI) {
      throw new Error("Bootstrap requires REDIS_URI in defaults.env")
    }
    if (!MONGODB_URI) {
      throw new Error("Bootstrap requires MONGODB_URI in defaults.env")
    }
    if (!MESHBLU_PRIVATE_KEY_BASE64) {
      throw new Error("Bootstrap requires MESHBLU_PRIVATE_KEY_BASE64 in defaults.env")
    }
    if (!MESHBLU_PUBLIC_KEY_BASE64) {
      throw new Error("Bootstrap requires MESHBLU_PUBLIC_KEY_BASE64 in defaults.env")
    }
    if (!MESHBLU_CORE_TOKEN) {
      throw new Error("Bootstrap requires MESHBLU_CORE_TOKEN in defaults.env")
    }
    this.meshbluServer = new MeshbluServer({
      dispatcherWorker: {
        namespace: "meshblu",
        timeoutSeconds: 1,
        singleRun: false,
        concurrency: 2,
        requestQueueName: "meshblu-request-queue",
        jobLogSampleRate: 0,
        jobLogQueue: "job-log:sample-rate:0",
        jobLogRedisUri: REDIS_URI,
        cacheRedisUri: REDIS_URI,
        firehoseRedisUri: REDIS_URI,
        redisUri: REDIS_URI,
        mongoDBUri: MONGODB_URI,
        privateKey: MESHBLU_PRIVATE_KEY_BASE64,
        publicKey: MESHBLU_PUBLIC_KEY_BASE64,
        pepper: MESHBLU_CORE_TOKEN,
      },
      meshbluHttp: {
        cacheRedisUri: REDIS_URI,
        redisUri: REDIS_URI,
        jobLogRedisUri: REDIS_URI,
        jobLogSampleRate: 0,
        jobLogQueue: "job-log:sample-rate:0",
        namespace: "meshblu",
        requestQueueName: "meshblu-request-queue",
        responseQueueName: "meshblu-response-queue",
        jobTimeoutSeconds: 2,
        maxConnections: 15,
        port: this.meshbluConfig.port,
      },
      meshbluFirehose: {
        disable: true,
      },
      webhookWorker: {
        disable: true,
      },
    })
    const prepare = Promise.promisify(this.meshbluServer.prepare)
    const run = Promise.promisify(this.meshbluServer.run)
    await prepare()
    await run()
  }

  _stopMeshblu() {
    const destroy = Promise.promisify(this.meshbluServer.destroy)
    return destroy()
  }
}

module.exports = Bootstrap
