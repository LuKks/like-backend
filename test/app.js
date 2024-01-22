const Backend = require('../index.js')
const express = require('express')

module.exports = Backend.launch(main)

function main () {
  const app = express()

  app.get('/api/example', function (req, res) {
    res.json('Hello world!')
  })

  app.get('/api/bad-request', function (req, res) {
    res.status(400).json({ error: 'SOMETHING' })
  })

  app.get('/api/bad-response', function (req, res) {
    res.status(500).json({ error: 'SOMETHING' })
  })

  return app.listen(Backend.testing ? 0 : 1337, '127.0.0.1')
}
