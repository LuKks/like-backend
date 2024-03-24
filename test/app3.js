const Backend = require('../index.js')
const express = require('express')

module.exports = Backend.launch(main)

function main () {
  const app = express()

  app.get('/api/example', function (req, res) {
    res.json('Hello world!')
  })

  return new Backend({
    app,
    goodbye: function () {
      console.log('App goodbye')
    }
  })
}
