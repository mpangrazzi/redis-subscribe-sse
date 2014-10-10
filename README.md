
# (from) Redis subscribe (to) HTML5 Server-Sent Events

<p align="center">
  <img src="docs/screencast.gif">
</p>

A [Readable Stream](http://nodejs.org/api/stream.html#stream_class_stream_readable) that convert messages received over a [Redis PUBSUB channel](http://redis.io/topics/pubsub) to valid [HTML5 Server-Sent Events](http://www.w3schools.com/html/html5_serversentevents.asp).

Features:

* Can listen to one or more Redis PUBSUB channels
* Can associate Redis `channel` name to SSE `event` property, so publish on `test` channel means listening to `test` event on client-side
* Plays well with [Koa](http://koajs.com), [Express](http://expressjs.com) or plain node [http](http://nodejs.org/api/http.html) server


## Install

With [npm](http://npmjs.org/):

```
npm install redis-subscribe-sse
```

## Use cases

A typical use case is when you want to notify the end of an *async* task to client-side (e.g.: a background worker has finish to do its work), and you use Redis PUBSUB as a messaging service (which very fast and reliable).


## How to use

To obtain a `redis-subscribe-stream` instance, you have to do:

```javascript

  var subscribe = require('redis-subscribe-sse');

  var stream = subscribe({ /* options */ });

```

stream available `options` are:

- `channels` (Array, required): list of Redis channels to subscribe.
- `streamOptions`: (Object, optional): options passed to underlying Readable stream. Default: `{}`.
- `host` (String, optional): Redis host. Default: `127.0.0.1`
- `port` (Number, optional): Redis port. Default: `6379`
- `password` (String, optional): Redis password (if you need `AUTH`)
- `clientOptions`: [node_redis](https://github.com/mranney/node_redis) client options
- `retry` (Number, optional): SSE *retry* property. Usually a client tries to reconnect after 3-4 seconds after losing SSE connection. If you want to change that interval, you can set this property (in **ms**). Default: `5000`.
- `channelsAsEvents`: (Boolean, optional): Associate Redis channel names to SSE *event* property. This way, on client side you can listen to names events instead of generic messages. See `examples/koa.js` for a detailed example. Default: `false`.


## Tests

`npm test`


## Examples

### Server side

See `/examples` folder for **Koa** and **Express** examples. You can run them with:

```
  $ node ./examples/express
  $ node --harmony ./examples/koa
```

Keep in mind that Koa requires node `0.11.x`. If you want to see [debug](https://github.com/visionmedia/debug) messages:

`$ DEBUG=redis-subscribe-sse node ./examples/express`

### Client side

On client side, you can listen to SSE events using EventSource API (or a polyfill):

```javascript

  // NOTE: If you want full cross-browser support, 
  //       you may have to use a polyfill

  var source = new EventSource('/stream');

  source.onopen = function() {
    console.log('Connected');
  });

  // if you set `channelsAsEvents: true`:

  source.addEventListener('test-express', function(e) {
    console.log(e.type) // => Redis channel name
    console.log(e.data) // => message
  }, false);

  // otherwise:

  source.onmessage = function(e) {
    console.log(e.data); // => message
  });

```




