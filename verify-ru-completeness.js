'use strict';
const fs=require('fs');
const mustLoad={
  'index.html':['language-links.js'],
  'search.html':['language-links.js','product-copy-i18n.js'],
  'impressum.html':['language-links.js'],
  'datenschutz.html':['language-links.js'],
  '404.html':['language-links.js']
};
let failed=false;
for(const [file,scripts] of Object.entries(mustLoad)){
  const s=fs.readFileSync(file,'utf8');
  for(const script of scripts)if(!s.includes(script)){console.error(`${file}: missing ${script}`);failed=true;}
}
const ru=fs.readFileSync('ru-page-i18n.js','utf8');
const requiredRu=['Главная','Политика конфиденциальности','Выходные данные','Страница не найдена','Поиск товаров'];
for(const x of requiredRu)if(!ru.includes(x)){console.error(`ru-page-i18n.js: missing ${x}`);failed=true;}
const product=fs.readFileSync('product-copy-i18n.js','utf8');
if(!/ru\s*:/.test(product)&&!product.includes("'ru'")){console.error('product-copy-i18n.js: no Russian dictionary detected');failed=true;}
if(failed)process.exit(1);
console.log('Russian localization completeness wiring OK.');
