/*!
 * @jest-environment jsdom
 */

import * as React from 'react'
import { mount, render } from 'enzyme'

import ContainerForm from './ContainerForm'

describe('<ContainerForm />', () => {
  const codiusVersion: string = '0.0.1'

  it('matches snapshot', () => {
    const wrapper = mount(<ContainerForm codiusVersion={codiusVersion} />)
    expect(wrapper).toMatchSnapshot()
  })

  // it('renders three `.foo-bar`s', () => {
  //   const wrapper = render(<ContainerForm codiusVersion={codiusVersion} />)
  //   // expect(wrapper.find('.foo-bar')).to.have.lengthOf(3)
  //   expect(wrapper.find('#child')).toHaveHTML(
  //     '<span id="child">Test</span>'
  //   )
  // })

  // it('renders the title', () => {
  //   const wrapper = render(<ContainerForm codiusVersion={codiusVersion} />)
  //   expect(wrapper.text()).toHaveText('unique')
  // })
})
