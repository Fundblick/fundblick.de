'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {readProducts,requireHealth}=require('./destination-link-health.js');
const artifact=process.argv[2],out=process.argv[3]||path.join('build','amazgifts-future-production');
if(!artifact)throw new Error('Usage: node verify-amazgifts-future-production.js <artifact.json.gz.b64> [output-dir]');
const approvalFile='production-merchant-approvals.json',sourcesFile='production-catalog-sources.json',target='development/amazgifts-products.json.gz.b64';
const approvalBefore=fs.readFileSync(approvalFile,'utf8'),sourcesBefore=fs.readFileSync(sourcesFile,'utf8'),had=fs.existsSync(target),backup=had?fs.readFileSync(target):null;
try{
 fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(artifact,target);
 const approvals=JSON.parse(approvalBefore),approval=approvals.merchants.amazgifts;
 approval.termsCleared=true;approval.approved=true;approval.sources=[target];delete approval.reason;delete approval.quarantined;
 const sources=JSON.parse(sourcesBefore);if(!sources.includes(target))sources.push(target);
 fs.writeFileSync(approvalFile,JSON.stringify(approvals,null,2)+'\n');fs.writeFileSync(sourcesFile,JSON.stringify(sources,null,2)+'\n');
 const run=cp.spawnSync(process.execPath,['build-production-catalog.js',out],{encoding:'utf8'});
 if(!approval.destinationHealthReport){
   if(run.status===0||!/Destination health amazgifts: recent full passing report required/.test(run.stderr||''))throw new Error('Future production must reject missing real destination evidence: '+run.stderr);
   console.log('Amazgifts future production correctly blocked without a real full passing audit');
 }else{
 requireHealth('amazgifts',readProducts(target),approval);
 if(run.status!==0)throw new Error(run.stderr||'Future build failed');
 console.log(run.stdout);
 for(const script of ['verify-live-catalog-v2.js','verify-production-merchants.js','verify-production-categories.js'])cp.execFileSync(process.execPath,[script,out],{stdio:'inherit'});
 const manifest=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));
 if(manifest.realCount!==4479)throw new Error(`Future production realCount must be 4479, got ${manifest.realCount}`);
 const products=JSON.parse(fs.readFileSync(path.join(out,'products.json'),'utf8')),list=Array.isArray(products)?products:(products.products||[]);
 const amaz=list.filter(p=>(p?.bestOffer?.merchant||p?.merchant)==='Amazgifts DE');
 if(amaz.length!==2964)throw new Error(`Future production must expose 2964 Amazgifts products, got ${amaz.length}`);
 if(amaz.some(p=>p.inStock===true||p.availability==='IN_STOCK'))throw new Error('Future production fabricated Amazgifts stock');
 if(amaz.some(p=>p.shippingCost!==null&&p.shippingCost!==undefined))throw new Error('Future production fabricated Amazgifts shipping');
 console.log('Amazgifts future production simulation passed: realCount=4479');
 }
}finally{
 fs.writeFileSync(approvalFile,approvalBefore);fs.writeFileSync(sourcesFile,sourcesBefore);
 if(had)fs.writeFileSync(target,backup);else if(fs.existsSync(target))fs.unlinkSync(target);
}
