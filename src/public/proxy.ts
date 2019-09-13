/* global window document */
'use strict'

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import ProxyComponent from './components/Proxy'

const Proxy = React.createFactory(ProxyComponent)
const mountNode = document.getElementById('App')
const serverState = window['__INITIAL_PROPS__']

ReactDOM.hydrate(Proxy(serverState), mountNode)
