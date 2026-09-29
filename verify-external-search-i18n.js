'use strict';

const fs = require('node:fs');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const code = fs.readFileSync('external-search-i18n.js', 'utf8');
const supported = ['de','tr','ru','ar','pl','ro','uk','en','it','bg','hr','el','sr','es','fr','pt','fa','sq','zh-Hans','ku'];

for (const lang of supported) {
  const sandbox = { document:{ documentElement:{ lang } } };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.runInNewContext(code, sandbox);
  const text = sandbox.FundBlickExternalSearchI18n.get();
  for (const key of ['title','loading','empty','error','source']) {
    assert.equal(typeof text[key], 'string', `${lang}:${key} must exist`);
    assert.ok(text[key].trim().length > 0, `${lang}:${key} must not be empty`);
  }
}

console.log(`External search i18n: ${supported.length} languages OK`);
