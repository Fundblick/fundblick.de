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
  assert.equal(response.headers.get('access-control-allow-origin'), null);
  response = await worker.fetch(new Request('https://worker.example/search?q=akku', { method:'OPTIONS', headers:{ Origin:'https://evil.example' } }), {});
  assert.equal(response.status, 403);
  response = await worker.fetch(new Request('https://worker.example/search?q=akku', { method:'OPTIONS', headers:{ Origin:'https://fundblick.de' } }), {});
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-max-age'), '600');

  let upstreamUrl;
  let upstreamOptions;
  sandbox.fetch = async (url, options) => {
    upstreamUrl = new URL(url);
    upstreamOptions = options;
    return new Response(JSON.stringify({ web:{ results:[
      { title:'Treffer', url:'https://example.com/p', description:'Text', family_friendly:true },
      { title:'Nicht anzeigen', url:'https://example.com/x', family_friendly:false }
    ] } }), { status:200, headers:{ 'content-type':'application/json' } });
  };
  const longQuery = 'A'.repeat(200);
  response = await worker.fetch(new Request(`https://worker.example/search?q=${longQuery}&count=99&country=DE123&lang=de!!!`, { headers:{ Origin:'https://fundblick.de' } }), { BRAVE_SEARCH_API_KEY:'test-only' });
  body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.query.length, 120);
  assert.equal(body.count, 1);
  assert.equal(body.results[0].url, 'https://example.com/p');
  assert.equal(upstreamUrl.hostname, 'api.search.brave.com');
  assert.equal(upstreamUrl.searchParams.get('count'), '20');
  assert.equal(upstreamUrl.searchParams.get('country'), 'DE');
  assert.equal(upstreamUrl.searchParams.get('search_lang'), 'de');
  assert.equal(upstreamUrl.searchParams.get('safesearch'), 'moderate');
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
  body = await response.json();
  assert.equal(body.error, 'upstream_invalid_response');

  sandbox.fetch = async () => new Response('{}', { status:429 });
  response = await worker.fetch(new Request('https://worker.example/search?q=test'), { BRAVE_SEARCH_API_KEY:'test-only' });
  assert.equal(response.status, 429);

  sandbox.fetch = async () => new Response('{}', { status:500 });
  response = await worker.fetch(new Request('https://worker.example/search?q=test'), { BRAVE_SEARCH_API_KEY:'test-only' });
  assert.equal(response.status, 502);

  console.log('Brave Worker contract: hardened headers/origin/abuse/failure boundaries OK');
})().catch(error => { console.error(error); process.exitCode = 1; });
