'use strict';
(function(){
  const params=new URLSearchParams(location.search);
  const threshold=6;
  const providerTimeoutMs=2500;
  const root=document.querySelector('#external-results');
  const cards=document.querySelector('#cards');
  const query=document.querySelector('#query');
  if(!root||!cards||!query)return;

  const t=window.FundBlickExternalI18n||{eyebrow:'MORE OFFERS ON THE WEB',title:'More offers on the web',none:'FundBlick currently has no matching partner offers of its own.',few:n=>`FundBlick currently has only ${n} matching results of its own.`,note:'The following results come from an external source and are not FundBlick partner offers.',external:'External offer',view:'View externally',filters:'Filter external results',brand:'Brand',price:'Price',from:'From',to:'To',apply:'Apply',reset:'Reset external filters',merchant:'Merchant',results:n=>`${n} external results`};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
  const locale=params.get('lang')||document.documentElement.lang||'de-DE';
  const money=(n,currency='EUR')=>new Intl.NumberFormat(locale,{style:'currency',currency}).format(Number(n));
  const providers=[];
  const state={items:[],brand:new Set(),attrs:{},min:null,max:null,ownCount:0};
  let timer=null,runId=0;

  const emit=(name,detail)=>{
    try{window.dispatchEvent(new CustomEvent(`fundblick:${name}`,{detail}))}catch{}
  };

  function safeUrl(value){
    try{const url=new URL(String(value));return /^https?:$/.test(url.protocol)?url.href:''}catch{return ''}
  }

  function normalize(raw,provider){
    if(!raw||!raw.title||!raw.url)return null;
    const url=safeUrl(raw.url);if(!url)return null;
    const price=Number(raw.price);
    return {id:String(raw.id||url),sourceType:'external',provider:provider.id,title:String(raw.title),brand:String(raw.brand||''),merchant:String(raw.merchant||''),image:safeUrl(raw.image),price:Number.isFinite(price)&&price>=0?price:null,currency:String(raw.currency||'EUR').toUpperCase(),shipping:String(raw.shipping||''),url,attributes:raw.attributes&&typeof raw.attributes==='object'&&!Array.isArray(raw.attributes)?raw.attributes:{}};
  }

  function card(item){
    const tags=Object.entries(item.attributes).filter(([,v])=>v).slice(0,3).map(([k,v])=>`<span title="${esc(k)}">${esc(v)}</span>`).join('');
    return `<article class="product external-product" data-source-type="external" data-provider="${esc(item.provider)}">${item.image?`<img src="${esc(item.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:`<div class="no-image" aria-hidden="true">${esc(t.external)}</div>`}<div><p><bdi>${esc(item.brand||item.merchant||item.provider)}</bdi> · ${esc(t.external)}</p><h2 dir="auto">${esc(item.title)}</h2>${item.merchant?`<p>${esc(t.merchant)}: ${esc(item.merchant)}</p>`:''}${item.shipping?`<p>${esc(item.shipping)}</p>`:''}<div class="tags">${tags}</div></div><div class="price">${item.price!==null?`<strong>${money(item.price,item.currency)}</strong>`:''}<a class="external-cta" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer nofollow">${esc(t.view)}</a></div></article>`;
  }

  async function withTimeout(promise,ms){
    let handle;
    try{return await Promise.race([promise,new Promise((_,reject)=>{handle=setTimeout(()=>reject(new Error('provider-timeout')),ms)})])}
    finally{clearTimeout(handle)}
  }

  async function runProvider(provider,q,context){
    const started=performance.now();
    try{
      const raw=await withTimeout(Promise.resolve().then(()=>provider.search(q,context)),provider.timeoutMs||providerTimeoutMs);
      const items=(Array.isArray(raw)?raw:[]).map(x=>normalize(x,provider)).filter(Boolean);
      emit('external-provider',{provider:provider.id,status:'success',itemCount:items.length,durationMs:Math.round(performance.now()-started)});
      return items;
    }catch(error){
      const timeout=String(error?.message||'')==='provider-timeout';
      console.warn('FundBlick external provider failed:',provider.id,timeout?'timeout':error);
      emit('external-provider',{provider:provider.id,status:timeout?'timeout':'error',itemCount:0,durationMs:Math.round(performance.now()-started)});
      return [];
    }
  }

  function enabledProviders(){return providers.filter(p=>p&&p.enabled!==false&&typeof p.search==='function')}

  async function search(q,context={}){
    const enabled=enabledProviders();
    const groups=await Promise.all(enabled.map(p=>runProvider(p,q,context)));
    const seen=new Set();
    return groups.flat().filter(item=>{const key=item.url+'|'+item.title.toLowerCase();if(seen.has(key))return false;seen.add(key);return true});
  }

  function registerProvider(provider){
    if(!provider||!provider.id||typeof provider.search!=='function')throw new Error('Invalid external-search provider');
    if(!providers.some(p=>p.id===provider.id))providers.push(provider);
  }

  const optionValues=(key)=>{
    const values=new Set();
    for(const item of state.items){const value=key==='brand'?item.brand:item.attributes[key];if(value)values.add(String(value))}
    return [...values].sort((a,b)=>a.localeCompare(b,locale,{numeric:true}));
  };

  function filteredItems(){return state.items.filter(item=>{
    if(state.min!==null&&(item.price===null||item.price<state.min))return false;
    if(state.max!==null&&(item.price===null||item.price>state.max))return false;
    if(state.brand.size&&!state.brand.has(item.brand))return false;
    return Object.entries(state.attrs).every(([key,set])=>!set.size||set.has(String(item.attributes[key]??'')));
  })}

  function facetBlock(key,label,values){
    if(values.length<2)return '';
    const selected=key==='brand'?state.brand:(state.attrs[key]??=new Set());
    return `<fieldset class="external-facet"><legend>${esc(label)}</legend>${values.map(value=>`<label><input type="checkbox" data-external-facet="${esc(key)}" value="${esc(value)}" ${selected.has(value)?'checked':''}><span>${esc(value)}</span></label>`).join('')}</fieldset>`;
  }

  function renderFilters(){
    const keys=[...new Set(state.items.flatMap(item=>Object.keys(item.attributes||{})))].slice(0,6);
    const priceValues=state.items.map(x=>x.price).filter(Number.isFinite);
    const filters=`<div class="external-filter-head"><strong>${esc(t.filters)}</strong><span>${esc(t.results(filteredItems().length))}</span></div><div class="external-filter-grid">${priceValues.length?`<fieldset class="external-facet external-price"><legend>${esc(t.price)}</legend><label>${esc(t.from)}<input id="external-min" type="number" min="0" step="0.01" value="${state.min??''}"></label><label>${esc(t.to)}<input id="external-max" type="number" min="0" step="0.01" value="${state.max??''}"></label><button type="button" id="external-apply">${esc(t.apply)}</button></fieldset>`:''}${facetBlock('brand',t.brand,optionValues('brand'))}${keys.map(key=>facetBlock(key,key,optionValues(key))).join('')}</div><button class="external-reset" type="button" id="external-reset">${esc(t.reset)}</button>`;
    return `<div class="external-filter-panel">${filters}</div>`;
  }

  function bindFilters(){
    root.querySelectorAll('[data-external-facet]').forEach(input=>input.addEventListener('change',()=>{
      const key=input.dataset.externalFacet;const set=key==='brand'?state.brand:(state.attrs[key]??=new Set());
      input.checked?set.add(input.value):set.delete(input.value);renderBody();
    }));
    root.querySelector('#external-apply')?.addEventListener('click',()=>{
      const min=root.querySelector('#external-min')?.value,max=root.querySelector('#external-max')?.value;
      state.min=min===''||min==null?null:Number(min);state.max=max===''||max==null?null:Number(max);renderBody();
    });
    root.querySelector('#external-reset')?.addEventListener('click',()=>{state.brand.clear();state.attrs={};state.min=state.max=null;renderBody()});
  }

  function renderBody(){
    const items=filteredItems();
    root.hidden=false;
    root.innerHTML=`<div class="external-results-heading"><p class="eyebrow">${esc(t.eyebrow)}</p><h2>${esc(t.title)}</h2><p>${esc(state.ownCount?t.few(state.ownCount):t.none)} ${esc(t.note)}</p></div>${renderFilters()}<div class="product-grid external-product-grid">${items.length?items.slice(0,24).map(card).join(''):`<div class="empty"><p>${esc(t.results(0))}</p></div>`}</div>`;
    bindFilters();
  }

  function render(items,ownCount){
    state.items=items;state.ownCount=ownCount;state.brand.clear();state.attrs={};state.min=state.max=null;
    if(!items.length){root.hidden=true;root.innerHTML='';return}
    renderBody();
  }

  function realMerchantCount(){return cards.querySelectorAll('.product[data-real-merchant="true"]').length}

  async function evaluate(){
    const started=performance.now();
    const q=query.value.trim();
    const ownCount=realMerchantCount();
    const providerCount=enabledProviders().length;
    if(!q){render([],ownCount);emit('external-search',{used:false,reason:'empty-query',ownCount,providerCount,externalCount:0,durationMs:0});return}
    if(ownCount>=threshold){render([],ownCount);emit('external-search',{used:false,reason:'enough-own-results',ownCount,providerCount,externalCount:0,durationMs:0});return}
    const current=++runId;
    const items=await search(q,{ownCount,threshold,language:params.get('lang')||document.documentElement.lang||'de',market:'DE'});
    if(current!==runId)return;
    render(items,ownCount);
    emit('external-search',{used:true,reason:'below-threshold',ownCount,providerCount,externalCount:items.length,durationMs:Math.round(performance.now()-started),queryLength:q.length});
  }

  const observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(evaluate,100)});
  observer.observe(cards,{childList:true,subtree:false});
  query.addEventListener('change',()=>{clearTimeout(timer);timer=setTimeout(evaluate,100)});

  window.FundBlickExternalSearch={registerProvider,search,threshold,providerTimeoutMs,evaluate};

  // DEV-only mock: explicit URL parameter required. Never active by default.
  if(params.get('externalMock')==='1')registerProvider({id:'mock-web',async search(q){
    if(!/akkuschrauber/i.test(q))return [];
    return [
      {id:'mock-1',title:'18 V Akku-Bohrschrauber – Beispieltreffer',brand:'Beispielmarke',merchant:'Externer Testhändler',price:99.99,currency:'EUR',shipping:'Versandinformationen aus externer Quelle',url:'https://example.com/a',attributes:{Spannung:'18 V',Ausführung:'mit Akku'}},
      {id:'mock-2',title:'Kompakter Akkuschrauber 12 V – Beispieltreffer',brand:'Testwerkzeug',merchant:'Externer Testhändler',price:59.90,currency:'EUR',url:'https://example.com/b',attributes:{Spannung:'12 V',Ausführung:'mit Akku'}},
      {id:'mock-3',title:'18 V Akkuschrauber Solo – Beispieltreffer',brand:'Testwerkzeug',merchant:'Werkzeug Beispielshop',price:79.00,currency:'EUR',url:'https://example.com/c',attributes:{Spannung:'18 V',Ausführung:'Solo-Gerät'}},
      {id:'mock-4',title:'12 V Akku-Bohrschrauber Set – Beispieltreffer',brand:'Beispielmarke',merchant:'Werkzeug Beispielshop',price:119.00,currency:'EUR',url:'https://example.com/d',attributes:{Spannung:'12 V',Ausführung:'Set'}}
    ];
  }});
  setTimeout(evaluate,150);
})();
