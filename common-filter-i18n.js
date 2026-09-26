'use strict';
(function(){
  const lang=window.FundBlickLanguage?.lang||'de';
  const copy={
    de:{rating:'Bewertung',merchant:'Händler',merchants:'Händler & Angebote',free:'Kostenloser Versand',stock:'Sofort lieferbar',fast:'Lieferung ≤ 3 Werktage'},
    tr:{rating:'Değerlendirme',merchant:'Satıcı',merchants:'Mağazalar ve teklifler',free:'Ücretsiz kargo',stock:'Hemen teslim',fast:'Teslimat ≤ 3 iş günü'},
    ru:{rating:'Рейтинг',merchant:'Магазин',merchants:'Магазины и предложения',free:'Бесплатная доставка',stock:'В наличии',fast:'Доставка ≤ 3 рабочих дня'},
    ar:{rating:'التقييم',merchant:'التاجر',merchants:'المتاجر والعروض',free:'شحن مجاني',stock:'متوفر فوراً',fast:'التوصيل خلال ≤ 3 أيام عمل'},
    pl:{rating:'Ocena',merchant:'Sprzedawca',merchants:'Sklepy i oferty',free:'Darmowa dostawa',stock:'Dostępny od ręki',fast:'Dostawa ≤ 3 dni robocze'},
    ro:{rating:'Evaluare',merchant:'Comerciant',merchants:'Comercianți și oferte',free:'Livrare gratuită',stock:'Disponibil imediat',fast:'Livrare ≤ 3 zile lucrătoare'},
    uk:{rating:'Рейтинг',merchant:'Магазин',merchants:'Магазини та пропозиції',free:'Безкоштовна доставка',stock:'Є в наявності',fast:'Доставка ≤ 3 робочі дні'},
    en:{rating:'Rating',merchant:'Merchant',merchants:'Merchants & offers',free:'Free shipping',stock:'In stock',fast:'Delivery ≤ 3 business days'},
    it:{rating:'Valutazione',merchant:'Rivenditore',merchants:'Negozi e offerte',free:'Spedizione gratuita',stock:'Disponibile subito',fast:'Consegna ≤ 3 giorni lavorativi'},
    bg:{rating:'Оценка',merchant:'Търговец',merchants:'Магазини и оферти',free:'Безплатна доставка',stock:'Наличен веднага',fast:'Доставка ≤ 3 работни дни'},
    hr:{rating:'Ocjena',merchant:'Trgovac',merchants:'Trgovine i ponude',free:'Besplatna dostava',stock:'Odmah dostupno',fast:'Dostava ≤ 3 radna dana'},
    el:{rating:'Αξιολόγηση',merchant:'Έμπορος',merchants:'Καταστήματα και προσφορές',free:'Δωρεάν αποστολή',stock:'Άμεσα διαθέσιμο',fast:'Παράδοση ≤ 3 εργάσιμες ημέρες'},
    sr:{rating:'Оцена',merchant:'Продавац',merchants:'Продавнице и понуде',free:'Бесплатна достава',stock:'Одмах доступно',fast:'Испорука ≤ 3 радна дана'},
    es:{rating:'Valoración',merchant:'Tienda',merchants:'Tiendas y ofertas',free:'Envío gratis',stock:'Disponible de inmediato',fast:'Entrega ≤ 3 días laborables'},
    fr:{rating:'Note',merchant:'Marchand',merchants:'Marchands et offres',free:'Livraison gratuite',stock:'Disponible immédiatement',fast:'Livraison ≤ 3 jours ouvrés'},
    pt:{rating:'Avaliação',merchant:'Loja',merchants:'Lojas e ofertas',free:'Envio grátis',stock:'Disponível de imediato',fast:'Entrega ≤ 3 dias úteis'},
    fa:{rating:'امتیاز',merchant:'فروشنده',merchants:'فروشگاه‌ها و پیشنهادها',free:'ارسال رایگان',stock:'موجود برای ارسال فوری',fast:'تحویل ≤ ۳ روز کاری'},
    sq:{rating:'Vlerësimi',merchant:'Tregtar',merchants:'Dyqane dhe oferta',free:'Transport falas',stock:'Në stok',fast:'Dorëzim ≤ 3 ditë pune'},
    'zh-Hans':{rating:'评分',merchant:'商家',merchants:'商家与报价',free:'免运费',stock:'现货',fast:'配送 ≤ 3 个工作日'},
    ku:{rating:'Nirxandin',merchant:'Firoşkar',merchants:'Firoşgeh û pêşniyar',free:'Şandina belaş',stock:'Di stokê de',fast:'Şandin ≤ 3 rojên karê'}
  };
  const t=copy[lang]||copy.en;
  const values={'Kostenloser Versand':t.free,'Sofort lieferbar':t.stock,'Lieferung ≤ 3 Werktage':t.fast};
  window.FBCommonFilterI18n={lang,labels:t,values};
  function setText(el,value){if(el&&el.textContent!==value)el.textContent=value;}
  function translateLabel(label){const input=label.querySelector('input[type="checkbox"]');if(!input)return;const translated=values[input.value];if(!translated)return;const text=[...label.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());if(text&&text.textContent.trim()!==translated)text.textContent=' '+translated+' ';}
  function apply(){
    document.querySelectorAll('#filters .facet').forEach(section=>{const key=section.querySelector('input[type="checkbox"]')?.dataset.key;if(key==='rating')setText(section.querySelector('h2'),t.rating);if(key==='merchant')setText(section.querySelector('h2'),t.merchant);if(key==='merchants')setText(section.querySelector('h2'),t.merchants);section.querySelectorAll('label').forEach(translateLabel);});
    document.querySelectorAll('#chips button[data-remove]').forEach(button=>{const raw=button.dataset.remove||'',pos=raw.indexOf(':');if(pos<0)return;const key=raw.slice(0,pos),value=raw.slice(pos+1),translated=values[value],target=translated?translated+' ×':'';if(key==='shipping'&&translated&&button.textContent!==target)button.textContent=target;});
  }
  const targets=['filters','chips'].map(id=>document.getElementById(id)).filter(Boolean);const observer=new MutationObserver(()=>queueMicrotask(apply));targets.forEach(el=>observer.observe(el,{childList:true,subtree:true,characterData:true}));apply();
})();