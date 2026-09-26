'use strict';
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const zlib=require('node:zlib');
const assert=require('node:assert/strict');
const normalizer=require('./ahipos-feed-normalizer.js');

const fixturePath=process.argv[2]||path.join(__dirname,'tests','fixtures','ahipos-feed-fixture.json');
const compact=JSON.parse(fs.readFileSync(fixturePath,'utf8'));
const generic=compact.generic.map(([id,productPath,price,inStock],i)=>({
  merchant_product_id:id,product_name:`AHIPOS source product ${id}`,description:`source-description-${id}`,
  search_price:price,currency:'EUR',in_stock:inStock,stock_quantity:inStock==='1'?'10':'0',
  merchant_deep_link:`https://ahipos-horses.de${productPath}?variant=${id}`,
  aw_deep_link:`https://www.awin1.com/pclick.php?p=g${i+1}&m=120341`,merchant_image_url:`https://cdn.example.test/g/${id}.jpg`,
  merchant_category:'Sporting Goods, Outdoor Recreation, Equestrian, Horse Care, Horse Vitamins & Supplements'
}));
const retail=compact.retail.map(([id,productPath,price,availability],i)=>({
  id,title:`AHIPOS source variant ${id}`,description:`source-description-${id}`,price,availability,
  link:`https://ahipos-horses.de${productPath}?variant=${id}`,
  aw_deep_link:`https://www.awin1.com/cread.php?awinmid=120341&p=r${i+1}`,image_link:`https://cdn.example.test/r/${id}.jpg`,
  brand:'ahipos-horses',gtin:`fixture-${id}`,mpn:'',google_product_category:'Sporting Goods > Outdoor Recreation > Equestrian > Horse Care > Horse Vitamins & Supplements'
}));

function csv(rows){
  const headers=[...new Set(rows.flatMap(r=>Object.keys(r)))];
  const q=v=>{const s=String(v??'');return /[",\n\r]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;};
  return [headers.join(','),...rows.map(r=>headers.map(h=>q(r[h])).join(','))].join('\n')+'\n';
}
function gzTemp(name,rows){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fundblick-ahipos-'));const file=path.join(dir,name+'.csv.gz');fs.writeFileSync(file,zlib.gzipSync(Buffer.from(csv(rows),'utf8')));return file;}

const genericRows=normalizer.readCsv(gzTemp('generic',generic));
const retailRows=normalizer.readCsv(gzTemp('retail',retail));
assert.equal(genericRows.length,28,'generic row count');
assert.equal(retailRows.length,29,'retail row count');
const result=normalizer.normalizeFeeds(genericRows,retailRows);
assert.deepEqual(result.stats,{genericRows:28,retailRows:29,overlap:26,uniqueVariants:31,productGroups:25,availabilityConflicts:2,priceConflicts:0});
assert.equal(normalizer.validate(result).length,0,'normalizer validation must be green');
assert.equal(new Set(result.variants.map(v=>v.merchantVariantId)).size,31,'variant IDs must be unique');
assert.equal(result.products.length,25,'product path grouping must stay stable');
assert(result.products.every(p=>p.category==='pet.equestrian'),'must not reuse Casa-Moro family as fallback');
assert(result.variants.every(v=>v.affiliateUrl!==v.directUrl),'affiliate/direct links must remain distinct');
assert(result.variants.every(v=>v.affiliateUrl.includes('awin1.com')),'affiliate links must remain Awin links');
assert(result.variants.every(v=>v.directUrl.includes('ahipos-horses.de')),'direct links must remain merchant links');
const conflicts=result.variants.filter(v=>v.quality.availabilityConflict);
assert.deepEqual(conflicts.map(v=>v.merchantVariantId).sort(),['54828307906883','54828325568835']);
assert(conflicts.every(v=>v.availability==='OUT_OF_STOCK'&&!v.purchasable),'availability conflicts must resolve conservatively');
const overlapIds=new Set(generic.map(x=>x.merchant_product_id).filter(id=>retail.some(y=>y.id===id)));
for(const id of overlapIds){const a=generic.find(x=>x.merchant_product_id===id),b=retail.find(x=>x.id===id);assert.equal(normalizer.money(a.search_price),normalizer.money(b.price),`${id}: source prices must match`);}
for(const row of generic.slice(0,5)){const v=result.variants.find(x=>x.merchantVariantId===row.merchant_product_id);assert.equal(v.description,row.description,`${row.merchant_product_id}: source description must be preserved`);}
assert(!JSON.stringify(compact).includes('awinaffid='),'fixture must not contain publisher affiliate credentials');
console.log('AHIPOS_NORMALIZER_GATE_GREEN',JSON.stringify(result.stats));
