'use strict';
const {readProductionSources}=require('./production-source-reader.js');

const products=readProductionSources();

const real=products.filter(p=>p&&p.active!==false&&p.testData===false&&Number(p.price)>0&&String(p.name||'').trim());
const groupKey=p=>String(p.productGroupId||p.id||'').trim();
const typeOf=p=>String(p?.rawAttributes?.productType||'').trim();

function summarize(keyFn){
  const map=new Map();
  for(const p of real){
    const key=keyFn(p); if(!key)continue;
    if(!map.has(key))map.set(key,{products:0,groups:new Set(),merchants:new Set(),categories:new Set()});
    const row=map.get(key); row.products++; row.groups.add(groupKey(p)); row.merchants.add(String(p.merchant||'')); row.categories.add(String(p.category||''));
  }
  return [...map.entries()].map(([key,row])=>({key,products:row.products,groups:row.groups.size,merchants:row.merchants.size,categories:[...row.categories].filter(Boolean)})).sort((a,b)=>b.groups-a.groups||b.products-a.products||a.key.localeCompare(b.key,'de'));
}

const categories=summarize(p=>String(p.category||'').trim());
const productTypes=summarize(typeOf);
const categoryCandidates=categories.filter(x=>x.groups>=10&&x.products>=10);
const typeCandidates=productTypes.filter(x=>x.groups>=8&&x.products>=8);

console.log(`SEO AUDIT real products: ${real.length}`);
console.log('\nCATEGORY COVERAGE');
for(const x of categories)console.log(`${x.key}\tproducts=${x.products}\tgroups=${x.groups}\tmerchants=${x.merchants}`);
console.log('\nPRODUCT TYPE COVERAGE');
for(const x of productTypes.slice(0,40))console.log(`${x.key}\tproducts=${x.products}\tgroups=${x.groups}\tmerchants=${x.merchants}\tcategories=${x.categories.join(',')}`);
console.log('\nINITIAL NON-THIN CANDIDATES');
for(const x of categoryCandidates)console.log(`category:${x.key}\tproducts=${x.products}\tgroups=${x.groups}`);
for(const x of typeCandidates)console.log(`type:${x.key}\tproducts=${x.products}\tgroups=${x.groups}`);

if(real.length<1400)throw new Error(`Unexpected production product count: ${real.length}`);
if(!categories.length)throw new Error('No production categories found');
