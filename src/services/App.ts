import { Injector } from 'reduct'
import HttpServer from './HttpServer'
import KubernetesClient from './KubernetesClient'
import SelfTest from './SelfTest'

import { create as createLogger } from '../common/log'
const log = createLogger('App')

export default class App {
  private httpServer: HttpServer
  private kubernetesClient: KubernetesClient
  private selfTest: SelfTest
  constructor (deps: Injector) {
    this.httpServer = deps(HttpServer)
    this.kubernetesClient = deps(KubernetesClient)
    this.selfTest = deps(SelfTest)
  }

  async start () {
    log.info('starting c8s...')
    await this.kubernetesClient.start()
    await this.httpServer.init()
    await this.httpServer.start()
    // this.selfTest.start()
  }
}
