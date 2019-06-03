import { mkdirSync as mkdir } from 'fs'
import { Injector } from 'reduct'
import Config from './Config'
import PodManager from './PodManager'
import PeerFinder from './PeerFinder'
import HttpServer from './HttpServer'
import AdminServer from './AdminServer'
import BackgroundValidatePeers from './BackgroundValidatePeers'
import Ildcp from './Ildcp'
import SelfTest from './SelfTest'

import { create as createLogger } from '../common/log'
const log = createLogger('App')

export default class App {
  private config: Config
  private peerFinder: PeerFinder
  private httpServer: HttpServer
  private adminServer: AdminServer
  private podManager: PodManager
  private ildcp: Ildcp
  private backgroundValidatePeers: BackgroundValidatePeers
  private selfTest: SelfTest
  constructor (deps: Injector) {
    this.config = deps(Config)

    if (!this.config.memdownPersist && !this.config.devMode) this.makeRootDir()

    this.peerFinder = deps(PeerFinder)
    this.httpServer = deps(HttpServer)
    this.adminServer = deps(AdminServer)
    this.podManager = deps(PodManager)
    this.ildcp = deps(Ildcp)
    this.backgroundValidatePeers = deps(BackgroundValidatePeers)
    this.selfTest = deps(SelfTest)
  }

  async start () {
    log.info('starting codiusd...')
    await this.ildcp.init()
    await this.httpServer.start()
    if (this.config.adminApi) {
      await this.adminServer.start()
    }
    this.podManager.start()
    this.selfTest.start()
    this.peerFinder.start()
    this.backgroundValidatePeers.start()
  }

  private makeRootDir () {
    try {
      mkdir(this.config.codiusRoot, 0o700)
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err
      }
    }
  }
}
