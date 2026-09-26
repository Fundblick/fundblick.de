'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const config=require('./affiliate-config.js');
const consent=require('./affiliate-consent.js');

const privacy=fs.readFileSync('datenschutz.html','utf8');
const links=fs.readFileSync('language-links.js','utf8');
const css=fs.readFileSync('affiliate-consent.css','utf8');

assert.equal(config.network,'MULTI');
assert.equal(config.mode,'prepared');
assert.equal(config.adcell.vendorId,766,'ADCELL IAB Vendor ID must stay explicit');
assert.equal(config.awin.vendorId,907,'Awin IAB Vendor ID must stay explicit');
for(const [name,provider] of Object.entries({adcell:config.adcell,awin:config.awin})){
  assert.equal(provider.enabled,false,`${name} must remain disabled until real activation`);
  assert.equal(provider.outboundEnabled,false,`${name} outbound must remain disabled until real activation`);
  assert.equal(provider.trackingEnabled,false,`${name} tracking must remain disabled until real activation`);
  assert.equal(provider.liveDisclosure,false,`${name} live disclosure must not claim active tracking while disabled`);
}
assert.equal(consent.canTrack(config,'granted'),false,'consent alone must never enable disabled affiliate tracking');
assert.equal(consent.canTrack({adcell:{enabled:true,trackingEnabled:true},awin:{enabled:false,trackingEnabled:false}},'denied'),false,'denial must block tracking');
assert.equal(consent.canTrack({adcell:{enabled:true,trackingEnabled:true},awin:{enabled:false,trackingEnabled:false}},'granted','adcell'),true,'enabled ADCELL tracking may only pass after consent');
assert.equal(consent.canTrack({adcell:{enabled:false,trackingEnabled:false},awin:{enabled:true,trackingEnabled:true}},'granted','awin'),true,'enabled Awin tracking may only pass after consent');
assert.ok(Object.keys(consent.COPY).length>=20,'consent copy must cover FundBlick languages');
assert.ok(privacy.includes('id="affiliate-networks"'),'generic affiliate privacy section missing');
assert.ok(privacy.includes('id="affiliate-adcell"'),'ADCELL privacy section missing');
assert.ok(privacy.includes('data-adcell-live-disclosure="false"'),'inactive ADCELL legal disclosure marker missing');
assert.ok(privacy.includes('IAB Vendor ID 766'),'ADCELL vendor disclosure missing');
assert.ok(privacy.includes('https://www.adcell.de/datenschutz'),'ADCELL privacy reference missing');
assert.ok(privacy.includes('id="affiliate-awin"'),'Awin privacy section missing');
assert.ok(privacy.includes('data-awin-live-disclosure="false"'),'inactive Awin legal disclosure marker missing');
assert.ok(privacy.includes('Vendor ID 907'),'Awin vendor disclosure missing');
assert.ok(privacy.includes('AWIN AG'),'Awin controller identity missing');
assert.ok(privacy.includes('https://www.awin.com/de/datenschutzerklarung'),'Awin privacy reference missing');
assert.ok(privacy.includes('Awin ist derzeit technisch deaktiviert.'),'inactive Awin status text missing');
assert.ok(links.includes('affiliate-config.js'),'site-wide affiliate config bootstrap missing');
assert.ok(links.includes('affiliate-consent.js'),'site-wide consent bootstrap missing');
assert.ok(links.includes('affiliate-consent.css'),'site-wide consent styling bootstrap missing');
assert.ok(css.includes('@media(max-width:650px)'),'mobile consent layout missing');
assert.ok(!links.includes('www.adcell.de/js'),'readiness layer must not auto-load ADCELL tracking code');
assert.ok(!links.includes('www.dwin1.com'),'readiness layer must not auto-load Awin tracking code');
assert.ok(!links.includes('www.awin1.com'),'readiness layer must not auto-load Awin tracking code');

if(config.adcell.enabled||config.adcell.trackingEnabled){
  assert.equal(config.adcell.liveDisclosure,true,'active ADCELL requires liveDisclosure=true');
  assert.ok(privacy.includes('data-adcell-live-disclosure="true"'),'active ADCELL requires active privacy disclosure marker');
}
if(config.awin.enabled||config.awin.trackingEnabled){
  assert.equal(config.awin.liveDisclosure,true,'active Awin requires liveDisclosure=true');
  assert.ok(privacy.includes('data-awin-live-disclosure="true"'),'active Awin requires active privacy disclosure marker');
}
console.log('multi-network affiliate readiness verification passed');
