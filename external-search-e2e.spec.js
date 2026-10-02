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


test('adaptive refinement changes intent state without assuming result counts must shrink',async({page})=>{
 const shoe=(i,a)=>({title:`Nike Schuhe Edition ${i} EU ${a.size.value} ${a.audience.value==='women'?'Damen':'Herren'} ${a.color.value}`,url:`https://merchant-${i}.example/product/shoe-${i}`,image:'https://images.example/shoe.jpg',price:String(70+i),currency:'EUR',priceConfidence:'structured',productCandidate:true,resultType:'product',attributes:{brand:{value:'Nike',confidence:'HIGH'},...a}});
 const results=[
  shoe(1,{size:{value:39,confidence:'HIGH'},audience:{value:'women',confidence:'HIGH'},color:{value:'white',confidence:'HIGH'}}),
  shoe(2,{size:{value:40,confidence:'HIGH'},audience:{value:'men',confidence:'HIGH'},color:{value:'black',confidence:'HIGH'}}),
  shoe(3,{size:{value:39,confidence:'HIGH'},audience:{value:'women',confidence:'HIGH'},color:{value:'black',confidence:'HIGH'}}),
  shoe(4,{size:{value:40,confidence:'HIGH'},audience:{value:'men',confidence:'HIGH'},color:{value:'white',confidence:'HIGH'}})
 ];
 const state=await mockSearch(page,()=>({results,moreResultsAvailable:false}));
 await page.goto(base+'?q=Nike%20Schuhe&lang=de&web=1');
 const box=page.locator('#adaptive-refinement');await expect(box).toBeVisible();await expect(box).toContainText('Möchtest du die Suche genauer machen?');await expect(box.getByRole('button',{name:'Auswahl anwenden',exact:true})).toBeDisabled();
 const size=box.locator('fieldset[data-facet="size"]');await expect(size).toBeVisible();await expect(size.locator('legend')).toHaveText('Größe');await size.getByRole('button',{name:'39',exact:true}).click();await expect(size.getByRole('button',{name:'39',exact:true})).toHaveAttribute('aria-pressed','true');await expect(box.getByRole('button',{name:'Auswahl anwenden',exact:true})).toBeEnabled();await expect(page.locator('.external-result-card')).toHaveCount(2);
 await box.getByRole('button',{name:'Ohne weitere Auswahl suchen',exact:true}).click();await expect(box).toBeHidden();await expect(page.locator('.external-result-card')).toHaveCount(4);expect(state.errors).toEqual([]);
});

test('applied refinement may retrieve additional matching offers instead of only filtering the first batch',async({page})=>{
 const shoe=(i,size)=>({title:`Nike Damen Schuhe EU ${size} Modell ${i}`,url:`https://merchant-${i}.example/product/nike-${i}`,image:'https://images.example/nike.jpg',price:String(80+i),currency:'EUR',priceConfidence:'structured',productCandidate:true,resultType:'product'});
 const initial=[shoe(1,39),shoe(2,40),{...shoe(3,39),title:'Nike Herren Schuhe Größe 39 Modell 3'},{...shoe(4,40),title:'Nike Herren Schuhe Größe 40 Modell 4'}];
 const refined=[shoe(10,39),shoe(11,39),shoe(12,39),shoe(13,39),shoe(14,39),shoe(15,39)];
 const state=await mockSearch(page,req=>({results:/Größe\s+39/i.test(req.q||'')?refined:initial,moreResultsAvailable:false}));
 await page.goto(base+'?q=Nike%20Schuhe&lang=de&web=1');
 const box=page.locator('#adaptive-refinement');await expect(box).toBeVisible();const size=box.locator('fieldset[data-facet="size"]');await size.getByRole('button',{name:'39',exact:true}).click();await box.getByRole('button',{name:'Auswahl anwenden',exact:true}).click();
 await expect.poll(()=>state.requests.length).toBeGreaterThan(1);expect(state.requests.at(-1).q).toMatch(/Größe\s+39/i);await expect(page.locator('.external-result-card')).toHaveCount(6);expect(state.errors).toEqual([]);
});

test('skipping adaptive refinement preserves an unrelated normal facet filter',async({page})=>{
 const shoe=(i,size,audience,color)=>({title:`Nike ${audience} Schuhe EU ${size} ${color} Modell ${i}`,url:`https://merchant-${i}.example/product/skip-${i}`,image:'https://images.example/shoe.jpg',price:String(90+i),currency:'EUR',priceConfidence:'structured',productCandidate:true,resultType:'product'});
 const results=[shoe(1,39,'Damen','weiß'),shoe(2,40,'Herren','schwarz'),shoe(3,39,'Damen','schwarz'),shoe(4,40,'Herren','weiß')];
 const state=await mockSearch(page,()=>({results,moreResultsAvailable:false}));await page.goto(base+'?q=Nike%20Schuhe&lang=de&web=1');
 const box=page.locator('#adaptive-refinement');await expect(box).toBeVisible();
 const normal=page.locator('#external-results select[data-facet="color"]');await expect(normal).toBeVisible();await normal.selectOption('black');await expect(page.locator('.external-result-card')).toHaveCount(2);
 const size=box.locator('fieldset[data-facet="size"]');await size.getByRole('button',{name:'39',exact:true}).click();await expect(page.locator('.external-result-card')).toHaveCount(1);
 await box.getByRole('button',{name:'Ohne weitere Auswahl suchen',exact:true}).click();await expect(box).toBeHidden();await expect(normal).toHaveValue('black');await expect(page.locator('.external-result-card')).toHaveCount(2);expect(state.errors).toEqual([]);
});

test('specific shoe query does not ask already supplied refinement dimensions',async({page})=>{
 const shoe=(i,size,audience,color)=>({title:`Nike Cortez ${audience} Schuhe EU ${size} ${color} Modell ${i}`,url:`https://merchant-${i}.example/product/specific-${i}`,image:'https://images.example/shoe.jpg',price:String(100+i),currency:'EUR',priceConfidence:'structured',productCandidate:true,resultType:'product'});
 const state=await mockSearch(page,()=>({results:[shoe(1,39,'Damen','weiß'),shoe(2,39,'Damen','weiß')],moreResultsAvailable:false}));
 await page.goto(base+'?q=Nike%20Cortez%20Gr%C3%B6%C3%9Fe%2039%20Damen%20wei%C3%9F&lang=de&web=1');
 await expect(page.locator('.external-result-card')).toHaveCount(2);await expect(page.locator('#adaptive-refinement')).toBeHidden();expect(state.errors).toEqual([]);
});

test('unprepared product family renders evidence-backed adaptive facets without prepared taxonomy',async({page})=>{
 const purifier=(i,area,filter,noise)=>({title:`AirPure Luftreiniger ${i}`,url:`https://merchant-${i}.example/product/purifier-${i}`,image:'https://images.example/purifier.jpg',price:String(90+i),currency:'EUR',priceConfidence:'structured',productCandidate:true,resultType:'product',rawAttributes:{productType:'Luftreiniger'},attributes:{room_area:{value:area,unit:'m²',confidence:'HIGH'},filter_type:{value:filter,confidence:'HIGH'},noise:{value:noise,unit:'dB',confidence:'HIGH'}}});
 const state=await mockSearch(page,()=>({results:[purifier(1,20,'HEPA H13',18),purifier(2,30,'HEPA H14',24),purifier(3,50,'HEPA H13',31)],moreResultsAvailable:false}));
 await page.goto(base+'?q=Luftreiniger%20f%C3%BCrs%20Schlafzimmer&lang=de&web=1');await expect(page.locator('.external-result-card')).toHaveCount(3);const box=page.locator('#adaptive-refinement');await expect(box).toBeVisible();await expect(box).toContainText(/Raumfläche|Filtertyp/);const normal=page.locator('#external-results .external-results-facets');await expect(normal).toContainText('Raumfläche');await expect(normal).toContainText('Filtertyp');expect(state.errors).toEqual([]);
});

test('unprepared family ignores generic product-type noise in rendered facets',async({page})=>{
 const state=await mockSearch(page,()=>({results:[{title:'AirPure Luftreiniger',url:'https://merchant.example/p/air',image:'https://images.example/air.jpg',price:'99',currency:'EUR',priceConfidence:'structured',productCandidate:true,resultType:'product',rawAttributes:{productType:'Luftreiniger'},attributes:{filter_type:{value:'HEPA H13',confidence:'HIGH'}}},{title:'Noisy Produkt XL',url:'https://merchant.example/p/noise',image:'https://images.example/noise.jpg',price:'12',currency:'EUR',priceConfidence:'structured',productCandidate:true,resultType:'product',rawAttributes:{productType:'Produkt'},attributes:{size:{value:'XL',confidence:'HIGH'}}}],moreResultsAvailable:false}));
 await page.goto(base+'?q=Luftreiniger&lang=de&web=1');await expect(page.locator('.external-result-card')).toHaveCount(1);await expect(page.locator('#external-results')).not.toContainText('Größe');await expect(page.locator('.external-result-card')).not.toContainText('Noisy Produkt XL');expect(state.errors).toEqual([]);
});

test('unknown query without usable facet evidence does not fabricate refinement questions',async({page})=>{
 const state=await mockSearch(page,()=>({results:[{title:'Spezialadapter ZXQ-771',url:'https://merchant.example/product/zxq-771',image:'https://images.example/zxq.jpg',price:'19.90',currency:'EUR',priceConfidence:'structured',productCandidate:true,resultType:'product'}],moreResultsAvailable:false}));
 await page.goto(base+'?q=Spezialadapter%20ZXQ-771&lang=de&web=1');await expect(page.locator('.external-result-card')).toHaveCount(1);await expect(page.locator('#adaptive-refinement')).toBeHidden();expect(state.errors).toEqual([]);
});

test('sorting and append loading remain stable after adaptive retrieval',async({page})=>{
 const shoe=(i,size,price)=>({title:`Nike Damen Schuhe EU ${size} Modell ${i}`,url:`https://merchant-${i}.example/product/refined-${i}`,image:'https://images.example/nike.jpg',price:String(price),currency:'EUR',priceConfidence:'structured',productCandidate:true,resultType:'product'});
 const initial=[shoe(1,39,91),shoe(2,40,92),{...shoe(3,39,93),title:'Nike Herren Schuhe EU 39 Modell 3'},{...shoe(4,40,94),title:'Nike Herren Schuhe EU 40 Modell 4'}];
 const refined=Array.from({length:10},(_,i)=>shoe(20+i,39,120-i));
 const extra=[shoe(40,39,70),shoe(41,39,71)];
 const state=await mockSearch(page,req=>/Größe\s+39/i.test(req.q||'')?{results:req.offset===0?refined:extra,moreResultsAvailable:req.offset===0}:{results:initial,moreResultsAvailable:false});
 await page.goto(base+'?q=Nike%20Schuhe&lang=de&web=1');const box=page.locator('#adaptive-refinement');await expect(box).toBeVisible();await box.locator('fieldset[data-facet="size"]').getByRole('button',{name:'39',exact:true}).click();await box.getByRole('button',{name:'Auswahl anwenden',exact:true}).click();
 await expect(page.locator('.external-result-card')).toHaveCount(10);const sort=page.locator('#external-results').getByRole('combobox',{name:'Sortierung',exact:true});await sort.selectOption('price-asc');await expect(page.locator('.external-result-card').first().locator('.external-result-price')).toHaveText('111,00 €');
 await next(page).click();await expect(page.locator('.external-result-card')).toHaveCount(12);await expect(page.locator('.external-result-card').first().locator('.external-result-price')).toHaveText('70,00 €');
 const refinedRequests=state.requests.filter(r=>/Größe\s+39/i.test(r.q||''));expect(refinedRequests.map(r=>r.offset)).toEqual([0,1]);expect(new Set(refinedRequests.map(r=>r.q)).size).toBe(1);expect(state.errors).toEqual([]);
});

test('adaptive refinement controls fit a 390px mobile viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});const shoe=(i,size,audience)=>({title:`Nike ${audience} Schuhe EU ${size} Modell ${i}`,url:`https://merchant-${i}.example/product/mobile-${i}`,image:'https://images.example/shoe.jpg',price:String(75+i),currency:'EUR',priceConfidence:'structured',productCandidate:true,resultType:'product'});
 const state=await mockSearch(page,()=>({results:[shoe(1,39,'Damen'),shoe(2,40,'Herren'),shoe(3,39,'Damen'),shoe(4,40,'Herren')],moreResultsAvailable:false}));
 await page.goto(base+'?q=Nike%20Schuhe&lang=de&web=1');const box=page.locator('#adaptive-refinement');await expect(box).toBeVisible();
 for(const node of [box,box.getByRole('button',{name:'39',exact:true}),box.getByRole('button',{name:'Auswahl anwenden',exact:true}),box.getByRole('button',{name:'Ohne weitere Auswahl suchen',exact:true})]){const b=await node.boundingBox();expect(b).not.toBeNull();expect(b.x).toBeGreaterThanOrEqual(0);expect(b.x+b.width).toBeLessThanOrEqual(390);if(await node.evaluate(el=>el.matches('button')))expect(b.height).toBeGreaterThanOrEqual(44)}
 expect(state.errors).toEqual([]);
});

test('applying adaptive refinement preserves an unrelated normal filter',async({page})=>{
 const shoe=(i,size,color)=>({title:`Nike Damen Schuhe EU ${size} ${color} Modell ${i}`,url:`https://merchant-${i}.example/product/apply-filter-${i}`,image:'https://images.example/shoe.jpg',price:String(130+i),currency:'EUR',priceConfidence:'structured',productCandidate:true,resultType:'product'});
 const initial=[shoe(1,39,'schwarz'),shoe(2,40,'schwarz'),shoe(3,39,'weiß'),shoe(4,40,'weiß')];
 const refined=[shoe(10,39,'schwarz'),shoe(11,39,'schwarz'),shoe(12,39,'weiß'),shoe(13,39,'weiß')];
 const state=await mockSearch(page,req=>({results:/Größe\s+39/i.test(req.q||'')?refined:initial,moreResultsAvailable:false}));
 await page.goto(base+'?q=Nike%20Schuhe&lang=de&web=1');const normal=page.locator('#external-results select[data-facet="color"]');await normal.selectOption('black');await expect(page.locator('.external-result-card')).toHaveCount(2);
 const box=page.locator('#adaptive-refinement');await box.locator('fieldset[data-facet="size"]').getByRole('button',{name:'39',exact:true}).click();await box.getByRole('button',{name:'Auswahl anwenden',exact:true}).click();
 await expect.poll(()=>state.requests.length).toBeGreaterThan(1);await expect(page.locator('#external-results select[data-facet="color"]')).toHaveValue('black');await expect(page.locator('.external-result-card')).toHaveCount(2);expect(state.errors).toEqual([]);
});
