'use strict';
const {canonicalProductDigest}=require('./merchant-artifact-integrity.js');
const {MAX_AGE_MS,linkTargets,allowedUrl,policyDigest}=require('./destination-link-health.js');
const {validateStructure,structureContext}=require('./affiliate-structure-audit.js');
function validateSafeReport(report,{key,products,policy,now=Date.now()}){
 const fail=reason=>{throw Error('Destination health '+key+': '+reason);};
 if(report.version!==2||report.auditorVersion!==2||report.merchant!==key||report.scope!=='full'||report.status!=='pass'||report.trackingRequests!==0||report.trackingRequestBudget!==0)fail('full passing zero-tracking report required');
 if(report.artifactSha256!==canonicalProductDigest(products)||report.policySha256!==policyDigest(policy))fail('artifact/policy digest mismatch');
 const start=Date.parse(report.startedAt),end=Date.parse(report.completedAt);
 if(!Number.isFinite(start)||!Number.isFinite(end)||start>end||end>now||now-start>MAX_AGE_MS)fail('stale/future/invalid report');
 const targets=linkTargets(products),context=structureContext({key,products,policy});
 if(!targets.length||report.productCount!==products.length||report.expectedTargets!==targets.length||report.results?.length!==targets.length)fail('incomplete coverage');
 const results=new Map();
 for(const r of report.results){if(!r||results.has(r.mode+':'+r.url))fail('missing/duplicate result');results.set(r.mode+':'+r.url,r);}
 for(const target of targets){
  const r=results.get(target.mode+':'+target.url),checked=Date.parse(r?.checkedAt);
  if(r?.status!=='pass'||!Number.isFinite(checked)||checked<start||checked>end)fail('failed/missing/timestamp-invalid destination');
  if(target.mode==='affiliate'){
   let expected;try{expected=validateStructure(target,context);}catch(e){fail(e.message);}
   if(r.kind!==expected.kind||r.advertiserId!==expected.advertiserId||r.publisherId!==expected.publisherId||JSON.stringify(r.bindings)!==JSON.stringify(expected.bindings)||r.httpStatus!==undefined||r.chain!==undefined||r.bodySha256!==undefined)fail('invalid offline affiliate evidence');
   continue;
  }
  if(r.httpStatus!==200||!Number.isInteger(r.bodyBytes)||r.bodyBytes<=0||!/^[a-f0-9]{64}$/.test(r.bodySha256||''))fail('missing direct HTTP evidence');
  if(!Array.isArray(r.chain)||!r.chain.length||r.chain.length>9||r.chain[0].url!==target.url||r.chain.at(-1).url!==r.finalUrl||r.chain.at(-1).httpStatus!==200)fail('invalid redirect evidence');
  try{for(let i=0;i<r.chain.length;i++){allowedUrl(r.chain[i].url,policy.merchantHosts);if(i<r.chain.length-1&&![301,302,303,307,308].includes(r.chain[i].httpStatus))fail('invalid redirect status');}}catch{fail('invalid direct host/redirect');}
  const requested=new URL(target.url),final=new URL(r.finalUrl);
  if(requested.hostname.replace(/^www\./,'')!==final.hostname.replace(/^www\./,'')||requested.pathname.replace(/\/$/,'')!==final.pathname.replace(/\/$/,'')||requested.searchParams.get('variant')!==final.searchParams.get('variant'))fail('direct product/variant mismatch');
 }
 return report;
}
module.exports={validateSafeReport};
