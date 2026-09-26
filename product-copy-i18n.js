'use strict';
(function(root){
  const SUPPORTED=['de','tr','ru','ar','pl','ro','uk','en','it','bg','hr','el','sr','es','fr','pt','fa','sq','zh-Hans','ku'];
  const COPY={de:{cats:['Produkt','Beauty','Parfüm','Möbel','Lebensmittel','Laptop','Smartphone','Audio','Fernseher','Schuhe','Werkzeug','Kaffeemaschine','Tasche']},ru:{cats:['Товар','Красота','Парфюмерия','Мебель','Продукты','Ноутбук','Смартфон','Аудио','Телевизор','Обувь','Инструмент','Кофемашина','Сумка']},en:{cats:['Product','Beauty','Fragrance','Furniture','Groceries','Laptop','Smartphone','Audio','TV','Shoes','Tool','Coffee machine','Bag']}};
  const CAT_KEYS=['product','beauty','fragrance','furniture','grocery','laptop','phone','audio','tv','shoes','tool','coffee','bag'];
  const INDEX=Object.fromEntries(CAT_KEYS.map((key,i)=>[key,i]));
  const TEST_RE=/\b(?:testprodukt|test product|demo product|dummy product|fundblick test|testdaten|test data)\b/i;
  function language(){const raw=root.FundBlickLanguage?.lang||(typeof document!=='undefined'?document.documentElement.lang:'')||new URLSearchParams(typeof location!=='undefined'?location.search:'').get('lang')||'de';return SUPPORTED.includes(raw)?raw:'de';}
  function detect(title,description){const text=(String(title||'')+' '+String(description||'')).toLowerCase();if(/mascara|eyeshadow|lipstick|nail polish|makeup|cosmetic|beauty/.test(text))return'beauty';if(/fragrance|parfum|perfume|eau de|scent/.test(text))return'fragrance';if(/bed\b|sofa|table|chair|sink|mirror|furniture|bedroom|living room|bathroom|tisch|stuhl|möbel/.test(text))return'furniture';if(/apple|steak|cat food|dog food|chicken|cooking oil|cucumber|eggs|grocery|snack|recipe/.test(text))return'grocery';if(/laptop|notebook|zenbook|macbook|chromebook/.test(text))return'laptop';if(/smartphone|iphone|galaxy|pixel phone|mobile phone/.test(text))return'phone';if(/headphone|earbud|earphone|over-ear|on-ear|in-ear|kopfhörer/.test(text))return'audio';if(/television|smart tv|\btv\b|oled|qled|fernseher/.test(text))return'tv';if(/shoe|sneaker|boot|slipper|sandal|running|schuh/.test(text))return'shoes';if(/coffee|espresso|kaffeemaschine/.test(text))return'coffee';if(/heat gun|drill|tool|akkuschrauber|heißluft|werkzeug/.test(text))return'tool';if(/bag|handbag|tasche/.test(text))return'bag';return'product';}
  function categoryLabel(key,lang=language()){const pack=COPY[lang]||COPY.en;return pack.cats[INDEX[key]??0]||pack.cats[0];}
  function isTestCopy(title,description){return TEST_RE.test(`${title||''} ${description||''}`);}
  function localize(product,lang=language()){
    const title=String(product?.title||product?.name||'').trim();
    const description=String(product?.description||'').trim();
    const category=product?.family||detect(title,description);
    const categoryText=categoryLabel(category,lang);
    /* Merchant-originated title/description are source data, not UI copy. Never invent a translation. */
    if(!isTestCopy(title,description))return {title,description,category:categoryText,preserved:true};
    if(lang==='ru')return {title:title||categoryText,description:`Тестовый товар категории «${categoryText}». Используется только для проверки поиска и фильтров FundBlick.`,category:categoryText,preserved:false};
    if(lang==='de')return {title:title||categoryText,description:`Testprodukt aus der Kategorie ${categoryText}. Es wird ausschließlich zum Testen der FundBlick-Suche und Filter angezeigt.`,category:categoryText,preserved:false};
    return {title,description,category:categoryText,preserved:true};
  }
  function applyCard(article,lang=language()){
    const title=article.querySelector('h2');if(!title)return;
    const description=title.nextElementSibling?.matches('p')?title.nextElementSibling:null;
    if(!title.dataset.fbOriginalTitle)title.dataset.fbOriginalTitle=title.textContent.trim();
    if(description&&!description.dataset.fbOriginalDescription)description.dataset.fbOriginalDescription=description.textContent.trim();
    const localized=localize({title:title.dataset.fbOriginalTitle,description:description?.dataset.fbOriginalDescription||'',family:article.dataset.family||''},lang);
    title.textContent=localized.title;
    if(description)description.textContent=localized.description;
    title.lang=localized.preserved?'':lang;title.dir='auto';if(description){description.lang=localized.preserved?'':lang;description.dir='auto';}
    article.dataset.fbCopyPolicy=localized.preserved?'merchant-source-preserved':'test-copy-localized';
  }
  function apply(){if(typeof document==='undefined')return;const lang=language();document.querySelectorAll('.product').forEach(card=>applyCard(card,lang));}
  const api={SUPPORTED,COPY,detect,categoryLabel,isTestCopy,localize,apply};if(root)root.FBProductCopyI18n=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(typeof document!=='undefined'){const cards=document.getElementById('cards');if(cards){new MutationObserver(()=>queueMicrotask(apply)).observe(cards,{childList:true,subtree:true});apply();}document.getElementById('language')?.addEventListener('change',()=>setTimeout(apply,0));}
})(typeof window!=='undefined'?window:globalThis);
