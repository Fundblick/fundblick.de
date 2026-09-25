'use strict';
(function () {
  const CATEGORY_RULES = [
    {id:'headphones', label:'Kopfhörer', query:/kopfh[oö]rer|headphones?|earbuds?|in.?ear|over.?ear/i, product:/headphones?|earbuds?|earphones?|kopfh[oö]rer/i, facets:[['connection','Verbindung'],['form','Bauform'],['features','Funktionen'],['battery','Akkulaufzeit']]},
    {id:'tv', label:'Fernseher', query:/fernseher|television|\btv\b|\boled\b|\bqled\b/i, product:/television|smart tv|fernseher|\btv\b/i, facets:[['screen','Bildschirmdiagonale'],['panel','Bildschirmtechnik']]},
    {id:'shoes', label:'Schuhe', query:/\b(?:schuhe?|sneakers?|laufschuhe?|running shoes|boots?)\b/i, product:/\b(?:shoes?|sneakers?|cleats?|heels?|sandals?|espadrilles?|boots?|slippers?|schuhe?)\b/i, facets:[['size','Schuhgröße'],['color','Farbe']]},
    {id:'phone', label:'Smartphones', query:/smartphones?|handys?|iphone|galaxy|pixel phone/i, product:/smartphones?|iphone|mobile phone|galaxy|pixel phone/i, facets:[['storage','Speicher'],['color','Farbe']]},
    {id:'coffee', label:'Kaffeemaschinen', query:/kaffeemaschine|coffee maker|coffee machine/i, product:/coffee maker|coffee machine|espresso machine|kaffeemaschine/i, facets:[['features','Funktionen']]},
    {id:'heatgun', label:'Heißluftfön', query:/hei[ßs]luftf[oö]n|heat gun/i, product:/heat gun|hei[ßs]luftf[oö]n/i, facets:[['power','Leistung']]}
  ];
  const COLOR_WORDS={Schwarz:/\bblack\b|\bschwarz\b/i,Weiß:/\bwhite\b|\bwei[ßs]\b/i,Blau:/\bblue\b|\bblau\b/i,Rot:/\bred\b|\brot\b/i};
  if(typeof module!=='undefined')module.exports={detect,normalize,features};
  const qEl=typeof document!=='undefined'?document.querySelector('#query'):null;
  if(!qEl)return;
  const filtersEl=document.querySelector('#filters'),cardsEl=document.querySelector('#cards'),summaryEl=document.querySelector('#summary'),chipsEl=document.querySelector('#chips'),sortEl=document.querySelector('#sort');
  const params=new URLSearchParams(location.search);
  const state={query:params.get('q')||'',min:asNumber(params.get('min')),max:asNumber(params.get('max')),brands:new Set((params.get('brand')||'').split(',').filter(Boolean)),facets:{},sort:params.get('sort')||'relevance'};
  let products=[],category=null,base=[];
  try{const saved=JSON.parse(params.get('facets')||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))for(const [k,v] of Object.entries(saved))if(Array.isArray(v))state.facets[k]=new Set(v.map(String));}catch{}
  qEl.value=state.query;if([...sortEl.options].some(x=>x.value===state.sort))sortEl.value=state.sort;
  function asNumber(v){return v!==null&&v!==''&&Number.isFinite(Number(v))&&Number(v)>=0?Number(v):null}
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('de');
  const money=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(n);
  function detect(query){return CATEGORY_RULES.find(c=>c.query.test(query))||null}
  function features(product){
    const text=`${product.name||''} ${product.description||''}`;
    const found={};
    const put=(key,value)=>{if(value)found[key]=String(value)};
    if(product.family==='headphones'){
      if(/bluetooth|wireless|kabellos/i.test(text))put('connection','Kabellos');
      else if(/wired|kabelgebunden|mit kabel/i.test(text))put('connection','Kabelgebunden');
      const form=text.match(/(over|in|on)[- ]?ear/i);if(form)put('form',form[1][0].toUpperCase()+form[1].slice(1).toLowerCase()+'-Ear');
      if(/noise cancell?ing|\bANC\b/i.test(text))put('features','Noise Cancelling');
      const battery=text.match(/(\d{1,3})\s*(?:hours?|stunden|h)\s*(?:battery|akku)?/i);if(battery)put('battery',battery[1]+' h');
    }
    if(product.family==='tv'){
      const screen=text.match(/\b(\d{2,3})\s*(?:inch(?:es)?|zoll|["″])/i);if(screen)put('screen',screen[1]+' Zoll');
      const panel=text.match(/\b(OLED|QLED|Mini-LED)\b/i);if(panel)put('panel',panel[1].toUpperCase());
    }
    if(product.family==='shoes'){
      const size=text.match(/(?:size|gr[oö][ßs]e|EU)\s*(3[5-9]|4[0-8])\b/i);if(size)put('size',size[1]);
    }
    if(product.family==='phone'){
      const storage=text.match(/\b(64|128|256|512|1024)\s*GB\b/i);if(storage)put('storage',storage[1]+' GB');
    }
    if(product.family==='heatgun'){
      const power=text.match(/\b(\d{3,4})\s*(?:W|Watt)\b/i);if(power)put('power',power[1]+' W');
    }
    if(['shoes','phone'].includes(product.family))for(const [color,re] of Object.entries(COLOR_WORDS))if(re.test(text)){put('color',color);break}
    return found;
  }
  function normalize(raw){
    if(!raw||raw.active===false||!raw.name||!Number.isFinite(Number(raw.price))||Number(raw.price)<0)return null;
    const text=`${raw.name} ${raw.description||''}`;
    const family=CATEGORY_RULES.find(c=>c.product.test(text))?.id||(/(?:^|[- ])shoes?$/i.test(String(raw.category||''))?'shoes':null);
    const p={name:String(raw.name),brand:String(raw.brand||''),description:String(raw.description||''),category:String(raw.category||''),price:Number(raw.price),image:String(raw.image||''),family};
    p.attrs=features(p);return p;
  }
  function interpret(query){
    const constraints={};let clean=query;
    const max=query.match(/(?:unter|bis|max(?:imal)?)\s*(\d+(?:[,.]\d+)?)\s*(?:€|euro)/i);
    const min=query.match(/(?:[üu]ber|ab|mindestens)\s*(\d+(?:[,.]\d+)?)\s*(?:€|euro)/i);
    if(max&&state.max===null)state.max=Number(max[1].replace(',','.'));
    if(min&&state.min===null)state.min=Number(min[1].replace(',','.'));
    for(const match of [max,min])if(match)clean=clean.replace(match[0],' ');
    if(category?.id==='headphones'){
      if(/bluetooth|wireless|kabellos/i.test(clean))constraints.connection='Kabellos';
      if(/kabelgebunden|wired/i.test(clean))constraints.connection='Kabelgebunden';
      const form=clean.match(/over[- ]?ear|in[- ]?ear|on[- ]?ear/i);if(form)constraints.form=form[0].replace(' ','-').replace(/^\w/,x=>x.toUpperCase());
      if(/noise cancell?ing|\bANC\b/i.test(clean))constraints.features='Noise Cancelling';
    }
    if(category?.id==='tv'){
      const screen=clean.match(/\b(\d{2,3})\s*(?:zoll|inch(?:es)?|["″])/i);if(screen)constraints.screen=screen[1]+' Zoll';
      const panel=clean.match(/\b(OLED|QLED|Mini-LED)\b/i);if(panel)constraints.panel=panel[1].toUpperCase();
    }
    if(category?.id==='shoes'){
      const size=clean.match(/(?:gr[oö][ßs]e|size|EU)\s*(3[5-9]|4[0-8])\b/i);if(size)constraints.size=size[1];
    }
    if(category?.id==='phone'){
      const storage=clean.match(/\b(64|128|256|512|1024)\s*GB\b/i);if(storage)constraints.storage=storage[1]+' GB';
    }
    for(const [key,value] of Object.entries(constraints)){
      if(!state.facets[key])state.facets[key]=new Set();state.facets[key].add(value);
      clean=clean.replace(new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'),' ');
    }
    if(category)clean=clean.replace(category.query,' ');
    clean=clean.replace(/\b(?:bluetooth|wireless|kabellos|kabelgebunden|wired|zoll|inch|size|gr[oö][ßs]e|EU|GB|euro)\b/gi,' ');
    return norm(clean).split(/[^\p{L}\p{N}]+/u).filter(x=>x.length>1);
  }
  function queryMatch(p,tokens){
    if(category&&p.family!==category.id)return false;
    const hay=norm([p.name,p.brand,p.category,p.description].join(' '));
    return tokens.every(t=>hay.includes(t));
  }
  function filtered(skip){return base.filter(p=>{
    if(state.min!==null&&p.price<state.min||state.max!==null&&p.price>state.max)return false;
    if(skip!=='brand'&&state.brands.size&&!state.brands.has(p.brand))return false;
    return Object.entries(state.facets).every(([key,set])=>skip===key||!set.size||set.has(p.attrs[key]));
  })}
  function optionsFor(key){const set=new Set(base.map(p=>key==='brand'?p.brand:p.attrs[key]).filter(Boolean));return [...set].sort((a,b)=>a.localeCompare(b,'de',{numeric:true}))}
  function group(key,label,values){if(!values.length)return '';
    const selected=key==='brand'?state.brands:state.facets[key]||new Set();
    return `<section class="facet"><h2>${esc(label)}</h2>${values.map(value=>{const count=filtered(key).filter(p=>(key==='brand'?p.brand:p.attrs[key])===value).length;return `<label><input type="checkbox" data-key="${esc(key)}" value="${esc(value)}" ${selected.has(value)?'checked':''}>${esc(value)}<span>${count}</span></label>`}).join('')}</section>`;
  }
  function renderFilters(){
    const schema=category?.facets||[];
    const specialized=schema.map(([key,label])=>group(key,label,optionsFor(key))).join('');
    filtersEl.innerHTML=`<section class="facet"><h2>Preis der Testprodukte</h2><div class="price-row"><label>Von (€)<input class="number-input" id="min" type="number" min="0" step="0.01" value="${state.min??''}"></label><label>Bis (€)<input class="number-input" id="max" type="number" min="0" step="0.01" value="${state.max??''}"></label></div><button class="apply-price" id="apply-price" type="button">Preis anwenden</button></section>${group('brand','Hersteller',optionsFor('brand'))}${specialized}<section class="facet"><h2>Versand & Verfügbarkeit</h2><p class="facet-help">Dazu liegen noch keine verlässlichen Daten vor. Diese Filter werden ergänzt, sobald Händlerangebote angebunden sind.</p></section>`;
    filtersEl.querySelectorAll('input[type=checkbox]').forEach(el=>el.addEventListener('change',()=>{
      const set=el.dataset.key==='brand'?state.brands:(state.facets[el.dataset.key]??=new Set());
      el.checked?set.add(el.value):set.delete(el.value);render();
    }));
    filtersEl.querySelector('#apply-price').addEventListener('click',()=>{state.min=asNumber(filtersEl.querySelector('#min').value);state.max=asNumber(filtersEl.querySelector('#max').value);render()});
  }
  function renderChips(){const chips=[];
    if(state.min!==null)chips.push(['min',`ab ${money(state.min)}`]);if(state.max!==null)chips.push(['max',`bis ${money(state.max)}`]);
    for(const brand of state.brands)chips.push(['brand:'+brand,`Hersteller: ${brand}`]);
    for(const [key,values] of Object.entries(state.facets))for(const value of values)chips.push([key+':'+value,value]);
    chipsEl.innerHTML=chips.map(([key,label])=>`<button type="button" data-remove="${esc(key)}" aria-label="Filter ${esc(label)} entfernen">${esc(label)} ×</button>`).join('');
    chipsEl.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
      const [key,...rest]=b.dataset.remove.split(':');const value=rest.join(':');
      if(key==='min'||key==='max')state[key]=null;else if(key==='brand')state.brands.delete(value);else state.facets[key]?.delete(value);
      render();
    }));
  }
  function writeUrl(){const url=new URL(location.href);const set=(key,value)=>value==null||value===''?url.searchParams.delete(key):url.searchParams.set(key,String(value));
    set('q',state.query);set('min',state.min);set('max',state.max);set('brand',[...state.brands].join(','));
    const facetData=Object.fromEntries(Object.entries(state.facets).filter(([,s])=>s.size).map(([k,s])=>[k,[...s]]));
    set('facets',Object.keys(facetData).length?JSON.stringify(facetData):'');set('sort',state.sort==='relevance'?'':state.sort);history.replaceState(null,'',url);
  }
  function card(p){const tags=Object.values(p.attrs).slice(0,3).map(x=>`<span>${esc(x)}</span>`).join('');
    return `<article class="product">${p.image?`<img src="${esc(p.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:'<div class="no-image" aria-hidden="true">Produkt</div>'}<div><p>${esc(p.brand||p.category)} · Testdaten</p><h2>${esc(p.name)}</h2><p>${esc(p.description.slice(0,150))}</p><div class="tags">${tags}</div></div><div class="price"><strong>${money(p.price)}</strong><small>Testpreis, Versand unbekannt</small><span class="unavailable">Noch kein Angebot</span></div></article>`;
  }
  function render(){renderFilters();renderChips();let list=filtered();
    if(state.sort==='price-asc')list.sort((a,b)=>a.price-b.price);
    else if(state.sort==='price-desc')list.sort((a,b)=>b.price-a.price);
    else if(state.sort==='brand')list.sort((a,b)=>a.brand.localeCompare(b.brand,'de'));
    summaryEl.textContent=`${list.length} ${list.length===1?'Produkt':'Produkte'} gefunden${category?' · '+category.label:''}`;
    cardsEl.innerHTML=list.length?list.slice(0,100).map(card).join(''):`<div class="empty"><h2>Keine passenden Produkte</h2><p>Ändere deine Suchbegriffe oder entferne einen Filter. Für manche Produktklassen liegen noch keine Testprodukte vor.</p></div>`;
    writeUrl();
  }
  document.querySelector('.search-form').addEventListener('submit',e=>{e.preventDefault();state.query=qEl.value.trim();state.brands.clear();state.facets={};state.min=null;state.max=null;runSearch()});
  document.querySelector('#reset').addEventListener('click',()=>{state.min=state.max=null;state.brands.clear();state.facets={};render()});
  sortEl.addEventListener('change',()=>{state.sort=sortEl.value;render()});
  function runSearch(){category=detect(state.query);const tokens=interpret(state.query);base=products.filter(p=>queryMatch(p,tokens));render()}
  fetch('products.json').then(r=>{if(!r.ok)throw Error('Produktdaten nicht erreichbar');return r.json()}).then(data=>{if(!Array.isArray(data))throw Error('Produktdaten ungültig');products=data.map(normalize).filter(Boolean);runSearch()}).catch(()=>{summaryEl.textContent='Produktdaten konnten nicht geladen werden.';cardsEl.innerHTML='<div class="empty"><h2>Suche momentan nicht verfügbar</h2><p>Bitte versuche es später erneut.</p></div>'});
})();
