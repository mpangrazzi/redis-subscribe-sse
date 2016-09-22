'use strict'

/**
 * Module dependencies
 */

const express = require('express')
const fs = require('fs')
const path = require('path')


/**
 * To test, publish something on 'test-express' channel
 *
 * $ redis-cli publish test-express testmessage
 */


// stream

const subscribe = require('..')


// express app

let app = express()

app.get('/', (req, res) => {
  let index = path.join(__dirname, './index.html')
  fs.createReadStream(index).pipe(res)
})

app.get('/stream', (req, res) => {
  let sse = subscribe({
    channels: 'test-express',
    retry: 5000,
    host: '127.0.0.1',
    port: 6379
  })

  req.socket.setTimeout(Number.MAX_VALUE)

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })

  sse.pipe(res)
})

app.listen(3000, () => {
  console.log('Express listening on port 3000')
})
