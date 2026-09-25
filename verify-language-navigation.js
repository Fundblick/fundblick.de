'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const expected=['de','tr','ru','ar','pl','ro','uk','en','it','bg','hr','el','sr','es','fr','pt','fa','sq','zh-Hans','ku'];
const source=fs.readFileSync('language-links.js','utf8');
const match=source.match(/const supported=\[([^\]]+)\]/);
assert.ok(match,'supported language registry missing');
const actual=[...match[1].matchAll(/'([^']+)'/g)].map(x=>x[1]);
assert.deepEqual(actual,expected,'language navigation must mirror the 20-language live registry');
for(const file of ['index.html','search.html','impressum.html','datenschutz.html','404.html']){
  const html=fs.readFileSync(file,'utf8');
  assert.ok(html.includes('language-links.js'),`${file} must preserve language across internal navigation`);
}
assert.ok(source.includes("href.startsWith('mailto:')"),'mailto links must never receive a language parameter');
assert.ok(source.includes("href.startsWith('tel:')"),'telephone links must never receive a language parameter');
assert.ok(source.includes('url.origin===location.origin'),'language propagation must remain same-origin only');
console.log('live language navigation smoke tests passed');
