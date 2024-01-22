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

test('bad request', async function (t) {
  const request = await launch(t)

  try {
    await request('/api/bad-request')
  } catch (err) {
    if (!err.response) throw err
    t.is(err.response.status, 400)
    t.is(err.code, 'ERR_BAD_REQUEST')
    t.alike(err.body, { error: 'SOMETHING' })
  }
})

test('bad response', async function (t) {
  const request = await launch(t)

  try {
    await request('/api/bad-response')
  } catch (err) {
    if (!err.response) throw err
    t.is(err.response.status, 500)
    t.is(err.code, 'ERR_BAD_RESPONSE')
    t.alike(err.body, { error: 'SOMETHING' })
  }
})
