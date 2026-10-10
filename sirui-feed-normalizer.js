'use strict';
const fs=require('node:fs');
const {parseCsv,readCsv}=require('./merchant-csv.js');
const {classify}=require('./photography-product-classifier.js');
const ADVERTISER_ID='128645',PUBLISHER_ID='3106259',FEED_ID='F4133';
const clean=v=>String(v??'').trim();
function money(value){const m=clean(value).match(/^(\d+(?:\.\d{1,2})?) EUR$/);return m?Number(m[1]):null;}
function validDirect(value,id){try{const u=new URL(value);return u.protocol==='https:'&&['siruishop.de','www.siruishop.de'].includes(u.hostname)&&!u.username&&!u.password&&!u.port&&/^\/products\/[^/]+\/?$/.test(u.pathname)&&u.searchParams.getAll('variant').length===1&&u.searchParams.get('variant')===id;}catch{return false;}}
function validAffiliate(value,direct){try{const u=new URL(value);return u.protocol==='https:'&&['www.awin1.com','awin1.com'].includes(u.hostname)&&!u.username&&!u.password&&!u.port&&u.pathname==='/cread.php'&&['awinmid','awinaffid','ued'].every(k=>u.searchParams.getAll(k).length===1)&&u.searchParams.get('awinmid')===ADVERTISER_ID&&u.searchParams.get('awinaffid')===PUBLISHER_ID&&u.searchParams.get('ued')===direct;}catch{return false;}}
function description(value){if(/[{}]/.test(String(value||'')))return '';return clean(value).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();}
function categoryEvidence(row){return classify(row.title,row.product_type);}
function selectRows(rows){const advertiser=rows.filter(r=>r.advertiser_id===ADVERTISER_ID);return {advertiser,preferred:advertiser,eligible:advertiser};}
function normalizeRow(r){
 const bStock=/\bB-WARE\b/i.test(r.title||''),condition=bStock?'b-stock':clean(r.condition);
 const id=clean(r.id),tax=categoryEvidence(r),inStock=r.availability==='in_stock'?true:r.availability==='out_of_stock'?false:null;
 // Sale prices apply only within their explicit validity interval; otherwise retain price.
 let price=money(r.price);if(r.sale_price&&!r.sale_price_effective_date)price=money(r.sale_price)??price;
 return {id:'awin-'+ADVERTISER_ID+'-'+id,productGroupId:'awin-'+ADVERTISER_ID+'-variant-'+id,merchantVariantId:id,source:{network:'awin',advertiserId:ADVERTISER_ID,feedIds:[FEED_ID]},merchant:'SIRUI DE',name:clean(r.title),description:description(r.description),sourceText:true,category:tax?.category||null,brand:clean(r.brand),gtin:clean(r.gtin),mpn:clean(r.mpn),image:clean(r.image_link),directUrl:clean(r.link),affiliateUrl:clean(r.aw_deep_link),price,currency:'EUR',shippingCost:null,deliveryDays:null,inStock,availability:inStock===true?'IN_STOCK':inStock===false?'OUT_OF_STOCK':'UNKNOWN',active:inStock!==null,testData:false,rawAttributes:{productType:tax?.productType||'',sourceProductType:clean(r.product_type),taxonomyFamily:'photography',taxonomySource:'main-title-or-verified-source-type',facets:{...(r.color?{color:r.color}:{}),...(r.size?{size:r.size}:{}),...(condition?{condition:bStock?'B-Ware':condition}:{})},condition,feedCondition:clean(r.condition),sourceItemGroupId:clean(r.item_group_id),dataFeedId:FEED_ID}};
}
function normalize(rows){return selectRows(rows).eligible.map(normalizeRow);}
function validate(products){const errors=[],ids=new Set();for(const p of products){if(!/^\d+$/.test(p.merchantVariantId)||ids.has(p.id))errors.push(p.id+': invalid/duplicate identity');ids.add(p.id);if(!p.name||!p.brand)errors.push(p.id+': missing title/brand');if(!Number.isFinite(p.price)||p.price<=0)errors.push(p.id+': invalid EUR price');if(!validDirect(p.directUrl,p.merchantVariantId)||!validAffiliate(p.affiliateUrl,p.directUrl))errors.push(p.id+': invalid original links');try{const u=new URL(p.image);if(u.protocol!=='https:'||u.hostname!=='cdn.shopify.com'||u.username||u.password||u.port)throw Error();}catch{errors.push(p.id+': invalid image');}}return errors;}
if(require.main===module){const [input,output]=process.argv.slice(2),products=normalize(readCsv(input)),errors=validate(products);if(errors.length)throw Error(errors.join('\n'));fs.writeFileSync(output,JSON.stringify(products)+'\n');console.log(JSON.stringify({products:products.length,inStock:products.filter(p=>p.inStock).length,unclassified:products.filter(p=>!p.category).length}));}
function verifiedCategory(p,r){return classify(p.name,r.sourceProductType);}
module.exports={verifiedCategory,parseCsv,readCsv,selectRows,normalizeRow,normalize,validate,categoryEvidence,validDirect,validAffiliate};
