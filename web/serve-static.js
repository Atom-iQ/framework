/* eslint-disable @typescript-eslint/no-var-requires */
const static = require('node-static')
const http = require('http')

const file = new static.Server('./dist')

http
  .createServer(function (req, res) {
    file.serve(req, res)
  })
  .listen(7070)
