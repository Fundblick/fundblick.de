'use strict';

const assert = require('node:assert/strict');
global.FundBlickExternalSearchPolicy = require('./external-search-policy.js');
const client = require('./external-search-client.js');

assert.equal(client._endpoint('http://example.com'), null);
assert.equal(client._endpoint('javascript:alert(1)'), null);
assert.equal(client._endpoint('https://example.com').origin, 'https://example.com');

(async () => {
  const disabled = await client.search({ query: 'Akkuschrauber' });
  assert.equal(disabled.ok, false);
  assert.equal(disabled.skipped, 'endpoint-disabled');

  const invalid = await client.search({ endpoint: 'https://example.com', query: '   ' });
  assert.equal(invalid.ok, false);
  assert.equal(invalid.skipped, 'invalid-query');

  let calls = 0;
  global.fetch = async (url, options) => {
    calls += 1;
    assert.equal(url.origin, 'https://search.example.com');
    assert.equal(url.pathname, '/search');
    assert.equal(url.searchParams.get('q'), 'Akkuschrauber');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.referrerPolicy, 'no-referrer');
    return {
      ok: true,
      status: 200,
      async json() {
        return { results: [{ title: 'Treffer', url: 'https://shop.example/item', description: 'Web' }] };
      }
    };
  };

  client.clearSessionCache();
  const first = await client.search({ endpoint: 'https://search.example.com', query: ' Akkuschrauber ' });
  const second = await client.search({ endpoint: 'https://search.example.com', query: 'Akkuschrauber' });
  assert.equal(first.ok, true);
  assert.equal(first.results.length, 1);
  assert.equal(second.cached, true);
  assert.equal(calls, 1);

  console.log('External search client: OK');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
