'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
function localAssetRefs(file){
  const html=fs.readFileSync(file,'utf8');
  const refs=[];
  for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
    const raw=match[1];if(!raw||raw.startsWith('http:')||raw.startsWith('https:')||raw.startsWith('//')||raw.startsWith('data:')||raw.startsWith('#')||raw.startsWith('mailto:')||raw.startsWith('tel:'))continue;
    const clean=raw.split('?')[0].split('#')[0];if(!clean||clean==='/'||clean.startsWith('/'))continue;refs.push(clean);
  }
  return refs;
}
for(const page of ['index.html','search.html','impressum.html','datenschutz.html','404.html']){
  assert.ok(fs.existsSync(page),`missing page ${page}`);
  for(const ref of localAssetRefs(page))assert.ok(fs.existsSync(path.normalize(ref)),`${page} references missing local asset ${ref}`);
}
for(const required of ['products.json','development/core-products.json','CNAME','robots.txt','sitemap.xml'])assert.ok(fs.existsSync(required),`missing production asset ${required}`);
const index=fs.readFileSync('index.html','utf8');
const search=fs.readFileSync('search.html','utf8');
const imprint=fs.readFileSync('impressum.html','utf8');
const privacy=fs.readFileSync('datenschutz.html','utf8');
const notFound=fs.readFileSync('404.html','utf8');
const sitemap=fs.readFileSync('sitemap.xml','utf8');
const styles=fs.readFileSync('styles.css','utf8');
const links=fs.readFileSync('language-links.js','utf8');
assert.ok(index.includes('property="og:title"')&&index.includes('application/ld+json'),'homepage social/structured metadata missing');
assert.ok(index.includes('rel="icon"')&&search.includes('rel="icon"'),'favicon missing from customer pages');
assert.ok(styles.includes('.fb-beta-badge')&&styles.includes('.search-query-context')&&styles.includes('body.fb-legal-page'),'customer-facing polish styles missing');
assert.ok(links.includes('installBetaBadge')&&links.includes('installQueryContext')&&links.includes('installLegalShell'),'customer-facing polish behavior missing');
assert.ok(imprint.includes('class="fb-legal-page"')&&privacy.includes('class="fb-legal-page"'),'legal page shell missing');
assert.ok(notFound.includes('class="fb-error-page"'),'404 visual shell missing');
assert.ok(sitemap.includes('<loc>https://fundblick.de/</loc>')&&!/Development placeholder/i.test(sitemap),'production sitemap is still placeholder/empty');
console.log('production asset reference and customer-facing polish verification passed');
