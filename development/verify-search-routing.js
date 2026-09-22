const fs=require('fs'),crypto=require('crypto'),path=require('path');
const root=path.join(__dirname,'catalog');
const fail=m=>{throw new Error(m)};
const read=p=>fs.readFileSync(path.join(root,p));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const termHash=t=>crypto.createHash('sha256').update(String(t)).digest('hex').slice(0,16);
const fileFor=sha=>'search/'+sha.slice(0,12)+'.json';
const load=(file,sha)=>{const b=read(file);if(hash(b)!==sha)fail('hash mismatch: '+file);return {bytes:b.length,json:JSON.parse(b.toString('utf8'))}};
const m=JSON.parse(read('manifest.json').toString('utf8'));
const meta=m.searchRouting;
if(!meta||meta.version!==2||typeof meta.file!=='string'||!/^[a-f0-9]{64}$/.test(meta.sha256)||!Number.isInteger(meta.bytes))fail('invalid search routing metadata');
const loaded=load(meta.file,meta.sha256);
if(loaded.bytes!==meta.bytes)fail('search routing byte mismatch');
const r=loaded.json;
if(r.v!==2||!Number.isInteger(r.pageSize)||r.pageSize<10||!Number.isInteger(r.rareBucketCount)||r.rareBucketCount<16||!r.common||typeof r.common!=='object'||!Array.isArray(r.rare)||r.rare.length!==r.rareBucketCount)fail('invalid routing root');
const shaOk=s=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s);
let pages=0,rareBuckets=0;
for(const [key,manifestSha] of Object.entries(r.common)){
  if(!/^[a-f0-9]{16}$/.test(key)||!shaOk(manifestSha))fail('invalid common route');
  const tm=load(fileFor(manifestSha),manifestSha).json;
  if(!Array.isArray(tm.p)||!tm.p.length)fail('invalid common term manifest');
  let term=null;
  tm.p.forEach((pageSha,index)=>{
    if(!shaOk(pageSha))fail('invalid page hash');
    const page=load(fileFor(pageSha),pageSha).json;
    if(page.p!==index||!Array.isArray(page.items)||typeof page.t!=='string')fail('invalid common page');
    if(term===null)term=page.t; else if(page.t!==term)fail('mixed common term pages');
    pages++;
  });
  if(termHash(term)!==key)fail('common term hash mismatch');
}
r.rare.forEach((bucketSha,bucketIndex)=>{
  if(bucketSha===null)return;
  if(!shaOk(bucketSha))fail('invalid rare bucket hash');
  const bucket=load(fileFor(bucketSha),bucketSha).json;
  if(!bucket||Array.isArray(bucket)||typeof bucket!=='object')fail('invalid rare bucket');
  for(const [term,items] of Object.entries(bucket)){
    if(!Array.isArray(items))fail('invalid rare postings');
    const expected=parseInt(termHash(term).slice(0,8),16)%r.rareBucketCount;
    if(expected!==bucketIndex)fail('rare term routed to wrong bucket: '+term);
  }
  rareBuckets++;
});
console.log('FundBlick shadow search routing OK:',JSON.stringify({rootBytes:loaded.bytes,commonTerms:Object.keys(r.common).length,pages,rareBuckets}));
