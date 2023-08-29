import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { Client as Styletron } from 'styletron-engine-atomic';
import { Provider as StyleProvider } from 'styletron-react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import router from './routes/router';

const clientEngine = new Styletron({
  hydrate: document.getElementById('styletron'),
});

hydrateRoot(
  document.getElementById('root'),
  <StyleProvider value={clientEngine} id="styletron">
    <RouterProvider router={router} />
  </StyleProvider>,
);

if (module.hot) {
  module.hot.accept();
}
