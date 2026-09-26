'use strict';
(function(root){
  if(!root||!root.document)return;
  const copy={
    de:{current:'Aktueller Händlerpreis',reference:'Vergleichspreis',saving:'Ersparnis',merchant:'Händler',offer:'Angebot ansehen',spotlight:'Heutiges Angebot',qualified:'Qualifizierter Deal'},
    en:{current:'Current merchant price',reference:'Reference price',saving:'Saving',merchant:'Merchant',offer:'View offer',spotlight:"Today's offer",qualified:'Qualified deal'},
    ru:{current:'Текущая цена продавца',reference:'Сравнительная цена',saving:'Экономия',merchant:'Магазин',offer:'Посмотреть предложение',spotlight:'Предложение дня',qualified:'Подтверждённая скидка'},
    tr:{current:'Güncel satıcı fiyatı',reference:'Referans fiyat',saving:'Tasarruf',merchant:'Satıcı',offer:'Teklifi gör',spotlight:'Günün teklifi',qualified:'Doğrulanmış fırsat'},
    ar:{current:'سعر التاجر الحالي',reference:'السعر المرجعي',saving:'التوفير',merchant:'التاجر',offer:'عرض المنتج',spotlight:'عرض اليوم',qualified:'عرض موثّق'},
    pl:{current:'Aktualna cena sprzedawcy',reference:'Cena odniesienia',saving:'Oszczędność',merchant:'Sprzedawca',offer:'Zobacz ofertę',spotlight:'Oferta dnia',qualified:'Zweryfikowana okazja'},
    ro:{current:'Preț curent comerciant',reference:'Preț de referință',saving:'Economie',merchant:'Comerciant',offer:'Vezi oferta',spotlight:'Oferta zilei',qualified:'Ofertă verificată'},
    uk:{current:'Поточна ціна продавця',reference:'Порівняльна ціна',saving:'Економія',merchant:'Магазин',offer:'Переглянути пропозицію',spotlight:'Пропозиція дня',qualified:'Підтверджена знижка'},
    it:{current:'Prezzo attuale del rivenditore',reference:'Prezzo di riferimento',saving:'Risparmio',merchant:'Rivenditore',offer:'Vedi offerta',spotlight:'Offerta del giorno',qualified:'Offerta verificata'},
    fr:{current:'Prix marchand actuel',reference:'Prix de référence',saving:'Économie',merchant:'Marchand',offer:"Voir l'offre",spotlight:'Offre du jour',qualified:'Bon plan vérifié'},
    es:{current:'Precio actual del vendedor',reference:'Precio de referencia',saving:'Ahorro',merchant:'Tienda',offer:'Ver oferta',spotlight:'Oferta del día',qualified:'Oferta verificada'},
    pt:{current:'Preço atual da loja',reference:'Preço de referência',saving:'Poupança',merchant:'Loja',offer:'Ver oferta',spotlight:'Oferta do dia',qualified:'Oferta verificada'}
  };
  const lang=()=>document.querySelector('#language')?.value||document.documentElement.lang||'de';
  const t=()=>copy[lang()]||copy.en;
  const localeMap={de:'de-DE',en:'en-GB',ru:'ru-RU',tr:'tr-TR',ar:'ar',pl:'pl-PL',ro:'ro-RO',uk:'uk-UA',it:'it-IT',fr:'fr-FR',es:'es-ES',pt:'pt-PT'};
  const money=value=>new Intl.NumberFormat(localeMap[lang()]||'en-GB',{style:'currency',currency:'EUR'}).format(Number(value));
  const searchUrl=query=>'search.html?'+new URLSearchParams({q:query,lang:lang()}).toString();
  let products=[];
  function render(){
    const content=document.querySelector('#deal-content'),empty=document.querySelector('#deal-empty');
    if(!content||!empty)return;
    const deal=root.FundBlickDealOfDay?.selectDaily(products)||null;
    if(!deal){content.hidden=true;empty.hidden=false;return;}
    const text=t(),qualified=deal.kind==='deal';
    empty.hidden=true;content.hidden=false;content.dataset.dealKind=deal.kind;
    const image=document.querySelector('#dealImage');
    image.src=deal.image;image.alt='';image.hidden=!deal.image;
    document.querySelector('#dealBrand').textContent=deal.brand||deal.merchant||'FundBlick';
    document.querySelector('#dealName').textContent=deal.name;
    document.querySelector('#dealKind').textContent=qualified?text.qualified:text.spotlight;
    document.querySelector('#dealPriceLabel').textContent=text.current;
    document.querySelector('#dealPrice').textContent=money(deal.currentPrice);
    const reference=document.querySelector('#dealReference'),discount=document.querySelector('#dealDiscount'),saving=document.querySelector('#dealSaving'),evidence=document.querySelector('#dealEvidence');
    reference.hidden=!qualified;discount.hidden=!qualified;saving.hidden=!qualified;
    if(qualified){reference.textContent=money(deal.reference);discount.textContent='−'+Math.round(deal.discountPct)+' %';saving.textContent=`${text.saving}: ${money(deal.saving)}`;evidence.textContent=text.reference;}
    else{reference.textContent='';discount.textContent='';saving.textContent='';evidence.textContent=text.current;}
    document.querySelector('#dealMerchant').textContent=deal.merchant||'—';
    document.querySelector('#dealMerchantLabel').textContent=text.merchant;
    const cta=document.querySelector('#dealCta');cta.href=searchUrl(deal.name);cta.querySelector('span').textContent=text.offer;
  }
  document.querySelector('#language')?.addEventListener('change',()=>queueMicrotask(render));
  if(root.FundBlickCatalog?.load)root.FundBlickCatalog.load().then(list=>{products=Array.isArray(list)?list:[];render();}).catch(()=>{products=[];render();});
  root.FundBlickHomeDeal={render};
})(typeof window!=='undefined'?window:null);
