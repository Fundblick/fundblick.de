'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const cp = require('node:child_process');
const path = require('node:path');
const {auditTarget, contentFailure, publicAddress} = require('./audit-destination-links.js');
const {linkTargets, policyDigest, validateReport, requireHealth, readProducts, MAX_AGE_MS} = require('./destination-link-health.js');
const {canonicalProductDigest} = require('./merchant-artifact-integrity.js');
const {productionArtifactFor} = require('./merchant-production-artifact.js');
const policy = {merchantHosts: ['merchant.example'], affiliateHosts: ['affiliate.example'], redirectHosts: []};
const products = [{id: '1', network:'adcell', directUrl: 'https://merchant.example/products/1', affiliateUrl: 'https://affiliate.example/click/1'}];
const html = '<html><title>Product</title><script type="application/ld+json">{"@type":"Product","name":"Real page"}</script></html>';
const response = (status = 200, body = html, headers = {}) => ({status, body: Buffer.from(body), headers: {'content-type': 'text/html', ...headers}});
async function main() {
  const targets = linkTargets(products);
  const awinRoutes=linkTargets([{...products[0],network:'awin'}]);
  assert.equal(awinRoutes.length,4,'raw URLs plus both real Awin consent signals must be audited');
  assert(awinRoutes.some(t=>new URL(t.url).searchParams.get('cons')==='0'));
  assert(awinRoutes.some(t=>new URL(t.url).searchParams.get('cons')==='1'));
  const direct = targets.find(t => t.mode === 'direct'), affiliate = targets.find(t => t.mode === 'affiliate');
  const validDirect = await auditTarget(direct, policy, {request: async () => response()});
  assert.equal(validDirect.status, 'pass');
  const validAffiliate = await auditTarget(affiliate, policy, {offlineFixture:true,request: async u => u.host === 'affiliate.example' ? response(302, '', {location: direct.url}) : response()});
  assert.equal(validAffiliate.status, 'pass'); assert.equal(validAffiliate.chain.length, 2);
  for (const status of [404,410,429,500,503]) {
    const result = await auditTarget(direct, policy, {request: async () => response(status)});
    assert.equal(result.reason, `http-${status}`);
  }
  for (const title of ['404 Not Found', 'Hoppla!', '404 – Hoppla!', 'Seite nicht gefunden', 'Page not found', 'Produkt nicht gefunden']) {
    const result = await auditTarget(direct, policy, {request: async () => response(200, `<title>${title}</title>${html}`)});
    assert.equal(result.reason, 'soft-404');
  }
  assert.equal(contentFailure('<title>Shop</title>', direct.url), 'missing-product-evidence');
  assert.equal(contentFailure('<title>Verify you are human</title>' + html, direct.url), 'bot-challenge');
  assert.equal(contentFailure('<script src="shopify-captcha.js"></script>' + html, direct.url), null, 'Normal storefront captcha assets are not challenge pages');
  assert.equal(contentFailure(html, 'https://merchant.example/password'), 'error-or-login-destination');
  let calls = 0;
  const loop = await auditTarget(direct, policy, {request: async () => { calls++; return response(302, '', {location: direct.url}); }});
  assert.equal(loop.reason, 'redirect-loop'); assert.equal(calls, 1);
  const invalid = await auditTarget(direct, policy, {request: async () => response(302, '', {location: 'https://evil.example/product'})});
  assert.equal(invalid.reason, 'invalid-host-or-url');
  const noRedirect = await auditTarget(affiliate, policy, {request: async () => response()});
  assert.equal(noRedirect.status, 'fail');
  const missingLocation = await auditTarget(direct, policy, {request: async () => response(302)});
  assert.equal(missingLocation.reason, 'redirect-without-location');
  const timeout = await auditTarget(direct, policy, {request: async () => { throw new Error('request-timeout'); }});
  assert.equal(timeout.reason, 'request-timeout');
  for (const address of ['127.0.0.1','10.0.0.1','169.254.169.254','172.16.1.1','192.168.1.1','100.64.1.1','::1','fc00::1','fe80::1','::ffff:127.0.0.1','2001:db8::1']) assert.equal(publicAddress(address), false, address);
  assert.equal(publicAddress('8.8.8.8'), true); assert.equal(publicAddress('2606:4700::1111'), true);
  const now = Date.now();
  const report = {version:1, auditorVersion:1, merchant:'example', artifactSha256:canonicalProductDigest(products), policySha256:policyDigest(policy), productCount:1, expectedTargets:2, scope:'full', status:'pass', startedAt:new Date(now-10000).toISOString(), completedAt:new Date(now).toISOString(), results:[validDirect, validAffiliate]};
  assert.equal(validateReport(report,{key:'example',products,policy,now}), report);
  const awinProducts=[{...products[0],network:'awin'}];
  const awinResults=[];
  for(const target of awinRoutes)awinResults.push(await auditTarget(target,policy,{offlineFixture:true,request:async u=>u.host==='affiliate.example'?response(302,'',{location:direct.url}):response()}));
  const runtimeNow=Date.now();
  const awinReport={...report,artifactSha256:canonicalProductDigest(awinProducts),expectedTargets:4,results:awinResults,completedAt:new Date(runtimeNow).toISOString()};
  validateReport(awinReport,{key:'example',products:awinProducts,policy,now:runtimeNow});
  assert.throws(()=>validateReport({...awinReport,results:awinResults.filter(r=>!r.url.includes('cons=0'))},{key:'example',products:awinProducts,policy,now:runtimeNow}),/coverage/,'omitting the actual denied-consent route must block activation');
  const deniedResult=awinResults.find(r=>r.url.includes('cons=0'));
  const wrongDenied={...deniedResult,finalUrl:'https://merchant.example/products/other',chain:[deniedResult.chain[0],{url:'https://merchant.example/products/other',httpStatus:200}]};
  assert.throws(()=>validateReport({...awinReport,results:awinResults.map(r=>r===deniedResult?wrongDenied:r)},{key:'example',products:awinProducts,policy,now:runtimeNow}),/consent destination mismatch/,'denied consent cannot silently resolve to another product');
  const reject = (patch, pattern) => assert.throws(() => validateReport({...report,...patch},{key:'example',products,policy,now}),pattern);
  reject({artifactSha256:'0'.repeat(64)},/digest mismatch/);
  reject({policySha256:'0'.repeat(64)},/digest mismatch/);
  reject({merchant:'other'},/passing report/);
  reject({startedAt:new Date(now-MAX_AGE_MS-1).toISOString()},/stale/);
  reject({completedAt:new Date(now+1).toISOString()},/future/);
  reject({results:[validDirect]},/coverage/);
  reject({results:[validDirect,validDirect]},/duplicate/);
  reject({scope:'sample'},/passing report/);
  reject({results:[{...validDirect,status:'fail'},validAffiliate]},/failed/);
  reject({results:[null,validAffiliate]},/failed or missing destination/);
  reject({results:[{...validDirect,finalUrl:'https://evil.example/'},validAffiliate]},/redirect evidence/);
  reject({results:[{...validDirect,bodySha256:null},validAffiliate]},/failed/);
  const other = {...validAffiliate, finalUrl:'https://merchant.example/products/other', chain:[validAffiliate.chain[0],{url:'https://merchant.example/products/other',httpStatus:200}]};
  reject({results:[validDirect,other]},/consent destination mismatch/);
  assert.throws(() => requireHealth('amazgifts', products, {approved:true}, {allowLegacy:true}), /passing report required/);
  const casa = readProducts('development/core-products.json');
  assert.equal(requireHealth('casaMoro', casa, {approved:true}, {allowLegacy:true}), 'legacy-frozen');
  assert.throws(() => requireHealth('casaMoro', [{...casa[0],name:'changed'},...casa.slice(1)], {approved:true}, {allowLegacy:true}), /passing report required/);
  assert.throws(() => requireHealth('casaMoro', casa, {approved:true,quarantined:true}, {allowLegacy:true}), /passing report required/);
  // Exercise the actual quarantined artifact and activator. No synthetic health
  // fixture is ever written into production approvals or used to promote it.
  const before = ['production-merchant-approvals.json','production-catalog-sources.json'].map(f => fs.readFileSync(f,'utf8'));
  fs.mkdirSync('build', {recursive:true});
  const fixture = fs.mkdtempSync(path.resolve('build','destination-test-'));
  try {
    fs.mkdirSync(path.join(fixture,'development'));
    const source=productionArtifactFor('amazgifts').source;
    fs.copyFileSync(source,path.join(fixture,source));
    fs.copyFileSync('production-merchant-artifacts.json',path.join(fixture,'production-merchant-artifacts.json'));
    const approvals = JSON.parse(before[0]); delete approvals.merchants.amazgifts.destinationHealthReport;
    fs.writeFileSync(path.join(fixture,'production-merchant-approvals.json'),JSON.stringify(approvals));
    for (const envPatch of [{FUNDBLICK_AMAZGIFTS_DRY_RUN:'1'},{FUNDBLICK_AMAZGIFTS_DRY_RUN:'0',FUNDBLICK_CONFIRM_AMAZGIFTS_ACTIVATION:'YES'}]) {
      const run = cp.spawnSync(process.execPath,[path.resolve('activate-amazgifts-production.js')],{cwd:fixture,encoding:'utf8',env:{...process.env,...envPatch}});
      assert.ifError(run.error); assert.notEqual(run.status,0); assert.match(run.stderr,/Destination health amazgifts: recent full passing report required/);
    }
    before.forEach((text,i) => assert.equal(fs.readFileSync(['production-merchant-approvals.json','production-catalog-sources.json'][i],'utf8'),text));
  } finally {
    assert(path.resolve(fixture).startsWith(path.resolve('build') + path.sep));
    fs.rmSync(fixture,{recursive:true,force:true});
  }
  console.log('Destination link health tests passed: HTTP/redirect/soft-404/consent coverage/freshness/digest/quarantine/activation rejection');
}
main().catch(err => {console.error(err);process.exitCode=1;});
