const fs=require('fs'),crypto=require('crypto'),path=require('path');
const root=path.join(__dirname,'catalog');
const fail=m=>{throw new Error(m)};
const read=p=>fs.readFileSync(path.join(root,p));
const json=p=>JSON.parse(read(p).toString('utf8'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const m=json('manifest.json');
if(m.version!==1||!Number.isInteger(m.itemCount)||m.itemCount<0)fail('invalid manifest');
const verify=(file,sha)=>{const b=read(file);if(hash(b)!==sha)fail('hash mismatch: '+file);return JSON.parse(b.toString('utf8'))};
const idx=verify(m.searchFile,m.searchIndexSha256);
const tax=verify(m.taxonomyFile,m.taxonomySha256);
const concepts=verify(m.searchConceptsFile,m.searchConceptsSha256);
if(!Array.isArray(idx)||idx.length!==m.itemCount)fail('index count mismatch');
if(!Array.isArray(tax)||!Array.isArray(concepts))fail('taxonomy/concepts invalid');
const cats=new Set(tax.map(x=>x.id)), cs=new Set(concepts.map(x=>x.concept));
const ids=new Set(), expected={};
for(const p of idx){if(!p||typeof p.i!=='string'||ids.has(p.i))fail('invalid/duplicate product id');ids.add(p.i);if(!cats.has(p.c))fail('unknown category: '+p.c);if(!Number.isInteger(p.s)||!m.shards[String(p.s)])fail('invalid shard ref: '+p.i);expected[p.s]=(expected[p.s]||0)+1;if(p.x&&!p.x.every(x=>cs.has(x)))fail('unknown concept: '+p.i);if(p.m&&(!Array.isArray(p.m)||!p.m.every(x=>/^[A-Z]{2}$/.test(x))))fail('invalid market: '+p.i)}
let total=0;
for(const [k,meta] of Object.entries(m.shards)){const data=verify(meta.file,meta.sha256),keys=Object.keys(data);if(keys.length!==meta.itemCount||keys.length!==(expected[k]||0))fail('shard count mismatch: '+k);for(const id of keys){const p=data[id],ip=idx.find(x=>x.i===id);if(!p||p.id!==id||!ip||String(ip.s)!==k||p.category!==ip.c)fail('shard/index mismatch: '+id)}total+=keys.length}
if(total!==m.itemCount||Object.keys(m.shards).length!==m.shardCount)fail('publication total mismatch');
console.log('FundBlick catalog integrity OK:',m.itemCount,'products,',m.shardCount,'shards');
