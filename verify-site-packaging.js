'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {verify}=require('./verify-site-contents.js');
const root=path.join(__dirname,'build/package-isolation-test');fs.mkdirSync(root,{recursive:true});
for(const mode of ['production','preview']){
 const site=path.join(root,mode);fs.rmSync(site,{recursive:true,force:true});fs.mkdirSync(site);
 const files=require('./public-site-files.json').filter(f=>mode==='production'||f!=='CNAME');
 for(const file of files)fs.writeFileSync(path.join(site,file),file==='robots.txt'?'User-agent: *\nAllow: /\n':'');
 for(const dir of ['catalog','themen'])fs.mkdirSync(path.join(site,dir));
 for(const file of ['.nojekyll','asset-manifest.json'])fs.writeFileSync(path.join(site,file),file==='asset-manifest.json'?'{"assets":{}}':'');
 if(mode==='production')fs.writeFileSync(path.join(site,'sitemap.xml'),'');
 if(mode==='preview')for(const file of files.filter(f=>f.endsWith('.html')))fs.writeFileSync(path.join(site,file),'<head><meta name="robots" content="noindex,nofollow"></head>');
 verify(site,mode);
 for(const forbidden of ['development','destination-health','cloudflare','node_modules','docs','.env','AGENTS.md','products.json','obsolete.js']){
  fs.writeFileSync(path.join(site,forbidden),'private');assert.throws(()=>verify(site,mode),/Unexpected public/);fs.unlinkSync(path.join(site,forbidden));
 }
 if(mode==='preview'){fs.writeFileSync(path.join(site,'themen','leak.html'),'<link rel="canonical" href="https://fundblick.de/">');assert.throws(()=>verify(site,mode));fs.unlinkSync(path.join(site,'themen','leak.html'));}
}
console.log('Site packaging: internal evidence/server/dependencies/unknown-file injection blocked in both modes');
