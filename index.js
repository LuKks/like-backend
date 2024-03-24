const http = require('http')
const graceful = require('graceful-http')
const goodbye = require('graceful-goodbye')
const fetch = require('like-fetch')
const ReadyResource = require('ready-resource')
const safetyCatch = require('safety-catch')

const isProcess = require.main === module.parent
const handlers = []

module.exports = class Backend extends ReadyResource {
  constructor (opts = {}) {
    super()

    this.server = opts.server || http.createServer(opts.app)

    if (opts.app) {
      const port = opts.port || process.env.BACKEND_PORT || 1337
      const host = opts.host || process.env.BACKEND_HOST || '127.0.0.1'

      this.server.listen(isProcess ? port : 0, host)
    }

    this._gracefulClose = graceful(this.server)
    this._onclose = handlers.slice()

    if (opts.goodbye) this._onclose.push(opts.goodbye)
  }

  async _open () {
    await waitForServer(this.server)
  }

  async _close () {
    await this._gracefulClose()

    for (const onclose of this._onclose) {
      try {
        await onclose()
      } catch (err) {
        if (isProcess) safetyCatch(err)
        else throw err
      }
    }
  }

  get host () {
    return this.server.listening ? getHost(this.server.address().address) : null
  }

  get port () {
    return this.server.listening ? this.server.address().port : null
  }

  static testing = !isProcess

  static launch (setup) {
    if (isProcess) {
      // Executed as a process
      main().catch(err => {
        console.error(err)
        process.exit(1)
      })

      async function main () {
        const server = await setup()
        const backend = server instanceof Backend ? server : new Backend({ server })
        goodbye(() => backend.close(), -Infinity)
        await backend.ready()
      }
    } else {
      // Imported in tests
      return async function (t) {
        const server = await setup()
        const backend = server instanceof Backend ? server : new Backend({ server })
        t.teardown(() => backend.close(), { order: Infinity })
        await backend.ready()

        const request = customFetch.bind(null, backend)

        // Backward compat
        request.host = backend.host
        request.port = backend.port

        return request
      }
    }
  }

  static goodbye (onclose) {
    handlers.push(onclose)
  }
}

function waitForServer (server) {
  return new Promise((resolve, reject) => {
    server.on('listening', done)
    server.on('error', done)

    if (server.listening) done(null)

    function done (err) {
      server.off('listening', done)
      server.off('error', done)

      if (err) reject(err)
      else resolve()
    }
  })
}

function getHost (address) {
  if (!address || address === '::' || address === '0.0.0.0') return 'localhost'
  return address
}

function customFetch (backend, endpoint, opts = {}) {
  return fetch('http://' + backend.host + ':' + backend.port + endpoint, {
    validateStatus: 'ok',
    requestType: ('requestType' in opts) ? opts.requestType : 'json',
    responseType: ('responseType' in opts) ? opts.responseType : 'json',
    ...opts
  })
}
