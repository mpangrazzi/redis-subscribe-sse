'use strict'

/**
 * Module dependencies
 */

const Koa = require('koa')
const fs = require('co-fs')
const path = require('path')
const _ = require('koa-route')
const logger = require('koa-logger')


/**
 * To test, publish something on 'test-koa' or 'test-koa1' channel
 *
 * $ redis-cli publish test-koa testmessage
 * $ redis-cli publish test-koa1 testmessage1
 */


// stream

const subscribe = require('..')


// app

let app = new Koa()

// logger

app.use(logger())

// routes

let routes = {
  index: function *() {
    this.body = fs.createReadStream(__dirname + '/index.html')
  },
  stream: function *() {
    this.req.setTimeout(0)
    this.type = 'text/event-stream; charset=utf-8'

    this.set('Cache-Control', 'no-cache')
    this.set('Connection', 'keep-alive')

    let sse = subscribe({
      channels: ['test-koa', 'test-koa1'],
      retry: 10000,
      host: '127.0.0.1',
      port: 6379,
      channelsAsEvents: true
    })

    this.body = sse
  }
}

app.use(_.get('/', routes.index))
app.use(_.get('/stream', routes.stream))

app.listen(3000, () => {
  console.log('Listening on port 3000')
})
