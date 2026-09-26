'use strict';
(function(){
  const lang=window.FundBlickLanguage?.lang||'de';
  const copy={
    de:{backHome:'Zurück zur Hauptseite',loading:'Produkte werden geladen …',merchantDataNote:'Preise und Verfügbarkeit stammen aus den angebundenen Händlerdaten. Versandkosten werden nur berücksichtigt, wenn sie verlässlich vorliegen.'},
    ru:{backHome:'Назад на главную',loading:'Товары загружаются …',merchantDataNote:'Цены и наличие основаны на подключённых данных продавцов. Стоимость доставки учитывается только при наличии надёжных данных.'},
    en:{backHome:'Back to homepage',loading:'Loading products …',merchantDataNote:'Prices and availability come from connected merchant data. Shipping costs are included only when reliable data is available.'}
  };
  const t=copy[lang]||copy.en;
  for(const [key,value] of Object.entries(t)){
    const el=document.querySelector(`[data-i18n="${key}"]`);
    if(el)el.textContent=value;
  }
})();
