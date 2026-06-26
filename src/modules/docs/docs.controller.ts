import { type Request, type Response } from 'express';

import { getOpenApiSpec } from './docs.service.js';

export function getJson(req: Request, res: Response): void {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(getOpenApiSpec()));
}

export function renderUi(req: Request, res: Response): void {
  res.send(`
    <!doctype html>
    <html>
      <head>
        <title>API Reference | Tionix One Pro</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap');
          
          body {
            margin: 0;
          }
        </style>
      </head>
      <body>
        <script
          id="api-reference"
          data-url="/api/docs/openapi.json?v=${Date.now()}"
          data-configuration='{
            "theme": "deepSpace",
            "layout": "modern",
            "showSidebar": true,
            "hideModels": true,
            "searchHotKey": "k",
            "hideDownloadButton": false,
            "metaData": {
              "title": "Tionix One Pro API Reference"
            }
          }'></script>
        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
      </body>
    </html>
  `);
}
