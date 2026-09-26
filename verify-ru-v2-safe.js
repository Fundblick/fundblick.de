'use strict';
const fs=require('fs');
let failed=false;
const read=f=>fs.readFileSync(f,'utf8');
const requireText=(file,text)=>{if(!read(file).includes(text)){console.error(`${file}: missing ${text}`);failed=true;}};

// Search-page localization must remain presentation-only: no navigation/history rewrite.
const html=read('search.html');
for(const script of ['search-i18n.js','search-static-i18n.js','facet-value-i18n.js','common-filter-i18n.js'])if(!html.includes(script)){console.error(`search.html: missing ${script}`);failed=true;}
const staticI18n=read('search-static-i18n.js');
for(const text of ['Назад на главную','Товары загружаются','Цены и наличие поступают'])if(!staticI18n.includes(text)){console.error(`search-static-i18n.js: missing Russian copy ${text}`);failed=true;}
for(const forbidden of ['history.pushState','history.replaceState','location.href=','location.assign(','location.replace('])if(staticI18n.includes(forbidden)){console.error(`search-static-i18n.js: forbidden navigation mutation ${forbidden}`);failed=true;}

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
for(const file of ['index.html','search.html']){
  const src=read(file);
  if(src.includes('ru-page-i18n.js')){console.error(`${file}: RU V1 runtime wiring reintroduced`);failed=true;}
}

if(failed)process.exit(1);
console.log('RU V2 localization safety gate OK.');
