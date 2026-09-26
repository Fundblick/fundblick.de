'use strict';
const fs=require('node:fs');
const zlib=require('node:zlib');
const path=require('node:path');
const crypto=require('node:crypto');

const ADVERTISER_ID='120341';
const MERCHANT='Ahipos Horses DE';
const NETWORK='awin';

function parseCsv(text){
  const rows=[];let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(quoted){
      if(c==='"'&&text[i+1]==='"'){field+='"';i++;continue;}
      if(c==='"'){quoted=false;continue;}
      field+=c;continue;
    }
    if(c==='"'){quoted=true;continue;}
    if(c===','){row.push(field);field='';continue;}
    if(c==='\n'){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field='';continue;}
    field+=c;
  }
  if(field.length||row.length){row.push(field.replace(/\r$/,''));rows.push(row);}
  if(!rows.length)return [];
  const headers=rows.shift().map(h=>h.replace(/^\uFEFF/,''));
  return rows.filter(r=>r.some(v=>v!=='')).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??''])));
}
function readCsv(file){const raw=fs.readFileSync(file);const text=file.endsWith('.gz')?zlib.gunzipSync(raw).toString('utf8'):raw.toString('utf8');return parseCsv(text);}
function money(value){if(value===null||value===undefined||value==='')return null;const m=String(value).replace(',','.').match(/-?\d+(?:\.\d+)?/);return m?Math.round(Number(m[0])*100)/100:null;}
function clean(v){const s=String(v??'').trim();return s||null;}
function boolish(v){const s=String(v??'').trim().toLowerCase();if(['1','true','yes','in_stock','instock','available'].includes(s))return true;if(['0','false','no','out_of_stock','outofstock','unavailable'].includes(s))return false;return null;}
function stableId(prefix,...parts){return `${prefix}-${crypto.createHash('sha256').update(parts.map(x=>String(x??'')).join('|')).digest('hex').slice(0,24)}`;}
function normalizeProductPath(url){if(!url)return null;try{const u=new URL(url);u.searchParams.delete('variant');return `${u.origin}${u.pathname.replace(/\/$/,'')}`;}catch{return null;}}
function validAffiliateUrl(url){try{return /^https?:$/.test(new URL(url).protocol)&&/(^|\.)awin1\.com$/i.test(new URL(url).hostname);}catch{return false;}}
function validDirectUrl(url){try{return /(^|\.)ahipos-horses\.de$/i.test(new URL(url).hostname);}catch{return false;}}

function genericRow(row){
  const variantId=clean(row.merchant_product_id);
  return variantId?{source:'generic',variantId,awinProductId:clean(row.aw_product_id),name:clean(row.product_name),description:clean(row.description),price:money(row.search_price),currency:clean(row.currency)||'EUR',availability:boolish(row.in_stock),stockQuantity:money(row.stock_quantity),shippingCost:money(row.delivery_cost),affiliateUrl:clean(row.aw_deep_link),directUrl:clean(row.merchant_deep_link),imageUrl:clean(row.merchant_image_url),categoryEvidence:clean(row.merchant_category),brand:null,gtin:null,mpn:null,googleProductCategory:null}:null;
}
function retailRow(row){
  const variantId=clean(row.id);
  return variantId?{source:'retail',variantId,awinProductId:null,name:clean(row.title),description:clean(row.description),price:money(row.price),currency:(String(row.price||'').match(/\b([A-Z]{3})\b/)||[])[1]||'EUR',availability:boolish(row.availability),stockQuantity:null,shippingCost:null,affiliateUrl:clean(row.aw_deep_link),directUrl:clean(row.link),imageUrl:clean(row.image_link),categoryEvidence:null,brand:clean(row.brand),gtin:clean(row.gtin),mpn:clean(row.mpn),googleProductCategory:clean(row.google_product_category)}:null;
}
function classifyCategory(variants){
  const text=variants.map(v=>[v.name,v.variantName,v.googleProductCategory,v.merchantCategory].filter(Boolean).join(' ')).join(' ').toLowerCase();
  if(/(?:für hunde|pet supplies|dog|hunde)/i.test(text))return 'pet.dog';
  if(/(?:\(mensch\)|health\s*&\s*beauty|human inmuno)/i.test(text))return 'health.supplements';
  return 'pet.equestrian';
}
function inferProductType(product){
  const productName=String(product?.name||'');
  const structured=(product?.variants||[]).map(v=>[v.googleProductCategory,v.merchantCategory].filter(Boolean).join(' ')).join(' ');
  if(/bundle/i.test(productName))return 'Bundle';
  if(product.category==='pet.dog')return 'Hunde-Ergänzung';
  if(product.category==='health.supplements')return 'Nahrungsergänzung';
  if(/horse care/i.test(structured)&&!/(supplement|horse feed)/i.test(structured))return 'Pferdepflege';
  return 'Ergänzungsfutter';
}
function mergeEvidence(g,r){
  const variantId=(g||r).variantId;
  const availabilityConflict=!!(g&&r&&g.availability!==null&&r.availability!==null&&g.availability!==r.availability);
  const inStock=availabilityConflict?false:(r?.availability??g?.availability??false);
  const gp=g?.price,rp=r?.price,priceConflict=gp!==null&&gp!==undefined&&rp!==null&&rp!==undefined&&Math.abs(gp-rp)>0.009;
  const directUrl=g?.directUrl||r?.directUrl||null,affiliateUrl=g?.affiliateUrl||r?.affiliateUrl||null;
  return {id:stableId('variant',ADVERTISER_ID,variantId),merchantVariantId:variantId,awinProductId:g?.awinProductId||null,advertiserId:ADVERTISER_ID,merchant:MERCHANT,network:NETWORK,name:g?.name||r?.name||null,variantName:r?.name||g?.name||null,description:g?.description||r?.description||null,sourceText:true,price:gp??rp,currency:g?.currency||r?.currency||'EUR',availability:inStock?'IN_STOCK':'OUT_OF_STOCK',inStock,purchasable:!!inStock,stockQuantity:g?.stockQuantity??null,shippingCost:g?.shippingCost??r?.shippingCost??null,affiliateUrl,directUrl,imageUrl:g?.imageUrl||r?.imageUrl||null,brand:r?.brand||null,gtin:r?.gtin||null,mpn:r?.mpn||null,googleProductCategory:r?.googleProductCategory||null,merchantCategory:g?.categoryEvidence||null,productPath:normalizeProductPath(directUrl),quality:{availabilityConflict,priceConflict,sources:[g&&'generic',r&&'retail'].filter(Boolean)}};
}
function normalizeFeeds(genericRows,retailRows){
  const generic=genericRows.map(genericRow).filter(Boolean),retail=retailRows.map(retailRow).filter(Boolean),byVariant=new Map();
  for(const g of generic)byVariant.set(g.variantId,{generic:g,retail:null});
  for(const r of retail){const e=byVariant.get(r.variantId)||{generic:null,retail:null};e.retail=r;byVariant.set(r.variantId,e);}
  const variants=[...byVariant.values()].map(e=>mergeEvidence(e.generic,e.retail)).sort((a,b)=>a.merchantVariantId.localeCompare(b.merchantVariantId));
  const groups=new Map();for(const v of variants){const key=v.productPath||`variant:${v.merchantVariantId}`,list=groups.get(key)||[];list.push(v);groups.set(key,list);}
  const products=[...groups.entries()].map(([key,vars])=>{const product={id:stableId('product',ADVERTISER_ID,key),advertiserId:ADVERTISER_ID,merchant:MERCHANT,network:NETWORK,productPath:key,name:vars[0].name,description:vars[0].description,brand:vars.find(v=>v.brand)?.brand||null,category:classifyCategory(vars),variants:vars,variantCount:vars.length,priceFrom:Math.min(...vars.map(v=>v.price).filter(Number.isFinite)),purchasableVariantCount:vars.filter(v=>v.purchasable).length,imageUrl:vars.find(v=>v.imageUrl)?.imageUrl||null};product.productType=inferProductType(product);return product;}).sort((a,b)=>a.productPath.localeCompare(b.productPath));
  const overlap=[...byVariant.values()].filter(x=>x.generic&&x.retail).length;
  return {advertiserId:ADVERTISER_ID,merchant:MERCHANT,network:NETWORK,stats:{genericRows:generic.length,retailRows:retail.length,overlap,uniqueVariants:variants.length,productGroups:products.length,availabilityConflicts:variants.filter(v=>v.quality.availabilityConflict).length,priceConflicts:variants.filter(v=>v.quality.priceConflict).length},variants,products};
}
function toCatalogRows(result){
  const groupByVariant=new Map();for(const p of result.products)for(const v of p.variants)groupByVariant.set(v.merchantVariantId,p);
  return result.variants.map(v=>{const product=groupByVariant.get(v.merchantVariantId);return {id:`awin-${ADVERTISER_ID}-${v.merchantVariantId}`,productGroupId:product.id,merchantVariantId:v.merchantVariantId,source:{network:NETWORK,advertiserId:ADVERTISER_ID,feedIds:v.quality.sources.slice()},merchant:MERCHANT,name:v.variantName||v.name,productName:product.name,description:v.description||'',sourceText:true,category:product.category,googleProductCategory:v.googleProductCategory||'',brand:v.brand||'AHIPOS Horses',gtin:v.gtin||'',mpn:v.mpn||'',image:v.imageUrl||'',directUrl:v.directUrl||'',affiliateUrl:v.affiliateUrl||'',price:v.price,currency:v.currency||'EUR',shippingCost:v.shippingCost??null,inStock:v.inStock,availability:v.availability,active:true,testData:false,rawAttributes:{productType:inferProductType(product),merchantCategory:v.merchantCategory||'',availabilityConflict:!!v.quality.availabilityConflict}};}).sort((a,b)=>a.merchantVariantId.localeCompare(b.merchantVariantId));
}
function validate(result){
  const errors=[];for(const v of result.variants){if(!v.merchantVariantId)errors.push('missing merchantVariantId');if(!Number.isFinite(v.price)||v.price<=0)errors.push(`${v.merchantVariantId}: invalid price`);if(!v.directUrl||!validDirectUrl(v.directUrl))errors.push(`${v.merchantVariantId}: invalid directUrl`);if(!v.affiliateUrl||!validAffiliateUrl(v.affiliateUrl))errors.push(`${v.merchantVariantId}: invalid affiliateUrl`);if(v.affiliateUrl===v.directUrl)errors.push(`${v.merchantVariantId}: affiliate/direct URL collision`);if(v.quality.availabilityConflict&&v.inStock)errors.push(`${v.merchantVariantId}: conflict must resolve OUT_OF_STOCK`);if(!v.sourceText)errors.push(`${v.merchantVariantId}: source text provenance missing`);}if(result.products.some(p=>/^home\./.test(p.category)))errors.push('AHIPOS must not fall back to Casa-Moro families');return errors;
}
function main(){const [genericFile,retailFile,outputFile]=process.argv.slice(2);if(!genericFile||!retailFile)throw new Error('Usage: node ahipos-feed-normalizer.js <generic.csv[.gz]> <retail.csv[.gz]> [output.json]');const result=normalizeFeeds(readCsv(genericFile),readCsv(retailFile));const errors=validate(result);if(errors.length)throw new Error(`AHIPOS normalization failed:\n- ${errors.join('\n- ')}`);const text=JSON.stringify(result,null,2)+'\n';if(outputFile){fs.mkdirSync(path.dirname(outputFile),{recursive:true});fs.writeFileSync(outputFile,text);}else process.stdout.write(text);}
if(require.main===module)main();
module.exports={parseCsv,readCsv,normalizeFeeds,validate,normalizeProductPath,money,boolish,classifyCategory,inferProductType,toCatalogRows};
