'use strict';
const https = require('node:https');
const dns = require('node:dns').promises;
const net = require('node:net');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {canonicalProductDigest} = require('./merchant-artifact-integrity.js');
const {AUDITOR_VERSION, readProducts, policyFor, policyDigest, linkTargets, allowedUrl, validateReport} = require('./destination-link-health.js');
const MAX_BYTES = 4 * 1024 * 1024;
function publicAddress(address) {
  if (net.isIP(address) === 4) {
    const [a,b] = address.split('.').map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && [0,168].includes(b)) || (a === 198 && [18,19,51].includes(b)) || (a === 203 && b === 0));
  }
  // Accept global unicast only; mapped IPv4, loopback, ULA/link-local rejected.
  return net.isIP(address) === 6 && /^[23]/i.test(address) && !/^2001:(?:0:|db8:)/i.test(address);
}
async function realRequest(url) {
  if(['awin1.com','www.awin1.com'].includes(url.hostname))throw Error('real-tracking-requests-disabled');
  if(process.env.HTTPS_PROXY||process.env.https_proxy){
    const {promisify}=require('node:util'),execFile=promisify(require('node:child_process').execFile);
    const {stdout}=await execFile('python3',[path.join(__dirname,'destination-proxy-request.py'),url.href],{cwd:__dirname,timeout:20000,maxBuffer:6*1024*1024});
    const response=JSON.parse(stdout);response.body=Buffer.from(response.body,'base64');return response;
  }
  const addresses = await dns.lookup(url.hostname, {all: true});
  if (!addresses.length || addresses.some(a => !publicAddress(a.address))) throw new Error('non-public-address');
  const pinned = addresses[0];
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {'User-Agent': 'FundBlick-Destination-Audit/1.0', Accept: 'text/html', 'Accept-Encoding': 'identity'},
      lookup: (_host, options, cb) => options?.all ? cb(null, [pinned]) : cb(null, pinned.address, pinned.family)
    }, res => {
      const chunks = []; let size = 0;
      res.on('data', chunk => { size += chunk.length; if (size > MAX_BYTES) res.destroy(new Error('response-too-large')); else chunks.push(chunk); });
      res.on('error', reject);
      res.on('end', () => resolve({status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks)}));
    });
    const timer = setTimeout(() => req.destroy(new Error('request-timeout')), 15000);
    req.on('close', () => clearTimeout(timer)); req.on('error', reject);
  });
}
function contentFailure(html, finalUrl) {
  const url = new URL(finalUrl);
  if (/\/(?:404|not-found|page-not-found|password|login)(?:\/|$)/i.test(url.pathname)) return 'error-or-login-destination';
  const headings = [...html.matchAll(/<(?:title|h1)\b[^>]*>([\s\S]*?)<\/(?:title|h1)>/gi)].map(m => m[1].replace(/<[^>]+>/g, ' ')).join(' ');
  if (/\b404\b|\bhoppla\b|page\s+(?:not\s+found|unavailable)|seite\s+(?:nicht\s+gefunden|existiert\s+nicht)|nicht\s+gefunden|pagina\s+non\s+trovata|страница\s+не\s+найдена|produkt\s+nicht\s+gefunden/i.test(headings)) return 'soft-404';
  if (/captcha|checking your browser|verify you are human|just a moment/i.test(headings)) return 'bot-challenge';
  // HTTP 200 alone is insufficient: require actual product-page evidence.
  if (!/"@type"\s*:\s*(?:"Product"|\[[^\]]*"Product")|itemtype\s*=\s*["'][^"']*schema\.org\/Product|property\s*=\s*["']og:type["'][^>]*content\s*=\s*["']product/i.test(html)) return /cf-chl-|challenge-platform/i.test(html) ? 'bot-challenge' : 'missing-product-evidence';
  return null;
}
async function auditTarget(target, policy, {request = realRequest, offlineFixture = false} = {}) {
  const chain = []; const visited = new Set(); let current = target.url;
  try {
    if(target.mode==='affiliate'&&(!offlineFixture||request===realRequest))throw new Error('real-tracking-requests-disabled');
    allowedUrl(current, target.mode === 'direct' ? policy.merchantHosts : policy.affiliateHosts);
    for (let hop = 0; hop <= 8; hop++) {
      const allowed = target.mode === 'direct' ? policy.merchantHosts : [...policy.merchantHosts, ...policy.affiliateHosts, ...policy.redirectHosts];
      const url = allowedUrl(current, allowed);
      if (visited.has(current)) throw new Error('redirect-loop');
      visited.add(current);
      const response = await request(url);
      chain.push({url: current, httpStatus: response.status});
      if ([301,302,303,307,308].includes(response.status)) {
        if (!response.headers.location) throw new Error('redirect-without-location');
        current = new URL(response.headers.location, current).href; continue;
      }
      if (response.status !== 200) throw new Error(`http-${response.status}`);
      allowedUrl(current, policy.merchantHosts);
      if (!/text\/html|application\/xhtml\+xml/i.test(response.headers['content-type'] || '')) throw new Error('non-html-destination');
      const failure = contentFailure(response.body.toString('utf8'), current);
      if (failure) throw new Error(failure);
      if (!response.body.length) throw new Error('empty-destination');
      return {...target, status: 'pass', checkedAt: new Date().toISOString(), httpStatus: 200, finalUrl: current, chain, bodyBytes: response.body.length, bodySha256: crypto.createHash('sha256').update(response.body).digest('hex')};
    }
    throw new Error('too-many-redirects');
  } catch (err) {
    return {...target, status: 'fail', checkedAt: new Date().toISOString(), reason: err.code || err.message, finalUrl: current, chain};
  }
}
async function main() {
 const [key,output,...sources]=process.argv.slice(2);
 if(!key||!output||!sources.length)throw Error('Usage: node audit-destination-links.js <merchant> <report> <source...>');
 if(process.env.FUNDBLICK_LINK_AUDIT_LIMIT)throw Error('Partial audits cannot satisfy full coverage');
 await require('./audit-merchant-preview-links.js').run(key,output,sources);
}
if (require.main === module) main().catch(err => { console.error(err.message); process.exitCode = 1; });
module.exports = {auditTarget, contentFailure, publicAddress, realRequest};
