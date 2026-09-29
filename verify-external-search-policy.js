'use strict';

const assert = require('node:assert/strict');
const policy = require('./external-search-policy.js');

assert.equal(policy.normalizeQuery('  akkuschrauber   18V  '), 'akkuschrauber 18V');
assert.equal(policy.normalizeQuery('\u0000  test\nquery '), 'test query');
assert.equal(policy.normalizeQuery('x'.repeat(250)).length, 120);
assert.equal(policy.validQuery('a'), false);
assert.equal(policy.validQuery('ab'), true);
assert.equal(policy.DEFAULTS.minLocalResults, 10);

assert.equal(policy.shouldUseExternalSearch({ query: '', localResults: [] }), false);
assert.equal(policy.shouldUseExternalSearch({ query: 'a', localResults: [] }), false);
assert.equal(policy.shouldUseExternalSearch({ query: 'Akkuschrauber', localResults: [] }), true);
assert.equal(policy.shouldUseExternalSearch({ query: 'Akkuschrauber', localResults: [{}] }), true);
assert.equal(policy.shouldUseExternalSearch({ query: 'Akkuschrauber', localResults: 9 }), true);
assert.equal(policy.shouldUseExternalSearch({ query: 'Akkuschrauber', localResults: 10 }), false);
assert.equal(policy.shouldUseExternalSearch({ query: 'Akkuschrauber', localResults: [], pending: true }), false);
assert.equal(policy.shouldUseExternalSearch({ query: 'Akkuschrauber', localResults: [], alreadyRequested: true }), false);
assert.equal(policy.shouldUseExternalSearch({ query: 'Akkuschrauber', localResults: [], externalEnabled: false }), false);
assert.equal(policy.shouldUseExternalSearch({ query: 'Akkuschrauber', localResults: [{}], minLocalResults: 2 }), true);
assert.equal(policy.shouldUseExternalSearch({ query: 'Akkuschrauber', localResults: [{}, {}], minLocalResults: 2 }), false);

assert.equal(policy.requestKey('  AkkuSchrauber ', 'DE', 'de'), 'DE:de:akkuschrauber');
assert.equal(policy.cleanText('<strong>Bosch</strong> &amp; Akku'), 'Bosch & Akku');

const result = policy.normalizeExternalResult({
  title: '<strong>Beispiel</strong>',
  url: 'https://www.example.com/product/akku-18v',
  description: 'Jetzt kaufen &amp; bestellen',
  price: 12.99,
  affiliateUrl: 'https://example.com/fake-affiliate'
});
assert.deepEqual(result, {
  kind: 'external-web',
  title: 'Beispiel',
  url: 'https://www.example.com/product/akku-18v',
  description: 'Jetzt kaufen & bestellen',
  source: 'web',
  host: 'example.com',
  productCandidate: true
});
assert.equal(policy.normalizeExternalResult({ title: 'Bad', url: 'javascript:alert(1)' }), null);
assert.equal(policy.normalizeExternalResult({ title: '', url: 'https://example.com' }), null);

const deduped = policy.normalizeExternalResults([
  { title: 'A', url: 'https://example.com/item/' },
  { title: 'A duplicate', url: 'https://example.com/item/#details' },
  { title: 'B', url: 'https://example.org/info' }
]);
assert.equal(deduped.length, 2);

console.log('External search fallback policy: OK');
