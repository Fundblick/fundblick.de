const fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto'),cp=require('child_process');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'fundblick-seo-apply-'));
const source=path.join(tmp,'source'),preview=path.join(source,'seo-preview'),target=path.join(tmp,'target');
fs.mkdirSync(path.join(preview,'ru','product','test-product'),{recursive:true});
fs.writeFileSync(path.join(preview,'ru','product','test-product','index.html'),'<!doctype html><html lang="ru"><meta name="robots" content="noindex,follow"><h1>Тест</h1></html>');
fs.writeFileSync(path.join(preview,'sitemap.xml'),'<?xml version="1.0"?><urlset></urlset>');
const manifest={version:1,indexable:false,localeCount:20,pageCount:1,completeProductCount:1,queuedProductCount:0,pages:[{locale:'ru',path:'ru/product/test-product/index.html',url:'https://fundblick.de/ru/product/test-product/',productId:'product-test',sourceHash:'a'.repeat(64),dir:'ltr'}],queue:[]};
fs.writeFileSync(path.join(preview,'manifest.json'),JSON.stringify(manifest));
fs.writeFileSync(path.join(preview,'localization-queue.json'),JSON.stringify({version:1,products:[]}));
const walk=(root,current=root,out=[])=>{for(const e of fs.readdirSync(current,{withFileTypes:true})){const p=path.join(current,e.name);if(e.isDirectory())walk(root,p,out);else out.push(path.relative(root,p).split(path.sep).join('/'))}return out.sort()};
const files=walk(preview).map(rel=>{const b=fs.readFileSync(path.join(preview,...rel.split('/')));return {path:rel,bytes:b.length,sha256:sha(b)}});
const manifestEntry=files.find(x=>x.path==='manifest.json');
const handoff={version:1,sourceCommit:'0'.repeat(40),pageCount:1,localeCount:20,completeProductCount:1,queuedProductCount:0,fileCount:files.length,totalBytes:files.reduce((n,x)=>n+x.bytes,0),manifestSha256:manifestEntry.sha256,files};
fs.writeFileSync(path.join(source,'seo-preview-handoff.json'),JSON.stringify(handoff));
fs.mkdirSync(target,{recursive:true});fs.writeFileSync(path.join(target,'stale.html'),'stale');
const output=JSON.parse(cp.execFileSync(process.execPath,['development/apply-seo-preview-handoff.js',source,target],{encoding:'utf8'}));
if(output.pageCount!==1||output.localeCount!==20)throw new Error('SEO apply output counts mismatch');
const sourceFiles=walk(preview),targetFiles=walk(target);
if(JSON.stringify(sourceFiles)!==JSON.stringify(targetFiles))throw new Error('applied SEO preview file list mismatch');
if(fs.existsSync(path.join(target,'stale.html')))throw new Error('stale SEO preview file survived atomic apply');
for(const rel of sourceFiles){
  const a=fs.readFileSync(path.join(preview,...rel.split('/'))),b=fs.readFileSync(path.join(target,...rel.split('/')));
  if(!a.equals(b))throw new Error('applied SEO preview bytes differ: '+rel);
}
const bad=JSON.parse(JSON.stringify(handoff));bad.files[0].path='../escape.html';
fs.writeFileSync(path.join(source,'seo-preview-handoff.json'),JSON.stringify(bad));
let rejected=false;try{cp.execFileSync(process.execPath,['development/apply-seo-preview-handoff.js',source,path.join(tmp,'bad-target')],{stdio:'pipe'})}catch{rejected=true}
if(!rejected)throw new Error('unsafe SEO handoff path was not rejected');
const indexable=JSON.parse(JSON.stringify(handoff));
fs.writeFileSync(path.join(source,'seo-preview-handoff.json'),JSON.stringify(indexable));
const manifestPath=path.join(preview,'manifest.json'),oldManifest=fs.readFileSync(manifestPath);
const altered={...manifest,indexable:true};fs.writeFileSync(manifestPath,JSON.stringify(altered));
const alteredBytes=fs.readFileSync(manifestPath);const idx=indexable.files.findIndex(x=>x.path==='manifest.json');
indexable.files[idx]={...indexable.files[idx],bytes:alteredBytes.length,sha256:sha(alteredBytes)};
indexable.totalBytes=indexable.files.reduce((n,x)=>n+x.bytes,0);indexable.manifestSha256=indexable.files[idx].sha256;
fs.writeFileSync(path.join(source,'seo-preview-handoff.json'),JSON.stringify(indexable));
rejected=false;try{cp.execFileSync(process.execPath,['development/apply-seo-preview-handoff.js',source,path.join(tmp,'indexable-target')],{stdio:'pipe'})}catch{rejected=true}
if(!rejected)throw new Error('indexable development SEO preview was not rejected');
fs.writeFileSync(manifestPath,oldManifest);
fs.rmSync(tmp,{recursive:true,force:true});
console.log('FundBlick SEO preview apply contract OK',JSON.stringify({files:files.length,pageCount:1,localeCount:20}));
