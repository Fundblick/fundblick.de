'use strict';

const fs = require('node:fs');
const assert = require('node:assert/strict');
const vm = require('node:vm');

let code = fs.readFileSync('cloudflare/brave-search-worker.js', 'utf8');
code = code.replace('export default {', 'globalThis.__worker = {');

const sandbox = { URL, Response, Request, console, globalThis:null, fetch:async()=>{ throw new Error('unexpected upstream call'); } };
sandbox.globalThis = sandbox;
vm.runInNewContext(code, sandbox);
const worker = sandbox.__worker;
assert.ok(worker && typeof worker.fetch === 'function');

(async () => {
  let response = await worker.fetch(new Request('https://worker.example/health', { headers:{ Origin:'https://fundblick.de' } }), {});
  let body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.keyConfigured, false);
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://fundblick.de');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.match(response.headers.get('content-security-policy') || '', /default-src 'none'/);
  assert.match(response.headers.get('permissions-policy') || '', /geolocation=\(\)/);

  response = await worker.fetch(new Request('https://worker.example/health', { headers:{ Origin:'https://evil.example' } }), {});
  assert.equal(response.status, 403);
  assert.equal(response.headers.get('access-control-allow-origin'), null);

  response = await worker.fetch(new Request('https://worker.example/search?q=', { headers:{ Origin:'https://fundblick.de' } }), { BRAVE_SEARCH_API_KEY:'test-only' });
  assert.equal(response.status, 400);
  response = await worker.fetch(new Request('https://worker.example/search?q=a', { headers:{ Origin:'https://fundblick.de' } }), { BRAVE_SEARCH_API_KEY:'test-only' });
  assert.equal(response.status, 400);
  response = await worker.fetch(new Request('https://worker.example/search?q=akku', { headers:{ Origin:'https://fundblick.de' } }), {});
  assert.equal(response.status, 503);

  response = await worker.fetch(new Request('https://worker.example/search?q=akku', { headers:{ Origin:'https://evil.example' } }), { BRAVE_SEARCH_API_KEY:'test-only' });
  assert.equal(response.status, 403);
  response = await worker.fetch(new Request('https://worker.example/search?q=akku', { method:'OPTIONS', headers:{ Origin:'https://fundblick.de' } }), {});
  assert.equal(response.status, 204);

  let upstreamUrl;
  let upstreamOptions;
  sandbox.fetch = async (url, options) => {
    upstreamUrl = new URL(url);
    upstreamOptions = options;
    return new Response(JSON.stringify({ query:{ more_results_available:true }, web:{ results:[
      {
        title:'Bosch GSR',
        url:'https://search.example/result/gsr',
        description:'Akkuschrauber',
        thumbnail:{src:'https://img.example/gsr.jpg'},
        product:{
          url:'https://shop.example/produkt/gsr',
          offers:{ price:'149,99', priceCurrency:'EUR', availability:'https://schema.org/InStock' },
          seller:{ name:'Werkzeug Shop' }
        },
        family_friendly:true
      },
      {
        title:'Cluster Produkt',
        url:'https://shop.example/p/cluster',
        description:'Produktvergleich',
        product_cluster:[{
          image:'https://img.example/cluster.jpg',
          offers:[{ price:'79.50', priceCurrency:'USD', availability:'OutOfStock' }],
          brand:{ name:'ClusterBrand' }
        }],
        family_friendly:true
      },
      { title:'Snippet Preis', url:'https://shop.example/p/2', description:'Jetzt kaufen', extra_snippets:['Angebot 89,90 EUR sofort lieferbar'], family_friendly:true },
      {
        title:'Mercedes GL350 gebraucht kaufen | Ab 11.205 € · 161 im Vergleich',
        url:'https://www.autouncle.de/de/gebrauchtwagen/Mercedes/GL350',
        description:'166 gebrauchte Mercedes GL350 zum Verkauf',
        product:{ offers:{ price:'112050', priceCurrency:'EUR' } },
        family_friendly:true
      },
      { title:'Nicht anzeigen', url:'https://example.com/x', family_friendly:false }
    ] } }), { status:200, headers:{ 'content-type':'application/json' } });
  };
  const longQuery = 'A'.repeat(200);
  response = await worker.fetch(new Request(`https://worker.example/search?q=${longQuery}&count=99&offset=3&country=DE123&lang=de!!!`, { headers:{ Origin:'https://fundblick.de' } }), { BRAVE_SEARCH_API_KEY:'test-only' });
  body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.query.length, 120);
  assert.equal(body.count, 4);
  assert.equal(body.offset, 3);
  assert.equal(body.moreResultsAvailable, true);

  assert.equal(body.results[0].url, 'https://shop.example/produkt/gsr');
  assert.equal(body.results[0].productUrl, 'https://shop.example/produkt/gsr');
  assert.equal(body.results[0].image, 'https://img.example/gsr.jpg');
  assert.equal(body.results[0].price, '149,99');
  assert.equal(body.results[0].priceConfidence, 'structured');
  assert.equal(body.results[0].currency, 'EUR');
  assert.equal(body.results[0].merchant, 'Werkzeug Shop');
  assert.equal(body.results[0].productStatus, 'in_stock');
  assert.equal(body.results[0].productCandidate, true);

  assert.equal(body.results[1].image, 'https://img.example/cluster.jpg');
  assert.equal(body.results[1].price, '79.50');
  assert.equal(body.results[1].priceConfidence, 'structured');
  assert.equal(body.results[1].currency, 'USD');
  assert.equal(body.results[1].merchant, 'ClusterBrand');
  assert.equal(body.results[1].productStatus, 'out_of_stock');
  assert.equal(body.results[1].productCandidate, true);

  assert.equal(body.results[2].price, '89,90 EUR');
  assert.equal(body.results[2].priceConfidence, 'visible');
  assert.equal(body.results[2].currency, 'EUR');
  assert.equal(body.results[2].productStatus, 'unknown');

  assert.equal(body.results[3].price, '11.205 €');
  assert.equal(body.results[3].priceConfidence, 'visible');
  assert.equal(body.results[3].currency, 'EUR');
  assert.notEqual(body.results[3].price, '112050');

  assert.equal(upstreamUrl.hostname, 'api.search.brave.com');
  assert.equal(upstreamUrl.searchParams.get('count'), '20');
  assert.equal(upstreamUrl.searchParams.get('offset'), '3');
  assert.equal(upstreamUrl.searchParams.get('country'), 'DE');
  assert.equal(upstreamUrl.searchParams.get('search_lang'), 'de');
  assert.equal(upstreamUrl.searchParams.get('safesearch'), 'moderate');
  assert.equal(upstreamUrl.searchParams.get('extra_snippets'), 'true');
  assert.equal(upstreamOptions.headers['X-Subscription-Token'], 'test-only');
  assert.equal(JSON.stringify(body).includes('test-only'), false, 'secret must never be returned');

  sandbox.fetch = async () => { throw new Error('network down'); };
  response = await worker.fetch(new Request('https://worker.example/search?q=test'), { BRAVE_SEARCH_API_KEY:'test-only' });
  assert.equal(response.status, 502);
  body = await response.json();
  assert.equal(body.error, 'upstream_unreachable');

  sandbox.fetch = async () => new Response('not-json', { status:200 });
  response = await worker.fetch(new Request('https://worker.example/search?q=test'), { BRAVE_SEARCH_API_KEY:'test-only' });
  assert.equal(response.status, 502);

  sandbox.fetch = async () => new Response('{}', { status:429 });
  response = await worker.fetch(new Request('https://worker.example/search?q=test'), { BRAVE_SEARCH_API_KEY:'test-only' });
  assert.equal(response.status, 429);

  sandbox.fetch = async () => new Response('{}', { status:500 });
  response = await worker.fetch(new Request('https://worker.example/search?q=test'), { BRAVE_SEARCH_API_KEY:'test-only' });
  assert.equal(response.status, 502);

  console.log('Brave Worker contract: pagination + price provenance + normalization + safety OK');
})().catch(error => { console.error(error); process.exitCode = 1; });
