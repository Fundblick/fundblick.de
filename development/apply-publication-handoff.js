const fs=require('fs');
const path=require('path');
const crypto=require('crypto');

const sha256=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
const posix=value=>String(value||'').split(path.sep).join('/');

function safeRelative(value){
  const normalized=path.posix.normalize(String(value||''));
  if(!normalized||normalized==='.'||normalized.startsWith('/')||normalized==='..'||normalized.startsWith('../'))throw new Error('Unsafe handoff path: '+value);
  return normalized;
}
function listFiles(root,current=root,out=[]){
  if(!fs.existsSync(root))return out;
  for(const entry of fs.readdirSync(current,{withFileTypes:true})){
    const full=path.join(current,entry.name);
    if(entry.isDirectory())listFiles(root,full,out);
    else if(entry.isFile())out.push(posix(path.relative(root,full)));
  }
  return out.sort();
}
function validateHandoff(sourceRoot){
  const handoffPath=path.join(sourceRoot,'publication-handoff.json');
  const catalogRoot=path.join(sourceRoot,'catalog');
  if(!fs.existsSync(handoffPath)||!fs.existsSync(catalogRoot))throw new Error('Publication source incomplete');
  const handoff=JSON.parse(fs.readFileSync(handoffPath,'utf8'));
  if(handoff.version!==1||!Array.isArray(handoff.files)||!Number.isInteger(handoff.fileCount)||handoff.fileCount!==handoff.files.length)throw new Error('Invalid publication handoff');
  if(handoff.sourceCommit!==null&&!/^[a-f0-9]{40}$/.test(String(handoff.sourceCommit||'')))throw new Error('Invalid source commit');
  const actual=listFiles(catalogRoot),declared=handoff.files.map(file=>safeRelative(file.path));
  if(JSON.stringify(actual)!==JSON.stringify(declared))throw new Error('Catalog file list differs from handoff');
  let total=0;
  for(let i=0;i<handoff.files.length;i++){
    const entry=handoff.files[i],rel=declared[i],buffer=fs.readFileSync(path.join(catalogRoot,...rel.split('/')));
    total+=buffer.length;
    if(entry.bytes!==buffer.length||entry.sha256!==sha256(buffer))throw new Error('Catalog integrity mismatch: '+rel);
  }
  if(total!==handoff.totalBytes)throw new Error('Catalog total byte count mismatch');
  const manifest=handoff.files.find(file=>file.path==='manifest.json');
  if(!manifest||manifest.sha256!==handoff.manifestSha256)throw new Error('Catalog manifest hash mismatch');
  return {handoff,catalogRoot};
}
function applyPublication(sourceRoot,targetCatalog){
  const source=path.resolve(sourceRoot),target=path.resolve(targetCatalog);
  if(source===target||source.startsWith(target+path.sep)||target.startsWith(source+path.sep))throw new Error('Source and target must not overlap');
  const {handoff,catalogRoot}=validateHandoff(source);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  const stamp=process.pid+'-'+Date.now(),next=target+'.next-'+stamp,previous=target+'.previous-'+stamp;
  fs.rmSync(next,{recursive:true,force:true});fs.rmSync(previous,{recursive:true,force:true});
  fs.mkdirSync(next,{recursive:true});
  try{
    for(const entry of handoff.files){
      const rel=safeRelative(entry.path),src=path.join(catalogRoot,...rel.split('/')),dest=path.join(next,...rel.split('/'));
      fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(src,dest);
    }
    const copied=listFiles(next);
    if(JSON.stringify(copied)!==JSON.stringify(handoff.files.map(x=>x.path)))throw new Error('Copied catalog file list mismatch');
    if(fs.existsSync(target))fs.renameSync(target,previous);
    fs.renameSync(next,target);
    fs.rmSync(previous,{recursive:true,force:true});
  }catch(error){
    fs.rmSync(next,{recursive:true,force:true});
    if(!fs.existsSync(target)&&fs.existsSync(previous))fs.renameSync(previous,target);
    throw error;
  }
  return {sourceCommit:handoff.sourceCommit,itemCount:handoff.itemCount,fileCount:handoff.fileCount,totalBytes:handoff.totalBytes};
}
if(require.main===module){
  const source=process.argv[2],target=process.argv[3];
  if(!source||!target)throw new Error('Usage: node apply-publication-handoff.js <source-root> <target-catalog>');
  console.log(JSON.stringify(applyPublication(source,target)));
}
module.exports={validateHandoff,applyPublication};
