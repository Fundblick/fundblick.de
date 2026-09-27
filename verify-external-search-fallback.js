'use strict';
const fs=require('fs');
const assert=require('assert');

const html=fs.readFileSync('search.html','utf8');
const js=fs.readFileSync('external-search.js','utf8');
const i18n=fs.readFileSync('external-search-i18n.js','utf8');
const css=fs.readFileSync('external-search.css','utf8');
const packProvider=fs.readFileSync('external-query-pack-provider.js','utf8');
const relayConfig=fs.readFileSync('external-relay-config.js','utf8');
const relayProvider=fs.readFileSync('external-relay-provider.js','utf8');
const webConfig=fs.readFileSync('external-web-fallback-config.js','utf8');
const webI18n=fs.readFileSync('external-web-fallback-i18n.js','utf8');
const googlePse=fs.readFileSync('external-google-pse.js','utf8');
const pack=JSON.parse(fs.readFileSync('development/external-query-pack-fixture.json','utf8'));
const e2e=fs.readFileSync('external-search-e2e.spec.js','utf8');

assert(html.includes('id="external-results"'),'external results container missing');
assert(html.includes('external-search-i18n.js'),'external search i18n script missing');
assert(html.indexOf('external-search-i18n.js')<html.indexOf('external-search.js'),'external i18n must load before external search');
assert(html.indexOf('external-search.js')<html.indexOf('external-query-pack-provider.js'),'query-pack provider must load after external search API');
assert(html.indexOf('external-relay-config.js')<html.indexOf('external-relay-provider.js'),'relay config must load before relay provider');
assert(html.indexOf('external-search.js')<html.indexOf('external-relay-provider.js'),'relay provider must load after external search API');
assert(html.includes('external-search.css'),'external search stylesheet missing');
assert(js.includes("sourceType:'external'"),'external source type marker missing');
assert(i18n.includes("external:'Externes Angebot'"),'German external result disclosure missing');
assert(i18n.includes("external:'Внешнее предложение'"),'Russian external result disclosure missing');
for(const key of ['de','tr','ru','ar','pl','ro','uk','en','it','bg','hr','el','sr','es','fr','pt','fa','sq','ku']){
  assert(i18n.includes(`    ${key}:{`),`external i18n missing ${key}`);
  assert(webI18n.includes(`    ${key}:{`),`web fallback i18n missing ${key}`);
}
assert(i18n.includes("    'zh-Hans':{"),'external i18n missing zh-Hans');
assert(webI18n.includes("    'zh-Hans':{"),'web fallback i18n missing zh-Hans');
assert(i18n.includes('copy[rawLang]||copy[rawLang.split(\'-\')[0]]||copy.en'),'exact locale resolution missing');
assert(js.includes('rel="noopener noreferrer nofollow"'),'external link safety attributes missing');
assert(js.includes("params.get('externalMock')==='1'"),'dev mock must require explicit URL flag');
assert(packProvider.includes("params.get('externalPack')!=='1'"),'query-pack provider must require explicit development flag');
assert(packProvider.includes("tier:10"),'query-pack provider must be a structured tier provider');
assert(packProvider.includes('publishable!==false'),'query-pack provider must reject publishable packs');
assert(pack.schemaVersion===1 && pack.publishable===false,'query-pack fixture safety mismatch');
assert(js.includes('const threshold=6'),'fallback threshold changed unexpectedly');
assert(js.includes('providerTimeoutMs=2500'),'provider timeout guard missing');
assert(js.includes('withTimeout'),'provider timeout implementation missing');
assert(js.includes('providerTier'),'provider tier resolver missing');
assert(js.includes('if(items.length)return items'),'provider tier short-circuit missing');
assert(js.includes("emit('external-provider'"),'provider telemetry hook missing');
assert(js.includes("emit('external-search'"),'search telemetry hook missing');
assert(!/external-search'[^\n]*query\s*:/i.test(js),'raw query must not be emitted in search telemetry');
assert(js.includes('queryLength:q.length'),'privacy-safe query length metric missing');
assert(js.includes('safeUrl'),'external URLs must pass protocol validation');
assert(js.includes('runId'),'stale async result guard missing');

assert(relayConfig.includes('enabled:false'),'relay must be disabled by default');
assert(relayConfig.includes("provider:'cloudflare-workers-free-relay'"),'relay provider id missing');
assert(relayConfig.includes("endpoint:''"),'relay endpoint must be empty in development config');
assert(relayConfig.includes('tier:10'),'relay must remain structured tier 10');
assert(relayProvider.includes("params.get('externalRelayMock')==='1'"),'relay dev activation flag missing');
assert(relayProvider.includes("cfg.provider==='cloudflare-workers-free-relay'"),'relay provider gate missing');
assert(relayProvider.includes("url.protocol!=='https:'"),'live relay must require HTTPS');
assert(relayProvider.includes("credentials:'omit'"),'relay request must omit browser credentials');
assert(relayProvider.includes("cache:'no-store'"),'relay request must not use browser cache');
assert(relayProvider.includes('schemaVersion!==1'),'relay schema validation missing');

assert(webConfig.includes('enabled:false'),'Google research fallback must be disabled by default');
assert(webConfig.includes("cx:''"),'Google research engine id must remain empty');
assert(googlePse.includes("params.get('externalGoogleMock')==='1'"),'Google research fixture activation flag missing');

assert(!/api[_-]?key\s*[:=]\s*['"][^'"]+/i.test(js+i18n+packProvider+relayConfig+relayProvider+webConfig+webI18n+googlePse),'possible API key embedded in frontend');
assert(css.includes('.external-product'),'external card styling missing');
assert(css.includes('.external-filter-panel'),'external filter styling missing');
assert(e2e.includes('zero own results triggers external fallback'),'zero-result E2E missing');
assert(e2e.includes('six own results suppress external fallback'),'threshold E2E missing');
assert(e2e.includes('provider errors and timeouts fail open'),'provider fail-open E2E missing');
assert(e2e.includes('telemetry contains no raw query'),'privacy telemetry E2E missing');
assert(e2e.includes('provider tiers stop after the first tier'),'provider tier E2E missing');
assert(e2e.includes('relay is not requested without explicit development activation'),'relay opt-in E2E missing');
assert(e2e.includes('zero-cost relay feeds normalized product cards'),'relay product E2E missing');
assert(e2e.includes('Google PSE is not requested without explicit dev activation'),'Google research fixture opt-in E2E missing');
assert(e2e.includes('Google PSE research fixture renders only after structured fallback has no results'),'Google research fixture E2E missing');

console.log('external-search-fallback safety checks: OK');
