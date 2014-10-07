
/**
 * Module dependencies
 */

var redis = require('redis').createClient();
var Subscribe = require('../lib');


describe('Subscribe', function() {

  it('Should throw if options `channels` is missing', function() {
    var exception;

    try {
      new Subscribe({});
    } catch(e) { exception = e; }

    exception.message.should.equal('option `channels` is required and must be an Array or a String');
  });

  it('Should throw if options `retry` is invalid', function() {
    var exception;

    try {
      new Subscribe({
        channels: ['test'],
        retry: -1
      });
    } catch(e) { exception = e; }

    exception.message.should.equal('option `sse.retry` must be a Number greater than 0');
  });

  it('Should get a Subscribe stream', function() {
    var subscribe = new Subscribe({
      channels: ['test']
    });

    subscribe.should.be.an.instanceof.Subscribe;
    subscribe.channels.should.eql(['test']);
  });

  it('Should get a Subscribe stream with Redis options specified', function() {
    var subscribe = new Subscribe({
      channels: ['test'],
      host: '127.0.0.1',
      port: 6379,
      clientOptions: { enable_offline_queue: false }
    });

    subscribe.should.be.an.instanceof.Subscribe;
    subscribe.channels.should.eql(['test']);
  });

  it('Should stream Redis published messages as SSE', function(done) {

    var chunks = 0;

    var subscribe = new Subscribe({
      channels: ['test']
    });

    subscribe.on('ready', function() {
      redis.publish('test', 'test-message');
    });

    subscribe.on('data', function(data) {
      if (chunks === 0) {
        data.toString().should.equal('retry: 5000\n');
      }

      if (chunks === 1) {
        data.toString().should.equal('data: test-message\n\n');
        done();
      }

      chunks++;
    });

  });

  it('Should associate Redis channels as SSE events if `channelsAsEvents` option is true', function(done) {
    var chunks = 0;

    var subscribe = new Subscribe({
      channels: ['named-channel'],
      channelsAsEvents: true
    });

    subscribe.on('ready', function() {
      redis.publish('named-channel', 'test-message');
    });

    subscribe.on('data', function(data) {
      if (chunks === 0) {
        data.toString().should.equal('retry: 5000\n');
      }

      if (chunks === 1) {
        data.toString().should.equal('event: named-channel\n');
      }

      if (chunks === 2) {
        data.toString().should.equal('data: test-message\n\n');
        done();
      }

      chunks++;
    });

  });

});


