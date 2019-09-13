import * as React from 'react'
import WebMonetizationLoader from './WebMonetizationLoader'

type ProxyProps = {
  proxySrc: string
}

const Proxy: React.FC<ProxyProps> = (props: ProxyProps) => {

  return (
    <WebMonetizationLoader>
      <iframe src={props.proxySrc}></iframe>
    </WebMonetizationLoader>
  )
}

export default Proxy
