'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');

const files=[
  path.join('development','ahipos-products-1.json'),
  path.join('development','ahipos-products-2.json')
];
const rows=files.flatMap(file=>JSON.parse(fs.readFileSync(file,'utf8')));
const allowedCategories=new Set(['pet.equestrian','pet.dog','health.supplements']);
const forbiddenGeneratedFields=['generatedDescription','marketingCopy','healthClaim','benefitClaim','translatedDescription'];

assert.equal(rows.length,31,'expected 31 normalized AHIPOS variants');
assert.equal(new Set(rows.map(r=>String(r.id))).size,31,'variant ids must be unique');
assert.equal(new Set(rows.map(r=>String(r.merchantVariantId))).size,31,'merchant variant ids must be unique');
assert.equal(new Set(rows.map(r=>String(r.productGroupId))).size,25,'expected 25 product groups');

for(const row of rows){
  assert.equal(row.merchant,'Ahipos Horses DE',`${row.id}: merchant mismatch`);
  assert.equal(row.source?.network,'awin',`${row.id}: network provenance missing`);
  assert.equal(row.source?.advertiserId,'120341',`${row.id}: advertiser provenance missing`);
  assert.equal(row.sourceText,true,`${row.id}: source-text provenance missing`);
  assert(allowedCategories.has(row.category),`${row.id}: unsupported category ${row.category}`);
  assert(Number.isFinite(Number(row.price))&&Number(row.price)>0,`${row.id}: invalid price`);
  assert.equal(row.currency,'EUR',`${row.id}: currency must be EUR`);
  assert(/^https:\/\//.test(String(row.image||'')),`${row.id}: image must use https`);
  assert(/awin1\.com/i.test(String(row.affiliateUrl||'')),`${row.id}: affiliate url must be Awin`);
  assert(/ahipos-horses\.de/i.test(String(row.directUrl||'')),`${row.id}: direct url must be AHIPOS`);
  assert.notEqual(row.affiliateUrl,row.directUrl,`${row.id}: affiliate/direct collision`);
  assert(['IN_STOCK','OUT_OF_STOCK'].includes(row.availability),`${row.id}: invalid availability`);
  assert.equal(row.inStock,row.availability==='IN_STOCK',`${row.id}: stock flags disagree`);
  for(const field of forbiddenGeneratedFields)assert(!(field in row)&&!(field in (row.rawAttributes||{})),`${row.id}: forbidden generated claim field ${field}`);
  // Merchant descriptions may be omitted in the public development fixture, but never fabricated.
  if(row.description)assert.equal(row.sourceText,true,`${row.id}: description without merchant provenance`);
}

const counts={
  equestrian:rows.filter(r=>r.category==='pet.equestrian').length,
  dog:rows.filter(r=>r.category==='pet.dog').length,
  human:rows.filter(r=>r.category==='health.supplements').length,
  inStock:rows.filter(r=>r.inStock).length,
  outOfStock:rows.filter(r=>!r.inStock).length,
  freeShippingKnown:rows.filter(r=>r.shippingCost===0).length,
  shippingUnknown:rows.filter(r=>r.shippingCost==null).length,
  missingImages:rows.filter(r=>!r.image).length,
  missingAffiliateLinks:rows.filter(r=>!r.affiliateUrl).length,
  missingDirectLinks:rows.filter(r=>!r.directUrl).length
};

assert.deepEqual(counts,{equestrian:29,dog:1,human:1,inStock:26,outOfStock:5,freeShippingKnown:28,shippingUnknown:3,missingImages:0,missingAffiliateLinks:0,missingDirectLinks:0});

const conflicts=rows.filter(r=>r.rawAttributes?.availabilityConflict);
assert.equal(conflicts.length,2,'expected two source availability conflicts');
assert(conflicts.every(r=>!r.inStock),'availability conflicts must remain conservatively OUT_OF_STOCK');

console.log('AHIPOS_DATA_QUALITY_GREEN',JSON.stringify(counts));
