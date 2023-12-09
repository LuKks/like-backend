# like-backend

Create a server with graceful shutdown and tests easily

```
npm i like-backend
```

It includes [graceful-goodbye](https://github.com/mafintosh/graceful-goodbye) and [graceful-http](https://github.com/LuKks/graceful-http).

## Usage

Run it as a process (auto-detects SIGINT etc) or import it for testing (will auto-teardown).

`app.js`

```js
const Backend = require('like-backend')
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
```

`test.js`

```js
const test = require('brittle')
const fetch = require('like-fetch')
const launch = require('./app.js')

test('basic', async function (t) {
  const backend = await launch(t)

  const response = await fetch('http://127.0.0.1:' + backend.port + '/api/example')
  const data = await response.json()

  t.is(data, 'Hello world!')
})
```

## License

MIT
