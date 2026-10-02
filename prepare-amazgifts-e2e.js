'use strict';
const fs=require('node:fs');
const approvals=JSON.parse(fs.readFileSync('production-merchant-approvals.json','utf8'));
if(approvals?.merchants?.amazgifts?.approved!==true){console.log('Amazgifts browser E2E not required while merchant is blocked');process.exit(0);}
const catalog=JSON.parse(fs.readFileSync('build/catalog/products.json','utf8'));
const products=Array.isArray(catalog)?catalog:(catalog.products||[]);
const p=products.find(x=>(x?.bestOffer?.merchant||x?.merchant)==='Amazgifts DE');
if(!p)throw new Error('Approved Amazgifts has no production product for browser E2E');
fs.writeFileSync('build/amazgifts-e2e-product.json',JSON.stringify({id:p.id,name:p.name,category:p.category})+'\n');
console.log('Amazgifts browser E2E fixture ready',p.id,p.name);
