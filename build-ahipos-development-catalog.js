'use strict';
const fs=require('node:fs');
const path=require('node:path');

const outputRoot=process.argv[2]||path.join('build','ahipos-catalog');
const coreFile=path.normalize(path.join('development','core-products.json'));
const extraFiles=[path.join('development','ahipos-products-1.json'),path.join('development','ahipos-products-2.json')];
const originalRead=fs.readFileSync.bind(fs);
const extras=extraFiles.flatMap(file=>{
  const data=JSON.parse(originalRead(file,'utf8'));
  if(!Array.isArray(data))throw new Error(`${file} must contain an array`);
  return data;
});
if(extras.length!==31)throw new Error(`AHIPOS source contract broken: expected 31 variants, got ${extras.length}`);

fs.readFileSync=function(file,...args){
  if(path.normalize(String(file))===coreFile){
    const raw=originalRead(file,'utf8');
    const core=JSON.parse(raw);
    if(!Array.isArray(core))throw new Error(`${coreFile} must contain an array`);
    return JSON.stringify([...core,...extras]);
  }
  return originalRead(file,...args);
};
process.argv[2]=outputRoot;
require('./build-live-catalog.js');
