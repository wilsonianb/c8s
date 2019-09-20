/*!
 * @jest-environment jsdom
 */

import * as React from 'react'
import { mount, shallow } from 'enzyme'

import App from './App'

describe('<App />', () => {
  const codiusVersion: string = '0.0.1'

  test('matches snapshot', () => {
    const wrapper = mount(<App codiusVersion={codiusVersion} />)
    expect(wrapper).toMatchSnapshot()
  })

  test('contains web monetization required message', () => {
    const wrapper = shallow(<App codiusVersion={codiusVersion} />)
    // expect(wrapper).toMatchElement('<WebMonetizationLoader><WithFormik(InnerForm) /></WebMonetizationLoader>')
  })

  // TODO: test with web monetization
})
