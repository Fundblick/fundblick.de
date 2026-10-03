'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const root=__dirname,fixture=path.join(root,'build/site-portability-test');
fs.mkdirSync(fixture,{recursive:true});
const sources=require('./public-site-files.json');
const results=[];
for(const newline of ['\n','\r\n']){
 for(const file of sources){const text=fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n');fs.writeFileSync(path.join(fixture,file),text.replace(/\n/g,newline));}
 fs.mkdirSync(path.join(fixture,'_site'),{recursive:true});
 execFileSync(process.execPath,[path.join(root,'build-versioned-site.js')],{cwd:fixture,stdio:'inherit'});
 const manifest=JSON.parse(fs.readFileSync(path.join(fixture,'_site/asset-manifest.json'),'utf8'));
 const files=['asset-manifest.json','index.html','search.html','impressum.html','datenschutz.html','404.html',...Object.values(manifest.assets)];
 results.push(Object.fromEntries(files.map(file=>[file,fs.readFileSync(path.join(fixture,'_site',file)).toString('base64')])));
}
assert.deepEqual(results[0],results[1],'Windows and Linux source line endings must produce identical public HTML, hashes and browser assets');
console.log('Site portability verified: identical HTML and every hashed browser asset for LF/CRLF sources.');
