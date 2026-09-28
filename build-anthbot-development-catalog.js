'use strict';
const fs=require('node:fs');
const path=require('node:path');
const normalizer=require('./anthbot-feed-normalizer.js');

const input=process.argv[2];
const outputRoot=process.argv[3]||path.join('build','anthbot-catalog');
if(!input)throw new Error('Usage: node build-anthbot-development-catalog.js <125144-retail-de_DE.csv[.gz]> [output-dir]');
const coreFile=path.normalize(path.join('development','core-products.json'));
const source=normalizer.readCsv(input);
const selection=normalizer.selectRows(source);
const extras=normalizer.normalize(source);
const errors=normalizer.validate(extras);
if(errors.length)throw new Error(`ANTHBOT source rejected:\n- ${errors.join('\n- ')}`);
if(selection.advertiser.length!==161)throw new Error(`ANTHBOT feed contract changed: expected 161 advertiser rows, got ${selection.advertiser.length}`);
if(extras.length!==56)throw new Error(`ANTHBOT merchandise contract changed: expected 56 physical products, got ${extras.length}`);
if(extras.filter(p=>p.inStock).length!==36)throw new Error('ANTHBOT stock contract changed: expected 36 in-stock products');
if(extras.some(p=>p.testData!==false||p.source?.network!=='awin'||p.source?.advertiserId!=='125144'))throw new Error('ANTHBOT provenance contract broken');
const originalRead=fs.readFileSync.bind(fs);
fs.readFileSync=function(file,...args){
  if(path.normalize(String(file))===coreFile){
    const core=JSON.parse(originalRead(file,'utf8'));
    if(!Array.isArray(core))throw new Error(`${coreFile} must contain an array`);
    return JSON.stringify([...core,...extras]);
  }
  return originalRead(file,...args);
};
process.argv[2]=outputRoot;
require('./build-live-catalog.js');
