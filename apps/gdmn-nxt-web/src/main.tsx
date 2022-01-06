import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';

import App from './app/app';

import { store } from './app/store';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReconciliationStatement from './app/reconciliation-statement/reconciliation-statement';
import { registerMUI } from './mui-license';

// rename mui-license.ts.sample -> mui-license.ts
// put in bought license key
registerMUI();

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <StrictMode>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/rs" element={<ReconciliationStatement />} />
        </Routes>
      </StrictMode>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);
