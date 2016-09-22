'use strict'

/**
 * Module dependencies
 */

const debug = require('debug')('redis-subscribe-sse')
const Readable = require('stream').Readable
const Redis = require('ioredis')

const isObject = require('./util/is-object')
const isString = require('./util/is-string')
const isNumber = require('./util/is-number')
const isFunction = require('./util/is-function')

module.exports = function (options) {
  return new Subscribe(options)
}


class Subscribe extends Readable {

  constructor (options) {
    options = options || {}
    super(options)

    if (!isObject(options.channels) && !isString(options.channels)) {
      throw new TypeError('option `channels` is required and must be an Array or a String')
    }

    if (options.ioredis && !isObject(options.ioredis)) {
      throw new TypeError('option `ioredis` must be an Object')
    }

    if (options.retry && (!isNumber(options.retry) || options.retry <= 0)) {
      throw new TypeError('option `sse.retry` must be a Number greater than 0')
    }

    if (options.transform) {
      if (!isFunction(options.transform)) {
        throw new TypeError('option `transform` must be a function')
      } else {
        this.transform = options.transform
        this.transformType = this.transform.length === 2 ? 'async' : 'sync'
      }
    }

    this.channels = Array.isArray(options.channels) ?
      options.channels :
      [options.channels]

    this.channelsAsEvents = !!options.channelsAsEvents || false
    this.patternSubscribe = !!options.patternSubscribe || false

    this.ioredis = options.ioredis || {}

    this.port = +options.port || 6379
    this.host = options.host || '127.0.0.1'
    this.password = options.password || null
    this.clientOptions = options.clientOptions || {}

    this.retry = options.retry || 5000
    this.push('retry: ' + this.retry + '\n')

    this._init()
  }

  _read () {}

  _init () {
    this.setMaxListeners(0)

    this.client = new Redis(this.ioredis)
    this.client.on('error', this._onError.bind(this))

    var self = this

    this.client.on('ready', () => {
      debug('Redis client ready')
      self._subscribe()
    })
  }

  _subscribe () {
    var self = this

    let msgEventName = this.patternSubscribe ? 'pmessage' : 'message'
    let mode = this.patternSubscribe ? 'psubscribe' : 'subscribe'
    let handler = this.patternSubscribe ? '_onPmessage' : '_onMessage'

    this.client.on(msgEventName, this[handler].bind(this))

    let callback = (err, count) => {
      debug('Redis client subscribed to %s channel(s) (%j) with mode %s', count, self.channels, mode)
      self.emit('ready')
    }

    let args = this.channels.concat(callback)

    this.client[mode].apply(this.client, args)
  }

  _onMessage (channel, message) {
    debug('received %j message on channel %s', message, channel)
    this._push(channel, message)
  }

  _onPmessage (pattern, channel, message) {
    debug('received %j message on channel %s (from pattern %s)', message, channel, pattern)
    this._push(channel, message)
  }

  _runTransform (message, callback) {
    if (!this.transform) {
      return callback(message)
    }

    debug('%s transform() input: %s', this.transformType, message)

    switch(this.transformType) {
      case 'sync':
        let output = this.transform(message)
        debug('transform() output: %s', output)
        return callback(output)

      case 'async':
        return this.transform(message, (output) => {
          debug('transform() output: %s', output)
          callback(output)
        })

    }
  }

  _push (channel, message) {
    var self = this

    this._runTransform(message, output => {
      if (self.channelsAsEvents) {
        self.push('event: ' + channel + '\n')
      }

      self.push('data: ' + output + '\n\n')
      debug('pushed %s on %s', output, channel)
    })

  }

  _onError (err) {
    this.emit('error', err)
  }

  close (callback) {
    var self = this

    this.client.quit()

    this.client.on('end', () => {
      self.emit('close')

      if (callback) {
        callback.call(self)
      }
    })
  }

}
