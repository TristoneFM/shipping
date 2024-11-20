require('dotenv').config({ path: '../.env' })
const express = require('express')
const https = require('https')
const path = require('path')
const fs = require('fs')
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const app = express()

const portNumber = process.env.port || process.env.PORT || 5001
const routes = require('./routes/routes_RFC')
const routesDB = require('./routes/routes_DB')
const routesAD = require('./routes/routes_AD')


const update_dock = require('../backend/routines/routine_dock').UPDATE()// Update dock routine do not remove
// const portNumber = 5001

app.use(cors({ origin: true, credentials: true }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
  
  let server = app.listen(portNumber, function () {
    console.info('Express node_env: ' + process.env.NODE_ENV + " Port: " + server.address().port);
    server.on('connection', () => { server.setTimeout(20 * 60 * 1000) })
  })


app.use(routes)
app.use(routesDB)
app.use(routesAD)
