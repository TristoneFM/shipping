// const https = require('https');
// const { parse } = require('url');
// const next = require('next');
// const fs = require('fs');
// const path = require('path');

// const dev = process.env.NODE_ENV !== 'DEV';
// const port = process.env.PORT || 3001;
// const app = next({ dev });
// const handle = app.getRequestHandler();


// // Load SSL key and certificate
// const httpsOptions = {
//   key: fs.readFileSync(path.resolve('certificates/key.pem')),
//   cert: fs.readFileSync(path.resolve('certificates/cert.pem')),
// };

// app.prepare().then(() => {
//   https.createServer(httpsOptions, (req, res) => {
//     const parsedUrl = parse(req.url, true);
//     handle(req, res, parsedUrl);
//   }).listen(port, (err) => {
//     if (err) throw err;
//     console.log(`> Ready on https://localhost:${port}`);
//   });
// });

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3001;
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    // Be sure to pass `true` as the second argument to `url.parse`.
    // This tells it to parse the query portion of the URL.
    const parsedUrl = parse(req.url, true)
    const { pathname, query } = parsedUrl

    if (pathname === '/a') {
      app.render(req, res, '/a', query)
    } else if (pathname === '/b') {
      app.render(req, res, '/b', query)
    } else {
      handle(req, res, parsedUrl)
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})