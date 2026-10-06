'use strict';
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');
const {assertProductionArtifact}=require('./merchant-production-artifact.js');
const {requireProductQuality}=require('./merchant-product-quality.js');
const {requireHealth}=require('./destination-link-health.js');
const outputRoot=process.argv[2]||path.join('build','catalog');
let sourceManifest=JSON.parse(fs.readFileSync('production-catalog-sources.json','utf8'));
if(!Array.isArray(sourceManifest)||!sourceManifest.length)throw new Error('production-catalog-sources.json must contain at least one source file');
const approvals=JSON.parse(fs.readFileSync('production-merchant-approvals.json','utf8'));
const pinRegistry=JSON.parse(fs.readFileSync('production-merchant-artifacts.json','utf8'));
const pinnedMerchants=pinRegistry.merchants||{};
const profilePath=process.argv[3],previewKeys=new Set();
if(profilePath){
 const profile=JSON.parse(fs.readFileSync(profilePath,'utf8'));
 if(profile.version!==1||profile.mode!=='preview'||!profile.merchants||Array.isArray(profile.merchants)||!Object.keys(profile.merchants).length||!profile.artifacts||Array.isArray(profile.artifacts))throw new Error('Only an explicit version-1 preview merchant profile is supported');
 for(const [key,approval] of Object.entries(profile.merchants)){
  if(approvals.merchants[key]&&!pinnedMerchants[key])throw new Error('Preview profile cannot override production merchant '+key);
  if(approval.approved!==true||approval.quarantined===true||approval.termsCleared!==true||!approval.destinationHealthReport||!approval.productQualityReport||!Array.isArray(approval.sources)||!approval.sources.length||!profile.artifacts[key])throw new Error('Preview merchant requires full approval, terms, pinned artifact and real evidence: '+key);
  const previewProducts=approval.sources.flatMap(file=>require('./destination-link-health.js').readProducts(file));
  if(previewProducts.some(p=>p.source?.network!==approval.network||String(p.source?.advertiserId)!==String(approval.advertiserId)))throw new Error('Preview source provenance mismatch: '+key);
  if(approvals.merchants[key]||pinnedMerchants[key]){
   const same=(a,b)=>require('node:util').isDeepStrictEqual(a,b);
   if(!same(approval,approvals.merchants[key])||!same(profile.artifacts[key],pinnedMerchants[key])||!approval.sources.every(source=>sourceManifest.includes(source)))throw new Error('Preview profile cannot override production merchant '+key);
   console.log('Preview merchant already promoted with identical approval and pin: '+key);
   continue;
  }
  previewKeys.add(key);approvals.merchants[key]=approval;pinnedMerchants[key]=profile.artifacts[key];
  sourceManifest.push(...approval.sources);
 }
 if(Object.keys(profile.artifacts).some(key=>!profile.merchants[key]))throw new Error('Unassigned preview artifact');
 console.log('Catalog profile: validated Development additions, production configuration unchanged');
}
if(approvals?.version!==1||!approvals?.merchants||typeof approvals.merchants!=='object')throw new Error('production-merchant-approvals.json must contain version 1 merchant approvals');
const normalize=file=>path.normalize(String(file));const approvedMerchantSources=new Map();const blockedMerchantSources=new Map();
for(const [key,merchant] of Object.entries(approvals.merchants)){if(!merchant||typeof merchant!=='object')throw new Error(`Invalid production merchant approval: ${key}`);if(!merchant.network||!merchant.advertiserId)throw new Error(`Production merchant approval ${key} needs network and advertiserId`);if(!Array.isArray(merchant.sources))throw new Error(`Production merchant approval ${key} needs a sources array`);for(const source of merchant.sources){const target=merchant.approved===true?approvedMerchantSources:blockedMerchantSources;const normalized=normalize(source);if(approvedMerchantSources.has(normalized)||blockedMerchantSources.has(normalized))throw new Error(`Merchant source ${source} is assigned more than once`);target.set(normalized,key);}}
const coreFile=normalize('development/core-products.json');const normalizedManifest=sourceManifest.map(normalize);if(!normalizedManifest.includes(coreFile))throw new Error('Production source manifest must include development/core-products.json');
for(const source of normalizedManifest){if(blockedMerchantSources.has(source))throw new Error(`Production source ${source} belongs to blocked merchant ${blockedMerchantSources.get(source)}`);if(source!==coreFile&&!approvedMerchantSources.has(source))throw new Error(`Production merchant source ${source} has no explicit approval`);}for(const [source,key] of approvedMerchantSources){if(!normalizedManifest.includes(source))throw new Error(`Approved merchant source ${source} for ${key} is missing from production-catalog-sources.json`);}
const originalRead=fs.readFileSync.bind(fs);
function readSource(file){let raw=originalRead(file);const name=String(file);if(name.endsWith('.b64'))raw=Buffer.from(raw.toString('utf8').trim(),'base64');if(name.endsWith('.gz')||name.endsWith('.gz.b64'))raw=zlib.gunzipSync(raw);return JSON.parse(raw.toString('utf8'));}
// Validate raw artifacts before enrichment or writing any public catalog output.
const healthArtifacts=new Map();
for(const file of sourceManifest){const key=normalize(file)===coreFile?'casaMoro':approvedMerchantSources.get(normalize(file));const list=healthArtifacts.get(key)||[];list.push(...readSource(file));healthArtifacts.set(key,list);}
for(const [key,products] of healthArtifacts){
  const approval=approvals.merchants[key];
  if(previewKeys.has(key)&&products.some(p=>p.source?.network!==approval.network||String(p.source?.advertiserId)!==String(approval.advertiserId)))throw new Error('Preview source provenance mismatch: '+key);
  if(approval?.approved!==true)throw new Error(`Merchant ${key} has no explicit production approval`);
  if(approval?.quarantined===true)throw new Error(`Quarantined merchant ${key} cannot enter production`);
  requireHealth(key,products,approval,{allowLegacy:true});
  if(key==='amazgifts'||pinnedMerchants[key]){
    if(approval.termsCleared!==true)throw new Error(`Merchant ${key}: reviewed terms required`);
    requireProductQuality(key,products,approval);
  }else if(approval.productQualityReport)requireProductQuality(key,products,approval);
}
const combined=[];const seenIds=new Map();for(const file of sourceManifest){const normalizedFile=normalize(file);const data=readSource(normalizedFile);if(!Array.isArray(data))throw new Error(`${file} must contain an array`);
const merchantKey=approvedMerchantSources.get(normalizedFile);
if(merchantKey==='amazgifts'||pinnedMerchants[merchantKey]){
  if(previewKeys.has(merchantKey))assertProductionArtifact(merchantKey,data,file,{version:1,merchants:pinnedMerchants});
  else assertProductionArtifact(merchantKey,data,file);
}
for(const product of data){const id=String(product?.id||'').trim();if(!id)throw new Error(`${file} contains product without id`);if(seenIds.has(id))throw new Error(`Duplicate production product id ${id} in ${seenIds.get(id)} and ${file}`);seenIds.set(id,file);combined.push(product);}}
fs.readFileSync=function(file,...args){if(normalize(file)===coreFile)return JSON.stringify(combined);return originalRead(file,...args);};process.argv[2]=outputRoot;require('./build-live-catalog.js');
const preferred=['home.living','home.furniture','home.lighting','home.decor','pet.equestrian','pet.dog','health.supplements','home.garden.robot-mowers','home.garden.robot-mower-accessories','gifts.personalized.keychains','gifts.personalized.jewelry','gifts.personalized.photo-gifts','craft.jewelry-making.supplies'];const counts=new Map();for(const product of combined){if(!product||product.active===false)continue;const category=String(product.category||'').trim();const price=Number(product.price);if(!category||!product.id||!product.name||!Number.isFinite(price)||price<=0)continue;counts.set(category,(counts.get(category)||0)+1);}const rank=id=>{const index=preferred.indexOf(id);return index>=0?index:preferred.length;};const categories=[...counts.entries()].map(([id,count])=>({id,count})).sort((a,b)=>rank(a.id)-rank(b.id)||b.count-a.count||a.id.localeCompare(b.id,'de'));fs.writeFileSync(path.join(outputRoot,'categories.json'),JSON.stringify({version:1,categories})+'\n');console.log(`production categories built: ${categories.length} categories`);
