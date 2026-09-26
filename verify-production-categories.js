'use strict';
const fs=require('node:fs');
const path=require('node:path');

const root=process.argv[2]||path.join('build','catalog');
const file=path.join(root,'categories.json');
if(!fs.existsSync(file))throw new Error('Missing production categories.json');
const payload=JSON.parse(fs.readFileSync(file,'utf8'));
if(payload?.version!==1||!Array.isArray(payload.categories))throw new Error('Invalid production category manifest');
const counts=new Map(payload.categories.map(item=>[String(item?.id||''),Number(item?.count)||0]));
const expected=new Map([
  ['pet.equestrian',29],
  ['pet.dog',1],
  ['health.supplements',1]
]);
for(const [id,count] of expected){
  if(counts.get(id)!==count)throw new Error(`Expected ${id}=${count}, got ${counts.get(id)??'missing'}`);
}
const homeTotal=['home.living','home.furniture','home.lighting','home.decor'].reduce((sum,id)=>sum+(counts.get(id)||0),0);
if(homeTotal!==1428)throw new Error(`Expected Casa Moro home category total 1428, got ${homeTotal}`);
const total=[...counts.values()].reduce((sum,count)=>sum+count,0);
if(total!==1459)throw new Error(`Expected category total 1459, got ${total}`);
console.log(`Production category gate OK: ${payload.categories.length} categories, total ${total}`);