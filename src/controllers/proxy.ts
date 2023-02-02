import * as Hapi from '@hapi/hapi'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Injector } from 'reduct'
import ProxyComponent from '../public/components/Proxy'
import Config from '../services/Config'

const Proxy = React.createFactory(ProxyComponent)
const MANIFEST_SUBDOMAIN_REGEX = /^[a-zA-Z2-7]{52}$/

import { create as createLogger } from '../common/log'
const log = createLogger('proxy')

// Containers are accessed from the browser at:
//
//   https://hash.host-domain/path
//
// onRequest serves the web-monetized proxy page, which accesses the container at:
//
//   https://proxy-hash.hostdomain/path
//
// which is available via k8s/knative ingress

export default function (server: Hapi.Server, deps: Injector) {
  const config = deps(Config)

  function isProxyRequest (host: string): boolean {
    return !!MANIFEST_SUBDOMAIN_REGEX.exec(host.split('.')[0])
  }

  async function onRequest (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const host = request.info.host

    if (!isProxyRequest(host)) {
      return h.continue
    }

    const state = {
      proxySrc: `${new URL(config.publicUri).protocol}//codius-${host}/${request.params.path}`
    }

    return h.view('index', {
      // Use publicUri instead of current subdomain so onRequest doesn't change the path
      assets: `${config.publicUri}/assets/proxy.bundle.js`,
      component: renderToString(Proxy(state)),
      paymentPointer: config.paymentPointer,
      state: `window.__INITIAL_PROPS__ = ${JSON.stringify(state)}`
    })
  }

  server.ext('onRequest', onRequest)
}
