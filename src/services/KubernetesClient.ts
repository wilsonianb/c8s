import { Client1_13 } from 'kubernetes-client'
const Request = require('kubernetes-client/backends/request')
import { KnativeServiceSpec } from '../schemas/KnativeServiceSpec'
import * as Boom from 'boom'
import Config from './Config'
import { Injector } from 'reduct'

import { create as createLogger } from '../common/log'
const log = createLogger('KubernetesClient')

export default class KubernetesClient {
  private client: any
  private config: Config

  constructor (deps: Injector) {
    this.config = deps(Config)

    const devConfig = {
      auth: {
        bearer: 'token'
      },
      ca: 'ca',
      namespace: 'namespace',
      url: 'https://host:443'
    }

    const k8sConfig = this.config.devMode ? devConfig : Request.config.getInCluster()
    this.client = new Client1_13({ backend: new Request(k8sConfig) })
  }

  async start () {
    await this.client.loadSpec()
    const resp = await this.client.apis['apiextensions.k8s.io'].v1beta1.customresourcedefinitions('services.serving.knative.dev').get()
    this.client.addCustomResourceDefinition(resp.body)
  }

  async createKnativeService (serviceSpec: KnativeServiceSpec): Promise<string> {
    log.info('creating Knative service:', serviceSpec.metadata.name)
    try {
      await this.client.apis['serving.knative.dev'].v1alpha1.namespaces(this.config.k8sNamespace).services.post({ body: serviceSpec })
      return new Promise<string>(async (resolve, reject) => {
        const stream = await this.client.apis['serving.knative.dev'].v1alpha1.watch.namespaces(this.config.k8sNamespace).services(serviceSpec.metadata.name).getObjectStream()

        const timer = setTimeout(() => {
          reject(new Error('Timed out before pod reached Ready state'))
        }, 60000)

        stream.on('data', (service: any) => {
          log.trace(JSON.stringify(service, null, 2))
          if (service.object && service.object.status && service.object.status.conditions) {
            const conditions = service.object.status.conditions.reduce((acc: Object, condition: any) => {
              acc[condition.type] = condition.status
              return acc
            }, {})

            if (conditions.ConfigurationsReady === 'True' &&
                conditions.RoutesReady === 'True' &&
                conditions.Ready === 'True') {
              clearTimeout(timer)
              resolve(service.object.status.url)
            }
          }
        })
      })
    } catch (e) {
      throw Boom.serverUnavailable('Could not create pod: error=' + e.message)
    }
  }
}
