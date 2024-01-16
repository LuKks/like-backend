const Backend = require('../index.js')

let once = null

Backend.goodbye(function () {
  console.log('Route goodbye')
  once = null
})

module.exports = function (req, res) {
  if (!once) {
    once = Math.random()
    console.log('Route init', once)
  }

  res.json('Hello world!')
}
