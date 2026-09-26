'use strict';
(function(){
  let lang='de';
  try{lang=localStorage.getItem('fundblick-language')||'de'}catch{}
  try{const requested=new URLSearchParams(location.search).get('lang');if(requested)lang=requested}catch{}
  const copy={
    de:{title:'Hier gibt es nichts zu finden.',text:'Die aufgerufene Seite existiert nicht oder wurde verschoben.',search:'Zur Produktsuche'},
    ru:{title:'Здесь ничего не найдено.',text:'Запрошенная страница не существует или была перемещена.',search:'К поиску товаров'},
    en:{title:'There is nothing to find here.',text:'The requested page does not exist or has been moved.',search:'Go to product search'}
  };
  if(!copy[lang])lang='en';
  const t=copy[lang];
  document.documentElement.lang=lang;
  document.title=(lang==='ru'?'Страница не найдена':lang==='de'?'Seite nicht gefunden':'Page not found')+' – FundBlick';
  document.querySelectorAll('[data-error-i18n]').forEach(el=>{const key=el.dataset.errorI18n;if(t[key])el.textContent=t[key];});
})();
