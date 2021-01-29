import dotenv from 'dotenv'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import configureStore from 'store'
import ReviewWidget from './ReviewWidget'
import { BrowserRouter } from 'react-router-dom'
import registerServiceWorker from './registerServiceWorker'

dotenv.config()
const store = configureStore()

const Application = () => (
  <Provider store={store}>
    <ReviewWidget address={'https://34.67.37.132:80'} />
  </Provider>
)

ReactDOM.render(<BrowserRouter><Application/></BrowserRouter>, document.getElementById('app') )
registerServiceWorker()
