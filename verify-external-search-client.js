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
    assert.equal(url.searchParams.get('count'), '20');
    assert.equal(url.searchParams.get('offset'), '0');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.referrerPolicy, 'no-referrer');
    return {
      ok: true,
      status: 200,
      async json() {
        return { moreResultsAvailable:true, results: [
          {
            title: '<strong>Treffer</strong>',
            productUrl: 'https://shop.example/product/akku',
            url: 'https://search.example/result/akku',
            description: 'Web &amp; Shop',
            image: 'https://cdn.example/akku.jpg',
            price: '99,99 €',
            currency: 'EUR',
            priceConfidence:'visible',
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
  assert.equal(first.moreResultsAvailable, true);
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
    priceConfidence:'visible',
    productStatus:'in_stock',
    productCandidate:true
  });
  assert.equal(second.cached, true);
  assert.equal(calls - beforeValid, 1);

  client.clearSessionCache();
  global.fetch = async (url) => {
    requestedUrl = url;
    return { ok:true, status:200, async json(){ return { moreResultsAvailable:false, results:[] }; } };
  };
  const pageTwo = await client.search({ endpoint:'https://search.example.com', query:'Akkuschrauber', count:20, offset:1 });
  assert.equal(requestedUrl.searchParams.get('offset'), '1');
  assert.equal(pageTwo.offset, 1);
  assert.equal(pageTwo.moreResultsAvailable, false);

  client.clearSessionCache();
  global.fetch = async () => ({ ok:false, status:429, async json(){ return {}; } });
  const limited = await client.search({ endpoint:'https://search.example.com', query:'Bohrmaschine' });
  assert.equal(limited.ok, false);
  assert.equal(limited.status, 429);
  assert.deepEqual(limited.results, []);

  client.clearSessionCache();
  global.fetch=async (_,options)=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true}));
  const timedOut=await client.search({endpoint:'https://search.example.com',query:'Timeout Gegenprobe',timeoutMs:500});assert.equal(timedOut.ok,false);assert.equal(timedOut.timeout,true);assert.deepEqual(timedOut.results,[]);
  let retries=0;global.fetch=async()=>{retries++;return{ok:true,status:200,async json(){return{results:[],moreResultsAvailable:false}}}};
  const recovered=await client.search({endpoint:'https://search.example.com',query:'Timeout Gegenprobe'});assert.equal(recovered.ok,true);assert.equal(retries,1,'timeout does not poison pending requests or session cache');
  client.clearSessionCache();let concurrentCalls=0,complete;
  global.fetch=async (_,options)=>{concurrentCalls++;assert.equal(options.credentials,'omit');assert.equal(options.referrerPolicy,'no-referrer');return new Promise(resolve=>{complete=resolve})};
  const concurrentOne=client.search({endpoint:'https://search.example.com',query:'Concurrent Gegenprobe'}),concurrentTwo=client.search({endpoint:'https://search.example.com',query:'Concurrent Gegenprobe'});assert.equal(concurrentCalls,1,'in-flight equal queries share one fetch');complete({ok:true,status:200,async json(){return{results:[],moreResultsAvailable:false}}});assert.ok((await concurrentOne).ok);assert.ok((await concurrentTwo).ok);

  console.log('External search client: pagination, sanitized fields, cache and 429 OK');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
