1.0.0 / 2016-09-xx
==================

* Completely rewritten module core in ES6 while retaining compatiblity with last Node.js LTS (which is `4.5.0` at the moment of writing)
* Received redis messages can now be manipulated before pushing them to the stream
* Switched to `ioredis` as Redis client module
* Switched to `AVA` for tests
* Using SEMVER

0.2.0 / 2014-04-29
==================

* Added PSUBSCRIBE support

0.1.2 / 2014-10-10
==================

* Cleaned a bit code
* Added more DEBUG messages
* Refined docs and examples

0.1.1 / 2014-10-09
==================

* Added close() method

0.1.0 / 2014-10-08
==================

* Rewritten Redis client handling