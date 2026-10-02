'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),zlib=require('node:zlib'),cp=require('node:child_process');
const artifact=process.argv[2];if(!artifact)throw new Error('Usage: node verify-amazgifts-activation-dry-run.js <artifact.json.gz.b64>');
const approvalsBefore=fs.readFileSync('production-merchant-approvals.json','utf8'),sourcesBefore=fs.readFileSync('production-catalog-sources.json','utf8');
const target='development/amazgifts-products.json.gz.b64',had=fs.existsSync(target),backup=had?fs.readFileSync(target):null;
try{
 fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(artifact,target);
 const out=cp.execFileSync(process.execPath,['activate-amazgifts-production.js'],{env:{...process.env,FUNDBLICK_AMAZGIFTS_DRY_RUN:'1'},encoding:'utf8'});
 const plan=JSON.parse(out);if(!plan.dryRun||plan.products!==2964)throw new Error('dry-run activation plan invalid');
 if(plan.approval?.approved!==true||plan.approval?.termsCleared!==true)throw new Error('dry-run does not model final approval state');
 if(!plan.sources.includes(target))throw new Error('dry-run does not model production source promotion');
 if(fs.readFileSync('production-merchant-approvals.json','utf8')!==approvalsBefore)throw new Error('dry-run mutated approvals');
 if(fs.readFileSync('production-catalog-sources.json','utf8')!==sourcesBefore)throw new Error('dry-run mutated sources');
 console.log('Amazgifts activation dry-run passed without mutating production configuration');
}finally{if(had)fs.writeFileSync(target,backup);else if(fs.existsSync(target))fs.unlinkSync(target);}
