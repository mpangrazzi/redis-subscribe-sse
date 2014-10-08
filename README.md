
## (from) Redis subscribe (to) HTML5 Server-Sent Events

<p align="center">
  <img src="docs/screencast.gif">
</p>

A [Readable Stream](http://nodejs.org/api/stream.html#stream_class_stream_readable) that convert messages received over a [Redis PUBSUB channel](http://redis.io/topics/pubsub) to valid [HTML5 Server-Sent Events](http://www.w3schools.com/html/html5_serversentevents.asp).

Features:

* Can listen to one or more Redis PUBSUB channels
* Can associate Redis `channel` name to SSE `event` property, so publish on `test` channel means listening to `test` event on client-side
* Plays well with [Koa](http://koajs.com), [Express](http://expressjs.com) or plain node [http](http://nodejs.org/api/http.html) server

### Install

With [npm](http://npmjs.org/):

```
npm install redis-subscribe-sse
```

### Tests

`npm test`

### Examples

See `/examples` folder. You can run examples with:

```
  $ node ./examples/express
  $ node --harmony ./examples/koa
```

Keep in mind that Koa requires node `0.11.x`. If you want to see [debug](https://github.com/visionmedia/debug) messages:

`$ DEBUG=redis-subscribe-sse node ./examples/express`

But basically:

**Express**

```javascript

  // stream

  var subscribe = new Subscribe({
    channels: 'test-express',
    retry: 5000,
    host: '127.0.0.1',
    port: 6379
  });


  // express app

  // ...

  app.get('/stream', function(req, res) {
    req.socket.setTimeout(0);

    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    subscribe.pipe(res);
  });
```

**Koa**

```javascript

  // stream

  var subscribe = new Subscribe({
    channels: ['test-koa', 'test-koa1'],
    retry: 10000,
    host: '127.0.0.1',
    port: 6379,
    channelsAsEvents: true
  });

  // koa app

  // NOTE: `app.get` function is provided by `koa-router` module

  app.get('/stream', function *() {
    this.req.setTimeout(0);

    this.type = 'text/event-stream; charset=utf-8';

    this.set('Cache-Control', 'no-cache');
    this.set('Connection', 'keep-alive');

    var body = this.body = PassThrough();
    subscribe.pipe(body);
  });


  app.listen(3000, function() {
    console.log('Listening on port 3000');
  });

```

**Client side**

```javascript

  // NOTE: If you want full cross-browser support, 
  //       you may have to use a polyfill

  var source = new EventSource('/stream');

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




