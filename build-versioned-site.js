'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=process.cwd(),site=path.join(root,'_site');
const htmlFiles=['index.html','search.html','impressum.html','datenschutz.html','404.html'];
const assetRe=/(?:src|href)=["']([^"']+\.(?:js|css))(?:\?[^"']*)?["']/g;
const hash=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,12);
const assets=new Set();
for(const file of htmlFiles){if(!fs.existsSync(file))continue;const text=fs.readFileSync(file,'utf8');for(const m of text.matchAll(assetRe)){const rel=m[1].replace(/^\.\//,'');if(/^https?:|^\/\//.test(rel))continue;if(!fs.existsSync(rel))throw new Error(`Missing source asset in ${file}: ${rel}`);assets.add(rel);}}
// The consent modules are loaded dynamically. Hash them before their loader so
// changing consent policy also changes the loader URL in every HTML document.
const dynamicRe=/(?:src|href):['"]([^'"]+\.(?:js|css))(?:\?[^'"]*)?['"]/g;
const loader='language-links.js',loaderSource=fs.readFileSync(loader,'utf8');
for(const match of loaderSource.matchAll(dynamicRe)){if(!fs.existsSync(match[1]))throw new Error('Missing dynamic consent dependency: '+match[1]);assets.add(match[1]);}
const map=new Map();
for(const rel of [...assets].filter(x=>x!==loader).concat(loader)){let data=fs.readFileSync(rel);if(rel===loader)data=Buffer.from(data.toString().replace(dynamicRe,(full,source)=>full.replace(new RegExp(source.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:\\?[^\'" ]*)?'),map.get(source))));const ext=path.extname(rel),base=rel.slice(0,-ext.length),versioned=`${base}.${hash(data)}${ext}`;map.set(rel,versioned);const out=path.join(site,versioned);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,data);}
for(const file of htmlFiles){if(!fs.existsSync(file))continue;let text=fs.readFileSync(file,'utf8');text=text.replace(assetRe,(full,raw)=>{const rel=raw.replace(/^\.\//,'');const versioned=map.get(rel);if(!versioned)return full;return full.replace(raw,versioned).replace(/(\.(?:js|css))\?[^"']*/, '$1');});fs.writeFileSync(path.join(site,file),text);}
const manifest=Object.fromEntries(map);fs.writeFileSync(path.join(site,'asset-manifest.json'),JSON.stringify({algorithm:'sha256',hashLength:12,assets:manifest},null,2)+'\n');
for(const [source,target] of map){if(!fs.existsSync(path.join(site,target)))throw new Error(`Missing hashed asset: ${target}`);}
// Both static and dynamic browser references now use hashes; source aliases only
// duplicate bytes and are intentionally omitted from the published package.
for(const source of map.keys()){const alias=path.join(site,source);if(fs.existsSync(alias))fs.unlinkSync(alias);}
for(const file of htmlFiles){if(!fs.existsSync(path.join(site,file)))continue;const text=fs.readFileSync(path.join(site,file),'utf8');for(const source of map.keys()){const escaped=source.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');if(new RegExp(`(?:src|href)=["'](?:\\./)?${escaped}(?:\\?[^"']*)?["']`).test(text))throw new Error(`Unversioned asset reference remains in ${file}: ${source}`);}}
console.log(`Versioned ${map.size} production assets with SHA-256 content hashes.`);
