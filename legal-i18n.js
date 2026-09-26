'use strict';
(function(){
  const page=document.body?.dataset?.legalPage;
  if(!page)return;
  let lang='de';
  try{lang=localStorage.getItem('fundblick-language')||'de'}catch{}
  const copy={
    de:{back:'← FundBlick',imprintTitle:'Impressum',imprintBasis:'Angaben gemäß § 5 DDG',germany:'Deutschland',contact:'Kontakt',emailLabel:'E-Mail:',imprintDate:'Stand: 17. September 2026'},
    ru:{back:'← FundBlick',imprintTitle:'Выходные данные',imprintBasis:'Сведения согласно § 5 DDG',germany:'Германия',contact:'Контакты',emailLabel:'Эл. почта:',imprintDate:'Версия от 17 сентября 2026 г.'},
    en:{back:'← FundBlick',imprintTitle:'Legal notice',imprintBasis:'Information pursuant to § 5 DDG',germany:'Germany',contact:'Contact',emailLabel:'Email:',imprintDate:'Last updated: 17 September 2026'}
  };
  const t=copy[lang]||copy.en;
  document.documentElement.lang=lang;
  document.querySelectorAll('[data-legal-i18n]').forEach(el=>{const key=el.dataset.legalI18n;if(t[key])el.textContent=t[key];});
})();
