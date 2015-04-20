
/**
 * Module dependencies
 */

var Readable = require('stream').Readable;
var debug = require('debug')('redis-subscribe-sse');
var util = require('util');

module.exports = function(options) {
  return new Subscribe(options);
};


// Subscribe

function Subscribe(options) {
  if (!(this instanceof Subscribe)) return new Subscribe(options);

  if (typeof options.channels !== 'object' && typeof options.channels !== 'string') {
    throw new TypeError('option `channels` is required and must be an Array or a String');
  }

  if (options.streamOptions && typeof options.streamOptions !== 'object') {
    throw new TypeError('option `streamOptions` must be an Object');
  }

  if (options.retry && (typeof options.retry !== 'number' || options.retry <= 0)) {
    throw new TypeError('option `sse.retry` must be a Number greater than 0');
  }

  Readable.call(this, options.streamOptions || {});

  if (util.isArray(options.channels)) {
    this.channels = options.channels;
  } else {
    this.channels = [options.channels];
  }

  // Map redis channels to SSE event names

  this.channelsAsEvents = options.channelsAsEvents || false;

  // Determine normal subscribe mode or psub

  this.patternSubscribe = options.patternSubscribe || false;

  // Redis client options

  this.port = options.port || 6379;
  this.host = options.host || '127.0.0.1';
  this.password = options.password || null;
  this.clientOptions = options.clientOptions || {};

  this._initClient();

  // Initial SSE retry

  this.retry = options.retry || 5000;
  this.push('retry: ' + this.retry + '\n');
}
util.inherits(Subscribe, Readable);


Subscribe.prototype._initClient = function() {

  this.setMaxListeners(0);
  this.client = require('redis').createClient(this.port, this.host, this.clientOptions);

  this.client.on('error', this.onError.bind(this));

  var self = this;
  this.client.on('ready', function() {
    debug('redis client ready');

    if (self.password) {
      self.client.auth(self.password, function() {
          if(self.patternSubscribe) {
            self._psubscribe();
          } else {
            self._subscribe();
          }
      });
    } else {
        if(self.patternSubscribe) {
          self._psubscribe();
        } else {
          self._subscribe();
        }
    }

  });
};


Subscribe.prototype.onError = function(err) {
  this.emit('error', err);
};


Subscribe.prototype._subscribe = function() {
  var self = this;

  this.client.on('message', this._onMessage.bind(this));

  this.client.on('subscribe', function(channel, count) {
    debug('subscribed to %s', channel);
    self.emit('ready');
  });

  this.client.subscribe.apply(this.client, this.channels);
};

Subscribe.prototype._psubscribe = function() {
  var self = this;

  this.client.on('pmessage', this._onPmessage.bind(this));

  this.client.on('psubscribe', function(pattern, count) {
    debug('psubscribed to %s', pattern);
    self.emit('ready');
  });

  this.client.psubscribe.apply(this.client, this.channels);
};


Subscribe.prototype._read = function() {};


Subscribe.prototype.close = function() {
  var self = this;

  if(this.patternSubscribe) {
      this.client.punsubscribe();
  } else {
      this.client.unsubscribe();
  }

  this.client.quit();

  this.client.on('end', function() {
    self.emit('close');
  });
};


Subscribe.prototype._onMessage = function(channel, message) {
  debug('received %j message on channel %s', message, channel);

  if (this.channelsAsEvents) {
    this.push('event: ' + channel + '\n');
  }

  this.push('data: ' + message + '\n\n');
};

Subscribe.prototype._onPmessage = function(pattern, channel, message) {
  debug('received %j message on channel %s (from pattern %s)', message, channel, pattern);

  if (this.channelsAsEvents) {
    this.push('event: ' + channel + '\n');
  }

  this.push('data: ' + message + '\n\n');
};
