
/**
 * Module dependencies
 */

var koa = require('koa');
var fs = require('co-fs');
var path = require('path');
var router = require('koa-router');
var PassThrough = require('stream').PassThrough;


// stream

var subscribe = require('../lib');

var options = {
  channels: ['test-koa', 'test-koa1'],
  retry: 10000,
  host: '127.0.0.1',
  port: 6379,
  channelsAsEvents: true
};


// koa app

var app = module.exports = koa();

app.use(router(app));

app.get('/', function *() {
  var index = path.join(__dirname, './index.html');

  this.type = 'text/html; charset=utf-8';
  this.body = yield fs.readFile(index);
});

app.get('/stream', function *() {
  this.req.setTimeout(0);

  this.type = 'text/event-stream; charset=utf-8';

  this.set('Cache-Control', 'no-cache');
  this.set('Connection', 'keep-alive');

  var stream = subscribe(options);

  this.body = stream;

  this.req.on('close', function() {
    stream.close();
  });
});


app.listen(3000, function() {
  console.log('Listening on port 3000');
});
