import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';

import App from './app/app';

import { store } from './app/store';
import { Provider } from 'react-redux';

ReactDOM.render(
  <Provider store={store}>
    <StrictMode>
      <App />
    </StrictMode>
  </Provider>,
  document.getElementById('root')
);
