'use strict'

/**
 * Module dependencies
 */

const http = require('http')
const fs = require('fs')
const path = require('path')


/**
 * To test, publish something on 'test-http' channel
 *
 * $ redis-cli publish test-http testmessage
 */


// stream

const subscribe = require('..')


// http server

let server = http.createServer((req, res) => {
  let sse = subscribe({
    channels: 'test-http'
  })

  if (req.url === '/') {
    let index = path.join(__dirname, './index.html')
    res.setHeader('Content-Type', 'text/html charset=utf-8')
    fs.createReadStream(index).pipe(res)
  }

  if (req.url === '/stream') {
    req.setTimeout(Number.MAX_VALUE)

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    sse.pipe(res)
  }
})

server.listen(3000, () => {
  console.log('HTTP server listening on port 3000')
})
