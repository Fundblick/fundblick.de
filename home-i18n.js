'use strict';
(function(){
  const select=document.getElementById('language');
  if(!select)return;
  const copy={
    de:{skip:'Zum Inhalt',brandHome:'FundBlick Startseite',mainNav:'Hauptnavigation',categories:'Kategorien',dailyDeal:'Tagesangebot',language:'Sprache',chooseLanguage:'Sprache wählen',eyebrow:'PRODUKTSUCHE · HÄNDLERPREISE',headline:'Suchen. Angebote vergleichen. Fertig.',lead:'Produkt eingeben – FundBlick zeigt dir aktuell angebundene Händlerangebote und die verfügbaren Preis- und Produktinformationen.',searchLabel:'Produkte suchen',searchPlaceholder:'Produkt, Marke oder Modell suchen …',searchButton:'Suchen',productCategories:'Produktkategorien',catLiving:'Wohnen & Haushalt',catFurniture:'Möbel',catLighting:'Lampen & Beleuchtung',catDecor:'Dekoration',autoChecked:'automatisch geprüft',noDeal:'Heute kein qualifiziertes Schnäppchen',dealNote:'Nur Angebote mit ausreichend belastbaren Vergleichsdaten erscheinen hier.',why:'WARUM FUNDBLICK?',how:'So arbeitet FundBlick für dich.',valueLead:'Weniger Sucherei – schneller zum passenden Händlerangebot.',step1Title:'Produkt suchen',step1Text:'Produkt, Marke oder Modell eingeben.',step2Title:'Angebote vergleichen',step2Text:'Verfügbare Preis- und Produktinformationen übersichtlich vergleichen.',step3Title:'Zum Händler',step3Text:'Passendes Angebot auswählen und direkt zum Händler wechseln.',legal:'Rechtliches',imprint:'Impressum',privacy:'Datenschutz',affiliateNote:'Bei Händlerlinks können wir eine Vergütung erhalten. Dein Preis ändert sich dadurch nicht.'},
    ru:{skip:'К содержанию',brandHome:'Главная FundBlick',mainNav:'Главная навигация',categories:'Категории',dailyDeal:'Предложение дня',language:'Язык',chooseLanguage:'Выбрать язык',eyebrow:'ПОИСК ТОВАРОВ · ЦЕНЫ ПРОДАВЦОВ',headline:'Ищите. Сравнивайте предложения. Готово.',lead:'Введите товар — FundBlick покажет предложения подключённых продавцов и доступную информацию о ценах и товарах.',searchLabel:'Искать товары',searchPlaceholder:'Искать товар, бренд или модель …',searchButton:'Искать',productCategories:'Категории товаров',catLiving:'Дом и быт',catFurniture:'Мебель',catLighting:'Лампы и освещение',catDecor:'Декор',autoChecked:'проверено автоматически',noDeal:'Сегодня нет предложения, соответствующего критериям',dealNote:'Здесь появляются только предложения с достаточно надёжными данными для сравнения.',why:'ПОЧЕМУ FUNDBLICK?',how:'Как FundBlick работает для вас.',valueLead:'Меньше поисков — быстрее к подходящему предложению продавца.',step1Title:'Найдите товар',step1Text:'Введите товар, бренд или модель.',step2Title:'Сравните предложения',step2Text:'Сравните доступную информацию о ценах и товарах.',step3Title:'Перейдите к продавцу',step3Text:'Выберите подходящее предложение и перейдите непосредственно к продавцу.',legal:'Правовая информация',imprint:'Выходные данные',privacy:'Конфиденциальность',affiliateNote:'Мы можем получать вознаграждение за переходы по ссылкам продавцов. Для вас цена от этого не меняется.'}
  };
  const supported=new Set(Object.keys(copy));
  function saved(){try{return localStorage.getItem('fundblick-language')}catch{return null}}
  function language(){return supported.has(select.value)?select.value:(supported.has(saved())?saved():'de')}
  function apply(){
    const lang=language(),t=copy[lang]||copy.de;
    document.documentElement.lang=lang;
    document.querySelectorAll('[data-home-i18n]').forEach(el=>{const key=el.dataset.homeI18n;if(t[key])el.textContent=t[key];});
    document.querySelectorAll('[data-home-i18n-placeholder]').forEach(el=>{const key=el.dataset.homeI18nPlaceholder;if(t[key])el.setAttribute('placeholder',t[key]);});
    document.querySelectorAll('[data-home-i18n-aria]').forEach(el=>{const key=el.dataset.homeI18nAria;if(t[key])el.setAttribute('aria-label',t[key]);});
    try{localStorage.setItem('fundblick-language',lang)}catch{}
  }
  const initial=saved();if(supported.has(initial))select.value=initial;
  select.addEventListener('change',apply);
  apply();
})();
