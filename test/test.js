const test = require('brittle')
const fetch = require('like-fetch')
const launch = require('./app.js')

test('basic', async function (t) {
  const request = await launch(t)

  const data = await request('/api/example')

  t.is(data, 'Hello world!')
})

test('basic', async function (t) {
  const request = await launch(t)

  const response = await request('/api/example', { responseType: false })
  const data = await response.json()

  t.is(data, 'Hello world!')
})

test('basic', async function (t) {
  const backend = await launch(t)

  const response = await fetch('http://' + backend.host + ':' + backend.port + '/api/example')
  const data = await response.json()

  t.is(data, 'Hello world!')
})
