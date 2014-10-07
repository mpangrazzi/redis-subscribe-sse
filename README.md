(from) Redis subscribe (to) HTML5 Server-Sent Events
===

A [Readable Stream](http://nodejs.org/api/stream.html#stream_class_stream_readable) that convert messages received from a [Redis channel](http://redis.io/topics/pubsub) to valid [HTML5 Server-Sent Events](http://www.w3schools.com/html/html5_serversentevents.asp).

Features:

* Can subscribe to one or more channels
* Can set Redis channel name to SSE `event` property, so publish on `test` channels is equal to listen to `test` event on client-side
* Easy to integrate with [Koa](http://koajs.com) or [Express](http://expressjs.com) frameworks


