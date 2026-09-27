'use strict';
const fs=require('fs');
const assert=require('assert');

const html=fs.readFileSync('search.html','utf8');
const js=fs.readFileSync('external-search.js','utf8');
const i18n=fs.readFileSync('external-search-i18n.js','utf8');
const css=fs.readFileSync('external-search.css','utf8');
const e2e=fs.readFileSync('external-search-e2e.spec.js','utf8');

assert(html.includes('id="external-results"'),'external results container missing');
assert(html.includes('external-search-i18n.js'),'external search i18n script missing');
assert(html.indexOf('external-search-i18n.js')<html.indexOf('external-search.js'),'external i18n must load before external search');
assert(html.includes('external-search.css'),'external search stylesheet missing');
assert(js.includes("sourceType:'external'"),'external source type marker missing');
assert(i18n.includes("external:'Externes Angebot'"),'German external result disclosure missing');
assert(i18n.includes("external:'Внешнее предложение'"),'Russian external result disclosure missing');
assert(js.includes('rel="noopener noreferrer nofollow"'),'external link safety attributes missing');
assert(js.includes("params.get('externalMock')==='1'"),'dev mock must require explicit URL flag');
assert(js.includes('const threshold=6'),'fallback threshold changed unexpectedly');
assert(js.includes('safeUrl'),'external URLs must pass protocol validation');
assert(js.includes('data-external-facet'),'external facet wiring missing');
assert(js.includes('runId'),'stale async result guard missing');
assert(!/api[_-]?key\s*[:=]\s*['"][^'"]+/i.test(js+i18n),'possible API key embedded in frontend');
assert(css.includes('.external-product'),'external card styling missing');
assert(css.includes('.external-filter-panel'),'external filter styling missing');
assert(e2e.includes('zero own results triggers external fallback'),'zero-result E2E missing');
assert(e2e.includes('six own results suppress external fallback'),'threshold E2E missing');
assert(e2e.includes('Russian fallback copy is localized'),'localization E2E missing');

console.log('external-search-fallback safety checks: OK');
