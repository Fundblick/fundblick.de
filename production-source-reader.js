'use strict';
const fs=require('node:fs');
const zlib=require('node:zlib');

function readProductionSource(file){
  let raw=fs.readFileSync(file);
  const name=String(file);
  if(name.endsWith('.b64'))raw=Buffer.from(raw.toString('utf8').trim(),'base64');
  if(name.endsWith('.gz')||name.endsWith('.gz.b64'))raw=zlib.gunzipSync(raw);
  const data=JSON.parse(raw.toString('utf8'));
  if(!Array.isArray(data))throw new Error(`${file} must contain an array`);
  return data;
}

function readProductionSources(manifestFile='production-catalog-sources.json'){
  const sources=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
  if(!Array.isArray(sources)||!sources.length)throw new Error(`${manifestFile} must contain at least one source file`);
  return sources.flatMap(readProductionSource);
}

module.exports={readProductionSource,readProductionSources};
