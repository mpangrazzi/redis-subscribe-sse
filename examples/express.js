
/**
 * Module dependencies
 */

var express = require('express');
var fs = require('fs');
var path = require('path');


// stream

var subscribe = require('../lib');

var sse = subscribe({
  channels: 'test-express',
  retry: 5000,
  host: '127.0.0.1',
  port: 6379
});


// express app

var app = module.exports = express();

app.get('/', function(req, res) {
  var index = path.join(__dirname, './index.html');
  fs.createReadStream(index).pipe(res);
});

app.get('/stream', function(req, res) {
  req.socket.setTimeout(0);

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  sse.pipe(res);
});

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});
