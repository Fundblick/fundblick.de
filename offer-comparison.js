'use strict';
(function(root){
  if(!root||!root.document)return;
  const COPY={
    de:{summary:n=>`${n} Händlerangebote vergleichen`,shipping:'Versand',total:'Gesamt',delivery:'Lieferung',days:'Tage',simulated:'Simulierte Testangebote'},
    tr:{summary:n=>`${n} satıcı teklifini karşılaştır`,shipping:'Kargo',total:'Toplam',delivery:'Teslimat',days:'gün',simulated:'Simüle test teklifleri'},
    ru:{summary:n=>`Сравнить предложения: ${n}`,shipping:'Доставка',total:'Итого',delivery:'Срок',days:'дн.',simulated:'Смоделированные тестовые предложения'},
    ar:{summary:n=>`مقارنة ${n} عروض تجار`,shipping:'الشحن',total:'الإجمالي',delivery:'التوصيل',days:'أيام',simulated:'عروض اختبار محاكاة'},
    pl:{summary:n=>`Porównaj ${n} ofert`,shipping:'Wysyłka',total:'Razem',delivery:'Dostawa',days:'dni',simulated:'Symulowane oferty testowe'},
    ro:{summary:n=>`Compară ${n} oferte`,shipping:'Livrare',total:'Total',delivery:'Livrare în',days:'zile',simulated:'Oferte de test simulate'},
    uk:{summary:n=>`Порівняти пропозиції: ${n}`,shipping:'Доставка',total:'Разом',delivery:'Термін',days:'дн.',simulated:'Змодельовані тестові пропозиції'},
    en:{summary:n=>`Compare ${n} merchant offers`,shipping:'Shipping',total:'Total',delivery:'Delivery',days:'days',simulated:'Simulated test offers'},
    it:{summary:n=>`Confronta ${n} offerte`,shipping:'Spedizione',total:'Totale',delivery:'Consegna',days:'giorni',simulated:'Offerte di test simulate'},
    bg:{summary:n=>`Сравни ${n} оферти`,shipping:'Доставка',total:'Общо',delivery:'Срок',days:'дни',simulated:'Симулирани тестови оферти'},
    hr:{summary:n=>`Usporedi ${n} ponude`,shipping:'Dostava',total:'Ukupno',delivery:'Isporuka',days:'dana',simulated:'Simulirane testne ponude'},
    el:{summary:n=>`Σύγκριση ${n} προσφορών`,shipping:'Μεταφορικά',total:'Σύνολο',delivery:'Παράδοση',days:'ημέρες',simulated:'Προσομοιωμένες δοκιμαστικές προσφορές'},
    sr:{summary:n=>`Упореди ${n} понуде`,shipping:'Достава',total:'Укупно',delivery:'Испорука',days:'дана',simulated:'Симулиране тест понуде'},
    es:{summary:n=>`Comparar ${n} ofertas`,shipping:'Envío',total:'Total',delivery:'Entrega',days:'días',simulated:'Ofertas de prueba simuladas'},
    fr:{summary:n=>`Comparer ${n} offres`,shipping:'Livraison',total:'Total',delivery:'Délai',days:'jours',simulated:'Offres de test simulées'},
    pt:{summary:n=>`Comparar ${n} ofertas`,shipping:'Envio',total:'Total',delivery:'Entrega',days:'dias',simulated:'Ofertas de teste simuladas'},
    fa:{summary:n=>`مقایسه ${n} پیشنهاد فروشنده`,shipping:'ارسال',total:'مجموع',delivery:'تحویل',days:'روز',simulated:'پیشنهادهای آزمایشی شبیه‌سازی‌شده'},
    sq:{summary:n=>`Krahaso ${n} oferta`,shipping:'Transporti',total:'Gjithsej',delivery:'Dorëzimi',days:'ditë',simulated:'Oferta testuese të simuluara'},
    'zh-Hans':{summary:n=>`比较 ${n} 个商家报价`,shipping:'运费',total:'总价',delivery:'配送',days:'天',simulated:'模拟测试报价'},
    ku:{summary:n=>`${n} pêşniyarên firoşkaran berawird bike`,shipping:'Şandin',total:'Tevahî',delivery:'Radestkirin',days:'roj',simulated:'Pêşniyarên ceribandinê yên simulekirî'}
  };
  const localeMap={de:'de-DE',tr:'tr-TR',ru:'ru-RU',ar:'ar-SA',pl:'pl-PL',ro:'ro-RO',uk:'uk-UA',en:'en-GB',it:'it-IT',bg:'bg-BG',hr:'hr-HR',el:'el-GR',sr:'sr-RS',es:'es-ES',fr:'fr-FR',pt:'pt-PT',fa:'fa-IR',sq:'sq-AL','zh-Hans':'zh-CN',ku:'ku-TR'};
  const normalize=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const lang=()=>root.FundBlickLanguage?.lang||document.documentElement.lang||'de';
  const tx=()=>COPY[lang()]||COPY.en;
  const money=value=>new Intl.NumberFormat(localeMap[lang()]||'en-GB',{style:'currency',currency:'EUR'}).format(Number(value));
  let products=[];

  function installStyle(){
    if(document.getElementById('fundblick-offer-comparison-style'))return;
    const style=document.createElement('style');style.id='fundblick-offer-comparison-style';style.textContent=`.offer-comparison{margin-top:12px;border-top:1px solid var(--line);padding-top:10px}.offer-comparison summary{cursor:pointer;font-size:13px;font-weight:800;color:var(--green)}.offer-comparison-list{display:grid;gap:6px;margin-top:9px}.offer-row{display:grid;grid-template-columns:minmax(90px,1fr) auto auto;gap:10px;align-items:center;padding:7px 8px;background:var(--soft);border-radius:8px;font-size:12px}.offer-row b{font-size:12px}.offer-row span,.offer-row small{color:var(--muted)}.offer-row strong{text-align:right;font-size:13px}.offer-note{display:block;margin-top:7px;color:var(--muted);font-size:10px}@media(max-width:560px){.offer-row{grid-template-columns:1fr auto}.offer-row .offer-meta{grid-column:1/-1}.offer-row strong{grid-column:2;grid-row:1}}`;
    document.head.appendChild(style);
  }
  function productFor(article){
    const heading=article.querySelector('h2');if(!heading)return null;
    const headingNorm=normalize(heading.textContent);let match=products.find(product=>normalize(product.name)===headingNorm);if(match)return match;
    const meta=heading.previousElementSibling;const brand=normalize(meta?.textContent?.split('·')[0]);if(!brand)return null;
    const candidates=products.filter(product=>normalize(product.brand)===brand);return candidates.length===1?candidates[0]:candidates.find(product=>headingNorm.includes(normalize(product.brand)))||null;
  }
  function renderArticle(article,force=false){
    if(force){article.querySelector('.offer-comparison')?.remove();delete article.dataset.offersReady;}
    if(article.dataset.offersReady==='1')return;
    const product=productFor(article);if(!product||!Array.isArray(product.offers)||!product.offers.length)return;
    const heading=article.querySelector('h2'),content=heading?.parentElement;if(!content)return;
    const offers=[...product.offers].sort((a,b)=>Number(a.totalPrice)-Number(b.totalPrice)||Number(a.deliveryDays)-Number(b.deliveryDays));
    const t=tx();const details=document.createElement('details');details.className='offer-comparison';
    const summary=document.createElement('summary');summary.textContent=t.summary(offers.length);details.appendChild(summary);
    const list=document.createElement('div');list.className='offer-comparison-list';
    offers.slice(0,5).forEach(offer=>{const row=document.createElement('div');row.className='offer-row';const merchant=document.createElement('b');merchant.textContent=offer.merchant||offer.merchantId||'Demo';const meta=document.createElement('span');meta.className='offer-meta';meta.textContent=`${t.shipping}: ${money(offer.shippingCost)} · ${t.delivery}: ${offer.deliveryDays} ${t.days}`;const total=document.createElement('strong');total.textContent=`${t.total}: ${money(offer.totalPrice)}`;row.append(merchant,meta,total);list.appendChild(row);});
    details.appendChild(list);const note=document.createElement('small');note.className='offer-note';note.textContent=t.simulated;details.appendChild(note);content.appendChild(details);article.dataset.offersReady='1';
  }
  function apply(force=false){installStyle();document.querySelectorAll('#cards article.product').forEach(article=>renderArticle(article,force));}
  function ready(){const catalog=root.FundBlickCatalog;if(!catalog?.load)return;catalog.load().then(list=>{products=Array.isArray(list)?list:[];apply();}).catch(()=>{});}
  const cards=document.getElementById('cards');if(cards)new MutationObserver(()=>queueMicrotask(()=>apply())).observe(cards,{childList:true,subtree:true});
  document.querySelector('#language')?.addEventListener('change',()=>queueMicrotask(()=>apply(true)));
  ready();
  root.FundBlickOfferComparison={apply};
})(typeof window!=='undefined'?window:null);
