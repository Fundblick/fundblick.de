'use strict';
const fs = require('node:fs');
const zlib = require('node:zlib');
const crypto = require('node:crypto');
const {canonicalProductDigest} = require('./merchant-artifact-integrity.js');
const outboundPolicy=require('./affiliate-link-policy.js');
const outboundConfig=require('./affiliate-config.js');
const AUDITOR_VERSION = 1;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
// Migration ONLY: the three unchanged pre-gate artifacts on main at 9bffca9.
// These digests are NOT passing link-health evidence. Never extend this list.
const LEGACY = Object.freeze({
  casaMoro: 'ccfffd650092e7820353639157869c9f4ec4d8c0cfd191e71c85fc57d9ad2b4e',
  ahipos: '9ac1ebea3610d37566d64f2b3bcae9cd21c3c937187cfe96cfc4f1f1c610700a',
  anthbot: 'bbf05797765d047791c917955423bffbc4bde49930db30464cfaf8404739d8e1'
});
function readProducts(file) {
  let raw = fs.readFileSync(file);
  if (file.endsWith('.b64')) raw = Buffer.from(raw.toString('utf8').trim(), 'base64');
  if (file.endsWith('.gz') || file.endsWith('.gz.b64')) raw = zlib.gunzipSync(raw);
  const products = JSON.parse(raw.toString('utf8'));
  if (!Array.isArray(products) || !products.length) throw new Error(`Empty/invalid merchant artifact: ${file}`);
  return products;
}
function policyFor(key) {
  const policy = JSON.parse(fs.readFileSync('destination-link-policy.json', 'utf8'));
  const config = policy.merchants?.[key];
  if (policy.version !== 1 || !config || !Array.isArray(config.merchantHosts) || !config.merchantHosts.length || !Array.isArray(config.affiliateHosts) || !Array.isArray(config.redirectHosts)) throw new Error(`Missing destination policy for ${key}`);
  return config;
}
function policyDigest(policy) { return crypto.createHash('sha256').update(JSON.stringify(policy)).digest('hex'); }
function consentTargets(product,offer){
 const network=offer.network||offer.affiliateNetwork||product.source?.network||product.network||outboundConfig.defaultNetwork;
 return [null,'denied','granted'].map(decision=>outboundPolicy.resolve({...offer,network},outboundConfig,decision)).filter(r=>r.allowed&&r.url).map(r=>({mode:r.mode==='direct'?'direct':'affiliate',url:r.url}));
}
function linkTargets(products) {
  const targets = new Map();
  for (const product of products) {
    // Raw artifacts retain every consent route, including secondary offers.
    const offers = Array.isArray(product.offers) && product.offers.length ? product.offers : [product.bestOffer || product];
    const routes = [product, ...offers];
    for (const offer of routes) {
      for (const mode of ['direct', 'affiliate']) {
        const url = String(offer?.[`${mode}Url`] || '');
        if (url) targets.set(`${mode}:${url}`, {mode, url});
      }
      for(const target of consentTargets(product,offer))targets.set(`${target.mode}:${target.url}`,target);
    }
    if (!routes.some(offer => offer?.directUrl)) throw new Error(`Missing direct consent route: ${product.id}`);
    if (!routes.some(offer => offer?.affiliateUrl)) throw new Error(`Missing affiliate consent route: ${product.id}`);
  }
  return [...targets.values()];
}
function allowedUrl(raw, hosts) {
  const url = new URL(raw);
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443') || !hosts.includes(url.hostname.toLowerCase())) throw new Error('invalid-host-or-url');
  return url;
}
function validateReport(report, {key, products, policy = policyFor(key), now = Date.now()}) {
  const fail = reason => { throw new Error(`Destination health ${key}: ${reason}`); };
  if (report?.version !== 1 || report.auditorVersion !== AUDITOR_VERSION || report.merchant !== key || report.scope !== 'full' || report.status !== 'pass') fail('missing full passing report');
  if (report.artifactSha256 !== canonicalProductDigest(products) || report.policySha256 !== policyDigest(policy)) fail('artifact/policy digest mismatch');
  const started = Date.parse(report.startedAt), finished = Date.parse(report.completedAt);
  if (!Number.isFinite(started) || !Number.isFinite(finished) || started > finished || finished > now || now - started > MAX_AGE_MS) fail('stale/future/invalid report timestamps');
  const targets = linkTargets(products);
  if (report.productCount !== products.length || report.results?.length !== targets.length || report.expectedTargets !== targets.length || !targets.length) fail('incomplete coverage');
  const results = new Map();
  for (const result of report.results) {
    if(!result||typeof result!=='object')fail('failed or missing destination');
    const id = `${result.mode}:${result.url}`;
    if (results.has(id)) fail('duplicate result');
    results.set(id, result);
  }
  for (const target of targets) {
    const r = results.get(`${target.mode}:${target.url}`);
    if (!r || r.status !== 'pass' || r.httpStatus !== 200 || !Number.isInteger(r.bodyBytes) || r.bodyBytes <= 0 || !/^[a-f0-9]{64}$/.test(r.bodySha256 || '')) fail('failed or missing destination');
    const checked = Date.parse(r.checkedAt);
    if (!Number.isFinite(checked) || checked < started || checked > finished) fail('invalid result timestamp');
    if (!Array.isArray(r.chain) || !r.chain.length || r.chain.length > 9 || r.chain[0].url !== target.url || r.chain.at(-1).url !== r.finalUrl || r.chain.at(-1).httpStatus !== 200) fail('invalid redirect evidence');
    try {
      allowedUrl(target.url, target.mode === 'direct' ? policy.merchantHosts : policy.affiliateHosts);
      allowedUrl(r.finalUrl, policy.merchantHosts);
      for (let i = 0; i < r.chain.length; i++) {
        allowedUrl(r.chain[i].url, target.mode === 'direct' ? policy.merchantHosts : [...policy.merchantHosts, ...policy.affiliateHosts, ...policy.redirectHosts]);
        if (i < r.chain.length - 1 && ![301,302,303,307,308].includes(r.chain[i].httpStatus)) fail('invalid redirect status');
      }
    } catch { fail('invalid destination host/redirect chain'); }
  }
  for (const product of products) {
    const offers = [product, ...(Array.isArray(product.offers) ? product.offers : [product.bestOffer || product])];
    for (const offer of offers) {
      if (!offer.directUrl || !offer.affiliateUrl) continue;
      const direct = results.get(`direct:${offer.directUrl}`);
      for(const target of [{mode:'affiliate',url:offer.affiliateUrl},...consentTargets(product,offer).filter(t=>t.mode==='affiliate')]){
      const affiliate=results.get(`affiliate:${target.url}`);
      const d = new URL(direct.finalUrl), a = new URL(affiliate.finalUrl);
      // Tracking queries can differ; another product or homepage cannot pass.
      if (d.hostname.replace(/^www\./, '') !== a.hostname.replace(/^www\./, '') || d.pathname.replace(/\/$/, '') !== a.pathname.replace(/\/$/, '')) fail('consent destination mismatch');
      if (d.searchParams.has('variant') && d.searchParams.get('variant') !== a.searchParams.get('variant')) fail('consent variant mismatch');
      }
    }
  }
  return report;
}
function requireHealth(key, products, approval, {allowLegacy = false} = {}) {
  const digest = canonicalProductDigest(products);
  if (approval?.destinationHealthReport) {
    validateReport(JSON.parse(fs.readFileSync(approval.destinationHealthReport, 'utf8')), {key, products});
    return 'audited';
  }
  if (allowLegacy && approval?.approved === true && approval?.quarantined !== true && LEGACY[key] === digest) {
    console.log(`Destination health ${key}: frozen pre-gate artifact (NOT audited)`);
    return 'legacy-frozen';
  }
  throw new Error(`Destination health ${key}: recent full passing report required for artifact ${digest}`);
}
module.exports = {AUDITOR_VERSION, MAX_AGE_MS, readProducts, policyFor, policyDigest, linkTargets, consentTargets, allowedUrl, validateReport, requireHealth};
