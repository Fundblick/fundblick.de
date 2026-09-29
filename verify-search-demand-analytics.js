'use strict';

const assert = require('node:assert/strict');
global.FundBlickExternalSearchPolicy = require('./external-search-policy.js');
const analytics = require('./search-demand-analytics.js');

assert.equal(analytics.event({ query:'a' }), null);
assert.deepEqual(analytics.event({ query:'  Akku   Schrauber ', localResults:0, externalFallback:true, at:'2026-09-29T18:42:10Z', ip:'127.0.0.1', userAgent:'secret' }), {
  query:'Akku Schrauber',
  day:'2026-09-29',
  localResults:0,
  externalFallback:true
});

const rows = analytics.aggregate([
  { query:'Akkuschrauber', localResults:0, externalFallback:true, at:'2026-09-29T01:00:00Z' },
  { query:'akkuschrauber', localResults:0, externalFallback:true, at:'2026-09-29T23:00:00Z' },
  { query:'Akkuschrauber', localResults:1, externalFallback:false, at:'2026-09-29T12:00:00Z' }
]);
assert.equal(rows.length, 2);
assert.equal(rows.find(row => row.localResults === 0).count, 2);
assert.equal(rows.find(row => row.localResults === 1).count, 1);
assert.equal(JSON.stringify(rows).includes('127.0.0.1'), false);
assert.equal(JSON.stringify(rows).includes('userAgent'), false);

console.log('Search demand analytics contract: OK');
