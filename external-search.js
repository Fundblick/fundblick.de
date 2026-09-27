'use strict';
(function(){
  const params=new URLSearchParams(location.search);
  const threshold=6;
  const root=document.querySelector('#external-results');
  const cards=document.querySelector('#cards');
  const query=document.querySelector('#query');
  if(!root||!cards||!query)return;

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=(n,currency='EUR')=>new Intl.NumberFormat(document.documentElement.lang||'de-DE',{style:'currency',currency}).format(Number(n));
  const providers=[];

  function normalize(raw,provider){
    if(!raw||!raw.title||!raw.url)return null;
    const price=Number(raw.price);
    return {
      id:String(raw.id||raw.url),
      sourceType:'external',
      provider:provider.id,
      title:String(raw.title),
      brand:String(raw.brand||''),
      merchant:String(raw.merchant||''),
      image:String(raw.image||''),
      price:Number.isFinite(price)&&price>=0?price:null,
      currency:String(raw.currency||'EUR'),
      shipping:String(raw.shipping||''),
      url:String(raw.url),
      attributes:raw.attributes&&typeof raw.attributes==='object'?raw.attributes:{}
    };
  }

  function card(item){
    const tags=Object.values(item.attributes).filter(Boolean).slice(0,3).map(v=>`<span>${esc(v)}</span>`).join('');
    return `<article class="product external-product" data-source-type="external">${item.image?`<img src="${esc(item.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:`<div class="no-image" aria-hidden="true">Extern</div>`}<div><p><bdi>${esc(item.brand||item.merchant||item.provider)}</bdi> · Externes Angebot</p><h2 dir="auto">${esc(item.title)}</h2>${item.shipping?`<p>${esc(item.shipping)}</p>`:''}<div class="tags">${tags}</div></div><div class="price">${item.price!==null?`<strong>${money(item.price,item.currency)}</strong>`:''}<a class="external-cta" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer nofollow">Extern ansehen</a></div></article>`;
  }

  async function runProvider(provider,q,context){
    try{
      const result=await provider.search(q,context);
      return (Array.isArray(result)?result:[]).map(x=>normalize(x,provider)).filter(Boolean);
    }catch(error){
      console.warn('FundBlick external provider failed:',provider.id,error);
      return [];
    }
  }

  async function search(q,context={}){
    const enabled=providers.filter(p=>p&&p.enabled!==false&&typeof p.search==='function');
    const groups=await Promise.all(enabled.map(p=>runProvider(p,q,context)));
    return groups.flat();
  }

  function registerProvider(provider){
    if(!provider||!provider.id||typeof provider.search!=='function')throw new Error('Invalid external-search provider');
    if(providers.some(p=>p.id===provider.id))return;
    providers.push(provider);
  }

  function render(items,ownCount){
    if(!items.length){root.hidden=true;root.innerHTML='';return;}
    root.hidden=false;
    root.innerHTML=`<div class="external-results-heading"><p class="eyebrow">WEITERE ANGEBOTE IM WEB</p><h2>Weitere Angebote im Web</h2><p>${ownCount?`FundBlick hat aktuell nur ${ownCount} eigene passende ${ownCount===1?'Treffer':'Treffer'}.`: 'FundBlick hat aktuell keine eigenen passenden Angebote.'} Die folgenden Treffer stammen aus einer externen Quelle und sind keine FundBlick-Partnerangebote.</p></div><div class="product-grid">${items.slice(0,24).map(card).join('')}</div>`;
  }

  let timer=null;
  const observer=new MutationObserver(()=>{
    clearTimeout(timer);
    timer=setTimeout(async()=>{
      const q=query.value.trim();
      const ownCount=cards.querySelectorAll('.product').length;
      if(!q||ownCount>=threshold){render([],ownCount);return;}
      const items=await search(q,{ownCount,threshold,language:document.documentElement.lang||'de',market:'DE'});
      render(items,ownCount);
    },50);
  });
  observer.observe(cards,{childList:true,subtree:false});

  window.FundBlickExternalSearch={registerProvider,search,threshold};

  // Development-only mock. Explicit query parameter required; never active by default.
  if(params.get('externalMock')==='1'){
    registerProvider({
      id:'mock-web',
      async search(q){
        if(!/akkuschrauber/i.test(q))return [];
        return [
          {id:'mock-1',title:'18 V Akku-Bohrschrauber – Beispieltreffer',brand:'Beispielmarke',merchant:'Externer Testhändler',price:99.99,currency:'EUR',shipping:'Versandinformationen aus externer Quelle',url:'https://example.com/',attributes:{Spannung:'18 V',Ausführung:'mit Akku'}},
          {id:'mock-2',title:'Kompakter Akkuschrauber 12 V – Beispieltreffer',brand:'Testwerkzeug',merchant:'Externer Testhändler',price:59.90,currency:'EUR',url:'https://example.com/',attributes:{Spannung:'12 V'}}
        ];
      }
    });
  }
})();
