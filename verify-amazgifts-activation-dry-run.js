'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),zlib=require('node:zlib'),cp=require('node:child_process');
const artifact=process.argv[2];if(!artifact)throw new Error('Usage: node verify-amazgifts-activation-dry-run.js <artifact.json.gz.b64>');
const approvalsBefore=fs.readFileSync('production-merchant-approvals.json','utf8'),sourcesBefore=fs.readFileSync('production-catalog-sources.json','utf8');
const contract=require('./merchant-production-artifact.js').productionArtifactFor('amazgifts');
const candidateProducts=require('./destination-link-health.js').readProducts(artifact);
const candidateMatchesContract=require('./merchant-artifact-integrity.js').canonicalProductDigest(candidateProducts)===contract.artifactSha256;
const target=contract.source,had=fs.existsSync(target),backup=had?fs.readFileSync(target):null;
try{
 fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(artifact,target);
 const run=cp.spawnSync(process.execPath,['activate-amazgifts-production.js'],{env:{...process.env,FUNDBLICK_AMAZGIFTS_DRY_RUN:'1'},encoding:'utf8'});
 if(run.error)throw run.error;
 if(!candidateMatchesContract){
   if(run.status===0||!/production artifact (count|digest) mismatch/.test(run.stderr||''))throw new Error('Non-whitelisted artifact must be rejected: '+run.stderr);
   if(fs.readFileSync('production-merchant-approvals.json','utf8')!==approvalsBefore||fs.readFileSync('production-catalog-sources.json','utf8')!==sourcesBefore)throw new Error('Rejected candidate mutated production configuration');
   console.log('Amazgifts original/unreviewed candidate correctly rejected by pinned cleaned artifact contract');
 }else if(!JSON.parse(approvalsBefore).merchants.amazgifts.destinationHealthReport){
   if(run.status===0||!/Destination health amazgifts: recent full passing report required/.test(run.stderr||''))throw new Error('Dry-run must reject missing real destination evidence: '+run.stderr);
   if(fs.readFileSync('production-merchant-approvals.json','utf8')!==approvalsBefore||fs.readFileSync('production-catalog-sources.json','utf8')!==sourcesBefore)throw new Error('Rejected dry-run mutated production configuration');
   console.log('Amazgifts dry-run correctly blocked: no real destination health report');
   process.exitCode=0;
 }else{
 if(run.status!==0)throw new Error(run.stderr||'Dry-run failed');
 const out=run.stdout;
 const plan=JSON.parse(out);if(!plan.dryRun||plan.products!==contract.productCount)throw new Error('dry-run activation plan invalid');
 if(plan.approval?.approved!==true||plan.approval?.termsCleared!==true)throw new Error('dry-run does not model final approval state');
 if(!plan.sources.includes(target))throw new Error('dry-run does not model production source promotion');
 if(fs.readFileSync('production-merchant-approvals.json','utf8')!==approvalsBefore)throw new Error('dry-run mutated approvals');
 if(fs.readFileSync('production-catalog-sources.json','utf8')!==sourcesBefore)throw new Error('dry-run mutated sources');
 console.log('Amazgifts activation dry-run passed without mutating production configuration');
 }
}finally{if(had)fs.writeFileSync(target,backup);else if(fs.existsSync(target))fs.unlinkSync(target);}
