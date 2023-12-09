const graceful = require('graceful-http')
const goodbye = require('graceful-goodbye')
const ReadyResource = require('ready-resource')

const isProcess = require.main === module.parent

module.exports = class Backend extends ReadyResource {
  constructor (opts = {}) {
    super()

    this.app = opts.app
    this.server = null

    this._host = opts.host || '127.0.0.1'
    this._port = isProcess && typeof opts.port === 'number' ? opts.port : 0
    this._logs = isProcess && opts.logs === true

    this._gracefulClose = null
  }

  async _open () {
    const server = this.app.listen(this._port, this._host)

    if (this._logs) {
      server.on('listening', () => console.log('Server listening on port ' + server.address().port))
      server.on('close', () => console.log('Server closed'))
    }

    this.server = server
    this._gracefulClose = graceful(server)

    await waitForServer(this.server)
  }

  async _close () {
    if (this._gracefulClose) await this._gracefulClose()
  }

  get host () {
    return getHost(this.server.address().address)
  }

  get port () {
    return this.server.address().port
  }

  static launch (setup) {
    if (isProcess) {
      // Executed as a process
      main().catch(err => {
        console.error(err)
        process.exit(1)
      })

      async function main () {
        const backend = await setup()
        await backend.ready()
        goodbye(() => backend.close(), -Infinity)
      }
    } else {
      // Imported in tests
      return async function (t) {
        const backend = await setup()
        await backend.ready()
        t.teardown(() => backend.close(), { order: Infinity })
        return backend
      }
    }
  }
}

function waitForServer (server) {
  return new Promise((resolve, reject) => {
    server.on('listening', done)
    server.on('error', done)

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
