'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ui=require('./external-search-ui.js');
const offer=i=>({title:`Bosch GSR 18V-${i+20}`,url:`https://shop.example/product/${i}`,image:'https://cdn.example/drill.jpg',price:99+i,priceConfidence:'verified',productCandidate:true,resultType:'product'});
const listing={...offer(0),url:'https://shop.example/category/drills',title:'Makita 12V Auswahl'};
function element(){return{children:[],dataset:{},classList:{add(){}},replaceChildren(){this.children=[]},appendChild(child){this.children.push(child)},setAttribute(){},get childElementCount(){return this.children.length}}}
async function run(pages,view='offers',query='Bosch Akkuschrauber 18V',options={}){
 const scheduled=new Map(),events={},renders=[],facets=[],requests=[];let nextTimer=0,calls=0;
 const container=element(),cards={querySelectorAll:()=>[]};
 const context={URL,URLSearchParams,console,location:{search:`?q=${encodeURIComponent(query)}${options.optIn===false?'':'&web=1'}&intentView=${view}`},history:{replaceState(){}},MutationObserver:class{observe(){}disconnect(){}},setTimeout(fn){scheduled.set(++nextTimer,fn);return nextTimer},clearTimeout(id){scheduled.delete(id)},document:{documentElement:{lang:'de',dataset:{externalSearchEnabled:'true',externalSearchEndpoint:'https://search.example'}},getElementById(id){return id==='external-results'?container:id==='cards'?cards:null},createElement:element}};
 context.window=context;
 context.addEventListener=(name,fn)=>{events[name]=fn};
 Object.assign(context,{FundBlickExternalSearchPolicy:require('./external-search-policy.js'),FundBlickExternalSearchClient:{async search({offset,query}){calls++;requests.push({offset,query});if(options.recoverFirst&&calls>1)return{ok:true,results:[offer(0)],moreResultsAvailable:false};assert.ok(offset<pages.length,'unexpected additional search request');if(pages[offset]?.ok===false)return pages[offset];return{ok:true,results:pages[offset],moreResultsAvailable:offset<pages.length-1}}},FundBlickExternalSearchUI:{...ui,render(_,state){renders.push(state)},hide(){}},FundBlickUniversalSearchIntent:require('./universal-search-intent.js'),FundBlickExternalPriceConfidence:require('./external-price-confidence.js'),FundBlickIntentQuery:require('./search-intent-query.js'),FundBlickProductIntelligence:require('./product-intelligence-core.js'),FundBlickProductQueryStrategy:require('./product-query-strategy.js'),FundBlickExternalResultPage:require('./external-result-page.js'),FundBlickProductIntelligencePipeline:require('./product-intelligence-pipeline.js'),FundBlickExternalIntelligenceUI:{render(_,state){facets.push(state)},apply:require('./external-intelligence-ui.js').apply}});
 vm.createContext(context);
 vm.runInContext(fs.readFileSync('product-storage-parser.js','utf8'),context);
 vm.runInContext(fs.readFileSync('product-fashion-attributes.js','utf8'),context);
 vm.runInContext(fs.readFileSync('product-intelligence-core.js','utf8'),context);
 vm.runInContext(fs.readFileSync('product-unit-normalizer.js','utf8'),context);
 vm.runInContext(fs.readFileSync('product-result-attribute-extractor.js','utf8'),context);
 const browserStorage=context.FundBlickProductResultAttributeExtractor.extract({title:'Samsung Smartphone 8 GB RAM 256 GB'},{category:'electronics.smartphone'});
 assert.equal(browserStorage.attributes.storage.value,256,'browser dependency wiring preserves storage separately from RAM');
 vm.runInContext(fs.readFileSync('product-query-strategy.js','utf8'),context);
 vm.runInContext(fs.readFileSync('external-price-evidence.js','utf8'),context);
 vm.runInContext(fs.readFileSync('external-search-ui.js','utf8'),context);
 const realUI=context.FundBlickExternalSearchUI;
 context.FundBlickExternalSearchUI={...realUI,render(node,state){renders.push(state);realUI.render(node,state)}};
 vm.runInContext(fs.readFileSync('external-search-runtime.js','utf8'),context);
 events['fundblick:search-rendered']();
 for(const [id,fn]of scheduled){scheduled.delete(id);await fn()}
 return{get calls(){return calls},async settleAgain(){events['fundblick:search-rendered']();for(const [id,fn]of scheduled){scheduled.delete(id);await fn()}},state:renders.at(-1),facets:facets.at(-1),container,renders,requests};
}
(async()=>{
 let result=await run([[...Array.from({length:20},()=>listing),...Array.from({length:21},(_,i)=>offer(i))]]);
 assert.equal(result.state.results.length,21,'all eligible offers returned by the provider page remain visible');
 assert.equal(result.requests[0].query,'Bosch Akkuschrauber 18V kaufen -preisvergleich -site:idealo.de -site:geizhals.de','browser runtime sends validated focused offer query');
 assert.ok(result.state.results.every(ui.offerEligible));
 assert.equal(result.container.children.find(child=>child.className==='external-results-list').children.length,21,'real renderer creates all eligible cards without exceptions');
 assert.ok(!JSON.stringify(result.facets).includes('makita'),'excluded listings cannot create facets');
 const controls=result.container.children.at(-1),nav=controls.children.at(-1),next=nav.children.find(child=>child&&typeof child.onclick==='function');
 assert.ok(next,'append pager exposes a load-more button');await next.onclick();
 assert.equal(result.renders.at(-1).results.length,21,'append-style load more preserves the existing offers when the next provider page only duplicates them');
 result=await run([[...Array.from({length:20},()=>listing)],[...Array.from({length:12},(_,i)=>offer(i))]]);
 assert.equal(result.calls,1,'first page never automatically requests more pages for sparse offers');
 assert.equal(result.state.results.length,0);
 await result.container.children.at(-1).children.at(-1).children.find(child=>child&&typeof child.onclick==='function').onclick();
 assert.equal(result.requests[0].query,result.requests[1].query,'pagination retains the same refined query');
 assert.equal(result.renders.at(-1).results.length,12);
 assert.ok(result.container.children.at(-1).children.at(-1).children.some(child=>String(child.textContent||'').includes('12 Angebote geladen')),'append pager reports the accumulated offer count');

 result=await run([[...Array.from({length:20},()=>offer(0))],[...Array.from({length:12},(_,i)=>offer(i+1))]]);
 assert.equal(result.calls,1,'duplicates do not trigger automatic upstream requests');
 assert.equal(result.state.results.length,1);
 await result.container.children.at(-1).children.at(-1).children.find(child=>child&&typeof child.onclick==='function').onclick();
 assert.equal(result.renders.at(-1).results.length,13);
 result=await run([[listing]],'info');assert.equal(result.state.results.length,1,'information view preserves non-offer sources');
 assert.ok(result.requests[0].query.endsWith('Erklärung Ratgeber'));assert.ok(!result.requests[0].query.includes('-site:'),'information search retains comparison sources');
 result=await run([[]],'offers','Winterreifen 205/55 R16');assert.equal(result.requests[0].query,'Winterreifen 205/55 R16 kaufen Preis Angebot','unimproved tire search preserves baseline');
 result=await run([[offer(0)]],'offers','Bosch Akkuschrauber 18V',{optIn:false});assert.equal(result.calls,0,'no web request before explicit opt-in');
 result=await run([[offer(0)],{ok:false,error:'rate-limited'}]);
 const retry=result.container.children.at(-1).children.at(-1).children.find(child=>child&&typeof child.onclick==='function');
 await retry.onclick();assert.equal(result.renders.at(-1).results.length,1,'failed next-page request preserves existing offers');

 await retry.onclick();assert.equal(result.requests.length,3,'temporary failure permits retry');assert.equal(result.requests[1].offset,result.requests[2].offset);
 result=await run([{ok:false,status:429}]);assert.equal(result.calls,1);await result.settleAgain();await result.settleAgain();assert.equal(result.calls,1,'repeated local completion events cannot automatically retry failed web requests');assert.equal(result.renders.at(-1).error,true);
 result=await run([{ok:false,status:429}],'offers','Bosch Akkuschrauber 18V',{recoverFirst:true});const initialRetry=result.container.children.at(-1);assert.equal(initialRetry.textContent,'Websuche erneut versuchen');initialRetry.onclick();initialRetry.onclick();await result.settleAgain();assert.equal(result.calls,2,'explicit retry shares one scheduled initial request');assert.deepEqual(result.requests.map(r=>r.offset),[0,0]);assert.equal(result.renders.at(-1).results.length,1);await result.settleAgain();assert.equal(result.calls,2,'local completion cannot repeat successful retry');
 console.log('External runtime: opt-in + one initial request + append-style load more + retry + eligible offers OK');
})().catch(error=>{console.error(error);process.exitCode=1});
