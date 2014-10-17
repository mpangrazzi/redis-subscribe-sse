
/**
 * Module dependencies
 */

var express = require('express');
var fs = require('fs');
var path = require('path');


/**
 * To test, publish something on 'test-cors' channel
 *
 * $ redis-cli publish test-cors testmessage
 */


// stream

var subscribe = require('../lib');


// express app

var frontend = express();
var backend = express();

frontend.get('/', function(req, res) {
  var index = path.join(__dirname, './cors.html');
  fs.createReadStream(index).pipe(res);
});

backend.get('/stream', function(req, res) {

  var sse = subscribe({
    channels: 'test-cors'
  });

  req.socket.setTimeout(0);

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  sse.pipe(res).on('close', function() {
    sse.close();
  });

});

frontend.listen(3000, function() {
  console.log('Frontend listening on port 3000');
});

backend.listen(4000, function() {
  console.log('backend on port 4000');
});
