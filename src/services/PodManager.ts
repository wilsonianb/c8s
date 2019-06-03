// import axios from 'axios'
import * as Boom from 'boom'
import { Injector } from 'reduct'
import { PodSpec } from '../schemas/PodSpec'
import HyperClient from './HyperClient'
import PodDatabase from './PodDatabase'
import ManifestDatabase from './ManifestDatabase'
import { checkMemory } from '../util/podResourceCheck'
import { Transform, PassThrough } from 'stream'
import * as multi from 'multi-read-stream'
import { create as createLogger } from '../common/log'
const log = createLogger('PodManager')

const DEFAULT_INTERVAL = 5000

export default class PodManager {
  private hyper: HyperClient
  private pods: PodDatabase
  private manifests: ManifestDatabase
  private hyperClient: HyperClient

  constructor (deps: Injector) {
    this.pods = deps(PodDatabase)
    this.manifests = deps(ManifestDatabase)
    this.hyper = deps(HyperClient)
    this.hyperClient = deps(HyperClient)
  }

  public checkPodMem (memory: number | void): number {
    if (memory) {
      return memory
    }
    return 0
  }

  start () {
    this.run()
      .catch(err => log.error(err))
  }

  async run () {
    // log.debug('monitoring for expired images')

    const expired = this.pods.getExpiredPods()
    if (expired.length) {
      log.debug('got expired pods. pods=' + JSON.stringify(expired))
    }

    await Promise.all(expired.map(async pod => {
      log.debug('cleaning up pod. id=' + pod)
      try {
        await this.hyperClient.deletePod(pod)
        await this.manifests.deleteManifest(pod)
      } catch (e) {
        log.error('error cleaning up pod. ' +
          `id=${pod} ` +
          `error=${e.message}`)
      }

      await this.pods.deletePod(pod)
    }))

    setTimeout(this.run.bind(this), DEFAULT_INTERVAL)
  }

  public getMemoryUsed () {
    const runningPods = this.pods.getRunningPods()
    let memory = 0
    for (let i = 0; i < runningPods.length; i++) {
      let pod = this.pods.getPod(runningPods[i])
      if (pod) {
        memory += this.checkPodMem(pod.memory)
      }
    }
    return memory
  }

  async startPod (podSpec: PodSpec, duration: string, port?: string) {
    if (this.pods.getPod(podSpec.id)) {
      const isRunning = await this.hyperClient.getPodInfo(podSpec.id)
        .then(info => !!info)
        .catch(() => false)
      if (isRunning) {
        await this.pods.addDurationToPod(podSpec.id, duration)
        return
      }
    }

    try {
      await this.pods.addPod({
        id: podSpec.id,
        running: true,
        duration,
        memory: checkMemory(podSpec.resource)
      })

      // TODO: validate regex on port arg incoming
      if (port && Number(port) > 0) {
        await this.pods.setPodPort(podSpec.id, port)
      }
      await this.hyperClient.runPod(podSpec)

      const ip = await this.hyper.getPodIP(podSpec.id)
      await this.pods.setPodIP(podSpec.id, ip)

    } catch (err) {
      log.error(`run pod failed, error=${err.message}`)
      throw Boom.badImplementation('run pod failed')
    } finally {
      await this.verifyRunningPods()
    }

  }

  async getLogStream (podId: string, follow: boolean = false) {
    const { spec: { containers } } = await this.hyperClient.getPodInfo(podId)

    const stdStreams = {
      1: 'stdout',
      2: 'stderr'
    }

    const streams = await Promise.all(containers.map(async container => {
      const stream = await this.hyperClient.getLog(container.containerID, follow)
      const transform = new Transform({
        transform (chunk: Buffer, encoding: string, callback: Function) {
          const streamName = stdStreams[chunk[0]] || chunk[0]
          const containerName = container.name.substring(container.name.indexOf('_') + 1)
          const logData = chunk.slice(8)
          const logLine = `${containerName} ${streamName} ${logData.toString()}`
          callback(null, logLine)
        }
      })
      stream.pipe(transform)
      return transform
    }))

    if (follow) {
      const pingStream = new PassThrough()
      let pingInterval = setInterval(() => pingStream.push('ping\n'), 1000)
      pingStream.on('end', () => clearInterval(pingInterval))

      streams.push(pingStream)
    }

    return multi(streams)
  }

  private async verifyRunningPods () {
    const dbPods = this.pods.getRunningPods()
    log.debug(`dbPods=${dbPods}`)
    const runningPodsSet = new Set(await this.hyperClient.getPodList())
    const podsToDelete = dbPods.filter(pod => !runningPodsSet.has(pod))
    log.debug(`delete pods=${podsToDelete}`)
    this.pods.deletePods(podsToDelete)
  }
}
