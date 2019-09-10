import * as Hapi from '@hapi/hapi'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Injector } from 'reduct'
import AppComponent from '../public/components/App'
import Config from '../services/Config'
import * as path from 'path'

const App = React.createFactory(AppComponent)

export default function (server: Hapi.Server, deps: Injector) {
  const config = deps(Config)

  async function getIndex (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const state = {
      // TODO: set min version in config
      // codiusVersion: config.version.codius.min
      codiusVersion: '2.0.0'
    }

    return h.view('index', {
      component: renderToString(App(state)),
      paymentPointer: config.paymentPointer,
      state: `window.__INITIAL_PROPS__ = ${JSON.stringify(state)}`
    })
  }

  server.route({
    method: 'GET',
    path: '/{params*}',
    handler: getIndex
  })
}
