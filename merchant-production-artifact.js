'use strict';
const fs=require('node:fs'),path=require('node:path');
const {canonicalProductDigest}=require('./merchant-artifact-integrity.js');
function productionArtifactFor(key,registry){
 registry=registry||JSON.parse(fs.readFileSync('production-merchant-artifacts.json','utf8'));
 const contract=registry.merchants?.[key];
 if(registry.version!==1||!contract||!contract.source||!Number.isInteger(contract.productCount)||contract.productCount<1||!/^[a-f0-9]{64}$/.test(contract.artifactSha256||'')||!contract.identityPath||!contract.categoryCounts)throw new Error(`Missing pinned production artifact contract: ${key}`);
 return contract;
}
function identity(product,contract){return contract.identityPath.split('.').reduce((value,key)=>value?.[key],product);}
function assertProductionArtifact(key,products,source,registry){
 const contract=productionArtifactFor(key,registry);
 if(path.normalize(source)!==path.normalize(contract.source))throw new Error(`${key} production artifact source mismatch`);
 if(products.length!==contract.productCount)throw new Error(`${key} production artifact count mismatch`);
 if(canonicalProductDigest(products)!==contract.artifactSha256)throw new Error(`${key} production artifact digest mismatch`);
 const ids=products.map(p=>String(identity(p,contract)||''));
 if(ids.some(id=>!id)||new Set(ids).size!==products.length)throw new Error(`${key} production artifact contains duplicate/missing merchant product identities`);
 const categories=products.reduce((counts,p)=>(counts[p.category]=(counts[p.category]||0)+1,counts),{});
 if(JSON.stringify(Object.entries(categories).sort())!==JSON.stringify(Object.entries(contract.categoryCounts).sort()))throw new Error(`${key} production artifact category contract mismatch`);
 return contract;
}
module.exports={productionArtifactFor,assertProductionArtifact,identity};
