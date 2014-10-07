
/**
 * Module dependencies
 */

var Subscribe = require('../lib');


// stream

var subscribe = new Subscribe({
  channels: ['test-koa', 'test-koa1'],
  retry: 10000,
  host: '127.0.0.1',
  port: 6379,
  channelsAsEvents: true
});

var app = require('./apps/koa');

app.listen(3000, function() {
  console.log('Listening on port 3000');
});
