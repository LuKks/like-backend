const Backend = require('../index.js')
const express = require('express')

module.exports = Backend.launch(setup)

async function setup () {
  const app = express()

  app.get('/api/example', function (req, res) {
    res.json('Hello world!')
  })

  return new Backend({
    app,
    host: '127.0.0.1',
    port: 1337,
    logs: true
  })
}
