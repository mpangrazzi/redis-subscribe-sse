
/**
 * Module dependencies
 */

var http = require('http');
var fs = require('fs');
var path = require('path');


// stream

var subscribe = require('../lib');

/**
 * To test, publish something on 'test-http' channel
 *
 * $ redis-cli publish test-http testmessage
 */

var sse = subscribe({
  channels: 'test-http'
});


// http server

var server = http.createServer(function(req, res) {

  if (req.url === '/') {
    var index = path.join(__dirname, './index.html');
    fs.createReadStream(index).pipe(res);
  }

  if (req.url === '/stream') {
    req.setTimeout(0);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    sse.pipe(res);
  }

});

server.listen(3000, function() {
  console.log('Listening on port 3000');
});
