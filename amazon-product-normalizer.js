'use strict';
const crypto=require('node:crypto');

const NETWORK='amazon';
const MERCHANT='Amazon';
const DEFAULT_MARKETPLACE='www.amazon.de';

function clean(value){const text=String(value??'').trim();return text||null;}
function money(value){if(value===null||value===undefined||value==='')return null;if(typeof value==='number')return Number.isFinite(value)?Math.round(value*100)/100:null;const normalized=String(value).replace(/\s/g,'').replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(',','.');const match=normalized.match(/-?\d+(?:\.\d+)?/);return match?Math.round(Number(match[0])*100)/100:null;}
function stableId(...parts){return crypto.createHash('sha256').update(parts.map(part=>String(part??'')).join('|')).digest('hex').slice(0,24);}
function validAsin(value){return /^[A-Z0-9]{10}$/.test(String(value||'').trim().toUpperCase());}
function normalizeAsin(value){const asin=String(value||'').trim().toUpperCase();return validAsin(asin)?asin:null;}
function safeAmazonUrl(value){
  if(!value)return null;
  try{
    const url=new URL(value);
    if(url.protocol!=='https:')return null;
    if(!/(^|\.)amazon\.de$/i.test(url.hostname))return null;
    return url.toString();
  }catch{return null;}
}
function canonicalProductUrl(asin){return validAsin(asin)?`https://${DEFAULT_MARKETPLACE}/dp/${normalizeAsin(asin)}`:null;}
function availability(value){
  const text=String(value??'').trim().toLowerCase();
  if(['in_stock','instock','available','true','1'].includes(text))return true;
  if(['out_of_stock','outofstock','unavailable','false','0'].includes(text))return false;
  return null;
}
function normalizeItem(item,options={}){
  const asin=normalizeAsin(item?.asin||item?.ASIN);
  if(!asin)return null;
  const detail=item?.detailPageURL||item?.detailPageUrl||item?.url;
  const directUrl=safeAmazonUrl(detail)||canonicalProductUrl(asin);
  const price=money(item?.price?.amount??item?.price??item?.offers?.price?.amount);
  const currency=clean(item?.price?.currency||item?.currency||item?.offers?.price?.currency)||'EUR';
  const inStock=availability(item?.availability??item?.inStock);
  const title=clean(item?.title||item?.itemInfo?.title?.displayValue||item?.name);
  const brand=clean(item?.brand||item?.itemInfo?.byLineInfo?.brand?.displayValue);
  const image=clean(item?.image||item?.images?.primary?.large?.url||item?.images?.primary?.medium?.url);
  const category=clean(item?.category||options.defaultCategory)||'other';
  return {
    id:`amazon-${asin}`,
    merchantVariantId:asin,
    productGroupId:`amazon-product-${stableId(asin)}`,
    source:{network:NETWORK,marketplace:DEFAULT_MARKETPLACE},
    merchant:MERCHANT,
    name:title||`Amazon ${asin}`,
    productName:title||`Amazon ${asin}`,
    description:clean(item?.description)||'',
    sourceText:true,
    category,
    brand:brand||'',
    gtin:clean(item?.gtin)||'',
    mpn:clean(item?.mpn)||'',
    image:image||'',
    directUrl,
    affiliateUrl:null,
    price,
    currency,
    shippingCost:money(item?.shippingCost),
    inStock:inStock===true,
    availability:inStock===true?'IN_STOCK':inStock===false?'OUT_OF_STOCK':'UNKNOWN',
    active:false,
    testData:false,
    rawAttributes:{asin,marketplace:DEFAULT_MARKETPLACE,sourceAdapter:'amazon-foundation-v1'}
  };
}
function validateRow(row){
  const errors=[];
  if(!row)return ['item could not be normalized'];
  if(!validAsin(row.merchantVariantId))errors.push('invalid ASIN');
  if(!safeAmazonUrl(row.directUrl))errors.push(`${row.merchantVariantId}: invalid Amazon direct URL`);
  if(row.affiliateUrl!==null)errors.push(`${row.merchantVariantId}: affiliate URL must remain null until Amazon affiliate handoff is configured`);
  if(row.active!==false)errors.push(`${row.merchantVariantId}: Amazon foundation rows must remain inactive`);
  if(row.price!==null&&(!Number.isFinite(row.price)||row.price<0))errors.push(`${row.merchantVariantId}: invalid price`);
  return errors;
}
function normalizeItems(items,options={}){
  if(!Array.isArray(items))throw new TypeError('Amazon items must be an array');
  const rows=items.map(item=>normalizeItem(item,options)).filter(Boolean);
  const seen=new Set(),deduped=[];
  for(const row of rows){if(seen.has(row.merchantVariantId))continue;seen.add(row.merchantVariantId);deduped.push(row);}
  const errors=deduped.flatMap(validateRow);
  return {network:NETWORK,merchant:MERCHANT,marketplace:DEFAULT_MARKETPLACE,active:false,stats:{input:items.length,normalized:rows.length,unique:deduped.length,rejected:items.length-rows.length},errors,rows:deduped};
}

module.exports={NETWORK,MERCHANT,DEFAULT_MARKETPLACE,clean,money,validAsin,normalizeAsin,safeAmazonUrl,canonicalProductUrl,availability,normalizeItem,normalizeItems,validateRow};
