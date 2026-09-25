'use strict';
(function(){
  const supported=['de','tr','ru','ar','pl','ro','uk','en','it','bg','hr','el','sr','es','fr','pt','fa','sq','zh-Hans','ku'];
  const emptySearch={
    de:'Bitte gib ein Produkt, eine Marke oder ein Modell ein.',
    tr:'Lütfen bir ürün, marka veya model girin.',
    ru:'Введите товар, бренд или модель.',
    ar:'يرجى إدخال منتج أو علامة تجارية أو موديل.',
    pl:'Wpisz produkt, markę lub model.',
    ro:'Introdu un produs, o marcă sau un model.',
    uk:'Введіть товар, бренд або модель.',
    en:'Please enter a product, brand or model.',
    it:'Inserisci un prodotto, un marchio o un modello.',
    bg:'Въведете продукт, марка или модел.',
    hr:'Unesite proizvod, marku ili model.',
    el:'Εισαγάγετε προϊόν, μάρκα ή μοντέλο.',
    sr:'Унесите производ, бренд или модел.',
    es:'Introduce un producto, una marca o modelo.',
    fr:'Saisissez un produit, une marque ou un modèle.',
    pt:'Introduza um produto, uma marca ou um modelo.',
    fa:'لطفاً یک محصول، برند یا مدل وارد کنید.',
    sq:'Shkruaj një produkt, markë ose model.',
    'zh-Hans':'请输入商品、品牌或型号。',
    ku:'Ji kerema xwe hilberek, markeyek an modelek binivîse.'
  };
  function normalize(value){const raw=String(value||'').trim().replace(/_/g,'-');if(!raw)return null;if(supported.includes(raw))return raw;const lower=raw.toLowerCase();if(lower==='zh'||lower.startsWith('zh-cn')||lower.startsWith('zh-sg')||lower.startsWith('zh-hans'))return 'zh-Hans';const base=lower.split('-')[0];return supported.find(x=>x.toLowerCase()===base)||null;}
  function current(){const params=new URLSearchParams(location.search),select=document.querySelector('#language');let saved=null;try{saved=localStorage.getItem('fundblick-language')}catch{}return normalize(params.get('lang'))||normalize(window.FundBlickLanguage?.lang)||normalize(select?.value)||normalize(saved)||normalize(document.documentElement.lang)||'de';}
  function eligible(anchor){const href=anchor.getAttribute('href');if(!href||href.startsWith('#')||href.startsWith('mailto:')||href.startsWith('tel:')||href.startsWith('javascript:'))return false;try{const url=new URL(href,location.href);return url.origin===location.origin}catch{return false}}
  function apply(lang=current()){
    document.querySelectorAll('a[href]').forEach(anchor=>{if(!eligible(anchor))return;const url=new URL(anchor.getAttribute('href'),location.href);url.searchParams.set('lang',lang);anchor.href=url.pathname+url.search+url.hash;});
    document.documentElement.dataset.navigationLanguage=lang;
  }
  function installHomeSearchGuard(){
    const form=document.querySelector('#searchForm'),input=document.querySelector('#q');if(!form||!input)return;
    let status=document.querySelector('#emptySearchStatus');
    if(!status){status=document.createElement('p');status.id='emptySearchStatus';status.className='voice-status';status.setAttribute('role','status');status.setAttribute('aria-live','assertive');status.hidden=true;form.insertAdjacentElement('afterend',status);}
    const clear=()=>{status.textContent='';status.hidden=true;input.removeAttribute('aria-invalid');};
    const show=()=>{const lang=current();status.textContent=emptySearch[lang]||emptySearch.en;status.hidden=false;input.setAttribute('aria-invalid','true');input.focus();};
    form.addEventListener('submit',event=>{if(!input.value.trim()){event.preventDefault();show();}else clear();});
    input.addEventListener('input',()=>{if(input.value.trim())clear();});
    const select=document.querySelector('#language');if(select)select.addEventListener('change',()=>{if(input.getAttribute('aria-invalid')==='true')queueMicrotask(show);});
  }

  const betaCopy={de:'Live-Beta · aktuell Testdaten',tr:'Canlı beta · şu anda test verileri',ru:'Live-бета · сейчас тестовые данные',ar:'نسخة تجريبية مباشرة · بيانات اختبار حالياً',pl:'Live beta · obecnie dane testowe',ro:'Beta live · momentan date de test',uk:'Live-бета · зараз тестові дані',en:'Live beta · currently test data',it:'Beta live · al momento dati di prova',bg:'Live beta · в момента тестови данни',hr:'Live beta · trenutačno testni podaci',el:'Live beta · προς το παρόν δοκιμαστικά δεδομένα',sr:'Live beta · тренутно тестни подаци',es:'Beta en vivo · actualmente datos de prueba',fr:'Bêta en ligne · données de test actuellement',pt:'Beta em direto · atualmente dados de teste',fa:'نسخه بتای زنده · فعلاً داده‌های آزمایشی',sq:'Beta live · aktualisht të dhëna testuese','zh-Hans':'在线测试版 · 当前为测试数据',ku:'Beta ya zindî · niha daneyên ceribandinê'};
  const resultsFor={de:'Ergebnisse für',tr:'Sonuçlar',ru:'Результаты для',ar:'نتائج البحث عن',pl:'Wyniki dla',ro:'Rezultate pentru',uk:'Результати для',en:'Results for',it:'Risultati per',bg:'Резултати за',hr:'Rezultati za',el:'Αποτελέσματα για',sr:'Резултати за',es:'Resultados para',fr:'Résultats pour',pt:'Resultados para',fa:'نتایج برای',sq:'Rezultate për','zh-Hans':'搜索结果',ku:'Encam ji bo'};
  function installBetaBadge(){
    const language=document.querySelector('.hero-language');if(!language)return;
    let badge=document.querySelector('.fb-beta-badge');
    if(!badge){badge=document.createElement('div');badge.className='fb-beta-badge';badge.setAttribute('role','note');language.insertAdjacentElement('afterend',badge);}
    const paint=()=>{badge.textContent=betaCopy[current()]||betaCopy.de;};paint();
    document.querySelector('#language')?.addEventListener('change',()=>queueMicrotask(paint));
  }
  function installQueryContext(){
    const form=document.querySelector('.search-form');if(!form)return;
    let box=document.querySelector('#searchQueryContext');
    if(!box){box=document.createElement('div');box.id='searchQueryContext';box.className='search-query-context';box.setAttribute('role','note');form.insertAdjacentElement('afterend',box);}
    const paint=()=>{const q=(new URLSearchParams(location.search).get('q')||'').trim();if(!q){box.hidden=true;box.textContent='';return;}box.hidden=false;box.replaceChildren();const label=document.createElement('span');label.className='search-query-context-label';label.textContent=(resultsFor[current()]||resultsFor.de)+':';const value=document.createElement('strong');value.dir='auto';value.textContent=q;box.append(label,value);};
    paint();document.querySelector('#language')?.addEventListener('change',()=>queueMicrotask(paint));form.addEventListener('submit',()=>queueMicrotask(paint));window.addEventListener('pageshow',paint);window.addEventListener('popstate',paint);
  }
  function installLegalShell(){
    if(!document.body.classList.contains('fb-legal-page')||document.querySelector('.fb-legal-header'))return;
    const header=document.createElement('header');header.className='fb-legal-header';header.innerHTML='<div class="fb-legal-header-inner"><a class="fb-shell-brand" href="/" aria-label="FundBlick Startseite">Fund<span>Blick</span></a><a class="fb-shell-home" href="/">Startseite</a></div>';document.body.prepend(header);
    const footer=document.createElement('footer');footer.className='fb-legal-footer';footer.innerHTML='<div><strong>FundBlick</strong><span>Produktsuche · Preisvergleich</span></div>';document.body.append(footer);
  }
  function installCustomerPolish(){installBetaBadge();installQueryContext();installLegalShell();}

  function loadAsset(tag,attrs){return new Promise((resolve,reject)=>{const exists=attrs.src?document.querySelector(`script[src^="${attrs.src}"]`):document.querySelector(`link[href^="${attrs.href}"]`);if(exists){resolve(exists);return;}const el=document.createElement(tag);Object.entries(attrs).forEach(([key,value])=>el.setAttribute(key,value));el.addEventListener('load',()=>resolve(el),{once:true});el.addEventListener('error',reject,{once:true});document.head.appendChild(el);});}
  function installAffiliateReadiness(){
    loadAsset('link',{rel:'stylesheet',href:'affiliate-consent.css?v=20260925-live21'}).catch(()=>{});
    loadAsset('script',{src:'affiliate-config.js?v=20260925-live21'})
      .then(()=>loadAsset('script',{src:'affiliate-consent-version.js?v=20260925-live21'}))
      .then(()=>loadAsset('script',{src:'affiliate-consent.js?v=20260925-live21'}))
      .then(()=>loadAsset('script',{src:'affiliate-link-policy.js?v=20260925-live21'}))
      .then(()=>loadAsset('script',{src:'affiliate-outbound.js?v=20260925-live21'}))
      .catch(()=>{});
  }
  const select=document.querySelector('#language');if(select)select.addEventListener('change',()=>queueMicrotask(()=>apply(normalize(select.value)||'de')));
  apply();
  installHomeSearchGuard();
  installCustomerPolish();
  installAffiliateReadiness();
  window.FundBlickLanguageLinks={apply,current,emptySearch};
})();
