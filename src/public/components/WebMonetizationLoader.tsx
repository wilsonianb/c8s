import * as React from 'react'
const { useMonetizationState } = require('react-web-monetization')

const WebMonetizationLoader: React.FC = ({ children }) => {
  const { state: monetizationState } = useMonetizationState()

  if (monetizationState === 'pending') {
    return <p>Awaiting Web Monetization...</p>
  } else if (monetizationState === 'started') {
    return <>{children}</>
  } else {
    return <p>Sorry! You need <a href='https://webmonetization.org'>Web Monetization</a> to view this content.</p>
  }
}

export default WebMonetizationLoader
