'use strict';

(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.FundBlickIntentQuery=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  const terms={
    de:{offers:'kaufen Preis Angebot',info:'Erklärung Ratgeber',video:'Video',local:'Händler Geschäft vor Ort'},
    en:{offers:'buy price offers',info:'explanation guide',video:'video',local:'local store dealer nearby'},
    ru:{offers:'купить цена предложения',info:'объяснение руководство',video:'видео',local:'магазин продавец рядом'},
    ro:{offers:'cumpără preț oferte',info:'explicație ghid',video:'video',local:'magazin comerciant local'},
    tr:{offers:'satın al fiyat teklif',info:'açıklama rehber',video:'video',local:'yerel mağaza satıcı'},
    pl:{offers:'kup cena oferta',info:'wyjaśnienie poradnik',video:'wideo',local:'lokalny sklep sprzedawca'},
    it:{offers:'comprare prezzo offerte',info:'spiegazione guida',video:'video',local:'negozio rivenditore locale'},
    fr:{offers:'acheter prix offres',info:'explication guide',video:'vidéo',local:'magasin vendeur local'},
    es:{offers:'comprar precio ofertas',info:'explicación guía',video:'video',local:'tienda vendedor local'}
  };

  function clean(value){return String(value||'').replace(/\s+/g,' ').trim()}
  function refine(query,view='offers',language='de'){
    const q=clean(query);
    if(!q)return '';
    const lang=String(language||'de').toLowerCase().split('-')[0];
    const table=terms[lang]||terms.en;
    const key=['offers','info','video','local'].includes(view)?view:'offers';
    return `${q} ${table[key]}`.trim();
  }
  return Object.freeze({refine,terms});
});
