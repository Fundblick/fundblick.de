'use strict';
(function(root){
  const api=root.FundBlickTaxonomyI18n;
  if(!api)return;
  Object.assign(api.aliases,{
    'Ergänzungsfutter':'equestrian_supplement',
    'Pferdepflege':'horse_care',
    'Bundle':'bundle'
  });
  api.labels.ru=api.labels.ru||{};
  Object.assign(api.labels.ru,{
    equestrian_supplement:'Кормовая добавка',
    horse_care:'Уход за лошадью',
    bundle:'Набор'
  });
})(typeof window!=='undefined'?window:globalThis);
