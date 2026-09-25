const fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto'),cp=require('child_process');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const catalog=path.resolve('development/catalog');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'fundblick-publication-'));
const source=path.join(tmp,'source'),target=path.join(tmp,'target');
fs.mkdirSync(path.join(source,'catalog'),{recursive:true});
fs.cpSync(catalog,path.join(source,'catalog'),{recursive:true});
const walk=(root,current=root,out=[])=>{for(const e of fs.readdirSync(current,{withFileTypes:true})){const p=path.join(current,e.name);if(e.isDirectory())walk(root,p,out);else out.push(path.relative(root,p).split(path.sep).join('/'))}return out.sort()};
const files=walk(path.join(source,'catalog')).map(rel=>{const b=fs.readFileSync(path.join(source,'catalog',...rel.split('/')));return {path:rel,bytes:b.length,sha256:sha(b)}});
const manifest=files.find(x=>x.path==='manifest.json');
const publicManifest=JSON.parse(fs.readFileSync(path.join(source,'catalog','manifest.json'),'utf8'));
const handoff={version:1,sourceCommit:'0'.repeat(40),itemCount:publicManifest.itemCount,fileCount:files.length,totalBytes:files.reduce((n,x)=>n+x.bytes,0),manifestSha256:manifest.sha256,files};
fs.writeFileSync(path.join(source,'publication-handoff.json'),JSON.stringify(handoff));
fs.mkdirSync(target,{recursive:true});fs.writeFileSync(path.join(target,'stale.json'),'stale');
cp.execFileSync(process.execPath,['development/apply-publication-handoff.js',source,target],{stdio:'pipe'});
const sourceFiles=walk(path.join(source,'catalog')),targetFiles=walk(target);
if(JSON.stringify(sourceFiles)!==JSON.stringify(targetFiles))throw new Error('applied catalog file list mismatch');
if(fs.existsSync(path.join(target,'stale.json')))throw new Error('stale catalog file survived atomic apply');
for(const rel of sourceFiles){
  const a=fs.readFileSync(path.join(source,'catalog',...rel.split('/'))),b=fs.readFileSync(path.join(target,...rel.split('/')));
  if(!a.equals(b))throw new Error('applied catalog bytes differ: '+rel);
}
const bad=JSON.parse(JSON.stringify(handoff));bad.files[0].path='../escape.json';
fs.writeFileSync(path.join(source,'publication-handoff.json'),JSON.stringify(bad));
let rejected=false;try{cp.execFileSync(process.execPath,['development/apply-publication-handoff.js',source,path.join(tmp,'bad-target')],{stdio:'pipe'})}catch{rejected=true}
if(!rejected)throw new Error('unsafe handoff path was not rejected');
fs.rmSync(tmp,{recursive:true,force:true});
console.log('FundBlick publication apply contract OK',JSON.stringify({files:files.length,itemCount:publicManifest.itemCount}));
