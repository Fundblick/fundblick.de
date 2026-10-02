'use strict';
const fs=require('node:fs'),path=require('node:path');
const approvals=JSON.parse(fs.readFileSync('production-merchant-approvals.json','utf8'));
if(approvals?.merchants?.amazgifts?.approved!==true){console.log('Amazgifts browser E2E not required while merchant is blocked');process.exit(0);}
const root=path.join('build','catalog');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
let p=null;
for(const meta of Object.values(manifest.shards||{})){
  const products=JSON.parse(fs.readFileSync(path.join(root,meta.file),'utf8'));
  p=products.find(x=>(x?.bestOffer?.merchant||x?.merchant)==='Amazgifts DE');
  if(p)break;
}
if(!p)throw new Error('Approved Amazgifts has no production product for browser E2E');
fs.writeFileSync('build/amazgifts-e2e-product.json',JSON.stringify({id:p.id,name:p.name,category:p.category})+'\n');
console.log('Amazgifts browser E2E fixture ready',p.id,p.name);
