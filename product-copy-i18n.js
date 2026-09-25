'use strict';
(function(root){
  const SUPPORTED=['de','tr','ru','ar','pl','ro','uk','en','it','bg','hr','el','sr','es','fr','pt','fa','sq','zh-Hans','ku'];
  const COPY={
    de:{cats:['Produkt','Beauty','Parfüm','Möbel','Lebensmittel','Laptop','Smartphone','Audio','Fernseher','Schuhe','Werkzeug','Kaffeemaschine','Tasche'],desc:'Testprodukt aus {category}{brand}. Es wird ausschließlich zum Testen der FundBlick-Suche und Filter angezeigt.',brand:' von {brand}'},
    tr:{cats:['Ürün','Güzellik','Parfüm','Mobilya','Gıda','Dizüstü bilgisayar','Akıllı telefon','Ses','Televizyon','Ayakkabı','Alet','Kahve makinesi','Çanta'],desc:'{category}{brand} kategorisinde test ürünü. Yalnızca FundBlick arama ve filtrelerini test etmek için gösterilir.',brand:' · {brand}'},
    ru:{cats:['Товар','Красота','Парфюмерия','Мебель','Продукты','Ноутбук','Смартфон','Аудио','Телевизор','Обувь','Инструмент','Кофемашина','Сумка'],desc:'Тестовый товар в категории «{category}»{brand}. Показан только для проверки поиска и фильтров FundBlick.',brand:' · {brand}'},
    ar:{cats:['منتج','مستحضرات تجميل','عطور','أثاث','مواد غذائية','حاسوب محمول','هاتف ذكي','صوتيات','تلفاز','أحذية','أدوات','ماكينة قهوة','حقيبة'],desc:'منتج تجريبي ضمن فئة {category}{brand}. يُعرض فقط لاختبار البحث والفلاتر في FundBlick.',brand:' من {brand}'},
    pl:{cats:['Produkt','Uroda','Perfumy','Meble','Artykuły spożywcze','Laptop','Smartfon','Audio','Telewizor','Obuwie','Narzędzia','Ekspres do kawy','Torba'],desc:'Produkt testowy w kategorii {category}{brand}. Jest wyświetlany wyłącznie do testowania wyszukiwarki i filtrów FundBlick.',brand:' · {brand}'},
    ro:{cats:['Produs','Frumusețe','Parfumuri','Mobilier','Alimente','Laptop','Smartphone','Audio','Televizor','Încălțăminte','Unelte','Aparat de cafea','Geantă'],desc:'Produs de test din categoria {category}{brand}. Este afișat doar pentru testarea căutării și filtrelor FundBlick.',brand:' · {brand}'},
    uk:{cats:['Товар','Краса','Парфумерія','Меблі','Продукти','Ноутбук','Смартфон','Аудіо','Телевізор','Взуття','Інструмент','Кавомашина','Сумка'],desc:'Тестовий товар у категорії «{category}»{brand}. Показаний лише для перевірки пошуку та фільтрів FundBlick.',brand:' · {brand}'},
    en:{cats:['Product','Beauty','Fragrance','Furniture','Groceries','Laptop','Smartphone','Audio','TV','Shoes','Tool','Coffee machine','Bag'],desc:'Test product in {category}{brand}. It is shown only to test FundBlick search and filters.',brand:' · {brand}'},
    it:{cats:['Prodotto','Bellezza','Profumi','Mobili','Alimentari','Portatile','Smartphone','Audio','Televisore','Scarpe','Utensile','Macchina da caffè','Borsa'],desc:'Prodotto di prova nella categoria {category}{brand}. Viene mostrato solo per testare ricerca e filtri di FundBlick.',brand:' · {brand}'},
    bg:{cats:['Продукт','Красота','Парфюми','Мебели','Храни','Лаптоп','Смартфон','Аудио','Телевизор','Обувки','Инструмент','Кафемашина','Чанта'],desc:'Тестов продукт в категория „{category}“{brand}. Показва се само за тестване на търсенето и филтрите на FundBlick.',brand:' · {brand}'},
    hr:{cats:['Proizvod','Ljepota','Parfemi','Namještaj','Namirnice','Prijenosno računalo','Pametni telefon','Audio','Televizor','Obuća','Alat','Aparat za kavu','Torba'],desc:'Testni proizvod u kategoriji {category}{brand}. Prikazuje se samo za testiranje FundBlick pretraživanja i filtara.',brand:' · {brand}'},
    el:{cats:['Προϊόν','Ομορφιά','Αρώματα','Έπιπλα','Τρόφιμα','Φορητός υπολογιστής','Smartphone','Ήχος','Τηλεόραση','Παπούτσια','Εργαλείο','Καφετιέρα','Τσάντα'],desc:'Δοκιμαστικό προϊόν στην κατηγορία {category}{brand}. Εμφανίζεται μόνο για δοκιμή της αναζήτησης και των φίλτρων του FundBlick.',brand:' · {brand}'},
    sr:{cats:['Производ','Лепота','Парфеми','Намештај','Намирнице','Лаптоп','Паметни телефон','Аудио','Телевизор','Обућа','Алат','Апарат за кафу','Торба'],desc:'Тестни производ у категорији {category}{brand}. Приказује се само за тестирање FundBlick претраге и филтера.',brand:' · {brand}'},
    es:{cats:['Producto','Belleza','Perfumería','Muebles','Alimentación','Portátil','Smartphone','Audio','Televisor','Calzado','Herramienta','Cafetera','Bolso'],desc:'Producto de prueba de la categoría {category}{brand}. Se muestra únicamente para probar la búsqueda y los filtros de FundBlick.',brand:' · {brand}'},
    fr:{cats:['Produit','Beauté','Parfums','Meubles','Alimentation','Ordinateur portable','Smartphone','Audio','Téléviseur','Chaussures','Outil','Machine à café','Sac'],desc:'Produit de test de la catégorie {category}{brand}. Il est affiché uniquement pour tester la recherche et les filtres FundBlick.',brand:' · {brand}'},
    pt:{cats:['Produto','Beleza','Perfumes','Mobiliário','Alimentos','Portátil','Smartphone','Áudio','Televisor','Calçado','Ferramenta','Máquina de café','Mala'],desc:'Produto de teste da categoria {category}{brand}. É apresentado apenas para testar a pesquisa e os filtros do FundBlick.',brand:' · {brand}'},
    fa:{cats:['محصول','زیبایی','عطر','مبلمان','مواد غذایی','لپ‌تاپ','گوشی هوشمند','صوتی','تلویزیون','کفش','ابزار','دستگاه قهوه','کیف'],desc:'محصول آزمایشی در دستهٔ {category}{brand}. فقط برای آزمایش جستجو و فیلترهای FundBlick نمایش داده می‌شود.',brand:' از {brand}'},
    sq:{cats:['Produkt','Bukuri','Parfume','Mobilje','Ushqime','Laptop','Telefon inteligjent','Audio','Televizor','Këpucë','Vegël','Aparat kafeje','Çantë'],desc:'Produkt testues në kategorinë {category}{brand}. Shfaqet vetëm për të testuar kërkimin dhe filtrat e FundBlick.',brand:' · {brand}'},
    'zh-Hans':{cats:['商品','美妆','香水','家具','食品','笔记本电脑','智能手机','音频','电视','鞋类','工具','咖啡机','包袋'],desc:'这是{category}{brand}类的测试商品，仅用于测试 FundBlick 的搜索和筛选功能。',brand:' · {brand}'},
    ku:{cats:['Hilber','Bedewî','Bêhn','Mobîlya','Xwarin','Laptop','Telefonê jîr','Deng','Televîzyon','Pêlav','Amûr','Makîneya qehweyê','Çente'],desc:'Hilbera testê di kategoriya {category}{brand} de ye. Tenê ji bo ceribandina lêgerîn û parzûnên FundBlick tê nîşandan.',brand:' · {brand}'}
  };
  const CAT_KEYS=['product','beauty','fragrance','furniture','grocery','laptop','phone','audio','tv','shoes','tool','coffee','bag'];
  const INDEX=Object.fromEntries(CAT_KEYS.map((key,i)=>[key,i]));
  function language(){const raw=root.FundBlickLanguage?.lang||(typeof document!=='undefined'?document.documentElement.lang:'')||'de';return SUPPORTED.includes(raw)?raw:'de';}
  function detect(title,description){
    const text=(String(title||'')+' '+String(description||'')).toLowerCase();
    if(/mascara|eyeshadow|lipstick|nail polish|makeup|cosmetic|beauty/.test(text))return 'beauty';
    if(/fragrance|parfum|perfume|eau de|scent/.test(text))return 'fragrance';
    if(/bed\b|sofa|table|chair|sink|mirror|furniture|bedroom|living room|bathroom/.test(text))return 'furniture';
    if(/apple|steak|cat food|dog food|chicken|cooking oil|cucumber|eggs|grocery|snack|recipe/.test(text))return 'grocery';
    if(/laptop|notebook|zenbook|macbook|chromebook/.test(text))return 'laptop';
    if(/smartphone|iphone|galaxy|pixel phone|mobile phone/.test(text))return 'phone';
    if(/headphone|earbud|earphone|over-ear|on-ear|in-ear/.test(text))return 'audio';
    if(/television|smart tv|\btv\b|oled|qled/.test(text))return 'tv';
    if(/shoe|sneaker|boot|slipper|sandal|running/.test(text))return 'shoes';
    if(/coffee|espresso|kaffeemaschine/.test(text))return 'coffee';
    if(/heat gun|drill|tool|akkuschrauber|heißluft/.test(text))return 'tool';
    if(/bag|handbag|tasche/.test(text))return 'bag';
    return 'product';
  }
  function categoryLabel(key,lang=language()){const pack=COPY[lang]||COPY.de;return pack.cats[INDEX[key]??0]||pack.cats[0];}
  function looksLikeIdentity(title,brand){
    const t=String(title||'').trim(),b=String(brand||'').trim();
    if(!t)return false;
    if(/\d|\b(?:pro|max|ultra|plus|mini|air|zenbook|pixel|galaxy|iphone|macbook|thinkpad|wire|demo|test|series|model)\b/i.test(t))return true;
    if(b&&t.toLowerCase().includes(b.toLowerCase()))return true;
    return false;
  }
  function localize(product,lang=language()){
    const pack=COPY[lang]||COPY.de;
    const originalTitle=String(product?.title||product?.name||'').trim();
    const originalDescription=String(product?.description||'').trim();
    const brand=String(product?.brand||'').trim();
    const category=product?.family||detect(originalTitle,originalDescription);
    const cat=categoryLabel(category,lang);
    if(lang==='en')return {title:originalTitle,description:originalDescription,category:cat};
    const brandText=brand?pack.brand.replace('{brand}',brand):'';
    const description=pack.desc.replace('{category}',cat).replace('{brand}',brandText);
    let title=originalTitle;
    if(!looksLikeIdentity(originalTitle,brand))title=(lang==='ar'||lang==='fa')?(brand?`${cat} · ${brand}`:cat):(brand?`${brand} · ${cat}`:cat);
    return {title,description,category:cat};
  }
  function applyCard(article,lang=language()){
    const title=article.querySelector('h2');if(!title)return;
    const description=title.nextElementSibling?.matches('p')?title.nextElementSibling:null;
    const brand=article.querySelector('p bdi')?.textContent?.trim()||'';
    if(!title.dataset.fbOriginalTitle)title.dataset.fbOriginalTitle=title.textContent.trim();
    if(description&&!description.dataset.fbOriginalDescription)description.dataset.fbOriginalDescription=description.textContent.trim();
    const localized=localize({title:title.dataset.fbOriginalTitle,description:description?.dataset.fbOriginalDescription||'',brand},lang);
    if(title.textContent!==localized.title)title.textContent=localized.title;
    if(description&&description.textContent!==localized.description)description.textContent=localized.description;
    title.lang=lang;title.dir='auto';if(description){description.lang=lang;description.dir='auto';}
  }
  function apply(){if(typeof document==='undefined')return;const lang=language();document.querySelectorAll('.product').forEach(card=>applyCard(card,lang));}
  const api={SUPPORTED,COPY,detect,categoryLabel,looksLikeIdentity,localize,apply};
  if(root)root.FBProductCopyI18n=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(typeof document!=='undefined'){
    const cards=document.getElementById('cards');if(cards){new MutationObserver(()=>queueMicrotask(apply)).observe(cards,{childList:true,subtree:true});apply();}
    document.getElementById('language')?.addEventListener('change',()=>setTimeout(apply,0));
  }
})(typeof window!=='undefined'?window:globalThis);
