'use strict';
const fs=require('node:fs'),path=require('node:path');
const {auditStructure,structureContext}=require('./affiliate-structure-audit.js');
const {auditTarget}=require('./audit-destination-links.js');
const {AUDITOR_VERSION,MAX_AGE_MS,readProducts,policyFor,policyDigest,linkTargets,validateReport}=require('./destination-link-health.js');
const {canonicalProductDigest}=require('./merchant-artifact-integrity.js');
function checkpoint(report,expected,targets,now=Date.now()){
 if(report.status!=='incomplete'||report.scope!=='full'||!Array.isArray(report.results))throw Error('Only an incomplete full audit can be resumed');
 for(const key of ['version','auditorVersion','merchant','artifactSha256','policySha256','productCount','expectedTargets'])if(report[key]!==expected[key])throw Error('Checkpoint contract mismatch: '+key);
 const started=Date.parse(report.startedAt);if(!Number.isFinite(started)||started>now||now-started>MAX_AGE_MS)throw Error('Invalid/stale checkpoint');
 if(expected.version===2&&(report.trackingRequests!==0||report.trackingRequestBudget!==0))throw Error('Checkpoint tracking budget must stay zero');
 const allowed=new Set(targets.map(t=>t.mode+':'+t.url)),seen=new Set();
 for(const r of report.results){const key=r.mode+':'+r.url;if(!allowed.has(key)||seen.has(key)||!['pass','fail'].includes(r.status))throw Error('Invalid checkpoint target');seen.add(key);const checked=Date.parse(r.checkedAt);if(!Number.isFinite(checked)||checked<started||checked>now)throw Error('Invalid checkpoint result time');}
 return report;
}
async function run(key,output,sources){
 const products=sources.flatMap(readProducts),policy=policyFor(key),targets=linkTargets(products),context=structureContext({key,products,policy});
 const expected={version:2,auditorVersion:2,merchant:key,artifactSha256:canonicalProductDigest(products),policySha256:policyDigest(policy),productCount:products.length,expectedTargets:targets.length,scope:'full',trackingRequests:0,trackingRequestBudget:0};
 let report=fs.existsSync(output)?checkpoint(JSON.parse(fs.readFileSync(output,'utf8')),expected,targets):{...expected,startedAt:new Date().toISOString(),results:[],status:'incomplete'};
 const results=new Map(report.results.map(r=>[r.mode+':'+r.url,r])),pending=targets.filter(t=>!results.has(t.mode+':'+t.url));
 report.execution={scheduler:'direct-http-offline-affiliate-v2',concurrency:6,minTargetStartMs:1000,resumedTargets:results.size};
 // Direct routes receive real HTTP evidence; tracking routes receive offline structural evidence.
 // Space target starts globally, retain failures, and keep the original audit start.
 let next=0,turn=Promise.resolve();
 const reserve=()=>{const wait=turn;turn=wait.then(()=>new Promise(resolve=>setTimeout(resolve,1000)));return wait;};
 fs.mkdirSync(path.dirname(output),{recursive:true});
 const save=()=>{report.results=targets.map(t=>results.get(t.mode+':'+t.url)).filter(Boolean);fs.writeFileSync(output,JSON.stringify(report)+'\n');};
 const worker=async()=>{while(next<pending.length){const target=pending[next++];if(target.mode==='direct')await reserve();const r=target.mode==='affiliate'?auditStructure(target,context):await auditTarget(target,policy);results.set(target.mode+':'+target.url,r);save();console.log(results.size+'/'+targets.length+' '+target.mode+': '+(r.reason||'pass'));}};
 await Promise.all(Array.from({length:6},()=>worker()));
 report.completedAt=new Date().toISOString();report.failedTargets=[...results.values()].filter(r=>r.status!=='pass').length;report.status=report.failedTargets?'fail':'pass';save();
 if(report.status==='pass'){try{validateReport(report,{key,products,policy});}catch(error){report.status='fail';report.reason=error.message;save();throw error;}}
 console.log('Full preview destination audit: '+report.status+', '+report.failedTargets+' failed');
 if(report.status!=='pass')process.exitCode=1;
 return report;
}
if(require.main===module){const [key,output,...sources]=process.argv.slice(2);if(!key||!output||!sources.length)throw Error('Usage: node audit-merchant-preview-links.js <merchant> <report> <source...>');run(key,output,sources).catch(e=>{console.error(e);process.exitCode=1;});}
module.exports={checkpoint,run};
