import * as React from 'react'
import ContainerForm from './ContainerForm'
import WebMonetizationLoader from './WebMonetizationLoader'

type AppProps = {
  codiusVersion: string
}

const App: React.FC<AppProps> = (props: AppProps) => {

  return (
    <WebMonetizationLoader>
      <ContainerForm codiusVersion={props.codiusVersion} />
    </WebMonetizationLoader>
  )
}

export default App
