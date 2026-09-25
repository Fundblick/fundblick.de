const fs=require('fs'),crypto=require('crypto'),path=require('path');
const root=path.join(__dirname,'catalog');
const read=p=>fs.readFileSync(path.join(root,p));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const json=p=>JSON.parse(read(p).toString('utf8'));
const m=json('manifest.json');
if(!m.substringRouting||m.substringRouting.version!==1)throw new Error('substring routing metadata missing');
if(typeof m.substringRouting.sha256!=='string'||!/^[a-f0-9]{64}$/.test(m.substringRouting.sha256))throw new Error('invalid substring root hash');
if(m.substringRouting.file!=='substring/'+m.substringRouting.sha256.slice(0,12)+'.json')throw new Error('invalid substring root file');
const rootBytes=read(m.substringRouting.file);
if(hash(rootBytes)!==m.substringRouting.sha256)throw new Error('substring root hash mismatch');
if(rootBytes.length!==m.substringRouting.bytes)throw new Error('substring root byte mismatch');
const r=JSON.parse(rootBytes.toString('utf8'));
if(r.v!==1||!Number.isInteger(r.b)||r.b<16||!Number.isInteger(r.s)||r.s<32||!Array.isArray(r.d)||r.d.length!==r.b)throw new Error('substring root invalid');
const fileFor=sha=>'substring/'+sha.slice(0,12)+'.json';
const verify=sha=>{
  if(typeof sha!=='string'||!/^[a-f0-9]{64}$/.test(sha))throw new Error('invalid substring hash');
  const p=fileFor(sha),b=read(p);
  if(hash(b)!==sha)throw new Error('substring file hash mismatch: '+p);
  return JSON.parse(b.toString('utf8'));
};
for(const directorySha of r.d){
  if(directorySha===null)continue;
  const directory=verify(directorySha);
  if(!directory||Array.isArray(directory)||typeof directory!=='object')throw new Error('substring directory invalid');
  for(const [gram,entry] of Object.entries(directory)){
    if(Array.isArray(entry?.r))continue;
    if(!entry||!Number.isInteger(entry.n)||!Array.isArray(entry.p)||!entry.p.length)throw new Error('substring route invalid: '+gram);
    for(const pageSha of entry.p){
      const page=verify(pageSha);
      if(page.g!==gram||!Array.isArray(page.v))throw new Error('substring page mismatch: '+gram);
    }
  }
}
const verification=verify(r.c);
if(!verification||!Array.isArray(verification.p))throw new Error('substring verification manifest invalid');
for(const pageSha of verification.p){
  const page=verify(pageSha);
  if(!Array.isArray(page))throw new Error('substring verification page invalid');
}
console.log('FundBlick substring routing integrity OK',JSON.stringify({rootBytes:rootBytes.length,directories:r.d.filter(Boolean).length,verificationPages:verification.p.length}));
