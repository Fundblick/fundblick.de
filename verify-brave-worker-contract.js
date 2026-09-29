'use strict';

const fs = require('node:fs');
const assert = require('node:assert/strict');
const vm = require('node:vm');

let code = fs.readFileSync('cloudflare/brave-search-worker.js', 'utf8');
code = code.replace('export default {', 'globalThis.__worker = {');

const sandbox = {
  URL,
  Response,
  Request,
  console,
  globalThis: null,
  fetch: async () => { throw new Error('unexpected upstream call'); }
};
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

  response = await worker.fetch(new Request('https://worker.example/search?q='), { BRAVE_SEARCH_API_KEY:'test-only' });
  assert.equal(response.status, 400);

  response = await worker.fetch(new Request('https://worker.example/search?q=akku'), {});
  assert.equal(response.status, 503);

  let upstreamUrl;
  let upstreamOptions;
  sandbox.fetch = async (url, options) => {
    upstreamUrl = new URL(url);
    upstreamOptions = options;
    return new Response(JSON.stringify({ web:{ results:[{ title:'Treffer', url:'https://example.com/p', description:'Text', family_friendly:true }] } }), { status:200, headers:{ 'content-type':'application/json' } });
  };
  response = await worker.fetch(new Request('https://worker.example/search?q=Akkuschrauber&count=99&country=DE&lang=de', { headers:{ Origin:'https://fundblick.de' } }), { BRAVE_SEARCH_API_KEY:'test-only' });
  body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.count, 1);
  assert.equal(body.results[0].url, 'https://example.com/p');
  assert.equal(upstreamUrl.hostname, 'api.search.brave.com');
  assert.equal(upstreamUrl.searchParams.get('count'), '20');
  assert.equal(upstreamOptions.headers['X-Subscription-Token'], 'test-only');
  assert.equal(JSON.stringify(body).includes('test-only'), false, 'secret must never be returned');

  sandbox.fetch = async () => new Response('{}', { status:429 });
  response = await worker.fetch(new Request('https://worker.example/search?q=test'), { BRAVE_SEARCH_API_KEY:'test-only' });
  assert.equal(response.status, 429);

  console.log('Brave Worker contract: OK');
})().catch(error => { console.error(error); process.exitCode = 1; });
