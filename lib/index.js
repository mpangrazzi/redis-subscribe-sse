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

  _push (channel, message) {
    debug('pushing %s on %s', message, channel)

    if (this.channelsAsEvents) {
      this.push('event: ' + channel + '\n')
    }

    this.push('data: ' + message + '\n\n')
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
