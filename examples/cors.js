'use strict'

/**
 * Module dependencies
 */

const express = require('express')
const fs = require('fs')
const path = require('path')


/**
 * To test, publish something on 'test-cors' channel
 *
 * $ redis-cli publish test-cors testmessage
 */


// stream

const subscribe = require('..')


// express app

let frontend = express()
let backend = express()

frontend.get('/', (req, res) => {
  var index = path.join(__dirname, './cors.html')
  fs.createReadStream(index).pipe(res)
})

backend.get('/stream', (req, res) => {
  var sse = subscribe({
    channels: 'test-cors'
  })

  req.socket.setTimeout(Number.MAX_VALUE)

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  })

  sse.pipe(res)
})

frontend.listen(3000, () => {
  console.log('Express (frontend) listening on port 3000')
})

backend.listen(4000, function() {
  console.log('Express (backend) listening on port 4000')
})
