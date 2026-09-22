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
for(const p of idx){if(!p||typeof p.i!=='string'||ids.has(p.i))fail('invalid/duplicate product id');ids.add(p.i);if(!cats.has(p.c))fail('unknown category: '+p.c);if(!Number.isInteger(p.s)||!m.shards[String(p.s)])fail('invalid shard ref: '+p.i);expected[p.s]=(expected[p.s]||0)+1;if(p.x&&!p.x.every(x=>cs.has(x)))fail('unknown concept: '+p.i);if(p.m&&(!Array.isArray(p.m)||!p.m.every(x=>/^[A-Z]{2}$/.test(x))))fail('invalid market: '+p.i);if(p.t&&(!Array.isArray(p.t)||!p.t.every(x=>/^[A-Z]{2}$/.test(x))||new Set(p.t).size!==p.t.length))fail('invalid delivery countries: '+p.i);if(p.w!==undefined&&p.w!==1)fail('invalid unknown-shipping flag: '+p.i);if(p.d!==undefined){if(!p.d||Array.isArray(p.d)||typeof p.d!=='object')fail('invalid delivery prices: '+p.i);for(const [country,price] of Object.entries(p.d)){if(!/^[A-Z]{2}$/.test(country)||!price||!Number.isFinite(price.p)||price.p<0||typeof price.u!=='string'||!/^[A-Z]{3}$/.test(price.u))fail('invalid delivery price: '+p.i+' '+country)}}if(p.g!==undefined){if(typeof p.g!=='string')fail('invalid image url: '+p.i);let u;try{u=new URL(p.g)}catch{fail('invalid image url: '+p.i)}if(!/^https?:$/.test(u.protocol)||u.hostname.toLowerCase()==='example.com')fail('unsafe/test image url: '+p.i)}}
let total=0;
const countryCode=v=>{const x=String(v||'').trim().toUpperCase();return /^[A-Z]{2}$/.test(x)?x:null};
for(const [k,meta] of Object.entries(m.shards)){const data=verify(meta.file,meta.sha256),keys=Object.keys(data);if(keys.length!==meta.itemCount||keys.length!==(expected[k]||0))fail('shard count mismatch: '+k);for(const id of keys){const p=data[id],ip=idx.find(x=>x.i===id);if(!p||p.id!==id||!ip||String(ip.s)!==k||p.category!==ip.c)fail('shard/index mismatch: '+id);if((ip.g||'')!==(p.imageUrl||''))fail('image index/shard mismatch: '+id);const offers=(p.variants||[]).flatMap(v=>v.offers||[]).filter(o=>o&&o.purchasable),known=new Set();let unknown=false;for(const offer of offers){const explicit=Array.isArray(offer.shipsTo)?offer.shipsTo.map(countryCode).filter(Boolean):[];if(explicit.length)explicit.forEach(x=>known.add(x));else{const market=countryCode(offer.market);if(market)known.add(market);unknown=true}}const actual=[...(ip.t||[])].sort(),wanted=[...known].sort();if(JSON.stringify(actual)!==JSON.stringify(wanted))fail('delivery countries index/shard mismatch: '+id);if(Boolean(ip.w)!==unknown)fail('unknown shipping index/shard mismatch: '+id);for(const country of Object.keys(ip.d||{}))if(!known.has(country))fail('delivery price outside known countries: '+id+' '+country)}total+=keys.length}
if(total!==m.itemCount||Object.keys(m.shards).length!==m.shardCount)fail('publication total mismatch');
console.log('FundBlick catalog integrity OK:',m.itemCount,'products,',m.shardCount,'shards');
