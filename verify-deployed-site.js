'use strict';
// Real HTTP verification of every public catalog shard and versioned browser asset.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const origin=new URL(process.argv[2]||'https://fundblick.de/');
const catalogRoot=path.resolve(process.argv[3]||'build/catalog');
const receipt=path.resolve(process.argv[4]||'build/deployed-site-verification.json');
const expectedSite=process.argv[5]?path.resolve(process.argv[5]):null;
assert.ok(origin.protocol==='https:'||['127.0.0.1','localhost'].includes(origin.hostname));
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
async function get(file,expectedStatus=200){const response=await fetch(new URL(file,origin),{signal:AbortSignal.timeout(20000),headers:{'Cache-Control':'no-cache'}});assert.equal(response.status,expectedStatus,file+' HTTP status');return Buffer.from(await response.arrayBuffer());}
async function each(values,action){let next=0;await Promise.all(Array.from({length:4},async()=>{while(next<values.length)await action(values[next++]);}));}
async function main(){
 const expected=JSON.parse(fs.readFileSync(path.join(catalogRoot,'manifest.json'))),actual=JSON.parse(await get('catalog/manifest.json'));
 assert.equal(actual.searchIndexSha256,expected.searchIndexSha256);assert.equal(actual.realCount,expected.realCount);assert.equal(actual.simulatedCount,0);
 const index=JSON.parse(await get('catalog/'+actual.searchFile));assert.equal(digest(JSON.stringify(index)),actual.searchIndexSha256);
 const products=[];await each(Object.values(actual.shards),async shard=>{const data=JSON.parse(await get('catalog/'+shard.file));assert.equal(digest(JSON.stringify(data)),shard.sha256);assert.equal(data.length,shard.itemCount);products.push(...data);});
 assert.equal(products.length,actual.itemCount);assert.equal(new Set(products.map(p=>p.id)).size,actual.itemCount);
 const localProducts=Object.values(expected.shards).flatMap(s=>JSON.parse(fs.readFileSync(path.join(catalogRoot,s.file))));
 const localById=new Map(localProducts.map(p=>[p.id,p]));for(const p of products)assert.deepEqual(p,localById.get(p.id),'Full public product matches reviewed build: '+p.id);
 const deluxe=require('./verify-deluxehomeart-production.js').verify(products);
 const categories=JSON.parse(await get('catalog/categories.json'));assert.deepEqual(categories,JSON.parse(fs.readFileSync(path.join(catalogRoot,'categories.json'))));
 assert.deepEqual(JSON.parse(await get('catalog/'+actual.homeDealFile)),JSON.parse(fs.readFileSync(path.join(catalogRoot,expected.homeDealFile))));
 const assets=JSON.parse(await get('asset-manifest.json'));
 if(expectedSite)assert.deepEqual(assets,JSON.parse(fs.readFileSync(path.join(expectedSite,'asset-manifest.json'))),'Deployed browser assets match release');
 await each(Object.entries(assets.assets),async([source,target])=>{const data=await get(target);assert.ok(target.includes('.'+digest(data).slice(0,12)+'.'),target+' content hash');if(expectedSite)assert.equal(digest(data),digest(fs.readFileSync(path.join(expectedSite,target))));});
 for(const file of ['index.html','search.html','impressum.html','datenschutz.html','404.html','robots.txt','sitemap.xml']){
  const data=await get(file);if(expectedSite)assert.equal(digest(data),digest(fs.readFileSync(path.join(expectedSite,file))),file+' release bytes');
  if(file==='index.html')assert.match(data.toString(),/index,follow/);
  if(file==='search.html')assert.match(data.toString(),/noindex,follow/);
  if(file.endsWith('.html'))for(const m of data.toString().matchAll(/(?:src|href)=["']([^"']+\.(?:js|css))["']/g))assert.ok(Object.values(assets.assets).includes(m[1]),'HTML references reviewed hashed asset: '+m[1]);
 }
 const sitemap=(await get('sitemap.xml')).toString();const landingUrls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname).filter(p=>p!=='/');
 for(const url of landingUrls){const html=(await get(url.replace(/^\//,''))).toString();assert.match(html,/index,follow/);assert.ok(html.includes('https://fundblick.de'+url));if(expectedSite)assert.equal(digest(html),digest(fs.readFileSync(path.join(expectedSite,url,'index.html'))));}
 const forbidden=['AGENTS.md','production-merchant-approvals.json','development/amazgifts-products.json.gz.b64','destination-health/amazgifts-clean-links.json','cloudflare/brave-search-worker.js','node_modules/package.json','.git/HEAD','products.json'];
 for(const file of forbidden)await get(file,404);
 const merchants={};for(const p of products)merchants[p.merchant]=(merchants[p.merchant]||0)+1;
 const result={verifiedAt:new Date().toISOString(),origin:origin.href,realProducts:products.length,deluxehomeartProducts:deluxe,merchants,categories:categories.categories.length,shards:Object.keys(actual.shards).length,hashedAssets:Object.keys(assets.assets).length,seoLandings:landingUrls.length,forbiddenPathsChecked:forbidden.length,allPublicProductsMatchReviewedBuild:true,allAssetsMatchRelease:!!expectedSite,searchIndexSha256:actual.searchIndexSha256};
 fs.mkdirSync(path.dirname(receipt),{recursive:true});fs.writeFileSync(receipt,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}
// A successful upload can precede edge propagation. Retry complete real checks,
// never substitute local data for a remote failure, and fail after a bounded window.
(async()=>{for(let attempt=1;attempt<=6;attempt++){try{await main();return;}catch(error){if(!expectedSite||attempt===6)throw error;console.warn('Public edge verification attempt '+attempt+' failed: '+error.message);await new Promise(resolve=>setTimeout(resolve,10000));}}})().catch(error=>{console.error(error);process.exitCode=1;});
