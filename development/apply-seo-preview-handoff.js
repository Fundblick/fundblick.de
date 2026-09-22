const fs=require('fs');
const path=require('path');
const crypto=require('crypto');

const sha256=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
const posix=value=>String(value||'').split(path.sep).join('/');

function safeRelative(value){
  const normalized=path.posix.normalize(String(value||''));
  if(!normalized||normalized==='.'||normalized.startsWith('/')||normalized==='..'||normalized.startsWith('../'))throw new Error('Unsafe SEO handoff path: '+value);
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
function validateSeoHandoff(sourceRoot){
  const handoffPath=path.join(sourceRoot,'seo-preview-handoff.json');
  const previewRoot=path.join(sourceRoot,'seo-preview');
  if(!fs.existsSync(handoffPath)||!fs.existsSync(previewRoot))throw new Error('SEO preview source incomplete');
  const handoff=JSON.parse(fs.readFileSync(handoffPath,'utf8'));
  if(handoff.version!==1||!Array.isArray(handoff.files)||!Number.isInteger(handoff.fileCount)||handoff.fileCount!==handoff.files.length)throw new Error('Invalid SEO preview handoff');
  if(handoff.sourceCommit!==null&&!/^[a-f0-9]{40}$/.test(String(handoff.sourceCommit||'')))throw new Error('Invalid SEO source commit');
  if(!Number.isInteger(handoff.pageCount)||handoff.pageCount<0||!Number.isInteger(handoff.localeCount)||handoff.localeCount<1)throw new Error('Invalid SEO preview counts');
  const actual=listFiles(previewRoot),declared=handoff.files.map(file=>safeRelative(file.path));
  if(JSON.stringify(actual)!==JSON.stringify(declared))throw new Error('SEO preview file list differs from handoff');
  let total=0;
  for(let i=0;i<handoff.files.length;i++){
    const entry=handoff.files[i],rel=declared[i],buffer=fs.readFileSync(path.join(previewRoot,...rel.split('/')));
    total+=buffer.length;
    if(entry.bytes!==buffer.length||entry.sha256!==sha256(buffer))throw new Error('SEO preview integrity mismatch: '+rel);
  }
  if(total!==handoff.totalBytes)throw new Error('SEO preview total byte count mismatch');
  const manifestEntry=handoff.files.find(file=>file.path==='manifest.json');
  if(!manifestEntry||manifestEntry.sha256!==handoff.manifestSha256)throw new Error('SEO preview manifest hash mismatch');
  const manifest=JSON.parse(fs.readFileSync(path.join(previewRoot,'manifest.json'),'utf8'));
  if(manifest.version!==1||manifest.indexable!==false)throw new Error('Development SEO preview must stay noindex');
  if(manifest.pageCount!==handoff.pageCount||manifest.localeCount!==handoff.localeCount)throw new Error('SEO preview manifest counts mismatch');
  return {handoff,previewRoot};
}
function applySeoPreview(sourceRoot,targetRoot){
  const source=path.resolve(sourceRoot),target=path.resolve(targetRoot);
  if(source===target||source.startsWith(target+path.sep)||target.startsWith(source+path.sep))throw new Error('Source and target must not overlap');
  const {handoff,previewRoot}=validateSeoHandoff(source);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  const stamp=process.pid+'-'+Date.now(),next=target+'.next-'+stamp,previous=target+'.previous-'+stamp;
  fs.rmSync(next,{recursive:true,force:true});fs.rmSync(previous,{recursive:true,force:true});
  fs.mkdirSync(next,{recursive:true});
  try{
    for(const entry of handoff.files){
      const rel=safeRelative(entry.path),src=path.join(previewRoot,...rel.split('/')),dest=path.join(next,...rel.split('/'));
      fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(src,dest);
    }
    const copied=listFiles(next);
    if(JSON.stringify(copied)!==JSON.stringify(handoff.files.map(x=>x.path)))throw new Error('Copied SEO preview file list mismatch');
    if(fs.existsSync(target))fs.renameSync(target,previous);
    fs.renameSync(next,target);
    fs.rmSync(previous,{recursive:true,force:true});
  }catch(error){
    fs.rmSync(next,{recursive:true,force:true});
    if(!fs.existsSync(target)&&fs.existsSync(previous))fs.renameSync(previous,target);
    throw error;
  }
  return {
    sourceCommit:handoff.sourceCommit,
    pageCount:handoff.pageCount,
    localeCount:handoff.localeCount,
    completeProductCount:handoff.completeProductCount,
    queuedProductCount:handoff.queuedProductCount,
    fileCount:handoff.fileCount,
    totalBytes:handoff.totalBytes
  };
}

if(require.main===module){
  const source=process.argv[2],target=process.argv[3];
  if(!source||!target)throw new Error('Usage: node apply-seo-preview-handoff.js <source-root> <target-seo-preview>');
  console.log(JSON.stringify(applySeoPreview(source,target)));
}
module.exports={validateSeoHandoff,applySeoPreview};
