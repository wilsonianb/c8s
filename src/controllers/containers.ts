import * as Hapi from '@hapi/hapi'
import * as Boom from 'boom'
import { Injector } from 'reduct'
import { ContainerRequest } from '../schemas/ContainerRequest'
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

export default function (server: Hapi.Server, deps: Injector) {
  const kubernetesClient = deps(KubernetesClient)
  const manifestParser = deps(ManifestParser)

  async function postContainer (request: any, h: Hapi.ResponseToolkit): Promise<PostContainerResponse> {
    const serviceSpec = manifestParser.manifestToKnativeServiceSpec(
      request.payload['manifest'],
      request.payload['private'] || {}
    )

    log.debug('serviceSpec', JSON.stringify(serviceSpec, null, 2))

    // TODO: check capacity in k8s cluster

    await kubernetesClient.createKnativeService(serviceSpec)

    const { manifestHash } = serviceSpec.metadata.annotations
    return {
      // TODO https
      url: `http://${manifestHash}.${request.info.host}`,
      manifestHash
    }
  }

  server.route({
    method: 'POST',
    path: '/containers',
    handler: postContainer,
    options: {
      validate: {
        payload: Enjoi(ContainerRequest),
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
