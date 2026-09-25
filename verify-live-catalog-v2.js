'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');

const root=process.argv[2]||path.join('build','catalog');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
assert.equal(manifest.version,2);
assert.ok(manifest.itemCount>=15,'catalog unexpectedly small');
assert.ok(manifest.shardCount>=2,'catalog should exercise multiple shards');
assert.ok(manifest.searchFile&&!manifest.searchFile.includes('development/'));
const index=JSON.parse(fs.readFileSync(path.join(root,manifest.searchFile),'utf8'));
assert.equal(index.length,manifest.itemCount);
const seen=new Set();let counted=0;
for(const [key,meta] of Object.entries(manifest.shards)){
  assert.equal(Number(key)>=0,true);
  const payload=JSON.parse(fs.readFileSync(path.join(root,meta.file),'utf8'));
  assert.ok(Array.isArray(payload));
  assert.equal(payload.length,meta.itemCount);
  counted+=payload.length;
  for(const product of payload){assert.ok(product.id&&product.name);assert.ok(!seen.has(product.id),`duplicate ${product.id}`);seen.add(product.id);}
}
assert.equal(counted,manifest.itemCount);
for(const row of index){assert.ok(seen.has(row.i),`index points to missing ${row.i}`);assert.ok(manifest.shards[String(row.s)],`invalid shard ${row.s}`);assert.ok(row.q.length>0);}
for(const expected of ['electronics.audio.headphones','electronics.televisions','fashion.shoes','electronics.smartphones','tools.heat-guns','home.kitchen.coffee-machines'])assert.ok(index.some(row=>row.c.includes(expected)),`missing category ${expected}`);
console.log('live catalog v2 verification passed');
