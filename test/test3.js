const test = require('brittle')
const launch = require('./app3.js')

test('basic', async function (t) {
  const request = await launch(t)

  const data = await request('/api/example')

  t.is(data, 'Hello world!')
})
