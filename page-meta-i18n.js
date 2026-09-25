'use strict';
(function(root){
  if(!root||!root.document)return;
  const COPY={
    de:{homeTitle:'FundBlick – Produkte finden, Gesamtpreise vergleichen',homeDescription:'Produkt suchen, Händlerangebote bündeln und Gesamtpreise inklusive Versand vergleichen.',searchTitle:'Produktsuche – FundBlick',searchDescription:'FundBlick Produktsuche mit passenden Filtern, Händlerangeboten und Gesamtpreisvergleich.'},
    tr:{homeTitle:'FundBlick – Ürünleri bul, toplam fiyatları karşılaştır',homeDescription:'Ürün ara, mağaza tekliflerini bir araya getir ve kargo dahil toplam fiyatları karşılaştır.',searchTitle:'Ürün arama – FundBlick',searchDescription:'Uygun filtreler, mağaza teklifleri ve toplam fiyat karşılaştırmasıyla FundBlick ürün araması.'},
    ru:{homeTitle:'FundBlick – находите товары и сравнивайте итоговые цены',homeDescription:'Ищите товары, сравнивайте предложения магазинов и итоговые цены с учётом доставки.',searchTitle:'Поиск товаров – FundBlick',searchDescription:'Поиск FundBlick с подходящими фильтрами, предложениями магазинов и сравнением итоговой цены.'},
    ar:{homeTitle:'FundBlick – ابحث عن المنتجات وقارن السعر الإجمالي',homeDescription:'ابحث عن المنتجات واجمع عروض المتاجر وقارن السعر الإجمالي بما في ذلك الشحن.',searchTitle:'بحث المنتجات – FundBlick',searchDescription:'بحث FundBlick مع فلاتر مناسبة وعروض المتاجر ومقارنة السعر الإجمالي.'},
    pl:{homeTitle:'FundBlick – znajdź produkty i porównaj ceny całkowite',homeDescription:'Szukaj produktów, porównuj oferty sklepów i ceny całkowite wraz z wysyłką.',searchTitle:'Wyszukiwanie produktów – FundBlick',searchDescription:'Wyszukiwanie FundBlick z dopasowanymi filtrami, ofertami sklepów i porównaniem ceny całkowitej.'},
    ro:{homeTitle:'FundBlick – găsește produse și compară prețurile totale',homeDescription:'Caută produse, compară ofertele comercianților și prețurile totale cu livrare inclusă.',searchTitle:'Căutare produse – FundBlick',searchDescription:'Căutare FundBlick cu filtre relevante, oferte de la comercianți și comparația prețului total.'},
    uk:{homeTitle:'FundBlick – знаходьте товари та порівнюйте загальні ціни',homeDescription:'Шукайте товари, порівнюйте пропозиції магазинів і загальні ціни з доставкою.',searchTitle:'Пошук товарів – FundBlick',searchDescription:'Пошук FundBlick із відповідними фільтрами, пропозиціями магазинів і порівнянням загальної ціни.'},
    en:{homeTitle:'FundBlick – find products, compare total prices',homeDescription:'Search products, compare merchant offers and total prices including shipping.',searchTitle:'Product search – FundBlick',searchDescription:'FundBlick product search with relevant filters, merchant offers and total-price comparison.'},
    it:{homeTitle:'FundBlick – trova prodotti e confronta i prezzi totali',homeDescription:'Cerca prodotti, confronta le offerte dei negozi e i prezzi totali inclusa la spedizione.',searchTitle:'Ricerca prodotti – FundBlick',searchDescription:'Ricerca FundBlick con filtri pertinenti, offerte dei negozi e confronto del prezzo totale.'},
    bg:{homeTitle:'FundBlick – намерете продукти и сравнете крайните цени',homeDescription:'Търсете продукти, сравнявайте оферти и крайни цени с включена доставка.',searchTitle:'Търсене на продукти – FundBlick',searchDescription:'Търсене във FundBlick с подходящи филтри, търговски оферти и сравнение на крайната цена.'},
    hr:{homeTitle:'FundBlick – pronađite proizvode i usporedite ukupne cijene',homeDescription:'Tražite proizvode, usporedite ponude trgovaca i ukupne cijene s dostavom.',searchTitle:'Pretraga proizvoda – FundBlick',searchDescription:'FundBlick pretraga s relevantnim filtrima, ponudama trgovaca i usporedbom ukupne cijene.'},
    el:{homeTitle:'FundBlick – βρείτε προϊόντα και συγκρίνετε συνολικές τιμές',homeDescription:'Αναζητήστε προϊόντα, συγκρίνετε προσφορές καταστημάτων και συνολικές τιμές με μεταφορικά.',searchTitle:'Αναζήτηση προϊόντων – FundBlick',searchDescription:'Αναζήτηση FundBlick με σχετικά φίλτρα, προσφορές καταστημάτων και σύγκριση συνολικής τιμής.'},
    sr:{homeTitle:'FundBlick – пронађите производе и упоредите укупне цене',homeDescription:'Претражите производе, упоредите понуде продаваца и укупне цене са доставом.',searchTitle:'Претрага производа – FundBlick',searchDescription:'FundBlick претрага са релевантним филтерима, понудама продаваца и поређењем укупне цене.'},
    es:{homeTitle:'FundBlick – encuentra productos y compara precios totales',homeDescription:'Busca productos, compara ofertas de comercios y precios totales con envío incluido.',searchTitle:'Búsqueda de productos – FundBlick',searchDescription:'Búsqueda FundBlick con filtros relevantes, ofertas de comercios y comparación del precio total.'},
    fr:{homeTitle:'FundBlick – trouvez des produits et comparez les prix totaux',homeDescription:'Recherchez des produits, comparez les offres marchandes et les prix totaux avec livraison.',searchTitle:'Recherche de produits – FundBlick',searchDescription:'Recherche FundBlick avec filtres pertinents, offres marchandes et comparaison du prix total.'},
    pt:{homeTitle:'FundBlick – encontre produtos e compare preços totais',homeDescription:'Pesquise produtos, compare ofertas de lojas e preços totais incluindo envio.',searchTitle:'Pesquisa de produtos – FundBlick',searchDescription:'Pesquisa FundBlick com filtros relevantes, ofertas de lojas e comparação do preço total.'},
    fa:{homeTitle:'FundBlick – محصول پیدا کنید و قیمت نهایی را مقایسه کنید',homeDescription:'محصول جست‌وجو کنید، پیشنهاد فروشگاه‌ها و قیمت نهایی همراه با ارسال را مقایسه کنید.',searchTitle:'جست‌وجوی محصول – FundBlick',searchDescription:'جست‌وجوی FundBlick با فیلترهای مرتبط، پیشنهاد فروشگاه‌ها و مقایسه قیمت نهایی.'},
    sq:{homeTitle:'FundBlick – gjej produkte dhe krahaso çmimet totale',homeDescription:'Kërko produkte, krahaso ofertat e shitësve dhe çmimet totale përfshirë dërgesën.',searchTitle:'Kërkim produktesh – FundBlick',searchDescription:'Kërkim FundBlick me filtra përkatës, oferta shitësish dhe krahasim të çmimit total.'},
    'zh-Hans':{homeTitle:'FundBlick – 查找商品并比较到手总价',homeDescription:'搜索商品，汇总商家报价，并比较包含运费的到手总价。',searchTitle:'商品搜索 – FundBlick',searchDescription:'FundBlick 商品搜索，提供相关筛选、商家报价和到手总价比较。'},
    ku:{homeTitle:'FundBlick – berheman bibîne û bihayê giştî berawird bike',homeDescription:'Berheman bigere, pêşniyarên firoşkaran û bihayê giştî bi şandinê re berawird bike.',searchTitle:'Lêgerîna berheman – FundBlick',searchDescription:'Lêgerîna FundBlick bi parzûnên guncaw, pêşniyarên firoşkaran û berawirdkirina bihayê giştî.'}
  };
  const supported=Object.keys(COPY);
  const normalize=value=>{const raw=String(value||'').replace(/_/g,'-');if(supported.includes(raw))return raw;const lower=raw.toLowerCase();if(lower==='zh'||lower.startsWith('zh-cn')||lower.startsWith('zh-hans'))return 'zh-Hans';const base=lower.split('-')[0];return supported.find(item=>item.toLowerCase()===base)||null;};
  const current=()=>{const params=new URLSearchParams(location.search),select=document.querySelector('#language');return normalize(select?.value)||normalize(params.get('lang'))||normalize(root.FundBlickLanguage?.lang)||normalize(document.documentElement.lang)||'de';};
  const meta=(selector,value)=>{const el=document.querySelector(selector);if(el&&value)el.setAttribute('content',value);};
  function apply(){
    const lang=current(),copy=COPY[lang]||COPY.en,isSearch=/\/search\.html$/i.test(location.pathname)||!!document.querySelector('.results-page'),query=new URLSearchParams(location.search).get('q')?.trim();
    const baseTitle=isSearch?copy.searchTitle:copy.homeTitle;
    document.title=isSearch&&query?`${query} – ${baseTitle}`:baseTitle;
    meta('meta[name="description"]',isSearch?copy.searchDescription:copy.homeDescription);
    if(!isSearch){meta('meta[property="og:title"]',copy.homeTitle);meta('meta[property="og:description"]',copy.homeDescription);}
    document.documentElement.lang=lang;
    document.documentElement.dir=(lang==='ar'||lang==='fa')?'rtl':'ltr';
    document.documentElement.dataset.metaLanguage=lang;
  }
  document.querySelector('#language')?.addEventListener('change',()=>queueMicrotask(apply));
  root.addEventListener('pageshow',apply);
  apply();
  root.FundBlickPageMeta={apply,COPY,current};
})(typeof window!=='undefined'?window:null);
