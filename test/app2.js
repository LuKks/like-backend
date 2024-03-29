const Backend = require('../index.js')
const express = require('express')

module.exports = Backend.launch(main)

function main () {
  const app = express()

  app.get('/api/example', require('./route2.js'))

  const server = app.listen(Backend.testing ? 0 : 1337, '127.0.0.1')

  return new Backend({
    server,
    goodbye: function () {
      console.log('App goodbye')
    }
  })
}
