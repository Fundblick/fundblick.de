'use strict';
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');

const root=__dirname;
const sourcePath=path.join(root,'development','core-products.json');
const original=fs.readFileSync(sourcePath,'utf8');
const products=JSON.parse(original);
if(!Array.isArray(products)||!products.length)throw new Error('core-products.json must contain products');

const sentinel={
  internalFeedPath:'SECRET_SENTINEL_FEED_PATH',
  internalCommission:99.99,
  internalDebug:{token:'SECRET_SENTINEL_TOKEN'},
  rawPayload:'SECRET_SENTINEL_RAW_PAYLOAD'
};
const injected=products.map((product,index)=>index===0?{...product,...sentinel}:product);
const out=fs.mkdtempSync(path.join(os.tmpdir(),'fundblick-public-boundary-'));

try{
  fs.writeFileSync(sourcePath,JSON.stringify(injected));
  const run=spawnSync(process.execPath,[path.join(root,'build-live-catalog.js'),out],{cwd:root,encoding:'utf8'});
  if(run.status!==0)throw new Error(`catalog build failed:\n${run.stdout}\n${run.stderr}`);

  const manifest=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));
  const publicFiles=[manifest.homeDealFile,...Object.values(manifest.shards||{}).map(entry=>entry.file)].filter(Boolean);
  const forbidden=['internalFeedPath','internalCommission','internalDebug','rawPayload','SECRET_SENTINEL_FEED_PATH','SECRET_SENTINEL_TOKEN','SECRET_SENTINEL_RAW_PAYLOAD'];
  for(const file of publicFiles){
    const text=fs.readFileSync(path.join(out,file),'utf8');
    for(const marker of forbidden){
      if(text.includes(marker))throw new Error(`public catalog boundary leak: ${marker} found in ${file}`);
    }
  }
  console.log(`public catalog boundary gate passed: ${publicFiles.length} public files checked`);
} finally {
  fs.writeFileSync(sourcePath,original);
  fs.rmSync(out,{recursive:true,force:true});
}
