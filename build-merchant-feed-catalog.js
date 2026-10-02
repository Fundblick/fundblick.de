'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {getMerchant,assertInput}=require('./merchant-feed-registry.js');

const [merchantKey,input,outputArg]=process.argv.slice(2);
if(!merchantKey||!input)throw new Error('Usage: node build-merchant-feed-catalog.js <merchant-key> <feed.csv[.gz]> [output-dir]');
const config=getMerchant(merchantKey);
assertInput(config,input);
const outputRoot=outputArg||path.join('build',`${config.key}-catalog`);
const expected=config.expected||{};
if(expected.rawFeedSha256){
  const rawFeedDigest=crypto.createHash('sha256').update(fs.readFileSync(input)).digest('hex');
  if(rawFeedDigest!==expected.rawFeedSha256)throw new Error(`${config.merchant} raw feed digest mismatch: expected ${expected.rawFeedSha256}, got ${rawFeedDigest}`);
}
const normalizer=require(config.normalizer);
const source=normalizer.readCsv(input);
const selection=normalizer.selectRows(source);
const extras=normalizer.normalize(source);
const errors=normalizer.validate(extras);
if(errors.length)throw new Error(`${config.merchant} source rejected:\n- ${errors.join('\n- ')}`);
if(Number.isInteger(expected.advertiserRows)&&selection.advertiser.length!==expected.advertiserRows)throw new Error(`${config.merchant} feed contract changed: expected ${expected.advertiserRows} advertiser rows, got ${selection.advertiser.length}`);
if(Number.isInteger(expected.products)&&extras.length!==expected.products)throw new Error(`${config.merchant} merchandise contract changed: expected ${expected.products} products, got ${extras.length}`);
if(Number.isInteger(expected.inStock)&&extras.filter(p=>p.inStock).length!==expected.inStock)throw new Error(`${config.merchant} stock contract changed: expected ${expected.inStock} in-stock products, got ${extras.filter(p=>p.inStock).length}`);
if(extras.some(p=>p.testData!==false||p.source?.network!==config.network||p.source?.advertiserId!==config.advertiserId))throw new Error(`${config.merchant} provenance contract broken`);
if(extras.some(p=>!config.catalogCategories.includes(p.category)))throw new Error(`${config.merchant} emitted an unregistered catalog category`);

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
process.argv[2]=outputRoot;
require('./build-live-catalog.js');
