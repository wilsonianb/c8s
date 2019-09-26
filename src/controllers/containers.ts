import { Server, ResponseToolkit } from '@hapi/hapi'
import Boom from '@hapi/boom'
import { Injector } from 'reduct'
import { URL } from 'url'
import { ContainerRequest } from '../schemas/ContainerRequest'
import Config from '../services/Config'
import KubernetesClient from '../services/KubernetesClient'
import ManifestParser from '../services/ManifestParser'
const Enjoi = require('enjoi')
const ContainerRequest = require('../schemas/ContainerRequest.json')

import { create as createLogger } from '../common/log'
const log = createLogger('containers')

export interface PostContainerResponse {
  url: string,
  manifestHash: string
}

export default function (server: Server, deps: Injector) {
  const config = deps(Config)
  const kubernetesClient = deps(KubernetesClient)
  const manifestParser = deps(ManifestParser)

  async function postContainer (request: any, h: ResponseToolkit): Promise<PostContainerResponse> {
    const serviceSpec = manifestParser.manifestToKnativeServiceSpec(
      request.payload['manifest'],
      request.payload['private'] || {}
    )

    log.debug('serviceSpec', JSON.stringify(serviceSpec, null, 2))

    // TODO: check capacity in k8s cluster

    await kubernetesClient.createKnativeService(serviceSpec)

    const { manifestHash } = serviceSpec.metadata.annotations

    const url = new URL(config.publicUri)
    url.host = manifestHash + '.' + url.host

    return {
      url: url.href,
      manifestHash
    }
  }

  server.route({
    method: 'POST',
    path: '/containers',
    handler: postContainer,
    options: {
      validate: {
        payload: Enjoi.schema(ContainerRequest),
        failAction: async (req, h, err) => {
          log.debug('validation error. error=' + (err && err.message))
          throw Boom.badRequest('Invalid request payload input')
        }
      },
      payload: {
        allow: 'application/json',
        output: 'data'
      }
    }
  })
}
