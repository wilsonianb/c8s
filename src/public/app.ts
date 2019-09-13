/* global window document */
'use strict'

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import AppComponent from './components/App'

const App = React.createFactory(AppComponent)
const mountNode = document.getElementById('App')
const serverState = window['__INITIAL_PROPS__']

ReactDOM.hydrate(App(serverState), mountNode)
