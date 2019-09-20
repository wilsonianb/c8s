import * as Hapi from '@hapi/hapi'
import registerContainersController from '../controllers/containers'
import registerStaticController from '../controllers/static'
import registerProxyController from '../controllers/proxy'
import SelfTestCheck from '../services/SelfTestCheck'
import { Injector } from 'reduct'
import * as Inert from '@hapi/inert'
import * as Vision from '@hapi/vision'
import * as Handlebars from 'handlebars'
import * as path from 'path'
import Config from './Config'

import { create as createLogger } from '../common/log'
const log = createLogger('HttpServer')

export default class HttpServer {
  private config: Config
  private selfTestCheck: SelfTestCheck
  private server: Hapi.Server

  constructor (deps: Injector) {
    this.config = deps(Config)
    this.selfTestCheck = deps(SelfTestCheck)
    this.server = new Hapi.Server({
      uri: this.config.publicUri.replace(/\/+$/, ''),
      address: this.config.bindIp,
      port: this.config.port,
      mime: {
        override: {
          // Streaming responses shouldn't get buffered so for simplicity we'll
          // just turn off compression for them.
          'application/vnd.codius.raw-stream': {
            compressible: false
          }
        }
      }
    })

    registerContainersController(this.server, deps)
    registerStaticController(this.server, deps)
    registerProxyController(this.server, deps)
  }

  async init () {
    await this.server.register({ plugin: require('@hapi/h2o2') })
    await this.server.register(this.selfTestCheck.checkSelfTestPlugin)
    await this.server.register(Inert)
    await this.server.register(Vision)
    this.server.views({
      engines: {
        html: Handlebars
      },
      relativeTo: path.resolve(__dirname, '../'),
      path: 'public/templates'
    })

    this.server.route({
      method: 'GET',
      path: '/assets/app.bundle.js',
      handler: {
        file: path.join(__dirname, '../public/assets/app.bundle.js')
      }
    })

    this.server.route({
      method: 'GET',
      path: '/assets/proxy.bundle.js',
      handler: {
        file: path.join(__dirname, '../public/assets/proxy.bundle.js')
      }
    })
    await this.server.initialize()
  }

  async start () {
    await this.server.start()

    log.info('listening at %s', this.server.info.uri)
  }

  async stop () {
    await this.server.stop()

    log.info('server stopped')
  }

  getServer () {
    if (process.env.NODE_ENV === 'test') {
      return this.server
    }
    return null
  }
}
