import 'zone.js/dist/zone-node';
const domino = require('domino');
const fs = require('fs');
const path = require('path');
const template = fs.readFileSync(path.join(__dirname, '../../dist', 'commudle-admin', 'index.html')).toString();
const win = domino.createWindow(template);
(global as any).WebSocket = require('ws');
global['window'] = win;
global['document'] = win.document;
global['DOMTokenList'] = win.DOMTokenList;
global['Node'] = win.Node;
global['Text'] = win.Text;
global['HTMLElement'] = win.HTMLElement;
global['navigator'] = win.navigator;
global['MutationObserver'] = getMockMutationObserver();

function getMockMutationObserver() {
  return class {
    observe(node, options) {
    }
    disconnect() {
    }
    takeRecords() {
      return [];
    }
  };
}

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';
import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';

export function app() {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/commudle-admin');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));


  server.get('/admin/**', (req, res) => {
    res.sendFile(join(distFolder, 'index.html'));
  });

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  return server;
}

declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';

export * from './src/main.server';
