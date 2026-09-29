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

  let calls = 0;
  global.fetch = async () => { calls += 1; throw new Error('invalid query must not reach network'); };
  for (const query of ['   ', 'a', '\u0000a\n']) {
    const invalid = await client.search({ endpoint: 'https://example.com', query });
    assert.equal(invalid.ok, false);
    assert.equal(invalid.skipped, 'invalid-query');
  }
  assert.equal(calls, 0);

  let requestedUrl;
  global.fetch = async (url, options) => {
    calls += 1;
    requestedUrl = url;
    assert.equal(url.origin, 'https://search.example.com');
    assert.equal(url.pathname, '/search');
    assert.equal(url.searchParams.get('q'), 'Akkuschrauber');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.referrerPolicy, 'no-referrer');
    return {
      ok: true,
      status: 200,
      async json() {
        return { results: [
          {
            title: '<strong>Treffer</strong>',
            productUrl: 'https://shop.example/product/akku',
            url: 'https://search.example/result/akku',
            description: 'Web &amp; Shop',
            image: 'https://cdn.example/akku.jpg',
            price: '99,99 €',
            currency: 'EUR',
            merchant: 'Beispiel Shop',
            productStatus: 'in_stock',
            productCandidate: true,
            affiliateUrl: 'fake'
          },
          { title: 'Unsicher', url: 'javascript:alert(1)' }
        ] };
      }
    };
  };

  client.clearSessionCache();
  const beforeValid = calls;
  const first = await client.search({ endpoint: 'https://search.example.com', query: ' Akkuschrauber ' });
  const second = await client.search({ endpoint: 'https://search.example.com', query: 'Akkuschrauber' });
  assert.equal(first.ok, true);
  assert.equal(first.results.length, 1);
  assert.deepEqual(first.results[0], {
    kind:'external-web',
    title:'Treffer',
    url:'https://shop.example/product/akku',
    productUrl:'https://shop.example/product/akku',
    description:'Web & Shop',
    source:'web',
    host:'shop.example',
    merchant:'Beispiel Shop',
    image:'https://cdn.example/akku.jpg',
    price:'99,99 €',
    currency:'EUR',
    productStatus:'in_stock',
    productCandidate:true
  });
  assert.equal(second.cached, true);
  assert.equal(calls - beforeValid, 1);
  assert.equal(requestedUrl.searchParams.get('q'), 'Akkuschrauber');

  client.clearSessionCache();
  global.fetch = async () => ({ ok:false, status:429, async json(){ return {}; } });
  const limited = await client.search({ endpoint:'https://search.example.com', query:'Bohrmaschine' });
  assert.equal(limited.ok, false);
  assert.equal(limited.status, 429);
  assert.deepEqual(limited.results, []);

  console.log('External search client: sanitized normalized offer fields, cache and 429 OK');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
