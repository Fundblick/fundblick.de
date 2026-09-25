'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const config=require('./affiliate-config.js');
const consent=require('./affiliate-consent.js');

const privacy=fs.readFileSync('datenschutz.html','utf8');
const links=fs.readFileSync('language-links.js','utf8');
const css=fs.readFileSync('affiliate-consent.css','utf8');

assert.equal(config.network,'ADCELL');
assert.equal(config.adcell.vendorId,766,'ADCELL IAB Vendor ID must stay explicit');
assert.equal(config.adcell.enabled,false,'ADCELL must remain disabled until real activation');
assert.equal(config.adcell.trackingEnabled,false,'ADCELL tracking must remain disabled until real activation');
assert.equal(config.adcell.liveDisclosure,false,'live disclosure must not claim active tracking while disabled');
assert.equal(consent.canTrack(config,'granted'),false,'consent alone must never enable disabled ADCELL tracking');
assert.equal(consent.canTrack({adcell:{enabled:true,trackingEnabled:true}},'denied'),false,'denial must block tracking');
assert.equal(consent.canTrack({adcell:{enabled:true,trackingEnabled:true}},'granted'),true,'tracking may only pass after explicit consent');
assert.ok(Object.keys(consent.COPY).length>=20,'consent copy must cover FundBlick languages');
assert.ok(privacy.includes('id="affiliate-adcell"'),'ADCELL privacy section missing');
assert.ok(privacy.includes('data-adcell-live-disclosure="false"'),'inactive legal disclosure marker missing');
assert.ok(privacy.includes('IAB Vendor ID 766'),'vendor disclosure missing');
assert.ok(privacy.includes('https://www.adcell.de/datenschutz'),'ADCELL privacy/opt-out reference missing');
assert.ok(privacy.includes('ADCELL ist derzeit technisch deaktiviert.'),'inactive status text missing');
assert.ok(links.includes('affiliate-config.js'),'site-wide ADCELL config bootstrap missing');
assert.ok(links.includes('affiliate-consent.js'),'site-wide consent bootstrap missing');
assert.ok(links.includes('affiliate-consent.css'),'site-wide consent styling bootstrap missing');
assert.ok(css.includes('@media(max-width:650px)'),'mobile consent layout missing');
assert.ok(!links.includes('www.adcell.de/js'),'readiness layer must not auto-load ADCELL tracking code');

if(config.adcell.enabled||config.adcell.trackingEnabled){
  assert.equal(config.adcell.liveDisclosure,true,'active ADCELL requires liveDisclosure=true');
  assert.ok(privacy.includes('data-adcell-live-disclosure="true"'),'active ADCELL requires active privacy disclosure marker');
}
console.log('ADCELL readiness verification passed');
