'use strict';
const fs=require('fs');
let failed=false;
const read=f=>fs.readFileSync(f,'utf8');

// Search-page localization must remain presentation-only: no navigation/history rewrite.
const html=read('search.html');
for(const script of ['search-i18n.js','search-static-i18n.js','facet-value-i18n.js','common-filter-i18n.js'])if(!html.includes(script)){console.error(`search.html: missing ${script}`);failed=true;}
const staticI18n=read('search-static-i18n.js');
for(const text of ['Назад на главную','Товары загружаются','Цены и наличие основаны на подключённых данных продавцов'])if(!staticI18n.includes(text)){console.error(`search-static-i18n.js: missing Russian copy ${text}`);failed=true;}
for(const forbidden of ['history.pushState','history.replaceState','location.href=','location.assign(','location.replace('])if(staticI18n.includes(forbidden)){console.error(`search-static-i18n.js: forbidden navigation mutation ${forbidden}`);failed=true;}

// Homepage localization must also remain presentation-only.
const homeHtml=read('index.html');
if(!homeHtml.includes('home-i18n.js')){console.error('index.html: missing home-i18n.js');failed=true;}
const home=read('home-i18n.js');
for(const text of ['Ищите. Сравнивайте предложения. Готово.','Категории','Предложение дня','ПОЧЕМУ FUNDBLICK?','Выходные данные','Конфиденциальность'])if(!home.includes(text)){console.error(`home-i18n.js: missing ${text}`);failed=true;}
for(const forbidden of ['history.pushState','history.replaceState','location.href=','location.assign(','location.replace('])if(home.includes(forbidden)){console.error(`home-i18n.js: forbidden navigation mutation ${forbidden}`);failed=true;}
for(const key of ['headline','lead','searchPlaceholder','catLiving','catFurniture','catLighting','catDecor','affiliateNote'])if(!homeHtml.includes(`data-home-i18n="${key}"`)&&!homeHtml.includes(`data-home-i18n-placeholder="${key}"`)){console.error(`index.html: missing home i18n key ${key}`);failed=true;}

// Legal localization is isolated and must not mutate navigation/history.
const imprint=read('impressum.html');
if(!imprint.includes('legal-i18n.js')){console.error('impressum.html: missing legal-i18n.js');failed=true;}
const legal=read('legal-i18n.js');
for(const text of ['Выходные данные','Сведения согласно § 5 DDG','Германия','Контакты','Версия от 17 сентября 2026 г.'])if(!legal.includes(text)){console.error(`legal-i18n.js: missing ${text}`);failed=true;}
for(const forbidden of ['history.pushState','history.replaceState','location.href=','location.assign(','location.replace('])if(legal.includes(forbidden)){console.error(`legal-i18n.js: forbidden navigation mutation ${forbidden}`);failed=true;}

// Privacy policy must cover every block, including inactive affiliate disclosures, without navigation changes.
const privacyHtml=read('datenschutz.html');
const privacy=read('datenschutz-i18n.js');
if(!privacyHtml.includes('datenschutz-i18n.js')){console.error('datenschutz.html: missing RU V2 privacy translator');failed=true;}
const blocks=[...privacyHtml.matchAll(/data-privacy-i18n="(\\d+)"/g)].map(match=>Number(match[1]));
if(blocks.length!==69||blocks.some((id,index)=>id!==index+1)){console.error('datenschutz.html: privacy block mapping incomplete');failed=true;}
for(let id=1;id<=69;id++)if(id!==60&&!privacy.includes('"'+id+'":')){console.error('datenschutz-i18n.js: missing block '+id);failed=true;}
for(const text of ['Политика конфиденциальности','Голосовой ввод','Срок хранения','Awin','ADCELL','Главная'])if(!privacy.includes(text)){console.error('datenschutz-i18n.js: missing '+text);failed=true;}
for(const forbidden of ['history.pushState','history.replaceState','location.href=','location.assign(','location.replace('])if(privacy.includes(forbidden)){console.error('datenschutz-i18n.js: forbidden navigation mutation '+forbidden);failed=true;}

// Dynamic common facets and category schemas need Russian display labels.
const common=read('common-filter-i18n.js');
for(const text of ['Рейтинг','Магазины и предложения','Бесплатная доставка','В наличии','Доставка ≤ 3 рабочих дней'])if(!common.includes(text)){console.error(`common-filter-i18n.js: missing ${text}`);failed=true;}
const schemas=read('facet-schemas.js');
for(const text of ['Тип товара','Материал','Стиль','Область применения','Цена товара','Производитель / бренд','Магазин'])if(!schemas.includes(text)){console.error(`facet-schemas.js: missing ${text}`);failed=true;}
const values=read('facet-value-i18n.js');
for(const text of ['Телевизоры','Строительные фены','Кофемашины','Регулировка температуры'])if(!values.includes(text)){console.error(`facet-value-i18n.js: missing ${text}`);failed=true;}

// Mobile actions must not fall back to hard-coded German in Russian mode.
const mobile=read('search-mobile.js');
for(const text of ['Применить фильтры','результатов'])if(!mobile.includes(text)){console.error(`search-mobile.js: missing ${text}`);failed=true;}

// RU V2 must not reintroduce the failed RU V1 page-level runtime wiring.
for(const file of ['index.html','search.html','impressum.html']){
  const src=read(file);
  if(src.includes('ru-page-i18n.js')){console.error(`${file}: RU V1 runtime wiring reintroduced`);failed=true;}
}

if(failed)process.exit(1);
console.log('RU V2 localization safety gate OK.');
