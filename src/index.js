import dotenv from 'dotenv'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import configureStore from 'store'
import registerServiceWorker from './registerServiceWorker'
import ReviewWidget from './ReviewWidget'
import { BrowserRouter } from 'react-router-dom';


dotenv.config()
const store = configureStore()

const Application = () => (
  <Provider store={store}>
    <ReviewWidget address={"http://34.67.37.132:80"} />
  </Provider>
)

ReactDOM.render( <BrowserRouter><Application/></BrowserRouter>, document.getElementById('app'))
registerServiceWorker()
