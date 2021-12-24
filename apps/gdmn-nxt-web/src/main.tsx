import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';

import App from './app/app';

import { store } from './app/store';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReconciliationStatement from './app/reconciliation-statement/reconciliation-statement';

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <StrictMode>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="recstm" element={<ReconciliationStatement />} />
        </Routes>
      </StrictMode>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);
