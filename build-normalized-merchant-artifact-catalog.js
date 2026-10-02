'use strict';
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');
const crypto=require('node:crypto');
const {getMerchant}=require('./merchant-feed-registry.js');

const [merchantKey,input,outputArg]=process.argv.slice(2);
if(!merchantKey||!input)throw new Error('Usage: node build-normalized-merchant-artifact-catalog.js <merchant-key> <products.json.gz.b64> [output-dir]');
const config=getMerchant(merchantKey);
const artifact=path.resolve(input);
if(!fs.existsSync(artifact))throw new Error('Normalized merchant artifact not found: '+input);
const packed=fs.readFileSync(artifact,'utf8').replace(/\s+/g,'');
const raw=zlib.gunzipSync(Buffer.from(packed,'base64'));
const extras=JSON.parse(raw.toString('utf8'));
if(!Array.isArray(extras))throw new Error('Normalized merchant artifact must contain an array');
const expected=config.expected||{};
if(Number.isInteger(expected.products)&&extras.length!==expected.products)throw new Error(`${config.merchant} artifact contract changed: expected ${expected.products} products, got ${extras.length}`);
const canonical=Buffer.from(JSON.stringify(extras),'utf8');
const digest=crypto.createHash('sha256').update(canonical).digest('hex');
if(expected.artifactSha256&&digest!==expected.artifactSha256)throw new Error(`${config.merchant} artifact digest mismatch: expected ${expected.artifactSha256}, got ${digest}`);
if(extras.some(p=>p.testData!==false||p.source?.network!==config.network||p.source?.advertiserId!==config.advertiserId))throw new Error(`${config.merchant} artifact provenance contract broken`);
if(extras.some(p=>!config.catalogCategories.includes(p.category)))throw new Error(`${config.merchant} artifact contains an unregistered catalog category`);
if(new Set(extras.map(p=>p.id)).size!==extras.length)throw new Error(`${config.merchant} artifact contains duplicate product ids`);
const outputRoot=outputArg||path.join('build',`${config.key}-artifact-catalog`);
const coreFile=path.normalize(path.join('development','core-products.json'));
const originalRead=fs.readFileSync.bind(fs);
fs.readFileSync=function(file,...args){
  if(path.normalize(String(file))===coreFile){
    const core=fs.existsSync(coreFile)?JSON.parse(originalRead(file,'utf8')):[];
    if(!Array.isArray(core))throw new Error(`${coreFile} must contain an array`);
    return JSON.stringify([...core,...extras]);
  }
  return originalRead(file,...args);
};
console.log(`Normalized artifact accepted: merchant=${config.key}, products=${extras.length}, canonicalSha256=${digest}`);
process.argv[2]=outputRoot;
require('./build-live-catalog.js');
