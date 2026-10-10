'use strict';
const assert=require('node:assert/strict');
const {auditTarget}=require('./audit-destination-links.js');
const {auditStructure}=require('./affiliate-structure-audit.js');
const {validateReport,linkTargets,policyDigest}=require('./destination-link-health.js');
const {canonicalProductDigest}=require('./merchant-artifact-integrity.js');
const {checkpoint}=require('./audit-merchant-preview-links.js');
const policy={merchantHosts:['siruishop.de'],affiliateHosts:['www.awin1.com'],redirectHosts:[]};
const direct='https://siruishop.de/products/lens?variant=123';
const affiliate='https://www.awin1.com/cread.php?awinmid=128645&awinaffid=3106259&ued='+encodeURIComponent(direct);
const products=[{id:'awin-128645-123',source:{network:'awin',advertiserId:'128645'},directUrl:direct,affiliateUrl:affiliate}];
async function main(){
 const start=new Date().toISOString(),results=[];
 for(const target of linkTargets(products)){
  if(target.mode==='affiliate')results.push(auditStructure(target,{key:'sirui',products,policy}));
  else results.push(await auditTarget(target,policy,{request:async()=>({status:200,headers:{'content-type':'text/html'},body:Buffer.from('<script>{"@type":"Product"}</script>')})}));
 }
 const report={version:2,auditorVersion:2,merchant:'sirui',scope:'full',status:'pass',trackingRequests:0,trackingRequestBudget:0,startedAt:start,completedAt:new Date().toISOString(),artifactSha256:canonicalProductDigest(products),policySha256:policyDigest(policy),productCount:1,expectedTargets:4,results};
 validateReport(report,{key:'sirui',products,policy});
 for(const patch of [{trackingRequests:1},{trackingRequestBudget:1},{results:results.slice(1)},{results:results.map(r=>r.mode==='affiliate'?{...r,httpStatus:200}:r)},{artifactSha256:'0'.repeat(64)}])assert.throws(()=>validateReport({...report,...patch},{key:'sirui',products,policy}));
 for(const url of [affiliate.replace('3106259','999'),affiliate.replace('128645','999'),affiliate+'&awinmid=128645',affiliate.replace('variant%3D123','variant%3D999')])assert.equal(auditStructure({mode:'affiliate',url},{key:'sirui',products,policy}).status,'fail');
 const attempt=await auditTarget({mode:'affiliate',url:affiliate},policy);
 assert.equal(attempt.reason,'real-tracking-requests-disabled');
 let calls=0;
 const redirect=await auditTarget({mode:'direct',url:direct},policy,{request:async()=>{calls++;return {status:302,headers:{location:affiliate},body:Buffer.alloc(0)};}});
 assert.equal(redirect.status,'fail');assert.equal(calls,1,'Never follow direct redirects into tracking');
 const incomplete={...report,status:'incomplete'};
 assert.equal(checkpoint(incomplete,report,linkTargets(products)),incomplete);
 assert.throws(()=>checkpoint({...incomplete,trackingRequests:1},report,linkTargets(products)));
 const pclick={...products[0],affiliateUrl:'https://www.awin1.com/pclick.php?a=3106259&m=128645&p=456',rawAttributes:{awinProductId:'456'}};
 assert.equal(auditStructure({mode:'affiliate',url:pclick.affiliateUrl},{key:'sirui',products:[pclick],policy}).status,'pass');
 assert.equal(auditStructure({mode:'affiliate',url:pclick.affiliateUrl.replace('456','789')},{key:'sirui',products:[pclick],policy}).status,'fail');
 console.log('Zero-tracking full coverage, identity, consent, tamper and redirect rejection passed');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
