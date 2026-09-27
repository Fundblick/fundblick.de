'use strict';
const fs=require('fs');
const assert=require('assert');

const html=fs.readFileSync('search.html','utf8');
const js=fs.readFileSync('external-search.js','utf8');
const css=fs.readFileSync('external-search.css','utf8');

assert(html.includes('id="external-results"'),'external results container missing');
assert(html.includes('external-search.js'),'external search script missing');
assert(html.includes('external-search.css'),'external search stylesheet missing');
assert(js.includes("sourceType:'external'"),'external source type marker missing');
assert(js.includes('Externes Angebot'),'external result disclosure missing');
assert(js.includes('rel="noopener noreferrer nofollow"'),'external link safety attributes missing');
assert(js.includes("params.get('externalMock')==='1'"),'dev mock must require explicit URL flag');
assert(js.includes('const threshold=6'),'fallback threshold changed unexpectedly');
assert(!/api[_-]?key\s*[:=]\s*['"][^'"]+/i.test(js),'possible API key embedded in frontend');
assert(css.includes('.external-product'),'external card styling missing');

console.log('external-search-fallback safety checks: OK');
