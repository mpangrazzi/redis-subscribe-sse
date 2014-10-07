
/**
 * Module dependencies
 */

var Subscribe = require('../lib');


// stream

var subscribe = new Subscribe({
  channels: 'test-express',
  retry: 5000,
  host: '127.0.0.1',
  port: 6379
});

// express app

var app = require('./apps/express');

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});
