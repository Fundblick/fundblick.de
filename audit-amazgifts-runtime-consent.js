'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),https=require('node:https'),dns=require('node:dns').promises;
const repo=__dirname,auditDir=path.resolve(process.argv[2]||'build/amazgifts-audit');process.chdir(repo);
const {readProducts,linkTargets,policyFor}=require(repo+'/destination-link-health.js');
const {auditTarget,publicAddress}=require(repo+'/audit-destination-links.js');
const products=JSON.parse(fs.readFileSync(auditDir+'/production-candidates.json')).results.filter(r=>r.status==='pass').map(r=>r.product),policy=policyFor('amazgifts');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const file=auditDir+'/runtime-consent.json',out=auditDir+'/production-evidence';
const report=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):{startedAt:new Date().toISOString(),results:[],status:'incomplete'};
const candidates=JSON.parse(fs.readFileSync(auditDir+'/production-candidates.json'));
const rawTargets=new Set(candidates.results.filter(r=>r.status==='pass').flatMap(r=>[r.direct,r.affiliate]).map(r=>r.mode+':'+r.url));
const targets=linkTargets(products).filter(t=>!rawTargets.has(t.mode+':'+t.url));let nextAt=0,pauseUntil=0;
async function request(u){
 if(u.protocol!=='https:'||u.username||u.password||u.port||![...policy.merchantHosts,...policy.affiliateHosts].includes(u.hostname))throw new Error('invalid-host');
 for(let n=0;n<3;n++){const at=Math.max(Date.now(),nextAt,pauseUntil);nextAt=at+350;await sleep(Math.max(0,at-Date.now()));
 try{const addresses=await dns.lookup(u.hostname,{all:true});if(!addresses.length||addresses.some(a=>!publicAddress(a.address)))throw new Error('non-public');const pinned=addresses[0];
 const res=await new Promise((resolve,reject)=>{const req=https.get(u,{headers:{'User-Agent':'FundBlick-Consent-Destination-Audit/1.0','Accept':'text/html','Accept-Encoding':'identity'},lookup:(_h,o,cb)=>o?.all?cb(null,[pinned]):cb(null,pinned.address,pinned.family)},r=>{const b=[];let size=0;r.on('data',c=>{size+=c.length;if(size>4*1024*1024)r.destroy(new Error('oversize'));else b.push(c);});r.on('error',reject);r.on('end',()=>resolve({status:r.statusCode,headers:r.headers,body:Buffer.concat(b)}));});const timer=setTimeout(()=>req.destroy(new Error('timeout')),20000);req.on('close',()=>clearTimeout(timer));req.on('error',reject);});
 const digest=sha(res.body);fs.writeFileSync(out+'/'+digest+'.bin',res.body);fs.appendFileSync(out+'/runtime-requests.jsonl',JSON.stringify({url:u.href,status:res.status,location:res.headers.location||null,bodySha256:digest,bodyBytes:res.body.length,checkedAt:new Date().toISOString(),attempt:n+1})+'\n');
 if([429,500,502,503,504].includes(res.status)&&n<2){pauseUntil=Date.now()+Math.max(15000*(n+1),Math.min(120000,Number(res.headers['retry-after']||0)*1000));continue;}return res;
 }catch(e){if(n===2)throw e;await sleep(2000*(n+1));}}
}
(async()=>{const done=new Set(report.results.map(r=>r.url)),pending=targets.filter(t=>!done.has(t.url));let next=0;await Promise.all([0,1].map(async()=>{while(next<pending.length){const t=pending[next++];const r=await auditTarget(t,policy,{request});if(r.status==='pass'){
 const original=new URL(t.url);original.searchParams.delete('cons');const p=t.mode==='direct'?products.find(p=>new URL(p.directUrl).href===t.url):products.find(p=>p.affiliateUrl===original.href);const end=new URL(r.finalUrl);
 if(!p||end.pathname!==new URL(p.rawAttributes.verifiedFinalProductUrl).pathname||end.searchParams.get('variant')!==p.merchantVariantId||!fs.readFileSync(out+'/'+r.bodySha256+'.bin','utf8').includes(p.rawAttributes.shopifyProductId)){r.status='fail';r.reason='runtime-product-or-variant-mismatch';}}
 report.results.push(r);fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');console.log(report.results.length+'/'+targets.length,r.status,r.reason||new URL(t.url).searchParams.get('cons'));}}));report.status='complete';report.completedAt=new Date().toISOString();fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');console.log('COMPLETE',report.results.length,report.results.filter(r=>r.status==='pass').length);})().catch(e=>{console.error(e);process.exitCode=1;});
