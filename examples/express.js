
/**
 * Module dependencies
 */

var express = require('express');
var fs = require('fs');
var path = require('path');


/**
 * To test, publish something on 'test-express' channel
 *
 * $ redis-cli publish test-express testmessage
 */


// stream

var subscribe = require('../lib');


// express app

var app = express();

app.get('/', function(req, res) {
  var index = path.join(__dirname, './index.html');
  fs.createReadStream(index).pipe(res);
});

app.get('/stream', function(req, res) {

  var sse = subscribe({
    channels: 'test-express',
    retry: 5000,
    host: '127.0.0.1',
    port: 6379
  });

  req.socket.setTimeout(0);

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  sse.pipe(res).on('close', function() {
    sse.close();
  });

});

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});
