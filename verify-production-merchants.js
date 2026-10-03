'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {productionArtifactFor}=require('./merchant-production-artifact.js');

const root=process.argv[2]||path.join('build','catalog');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
const approvals=JSON.parse(fs.readFileSync('production-merchant-approvals.json','utf8'));
const products=[];
for(const entry of Object.values(manifest.shards||{})){
  const payload=JSON.parse(fs.readFileSync(path.join(root,entry.file),'utf8'));
  if(!Array.isArray(payload))throw new Error(`${entry.file} must contain an array`);
  products.push(...payload);
}
if(products.length!==Number(manifest.itemCount))throw new Error(`Manifest itemCount ${manifest.itemCount} does not match ${products.length} products`);

const counts=new Map();
for(const product of products){
  const merchant=String(product?.bestOffer?.merchant||product?.merchant||'').trim();
  if(merchant)counts.set(merchant,(counts.get(merchant)||0)+1);
}
const casa=counts.get('Casa Moro DE')||0;
const ahipos=counts.get('Ahipos Horses DE')||0;
const anthbot=counts.get('ANTHBOT DE')||0;
const amazgifts=counts.get('Amazgifts DE')||0;
if(casa<1000)throw new Error(`Casa Moro production count unexpectedly low: ${casa}`);
if(ahipos!==31)throw new Error(`AHIPOS production count must be 31, got ${ahipos}`);

const ahiposProducts=products.filter(product=>(product?.bestOffer?.merchant||product?.merchant)==='Ahipos Horses DE');
if(new Set(ahiposProducts.map(product=>product.id)).size!==31)throw new Error('AHIPOS production ids are not unique');
if(!ahiposProducts.every(product=>String(product?.bestOffer?.network||product?.source?.network||'').toLowerCase()==='awin'))throw new Error('Every AHIPOS production offer must use AWIN');
if(!ahiposProducts.every(product=>String(product?.bestOffer?.affiliateUrl||'').includes('awin1.com')))throw new Error('Every AHIPOS production offer must have an AWIN affiliate URL');
if(!ahiposProducts.every(product=>String(product?.bestOffer?.directUrl||'').includes('ahipos-horses.de')))throw new Error('Every AHIPOS production offer must have an AHIPOS direct URL');
if(!ahiposProducts.some(product=>product.category==='pet.equestrian'))throw new Error('AHIPOS equestrian category missing from production');

const amazgiftsApproval=approvals?.merchants?.amazgifts;
if(!amazgiftsApproval)throw new Error('Amazgifts production approval record missing');
if(amazgiftsApproval.network!=='awin'||amazgiftsApproval.advertiserId!=='87569'||amazgiftsApproval.publisherId!=='3106259')throw new Error('Amazgifts production approval identity contract changed');
if(!Array.isArray(amazgiftsApproval.sources))throw new Error('Amazgifts production approval sources must be an array');
if(amazgiftsApproval.approved===true){if(amazgiftsApproval.sources.length!==1||amazgiftsApproval.sources[0]!==productionArtifactFor('amazgifts').source)throw new Error('Approved Amazgifts production source contract changed');}
else if(amazgiftsApproval.sources.length!==0)throw new Error('Blocked Amazgifts must not expose a production source');
const productionSources=JSON.parse(fs.readFileSync('production-catalog-sources.json','utf8'));
const amazgiftsSourceCount=productionSources.filter(source=>/amazgifts/i.test(String(source))).length;
if(!amazgiftsApproval?.approved&&amazgiftsSourceCount!==0)throw new Error(`Blocked Amazgifts source leaked into production configuration: ${amazgiftsSourceCount}`);
if(!amazgiftsApproval?.approved&&amazgifts!==0)throw new Error(`Blocked Amazgifts merchant leaked into production: ${amazgifts} products`);
if(amazgiftsApproval?.approved){
  if(amazgiftsSourceCount!==1)throw new Error(`Approved Amazgifts production requires exactly one explicit source, got ${amazgiftsSourceCount}`);
  const contract=productionArtifactFor('amazgifts');
  if(amazgifts!==contract.productCount)throw new Error(`Amazgifts production count must be ${contract.productCount}, got ${amazgifts}`);
  const amazgiftsProducts=products.filter(product=>(product?.bestOffer?.merchant||product?.merchant)==='Amazgifts DE');
  if(new Set(amazgiftsProducts.map(product=>product.id)).size!==contract.productCount)throw new Error('Amazgifts production ids are not unique');
  if(new Set(amazgiftsProducts.map(product=>product.rawAttributes?.shopifyProductId)).size!==contract.productCount)throw new Error('Amazgifts product families are not unique');
  if(!amazgiftsProducts.every(product=>String(product?.bestOffer?.network||product?.source?.network||'').toLowerCase()==='awin'))throw new Error('Every Amazgifts production offer must use AWIN');
  if(!amazgiftsProducts.every(product=>{try{const u=new URL(String(product?.bestOffer?.affiliateUrl||''));return /(^|\.)awin1\.com$/i.test(u.hostname)&&u.searchParams.get('a')==='3106259'&&u.searchParams.get('m')==='87569';}catch{return false;}}))throw new Error('Every Amazgifts production offer must preserve the verified AWIN publisher and advertiser ids');
  if(!amazgiftsProducts.every(product=>{try{return /(^|\.)amazgifts\.de$/i.test(new URL(String(product?.bestOffer?.directUrl||'')).hostname);}catch{return false;}}))throw new Error('Every Amazgifts production offer must have an Amazgifts direct URL');
  const allowed=new Set(['gifts.personalized.jewelry','gifts.personalized.keychains','gifts.personalized.photo-gifts','craft.jewelry-making.supplies','gifts.personalized.other']);
  if(!amazgiftsProducts.every(product=>allowed.has(product.category)))throw new Error('Amazgifts production contains an unexpected category');
  if(amazgiftsProducts.some(product=>product.inStock===true||product.availability==='IN_STOCK'))throw new Error('Amazgifts production must not fabricate confirmed stock from this feed');
  if(amazgiftsProducts.some(product=>product.shippingCost!==null&&product.shippingCost!==undefined))throw new Error('Amazgifts production must not fabricate shipping cost from this feed');
}

const anthbotApproval=approvals?.merchants?.anthbot;
if(!anthbotApproval)throw new Error('ANTHBOT production approval record missing');
if(anthbotApproval.approved!==true){
  if(anthbot!==0)throw new Error(`Blocked ANTHBOT merchant leaked into production: ${anthbot} products`);
}else{
  if(anthbot!==56)throw new Error(`ANTHBOT production count must be 56, got ${anthbot}`);
  const anthbotProducts=products.filter(product=>(product?.bestOffer?.merchant||product?.merchant)==='ANTHBOT DE');
  if(new Set(anthbotProducts.map(product=>product.id)).size!==56)throw new Error('ANTHBOT production ids are not unique');
  if(!anthbotProducts.every(product=>String(product?.bestOffer?.network||product?.source?.network||'').toLowerCase()==='awin'))throw new Error('Every ANTHBOT production offer must use AWIN');
  if(!anthbotProducts.every(product=>{try{return /(^|\.)awin1\.com$/i.test(new URL(String(product?.bestOffer?.affiliateUrl||'')).hostname);}catch{return false;}}))throw new Error('Every ANTHBOT production offer must have an AWIN affiliate URL');
  if(!anthbotProducts.every(product=>{try{return /(^|\.)anthbot\.com$/i.test(new URL(String(product?.bestOffer?.directUrl||'')).hostname);}catch{return false;}}))throw new Error('Every ANTHBOT production offer must have an ANTHBOT direct URL');
  const allowed=new Set(['home.garden.robot-mowers','home.garden.robot-mower-accessories']);
  if(!anthbotProducts.every(product=>allowed.has(product.category)))throw new Error('ANTHBOT production contains an unexpected category');
  if(!anthbotProducts.some(product=>product.category==='home.garden.robot-mowers'))throw new Error('ANTHBOT mower category missing from production');
  if(!anthbotProducts.some(product=>product.category==='home.garden.robot-mower-accessories'))throw new Error('ANTHBOT accessory category missing from production');
  const inStock=anthbotProducts.filter(product=>product.inStock===true||product.availability==='IN_STOCK').length;
  if(inStock!==34)throw new Error(`ANTHBOT production in-stock count must match current verified feed contract (34), got ${inStock}`);
}

const blazeApproval=approvals?.merchants?.blazevideo;
const blaze=counts.get('BlazeVideo DE')||0;
if(blazeApproval?.approved===true){
 const contract=productionArtifactFor('blazevideo'),selected=products.filter(p=>(p.bestOffer?.merchant||p.merchant)==='BlazeVideo DE');
 if(blaze!==contract.productCount||new Set(selected.map(p=>p.rawAttributes?.productFamilyId)).size!==blaze)throw new Error('BlazeVideo production count/family contract mismatch');
 for(const p of selected){
  const direct=new URL(p.bestOffer.directUrl),affiliate=new URL(p.bestOffer.affiliateUrl);
  if(direct.hostname!=='www.blazevideos.de'||!direct.pathname.startsWith('/products/')||affiliate.hostname!=='www.awin1.com'||affiliate.searchParams.get('m')!=='25962'||affiliate.searchParams.get('a')!=='3106259'||p.bestOffer.network!=='awin')throw new Error('BlazeVideo production link/provenance mismatch');
  if(p.inStock!==null||p.bestOffer.availability!=='UNKNOWN'||p.shippingCost!==null||p.bestOffer.promotions.length)throw new Error('BlazeVideo production must preserve unknown logistics and omit unverified coupons');
 }
}else if(blaze)throw new Error('Unapproved BlazeVideo products leaked into production');
console.log(`Production merchant gate OK: Casa Moro ${casa}, AHIPOS ${ahipos}, ANTHBOT ${anthbot}, Amazgifts ${amazgifts}, BlazeVideo ${blaze}, total ${products.length}`);
