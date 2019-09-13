import * as Hapi from '@hapi/hapi'
import * as Boom from 'boom'
import { Injector } from 'reduct'
import Config from '../services/Config'

const HttpProxy = require('http-proxy')
const PROXY_LABEL_REGEX = /^proxy-[a-zA-Z2-7]{52}$/

import { create as createLogger } from '../common/log'
const log = createLogger('proxy')

export default function (server: Hapi.Server, deps: Injector) {
  const config = deps(Config)
  const proxy = HttpProxy.createProxyServer()

  function isProxyRequest (host: string): boolean {
    return !!PROXY_LABEL_REGEX.exec(host.split('.')[0])
  }

  async function proxyToPod (request: Hapi.Request, h: any) {
    const host = request.info.host

    if (!isProxyRequest(host)) {
      return h.continue
    }

    // TODO: https
    const target = `http://${host.split('.')[0]}.${config.k8sNamespace}.svc.cluster.local`
    console.log(target)
    await new Promise((resolve, reject) => {
      proxy.web(request.raw.req, request.raw.res, { target }, (e: any) => {
        const statusError = {
          ECONNREFUSED: Boom.serverUnavailable(),
          ETIMEOUT: Boom.gatewayTimeout()
        }[e.code]

        if (statusError) {
          reject(statusError)
        }

        resolve()
      })
    })
  }

  server.ext('onRequest', proxyToPod)
}
