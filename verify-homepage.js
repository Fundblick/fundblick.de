'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
for(const id of ['searchForm','q','language','categories','deal','deal-content','deal-empty'])assert.ok(html.includes('id="'+id+'"'),'homepage element missing: '+id);
for(const file of ['home-i18n.js','catalog-loader.js','deal-of-day.js','home-deal.js','category-labels.js','home-categories.js'])assert.ok(html.includes('src="'+file+'"'),file+' must remain wired');
for(const file of ['app.js','i18n.js','home-extras.js','home-polish.js'])assert.ok(!html.includes('src="'+file),'retired homepage runtime must stay absent: '+file);
assert.ok(/id="searchForm"[^>]*action="search.html"[^>]*method="get"/.test(html),'search has a working native GET fallback');
assert.ok(/id="q"[^>]*name="q"/.test(html),'native search preserves the query');
assert.ok(!/id="q"[^>]*\sautofocus(?:\s|>|=)/.test(html),'no unsolicited mobile keyboard');
for(const marker of ['id="showcaseList"','class="home-value"','Live-Beta'])assert.ok(!html.includes(marker),'retired homepage content: '+marker);
assert.ok(!/<div id="deal-empty"[^>]*>[\s\S]*?<span>/.test(html),'empty deal state does not regain marketing copy');
assert.ok(fs.readFileSync('home.css','utf8').includes('.deal-card'),'daily offer styling remains');
assert.ok(fs.readFileSync('home-polish.css','utf8').includes('.search-feedback'),'accessible empty-search feedback styling remains');

async function verifyCompactHome(){
  const requests=[],manifest={itemCount:10000,searchFile:'search.json',homeDealFile:'home.json',shards:{'0':{file:'shard.json'}}};
  const fixtures={'catalog/manifest.json':manifest,'catalog/home.json':[{id:'one',name:'Regression product',price:10}],'catalog/search.json':[]};
  const window={location:{href:'https://fundblick.de/',pathname:'/'},document:{querySelector:()=>null},fetch:async url=>{
    requests.push(url);assert.ok(Object.hasOwn(fixtures,url),'unexpected homepage request: '+url);
    return {ok:true,json:async()=>fixtures[url]};
  }};
  vm.runInNewContext(fs.readFileSync('catalog-loader.js','utf8'),{window,URL,Response});
  assert.equal((await window.FundBlickCatalog.load()).length,1);
  await window.FundBlickCatalog.loadHome();
  assert.deepEqual(requests,['catalog/manifest.json','catalog/home.json'],'only compact feed fetched and cached');
  await window.FundBlickCatalog.meta();
  assert.deepEqual(requests,['catalog/manifest.json','catalog/home.json','catalog/search.json'],'search index deferred until explicit metadata request');
}
verifyCompactHome().then(()=>console.log('Homepage: current structure/native fallback and executed compact-feed loading OK')).catch(error=>{console.error(error);process.exitCode=1;});
