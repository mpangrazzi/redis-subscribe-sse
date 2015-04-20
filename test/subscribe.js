
/**
 * Module dependencies
 */

var redis = require('redis').createClient();
var subscribe = require('../lib');


describe('Subscribe', function() {

  it('Should throw if options `channels` is missing', function() {
    var exception;

    try {
      var s = subscribe({});
    } catch(e) { exception = e; }

    exception.message.should.equal('option `channels` is required and must be an Array or a String');
  });

  it('Should throw if options `retry` is invalid', function() {
    var exception;

    try {
      var s = subscribe({
        channels: ['test'],
        retry: -1
      });
    } catch(e) { exception = e; }

    exception.message.should.equal('option `sse.retry` must be a Number greater than 0');
  });

  it('Should get a Subscribe stream', function() {
    var s = subscribe({
      channels: ['test']
    });

    s.should.be.an.instanceof.Subscribe;
    s.channels.should.eql(['test']);
  });

  it('Should get a Subscribe stream with Redis options specified', function() {
    var s = subscribe({
      channels: ['test'],
      host: '127.0.0.1',
      port: 6379,
      clientOptions: { enable_offline_queue: false }
    });

    s.should.be.an.instanceof.Subscribe;
    s.channels.should.eql(['test']);
  });

  it('Should stream Redis published messages as SSE', function(done) {

    var chunks = 0;

    var s = subscribe({
      channels: ['test']
    });

    s.on('ready', function() {
      redis.publish('test', 'test-message');
    });

    s.on('data', function(data) {
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

    var s = subscribe({
      channels: ['named-channel'],
      channelsAsEvents: true
    });

    s.on('ready', function() {
      redis.publish('named-channel', 'test-message');
    });

    s.on('data', function(data) {
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

  it('Should stream Redis published messages as SSE (using PSUBSCRIBE)', function(done) {

      var chunks = 0;

      var s = subscribe({
        channels: ['test*'],
        patternSubscribe: true
      });

      s.on('ready', function() {
        redis.publish('test-pattern-subscribe', 'test-pattern-subscribe-message');
      });

      s.on('data', function(data) {
        if (chunks === 0) {
          data.toString().should.equal('retry: 5000\n');
        }

        if (chunks === 1) {
          data.toString().should.equal('data: test-pattern-subscribe-message\n\n');
          done();
        }

        chunks++;
      });

    });

});


