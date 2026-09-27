'use strict';
const fs=require('node:fs');
const path=require('node:path');

const seoRoot=process.argv[2]||path.join('build','seo');
const fail=message=>{throw new Error(message)};
const read=file=>fs.readFileSync(file,'utf8');
const assert=(condition,message)=>{if(!condition)fail(message)};

const robots=read('robots.txt');
assert(/User-agent:\s*\*/i.test(robots),'robots.txt must define User-agent: *');
assert(/Allow:\s*\/\s*$/im.test(robots),'robots.txt must allow crawling from /');
assert(/Sitemap:\s*https:\/\/fundblick\.de\/sitemap\.xml\s*$/im.test(robots),'robots.txt must reference canonical sitemap URL');

const home=read('index.html');
assert(/<meta\s+name="robots"\s+content="index,follow"/i.test(home),'homepage must be index,follow');
assert(/<link\s+rel="canonical"\s+href="https:\/\/fundblick\.de\/"/i.test(home),'homepage canonical missing or wrong');

const search=read('search.html');
assert(/<meta\s+name="robots"\s+content="noindex,follow"/i.test(search),'search page must stay noindex,follow');

const errorPage=read('404.html');
assert(/<meta\s+name="robots"\s+content="noindex"/i.test(errorPage),'404 page must stay noindex');

const sitemapPath=path.join(seoRoot,'sitemap.xml');
const manifestPath=path.join(seoRoot,'landing-manifest.json');
assert(fs.existsSync(sitemapPath),'generated sitemap missing');
assert(fs.existsSync(manifestPath),'SEO landing manifest missing');

const sitemap=read(sitemapPath);
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1].trim());
assert(urls.length>1,'sitemap must contain homepage and SEO landing pages');
assert(new Set(urls).size===urls.length,'sitemap contains duplicate URLs');
assert(urls[0]==='https://fundblick.de/','homepage must be first sitemap URL');
for(const url of urls){
  const parsed=new URL(url);
  assert(parsed.protocol==='https:','sitemap URL must use HTTPS: '+url);
  assert(parsed.hostname==='fundblick.de','sitemap URL must stay on fundblick.de: '+url);
  assert(!parsed.search&&!parsed.hash,'sitemap URL must not contain query/hash: '+url);
  assert(!/search\.html|impressum\.html|datenschutz\.html|404\.html/.test(parsed.pathname),'non-content utility/legal URL must not enter sitemap: '+url);
}

const manifest=JSON.parse(read(manifestPath));
const expected=['https://fundblick.de/',...(manifest.pages||[]).map(page=>`https://fundblick.de${page.url}`)];
assert(JSON.stringify(urls)===JSON.stringify(expected),'sitemap URLs must exactly match landing manifest order');

for(const page of manifest.pages||[]){
  const canonical=`https://fundblick.de${page.url}`;
  const file=path.join(seoRoot,page.url.replace(/^\//,'').replace(/\/$/,'') ,'index.html');
  assert(fs.existsSync(file),'landing page file missing: '+file);
  const html=read(file);
  assert(html.includes(`<link rel="canonical" href="${canonical}">`),'landing canonical mismatch: '+page.slug);
  assert(/<meta name="robots" content="index,follow">/.test(html),'landing must be index,follow: '+page.slug);
}

console.log(`Google indexability contract OK: ${urls.length} sitemap URLs, ${manifest.pages.length} SEO landings`);
