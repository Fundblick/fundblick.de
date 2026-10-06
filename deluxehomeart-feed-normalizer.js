'use strict';
const fs=require('node:fs');
const {parseCsv,readCsv}=require('./merchant-csv.js');
const {specificType}=require('./home-facet-classifier.js');
const ADVERTISER_ID='120411',PUBLISHER_ID='3106259',FEED_ID='110455',MERCHANT='Deluxehomeartshop DE';
const COLORS={'Rose':'Rosa','Rosa':'Rosa','Lyserød':'Hellrosa','Hvid':'Weiß','Sort':'Schwarz','Grå':'Grau','Støvet blå':'Verblasst Blau','Salvie Grøn':'Salbeigrün','Salviegrøn':'Salbeigrün','Isblå':'Eisblau','Kongeblå':'Königsblau','Karry':'Curry','Mint':'Minze','Cream':'Creme','Creme':'Creme','Bourgogne':'Burgunderrot','Lysegul':'Hellgelb','Lyslilla':'Helllila','Jade Grøn':'Jadegrün','Olivengrøn':'Olivgrün','Mørkelilla':'Dunkellila','Lys Karamel':'Hellkaramell','Sølv':'Silber','Elfenben':'Elfenbein','Rød':'Rot','Mørkegrå':'Dunkelgrau','Støvet grøn':'Verblasst Grün','Mørkegrøn':'Dunkelgrün','Støvet rød':'Verblasst Rot','Grøn':'Grün','Lysegrå':'Hellgrau','Blåbær blå':'Heidelbeerblau','Kobber':'Kupfer','Karamel':'Karamell'};
const clean=v=>String(v??'').trim();
function money(v){const text=clean(v);if(!/^\d+(?:[.,]\d{1,2})?$/.test(text))return null;const n=Number(text.replace(',','.'));return Number.isFinite(n)?n:null;}
function validDirect(value){try{const u=new URL(value);return u.protocol==='https:'&&['deluxehomeartshop.de','www.deluxehomeartshop.de'].includes(u.hostname)&&!u.username&&!u.password&&!u.port&&/^\/products\/[^/]+\/?$/.test(u.pathname);}catch{return false;}}
function validAffiliate(value,awinId){try{const u=new URL(value);return u.protocol==='https:'&&['www.awin1.com','awin1.com'].includes(u.hostname)&&!u.username&&!u.password&&!u.port&&u.pathname==='/pclick.php'&&u.searchParams.get('a')===PUBLISHER_ID&&u.searchParams.get('m')===ADVERTISER_ID&&(!awinId||u.searchParams.get('p')===awinId);}catch{return false;}}
function selectRows(rows){const advertiser=rows.filter(r=>String(r.merchant_id)===ADVERTISER_ID),preferred=advertiser.filter(r=>String(r.data_feed_id)===FEED_ID);return {advertiser,preferred,eligible:preferred};}
function categoryEvidence(row){
 const evidence=specificType({name:row.product_name,rawAttributes:{productType:row.product_type}});
 if(!evidence)throw new Error('Unclassified source product: '+row.merchant_product_id);
 return {category:'home.'+evidence.family,productType:evidence.type,family:evidence.family};
}
function normalizeRow(row){
 const id=clean(row.merchant_product_id),tax=categoryEvidence(row),color=clean(row.colour),facets={};
 if(color)facets.color=COLORS[color]||color;
 if(/Außenbereich|Draußen|Outdoor|Außenleuchte/i.test(row.product_name||''))facets.room='Garten / Außenbereich';
 const inStock=row.in_stock==='1'?true:row.in_stock==='0'?false:null;
 return {id:'awin-'+ADVERTISER_ID+'-'+id,productGroupId:'awin-'+ADVERTISER_ID+'-variant-'+id,merchantVariantId:id,source:{network:'awin',advertiserId:ADVERTISER_ID,feedIds:[FEED_ID]},merchant:MERCHANT,name:clean(row.product_name),description:clean(row.description),sourceText:true,category:tax.category,brand:clean(row.brand_name),gtin:'',mpn:'',image:clean(row.merchant_image_url),directUrl:clean(row.merchant_deep_link),affiliateUrl:clean(row.aw_deep_link),price:money(row.search_price),currency:clean(row.currency),shippingCost:money(row.delivery_cost),deliveryDays:null,inStock,availability:inStock===true?'IN_STOCK':inStock===false?'OUT_OF_STOCK':'UNKNOWN',active:row.is_for_sale!=='0',testData:false,rawAttributes:{productType:tax.productType,sourceProductType:clean(row.product_type),sourceColour:color,taxonomyFamily:tax.family,taxonomySource:'explicit-source-type-or-main-title',facets,dataFeedId:FEED_ID,awinProductId:clean(row.aw_product_id)}};
}
function normalize(rows){return selectRows(rows).eligible.map(normalizeRow);}
function validate(products){const errors=[],ids=new Set();for(const p of products){if(!/^\d+$/.test(p.merchantVariantId)||ids.has(p.id))errors.push(p.id+': invalid/duplicate identity');ids.add(p.id);if(!p.name||!p.brand)errors.push(p.id+': missing name/brand');if(!Number.isFinite(p.price)||p.price<=0||p.currency!=='EUR')errors.push(p.id+': invalid price/currency');if(!validDirect(p.directUrl)||!validAffiliate(p.affiliateUrl,p.rawAttributes.awinProductId))errors.push(p.id+': invalid original links');try{const u=new URL(p.image);if(u.protocol!=='https:'||u.hostname!=='cdn.shopify.com'||u.username||u.password||u.port)throw Error();}catch{errors.push(p.id+': invalid original image');}}return errors;}
function stats(products,selection){return {feedRows:selection?.advertiser.length??products.length,products:products.length,categories:products.reduce((a,p)=>(a[p.category]=(a[p.category]||0)+1,a),{}),brands:products.reduce((a,p)=>(a[p.brand]=(a[p.brand]||0)+1,a),{})};}
if(require.main===module){const [input,output]=process.argv.slice(2);if(!input)throw new Error('Usage: node deluxehomeart-feed-normalizer.js <feed.csv[.gz]> [output.json]');const rows=readCsv(input),products=normalize(rows),errors=validate(products);if(errors.length)throw new Error(errors.join('\n'));const payload=JSON.stringify({merchant:MERCHANT,advertiserId:ADVERTISER_ID,stats:stats(products,selectRows(rows)),products},null,2)+'\n';if(output)fs.writeFileSync(output,payload);else process.stdout.write(payload);}
module.exports={parseCsv,readCsv,selectRows,categoryEvidence,normalizeRow,normalize,validate,stats,validDirect,validAffiliate};
