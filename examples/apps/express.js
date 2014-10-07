
/**
 * Module dependencies
 */

var express = require('express');
var fs = require('fs');
var path = require('path');

// app

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

  subscribe.pipe(res);
});
