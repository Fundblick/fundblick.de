'use strict';
const {test,expect}=require('@playwright/test');
const base='http://127.0.0.1:4173/search.html';
const worker='https://fundblick-search.frosty-moon-518b.workers.dev/search*';
const offer=i=>({title:`${i%2?'Shell':'Castrol'} 10W-40 Motoröl ${i%3?5:1} Liter Edition ${i}`,url:`https://merchant-${i}.example/product/oil-${i}`,image:'https://images.example/oil.jpg',price:String(30+i),currency:'EUR',priceConfidence:'structured',productCandidate:true,resultType:'product'});
async function mockSearch(page,respond){const requests=[],errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.route(worker,async route=>{const url=new URL(route.request().url());requests.push({offset:Number(url.searchParams.get('offset')),q:url.searchParams.get('q'),count:Number(url.searchParams.get('count'))});const answer=respond(requests.at(-1),requests.length);await route.fulfill({status:answer.status||200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(answer.body||answer)})});return{requests,errors}}
async function settled(page){await expect(page.locator('#external-results .external-search-gate-button')).toBeVisible()}
function next(page){return page.locator('#external-results').getByRole('button',{name:'Weitere Angebote anzeigen',exact:true})}

test('explicit web opt-in preserves real catalog cards and auto-fills sparse offers',async({page})=>{
 const state=await mockSearch(page,()=>({results:[offer(0)],moreResultsAvailable:true}));
 await page.goto(base+'?q=Ahipos%20Flexen&lang=de');await settled(page);
 const local=page.locator('#cards article.product').first();await expect(local).toHaveAttribute('data-real-merchant','true');const before=await local.innerText();await expect(page.locator('.external-search-privacy')).toContainText('Cloudflare an Brave Search');await expect(page.locator('.external-search-privacy a')).toHaveAttribute('href','datenschutz.html#websuche');expect(state.requests).toHaveLength(0);
 await page.getByRole('button',{name:'Im Web weitersuchen',exact:true}).click();await expect(page.locator('.external-result-card')).toHaveCount(1);
 await expect(next(page)).toBeEnabled();expect(state.requests).toHaveLength(3);expect(state.requests.map(r=>r.offset)).toEqual([0,1,2]);expect(state.requests[0].count).toBe(20);expect(await local.innerText()).toBe(before);expect(state.errors).toEqual([]);
});

test('browser modules filter before paging; sorting and facets do not fetch',async({page})=>{
 const listing={...offer(99),title:'Motoröl Auswahl',url:'https://merchant.example/category/oil'};
 const state=await mockSearch(page,({offset})=>({results:offset===0?[listing,...Array.from({length:19},(_,i)=>offer(i))]:[offer(20),offer(21),offer(22)],moreResultsAvailable:offset===0}));
 await page.goto(base+'?q=10W40%20Motor%C3%B6l&lang=de&web=1');await expect(page.locator('.external-result-card')).toHaveCount(19);expect(state.requests).toHaveLength(1);
 const sort=page.locator('#external-results').getByRole('combobox',{name:'Sortierung',exact:true});await sort.selectOption('price-desc');await expect(page.locator('.external-result-card').first().locator('.external-result-price')).toHaveText('48,00 €');expect(state.requests).toHaveLength(1);
 const volume=page.locator('select[data-facet="volume"]');await expect(volume).toBeVisible();await volume.selectOption('5');await expect(page.locator('.external-result-card')).toHaveCount(12);expect(state.requests).toHaveLength(1);
 await page.locator('select[data-facet="volume"]').selectOption('');await next(page).click();await expect(page.locator('.external-results-pagination span')).toHaveText('22 Angebote geladen');await expect(page.locator('.external-result-card')).toHaveCount(22);expect(state.requests.map(x=>x.offset)).toEqual([0,1]);expect(state.requests[0].q).toBe(state.requests[1].q);expect(state.errors).toEqual([]);
});

test('mixed currencies disable misleading price and unit-price sorting',async({page})=>{
 const state=await mockSearch(page,()=>({results:[offer(1),{...offer(2),currency:'USD',price:'10.00'}],moreResultsAvailable:false}));
 await page.goto(base+'?q=10W40%20Motor%C3%B6l&lang=de&web=1');await expect(page.locator('.external-result-card')).toHaveCount(2);
 const sort=page.locator('#external-results').getByRole('combobox',{name:'Sortierung',exact:true});await expect(sort.locator('option[value="price-asc"]')).toBeDisabled();await expect(sort.locator('option[value="unit-price-asc"]')).toBeDisabled();expect(state.requests).toHaveLength(1);expect(state.errors).toEqual([]);
});

test('429 preserves own catalog results and failed next page can be retried',async({page})=>{
 let fail=true;const state=await mockSearch(page,({offset})=>offset===0?{results:[offer(1)],moreResultsAvailable:true}:fail?{status:429,body:{error:'rate-limited'}}:{results:[offer(2)],moreResultsAvailable:false});
 await page.goto(base+'?q=Ahipos%20Flexen&lang=de&web=1');await expect(page.locator('.external-result-card')).toHaveCount(1);await expect(page.locator('#cards article.product').first()).toHaveAttribute('data-real-merchant','true');
 expect(state.requests.map(x=>x.offset)).toEqual([0,1]);await expect(next(page)).toBeEnabled();await expect(page.locator('.external-results-pagination span')).toHaveText('1 Angebote geladen');await expect(page.locator('.external-result-card')).toHaveCount(1);
 fail=false;await next(page).click();await expect(page.locator('.external-result-card')).toHaveCount(2);await expect(page.locator('.external-results-pagination span')).toHaveText('2 Angebote geladen');expect(state.requests.map(x=>x.offset)).toEqual([0,1,1]);expect(state.errors).toEqual([]);
});

test('initial 429 leaves the existing catalog usable',async({page})=>{
 const state=await mockSearch(page,()=>({status:429,body:{error:'rate-limited'}}));await page.goto(base+'?q=Ahipos%20Flexen&lang=de&web=1');await expect(page.locator('#external-results')).toContainText('Websuche ist momentan nicht verfügbar');await expect(page.locator('#cards article.product').first()).toHaveAttribute('data-real-merchant','true');expect(state.requests).toHaveLength(1);expect(state.errors).toEqual([]);
});

test('initial search retries only after a user action and preserves catalog cards',async({page})=>{
 let fail=true;const state=await mockSearch(page,()=>fail?{status:429,body:{error:'rate-limited'}}:{results:[offer(1)],moreResultsAvailable:false});await page.goto(base+'?q=Ahipos%20Flexen&lang=de&web=1');const retry=page.getByRole('button',{name:'Websuche erneut versuchen',exact:true});await expect(retry).toBeVisible();expect(state.requests).toHaveLength(1);fail=false;await retry.click();await expect(page.locator('.external-result-card')).toHaveCount(1);expect(state.requests.map(r=>r.offset)).toEqual([0,0]);await expect(page.locator('#cards article.product').first()).toHaveAttribute('data-real-merchant','true');expect(state.errors).toEqual([]);
});

test('390px mobile web results and controls fit with usable touch targets',async({page})=>{
 await page.setViewportSize({width:390,height:844});const state=await mockSearch(page,()=>({results:[offer(1),offer(3)],moreResultsAvailable:true}));await page.goto(base+'?q=10W40%20Motor%C3%B6l&lang=de&web=1');await expect(page.locator('.external-result-card')).toHaveCount(2);
 for(const node of [page.locator('.external-result-card').first(),next(page),page.locator('#external-results').getByRole('combobox',{name:'Sortierung',exact:true})]){const box=await node.boundingBox();expect(box).not.toBeNull();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(390);if(node!==undefined&&await node.evaluate(el=>el.matches('button,select')))expect(box.height).toBeGreaterThanOrEqual(44)}
 expect(state.errors).toEqual([]);
});

test('external network failure preserves the real catalog',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));let requests=0;await page.route(worker,async route=>{requests++;await route.abort('failed')});
 await page.goto(base+'?q=Ahipos%20Flexen&lang=de&web=1');await expect(page.locator('#external-results')).toContainText('Websuche ist momentan nicht verfügbar');await expect(page.locator('#cards article.product').first()).toHaveAttribute('data-real-merchant','true');expect(requests).toBe(1);expect(errors).toEqual([]);
});

test('browser dependencies support Unicode classes and explicit fashion constraints',async({page})=>{
 const state=await mockSearch(page,()=>({results:[],moreResultsAvailable:false}));await page.goto(base+'?q=Ahipos%20Flexen&lang=de');await settled(page);
 const analysis=await page.evaluate(()=>({tv:window.FundBlickProductIntelligence.analyze('Samsung телевизор'),fashion:window.FundBlickProductIntelligence.analyze('Adidas Damen Schuhe grün EU 39,5'),model:window.FundBlickProductIntelligence.analyze('Nike Jordan 40 Schuhe')}));expect(analysis.tv.category).toBe('electronics.television');expect(analysis.fashion.attributes.audience.value).toBe('women');expect(analysis.fashion.attributes.color.value).toBe('green');expect(analysis.fashion.attributes.size.value).toBe(39.5);expect(analysis.model.attributes.size).toBeUndefined();expect(state.requests).toHaveLength(0);expect(state.errors).toEqual([]);
});

test('Hausschuhe structured detail survives generic title while category prices stay excluded',async({page})=>{
 const detail={title:'Hausschuhe online kaufen | OTTO',description:'UGG Tasman II Hausschuh',url:'https://www.otto.de/p/ugg-tasman-ii-S0EXAMPLE/',image:'https://images.example/tasman.jpg',price:'109.95',currency:'EUR',priceConfidence:'structured',productCandidate:true,resultType:'product'};
 const state=await mockSearch(page,()=>({results:[detail,{...detail,url:'https://www.otto.de/category/hausschuhe/'}],moreResultsAvailable:false}));await page.goto(base+'?q=Hausschuhe&lang=de');await settled(page);expect(state.requests).toHaveLength(0);await page.getByRole('button',{name:'Im Web weitersuchen',exact:true}).click();await expect(page.locator('.external-result-card')).toHaveCount(1);await expect(page.locator('.external-result-price')).toHaveText('109,95 €');expect(state.requests[0].q).toBe('Hausschuhe kaufen -preisvergleich -site:idealo.de -site:geizhals.de');expect(state.errors).toEqual([]);
 await page.goto('http://127.0.0.1:4173/datenschutz.html#websuche');await expect(page.locator('#websuche')).toContainText('Cloudflare Worker');await expect(page.locator('#websuche')).toContainText('90 Tagen');
});
