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
assert.ok(source.includes('installHomeSearchGuard'),'homepage empty-search guard missing');
assert.ok(source.includes("ar:'يرجى إدخال منتج أو علامة تجارية أو موديل.'"),'Arabic empty-search feedback missing');
for(const lang of expected)assert.ok(new RegExp(`(?:^|\\n\\s*)${lang==='zh-Hans'?"'zh-Hans'":lang}:`).test(source),`localized navigation/search feedback missing for ${lang}`);
const home=fs.readFileSync('index.html','utf8');
assert.ok(home.includes('id="searchForm"'),'homepage search form missing');
assert.ok(home.includes('id="q"'),'homepage search input missing');
console.log('live language navigation and empty-search smoke tests passed');
