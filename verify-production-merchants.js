'use strict';
const fs=require('node:fs');
const path=require('node:path');

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
if(casa<1000)throw new Error(`Casa Moro production count unexpectedly low: ${casa}`);
if(ahipos!==31)throw new Error(`AHIPOS production count must be 31, got ${ahipos}`);

const ahiposProducts=products.filter(product=>(product?.bestOffer?.merchant||product?.merchant)==='Ahipos Horses DE');
if(new Set(ahiposProducts.map(product=>product.id)).size!==31)throw new Error('AHIPOS production ids are not unique');
if(!ahiposProducts.every(product=>String(product?.bestOffer?.network||product?.source?.network||'').toLowerCase()==='awin'))throw new Error('Every AHIPOS production offer must use AWIN');
if(!ahiposProducts.every(product=>String(product?.bestOffer?.affiliateUrl||'').includes('awin1.com')))throw new Error('Every AHIPOS production offer must have an AWIN affiliate URL');
if(!ahiposProducts.every(product=>String(product?.bestOffer?.directUrl||'').includes('ahipos-horses.de')))throw new Error('Every AHIPOS production offer must have an AHIPOS direct URL');
if(!ahiposProducts.some(product=>product.category==='pet.equestrian'))throw new Error('AHIPOS equestrian category missing from production');

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

console.log(`Production merchant gate OK: Casa Moro ${casa}, AHIPOS ${ahipos}, ANTHBOT ${anthbot}, total ${products.length}`);
