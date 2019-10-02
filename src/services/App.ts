import { Injector } from 'reduct'
import HttpServer from './HttpServer'
import KubernetesClient from './KubernetesClient'

import { create as createLogger } from '../common/log'
const log = createLogger('App')

export default class App {
  private httpServer: HttpServer
  private kubernetesClient: KubernetesClient
  constructor (deps: Injector) {
    this.httpServer = deps(HttpServer)
    this.kubernetesClient = deps(KubernetesClient)
  }

  async start () {
    log.info('starting c8s...')
    await this.kubernetesClient.start()
    await this.httpServer.init()
    await this.httpServer.start()
  }
}
