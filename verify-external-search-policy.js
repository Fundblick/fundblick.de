'use strict';

const assert = require('node:assert/strict');
const policy = require('./external-search-policy.js');

assert.equal(policy.normalizeQuery('  akkuschrauber   18V  '), 'akkuschrauber 18V');
assert.equal(policy.normalizeQuery('\u0000  test\nquery '), 'test query');
assert.equal(policy.normalizeQuery('x'.repeat(250)).length, 120);
assert.equal(policy.validQuery('a'), false);
assert.equal(policy.validQuery('ab'), true);

assert.equal(policy.shouldUseExternalSearch({ query: '' , localResults: [] }), false);
assert.equal(policy.shouldUseExternalSearch({ query: 'a', localResults: [] }), false);
assert.equal(policy.shouldUseExternalSearch({ query: 'Akkuschrauber', localResults: [] }), true);
assert.equal(policy.shouldUseExternalSearch({ query: 'Akkuschrauber', localResults: [{}] }), false);
assert.equal(policy.shouldUseExternalSearch({ query: 'Akkuschrauber', localResults: 0 }), true);
assert.equal(policy.shouldUseExternalSearch({ query: 'Akkuschrauber', localResults: 1 }), false);
assert.equal(policy.shouldUseExternalSearch({ query: 'Akkuschrauber', localResults: [], pending: true }), false);
assert.equal(policy.shouldUseExternalSearch({ query: 'Akkuschrauber', localResults: [], alreadyRequested: true }), false);
assert.equal(policy.shouldUseExternalSearch({ query: 'Akkuschrauber', localResults: [], externalEnabled: false }), false);
assert.equal(policy.shouldUseExternalSearch({ query: 'Akkuschrauber', localResults: [{}], minLocalResults: 2 }), true);

assert.equal(
  policy.requestKey('  AkkuSchrauber ', 'DE', 'de'),
  'DE:de:akkuschrauber'
);

const result = policy.normalizeExternalResult({
  title: 'Beispiel',
  url: 'https://example.com/item',
  description: 'Beschreibung',
  price: 12.99,
  affiliateUrl: 'https://example.com/fake-affiliate'
});
assert.deepEqual(result, {
  kind: 'external-web',
  title: 'Beispiel',
  url: 'https://example.com/item',
  description: 'Beschreibung',
  source: 'web'
});
assert.equal(policy.normalizeExternalResult({ title: 'Bad', url: 'javascript:alert(1)' }), null);
assert.equal(policy.normalizeExternalResult({ title: '', url: 'https://example.com' }), null);

console.log('External search fallback policy: OK');
