# like-backend

Create HTTP servers with graceful shutdown and tests easily

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

module.exports = Backend.launch(main)

function main () {
  const app = express()

  app.get('/api/example', function (req, res) {
    res.json('Hello world!')
  })

  app.post('/api/users', function (req, res) {
    res.status(409).json({ error: 'EMAIL_ALREADY_REGISTERED' })
  })

  const server = app.listen(Backend.testing ? 0 : 1337, '127.0.0.1')

  return new Backend({
    server,
    goodbye: async function () {
      // Close resources here
    }
  })
}
```

`test.js`

```js
const test = require('brittle')
const launch = require('./app.js')

test('basic', async function (t) {
  const request = await launch(t)

  const data = await request('/api/example')
  t.is(data, 'Hello world!')
})

test('basic error', async function (t) {
  const request = await launch(t)

  try {
    await request('/api/users', { method: 'POST' })
  } catch (err) {
    if (!err.response) throw err
    t.is(err.response.status, 409)
    t.alike(err.body, { error: 'EMAIL_ALREADY_REGISTERED' })
  }
})
```

## API

#### `const backend = new Backend(options)`

Creates a Backend instance based on a HTTP server.

Avoid async operations between `server.listen` and the Backend creation.\
So there is no new connections until [graceful-http](https://github.com/LuKks/graceful-http) is hooked up.

Available `options`:
```js
{
  server, // Server that is already listening or set `app` to true if you want `server` to auto listen using options
  app, // HTTP request handler
  port, // Defaults to env BACKEND_PORT or 1337 (tests do randomize ports)
  host, // Defaults to env BACKEND_HOST or 127.0.0.1
  goodbye // Function that is called to teardown the backend
}
```

#### `backend.host`

Hostname or IP of the server once is listening.

#### `backend.port`

Port of the server once is listening.

#### `Backend.testing`

Static property that indicates if it's running for tests.

#### `Backend.launch(main)`

Static method to handle the start up of the server.

`main` must be a function that returns an HTTP server or a Backend instance.

#### `Backend.goodbye(onclose)`

Static method to add teardown handlers from outside of launch.

#### `const request = await launch(options)`

Starts the app for testing.

The returned `request` is a `like-fetch` instance, bound with the backend URL prefixed.

`options` available:
```
{
  teardown
}
```

## More examples

```js
test('custom teardown', async function (t) {
  const request = await launch({ teardown: t.teardown })
  // ...
})

test('disable response type', async function (t) {
  const request = await launch(t)

  const response = await request('/api/example', { responseType: false })
  const data = await response.json()

  t.is(data, 'Hello world!')
})

test('manual request', async function (t) {
  const backend = await launch(t)

  const response = await fetch('http://' + backend.host + ':' + backend.port + '/api/example')
  const data = await response.json()

  t.is(data, 'Hello world!')
})
```

## License

MIT
