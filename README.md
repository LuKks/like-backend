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

  const server = app.listen(Backend.testing ? 0 : 1337, '127.0.0.1')

  return new Backend({ server })
}
```

`test.js`

```js
const test = require('brittle')
const fetch = require('like-fetch')
const launch = require('./app.js')

test('basic', async function (t) {
  const backend = await launch(t) // Or pass any teardown function: launch({ teardown })

  const response = await fetch('http://127.0.0.1:' + backend.port + '/api/example')
  const data = await response.json()

  t.is(data, 'Hello world!')
})
```

## API

#### `const backend = new Backend({ server })`

Creates a Backend instance based on a HTTP server.

Avoid async operations between `server.listen` and the Backend creation.\
So there is no new connections until [graceful-http](https://github.com/LuKks/graceful-http) is hooked up.

#### `backend.host`

Hostname or IP of the server once is listening.

#### `backend.port`

Port of the server once is listening.

#### `Backend.testing`

Static property that indicates if it's running for tests.

#### `Backend.launch(main)`

Static method to handle the start up of the server.

`main` must be a function that returns a new Backend instance.

## License

MIT
