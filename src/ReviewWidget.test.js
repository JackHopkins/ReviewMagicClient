import React from 'react'
import { shallow } from 'enzyme'
import App from './ReviewWidget'

it('renders without crashing', () => {
  shallow(<App />)
})
