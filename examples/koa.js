'use strict'

/**
 * Module dependencies
 */

const Koa = require('koa')
const fs = require('fs')
const path = require('path')
const Router = require('koa-router')
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

let router = new Router()

router.get('/', function *() {
  this.type = 'text/html; charset=utf-8'
  this.body = fs.createReadStream(__dirname + '/index.html')
})

router.get('/stream', function *() {
  this.req.setTimeout(Number.MAX_VALUE)
  this.type = 'text/event-stream; charset=utf-8'

  this.set('Cache-Control', 'no-cache')
  this.set('Connection', 'keep-alive')

  this.body = subscribe({
    channels: ['test-koa', 'test-koa1'],
    retry: 10000,
    host: '127.0.0.1',
    port: 6379,
    channelsAsEvents: true
  })
})

app.use(router.routes())

app.listen(3000, () => {
  console.log('Koa listening on port 3000')
})
