'use strict';
const fs=require('node:fs'),crypto=require('node:crypto');
const {readProducts,linkTargets,validateReport}=require('./destination-link-health.js');
const {canonicalProductDigest}=require('./merchant-artifact-integrity.js');
function derive(key,originalSource,originalReport,qualifiedSource,output){
 if(originalReport===output)throw Error('Original evidence must be retained');
 const original=readProducts(originalSource),products=readProducts(qualifiedSource),bytes=fs.readFileSync(originalReport),report=JSON.parse(bytes);
 if(report.version!==2||report.merchant!==key||!['pass','fail'].includes(report.status)||report.scope!=='full'||!report.completedAt||report.artifactSha256!==canonicalProductDigest(original)||report.expectedTargets!==linkTargets(original).length||report.results?.length!==report.expectedTargets)throw Error('Complete matching original audit required');
 const identities=new Map(original.map(p=>[p.id,p]));
 for(const p of products){const old=identities.get(p.id);if(!old||p.directUrl!==old.directUrl||p.affiliateUrl!==old.affiliateUrl||p.merchantVariantId!==old.merchantVariantId)throw Error('Qualified source is not an exact destination subset');}
 const records=new Map(report.results.map(r=>[r.mode+':'+r.url,r]));
 if(records.size!==report.results.length)throw Error('Duplicate original evidence');
 const results=linkTargets(products).map(t=>records.get(t.mode+':'+t.url));
 if(results.some(r=>r?.status!=='pass'))throw Error('A failed destination cannot enter qualified evidence');
 const derived={...report,status:'pass',artifactSha256:canonicalProductDigest(products),productCount:products.length,expectedTargets:results.length,results,failedTargets:0,sourceEvidenceReportSha256:crypto.createHash('sha256').update(bytes).digest('hex'),sourceArtifactSha256:report.artifactSha256};
 validateReport(derived,{key,products});fs.writeFileSync(output,JSON.stringify(derived)+'\n');return derived;
}
if(require.main===module)derive(...process.argv.slice(2));
module.exports={derive};
