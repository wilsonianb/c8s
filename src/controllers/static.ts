import * as Hapi from '@hapi/hapi'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Injector } from 'reduct'
import AppComponent from '../public/components/App'
import ProxyComponent from '../public/components/Proxy'
import Config from '../services/Config'
import * as path from 'path'

const App = React.createFactory(AppComponent)
const Proxy = React.createFactory(ProxyComponent)
const MANIFEST_LABEL_REGEX = /^[a-zA-Z2-7]{52}$/

export default function (server: Hapi.Server, deps: Injector) {
  const config = deps(Config)

  function isPodRequest (host: string): boolean {
    return !!MANIFEST_LABEL_REGEX.exec(host.split('.')[0])
  }

  async function getApp (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const state = {
      // TODO: set min version in config
      // codiusVersion: config.version.codius.min
      codiusVersion: '2.0.0'
    }

    return h.view('index', {
      assets: '/assets/app.bundle.js',
      component: renderToString(App(state)),
      paymentPointer: config.paymentPointer,
      state: `window.__INITIAL_PROPS__ = ${JSON.stringify(state)}`
    })
  }

  async function getProxy (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const state = {
      // TODO: https
      proxySrc: `http://proxy-${request.info.host}${request.path}`
    }

    return h.view('index', {
      assets: '/assets/proxy.bundle.js',
      component: renderToString(Proxy(state)),
      paymentPointer: config.paymentPointer,
      state: `window.__INITIAL_PROPS__ = ${JSON.stringify(state)}`
    })
  }

  async function getIndex (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const host = request.info.host

    const proxy = isPodRequest(host)
    const state = {}

    return isPodRequest(request.info.host) ? getProxy(request, h) : getApp(request, h)
  }

  server.route({
    method: 'GET',
    path: '/{params*}',
    handler: getIndex
  })
}
