'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const site=path.resolve(process.argv[2]||'_site');
const read=file=>fs.readFileSync(path.join(site,file),'utf8');
const manifest=JSON.parse(read('asset-manifest.json'));
for(const [source,target]of Object.entries(manifest.assets)){
 const data=fs.readFileSync(path.join(site,target));
 assert.ok(target.includes('.'+crypto.createHash('sha256').update(data).digest('hex').slice(0,12)+'.'),'hash matches packaged bytes: '+source);
}
for(const file of ['index.html','search.html','impressum.html','datenschutz.html','404.html']){
 const html=read(file);
 for(const match of html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css))(?:\?[^"']*)?["']/g)){
  if(/^(?:https?:)?\/\//.test(match[1]))continue;
  const rel=match[1].replace(/^\.?\//,'');assert.ok(fs.existsSync(path.join(site,rel)),'packaged dependency exists: '+file+' -> '+rel);
  assert.match(rel,/\.[a-f0-9]{12}\.(?:js|css)$/,'production dependency is versioned');
 }
}
const search=read('search.html');assert.match(search,/data-external-search-endpoint="https:\/\/fundblick-search\.frosty-moon-518b\.workers\.dev"/);
assert.ok(!search.includes('data-external-search-development-relay'),'production never enables local relay');
for(const asset of ['product-fashion-attributes.js','external-price-evidence.js','external-search-client.js','external-search-runtime.js','product-query-strategy.js'])assert.ok(manifest.assets[asset],asset+' included in production');
assert.ok(read(manifest.assets['external-search-runtime.js']).includes('datenschutz.html#websuche'),'privacy link resolves to packaged public page');
assert.match(read('datenschutz.html'),/id="websuche"/);
const catalog=JSON.parse(read('catalog/manifest.json'));assert.equal(catalog.dataMode,'real');assert.ok(catalog.realCount>=1000);assert.equal(catalog.simulatedCount,0);
for(const entry of ['development','.git','products.json','datenschutz-preview.html'])assert.ok(!fs.existsSync(path.join(site,entry)),'private/preview file not published: '+entry);
assert.ok(fs.existsSync(path.join(site,'themen/moebel/index.html')));assert.ok(fs.existsSync(path.join(site,'sitemap.xml')));
console.log('Production package: hashed dependencies, external modules, public privacy link, real catalog and private-file isolation OK');
