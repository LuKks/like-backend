const test = require('brittle')
const fetch = require('like-fetch')
const launch = require('./app.js')

test('basic', async function (t) {
  const backend = await launch(t)

  const response = await fetch('http://127.0.0.1:' + backend.port + '/api/example')
  const data = await response.json()

  t.is(data, 'Hello world!')
})
