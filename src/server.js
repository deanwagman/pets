import { config } from 'dotenv';
config();

import React from 'react';
import express from 'express';
import path from 'path';
import { renderToString } from 'react-dom/server';
import { createProxyMiddleware } from 'http-proxy-middleware';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import webpack from 'webpack';
import { Provider as StyleProvider } from 'styletron-react';
import { Server as Styletron } from 'styletron-engine-atomic';
import { StaticRouterProvider } from 'react-router-dom/server';

import webpackConfig from '../webpack.config';
import Document from './components/Document';

import App from './App';
import db from './db/';
import authMiddleware from './middleware/authentication';
import routes from './routes/routes';
import { getStaticRouter } from './routes/router';
import NotificationsProvider from './state/notifications';

import { post as register } from './api/authentication/register';
import { post as login } from './api/authentication/login';

import chatMessage from './api/chat/message';
import simulateFineTune from './api/fine-tune/simulate';

import createPrompt from './api/prompts/create';

import autoComplete from './api/chat/autoComplete';

const app = express();
const port = process.env.PORT || 3000;

const engine = new Styletron();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  const compiler = webpack(webpackConfig);

  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath,
    }),
  );

  app.use(webpackHotMiddleware(compiler));

  console.log('Webpack Dev Middleware Enabled');
}

app.use(express.static(path.join(__dirname, 'dist')));

app.route('/api/register').post(register);
app.route('/api/login').post(login);
app.route('/api/message').post(chatMessage);
app.route('/api/fine-tune/simulate').post(simulateFineTune);
app.route('/api/auto-complete').post(autoComplete);

app.route('/api/prompts/create').post(createPrompt);

// Serve the SPA on every route
app.get('*', async (req, res) => {
  const { router, context } = await getStaticRouter(req);

  // Render markup for Client
  const html = renderToString(
    <StyleProvider value={engine} id="styletron">
      <NotificationsProvider>
        <StaticRouterProvider router={router} context={context} />
      </NotificationsProvider>
    </StyleProvider>,
  );

  // Extract CSS from Styletron
  const styles = engine.getCss();

  res.send(renderToString(<Document styles={styles} html={html} />));
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
