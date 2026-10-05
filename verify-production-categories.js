'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {productionArtifactFor}=require('./merchant-production-artifact.js');

const root=process.argv[2]||path.join('build','catalog');
const file=path.join(root,'categories.json');
if(!fs.existsSync(file))throw new Error('Missing production categories.json');
const payload=JSON.parse(fs.readFileSync(file,'utf8'));
if(payload?.version!==1||!Array.isArray(payload.categories))throw new Error('Invalid production category manifest');
const counts=new Map(payload.categories.map(item=>[String(item?.id||''),Number(item?.count)||0]));
const approvals=JSON.parse(fs.readFileSync('production-merchant-approvals.json','utf8'));
const expected=new Map([
  ['pet.equestrian',29],
  ['pet.dog',1],
  ['health.supplements',1],
  ['home.garden.robot-mowers',33],
  ['home.garden.robot-mower-accessories',23]
]);
if(approvals?.merchants?.blazevideo?.approved===true){for(const [category,count] of Object.entries(productionArtifactFor('blazevideo').categoryCounts))expected.set(category,count);}
if(approvals?.merchants?.amazgifts?.approved===true){
  for(const [category,count] of Object.entries(productionArtifactFor('amazgifts').categoryCounts))expected.set(category,count);
}
for(const [id,count] of expected){
  if(counts.get(id)!==count)throw new Error(`Expected ${id}=${count}, got ${counts.get(id)??'missing'}`);
}
const homeTotal=['home.living','home.furniture','home.lighting','home.decor'].reduce((sum,id)=>sum+(counts.get(id)||0),0);
if(homeTotal!==1428)throw new Error(`Expected Casa Moro home category total 1428, got ${homeTotal}`);
const anthbotTotal=['home.garden.robot-mowers','home.garden.robot-mower-accessories'].reduce((sum,id)=>sum+(counts.get(id)||0),0);
if(anthbotTotal!==56)throw new Error(`Expected ANTHBOT category total 56, got ${anthbotTotal}`);
const total=[...counts.values()].reduce((sum,count)=>sum+count,0);
const expectedTotal=1515+(approvals?.merchants?.blazevideo?.approved===true?productionArtifactFor('blazevideo').productCount:0)+(approvals?.merchants?.amazgifts?.approved===true?productionArtifactFor('amazgifts').productCount:0);
if(total!==expectedTotal)throw new Error(`Expected category total ${expectedTotal}, got ${total}`);
console.log(`Production category gate OK: ${payload.categories.length} categories, total ${total}`);
