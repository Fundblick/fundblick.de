'use strict';
(function(root){
  if(!root||!root.document)return;
  const doc=root.document;
  const COPY={
    de:{merchant:'Händler',brand:'Hersteller / Marke',productType:'Produkttyp',shippingUnknown:'Versandkosten beim Händler prüfen',shipping:'Versand',freeShipping:'Kostenloser Versand',toMerchant:'Zum Händler',ad:'Werbelink',priceOnly:'Produktpreis',totalPrice:'Gesamtpreis',inStock:'Lieferbar',outOfStock:'Derzeit nicht lieferbar'},
    en:{merchant:'Merchant',brand:'Brand',productType:'Product type',shippingUnknown:'Check shipping costs with merchant',shipping:'Shipping',freeShipping:'Free shipping',toMerchant:'Go to merchant',ad:'Affiliate link',priceOnly:'Product price',totalPrice:'Total price',inStock:'Available',outOfStock:'Currently unavailable'},
    tr:{merchant:'Satıcı',shippingUnknown:'Kargo ücretini satıcıda kontrol edin',toMerchant:'Satıcıya git',ad:'Reklam bağlantısı',priceOnly:'Ürün fiyatı'},
    ru:{merchant:'Продавец',brand:'Производитель / бренд',productType:'Тип товара',shippingUnknown:'Стоимость доставки уточняйте у продавца',shipping:'Доставка',freeShipping:'Бесплатная доставка',toMerchant:'К продавцу',ad:'Рекламная ссылка',priceOnly:'Цена товара',totalPrice:'Итоговая цена',inStock:'В наличии',outOfStock:'Сейчас нет в наличии'},
    ar:{merchant:'التاجر',shippingUnknown:'تحقق من تكلفة الشحن لدى التاجر',toMerchant:'إلى التاجر',ad:'رابط إعلاني',priceOnly:'سعر المنتج'},
    pl:{merchant:'Sprzedawca',shippingUnknown:'Sprawdź koszt wysyłki u sprzedawcy',toMerchant:'Do sklepu',ad:'Link reklamowy',priceOnly:'Cena produktu'},
    ro:{merchant:'Comerciant',shippingUnknown:'Verifică livrarea la comerciant',toMerchant:'La comerciant',ad:'Link afiliat',priceOnly:'Preț produs'},
    uk:{merchant:'Продавець',shippingUnknown:'Вартість доставки уточнюйте у продавця',toMerchant:'До продавця',ad:'Рекламне посилання',priceOnly:'Ціна товару'},
    it:{merchant:'Rivenditore',shippingUnknown:'Verifica le spese di spedizione dal rivenditore',toMerchant:'Vai al rivenditore',ad:'Link affiliato',priceOnly:'Prezzo prodotto'},
    fr:{merchant:'Marchand',shippingUnknown:'Vérifier les frais de livraison chez le marchand',toMerchant:'Voir le marchand',ad:'Lien affilié',priceOnly:'Prix du produit'},
    es:{merchant:'Tienda',shippingUnknown:'Consulta los gastos de envío en la tienda',toMerchant:'Ir a la tienda',ad:'Enlace publicitario',priceOnly:'Precio del producto'},
    pt:{merchant:'Loja',shippingUnknown:'Verifique os portes na loja',toMerchant:'Ir para a loja',ad:'Link afiliado',priceOnly:'Preço do produto'}
  };
  const pack=()=>Object.assign({},COPY.en,COPY[root.FundBlickLanguage?.lang]||{});
  const locale=()=>root.FundBlickLanguage?.config?.locale||'de-DE';
  const money=value=>new Intl.NumberFormat(locale(),{style:'currency',currency:'EUR'}).format(Number(value));
  const norm=v=>String(v||'').trim().toLowerCase();
  const brandFor=(brand,merchant)=>{const raw=String(brand||'').trim();if(/^ahipos[-\s]?horses$/i.test(raw))return 'Ahipos Horses';if(/^fast bundle$/i.test(raw)&&/ahipos/i.test(String(merchant||'')))return 'Ahipos Horses';return raw;};
  let byKey=new Map();
  function key(name,brand){return `${norm(name)}\u0000${norm(brand)}`;}
  function productFor(article){
    const name=article.querySelector('h2')?.textContent||'';
    const brand=article.querySelector('p bdi')?.textContent||'';
    return byKey.get(key(name,brand))||[...byKey.values()].find(p=>norm(p.name)===norm(name))||null;
  }
  function availabilityState(product,offer){
    const value=String(offer.availability||product.availability||'').toUpperCase();
    if(value==='OUT_OF_STOCK')return 'out';
    if(value==='IN_STOCK'||offer.inStock===true||product.inStock===true)return 'in';
    return '';
  }
  function addFact(container,label,value,className){
    if(!value)return;
    const row=doc.createElement('span');row.className=className||'product-fact';
    const strong=doc.createElement('strong');strong.textContent=label+': ';
    const text=doc.createElement('bdi');text.textContent=value;
    row.append(strong,text);container.append(row);
  }
  function decorate(article){
    if(!article||article.dataset.liveCatalogDecorated==='true')return false;
    const product=productFor(article);if(!product||product.testData!==false)return false;
    const t=pack(),offer=product.bestOffer||product.offers?.[0]||{};
    const merchant=product.merchant||offer.merchant||'';
    const brand=brandFor(product.brand,merchant)||product.category||'';
    const productType=product.rawAttributes?.productType||'';
    const firstMeta=article.querySelector('div > p');
    if(firstMeta){
      firstMeta.classList.add('product-facts');firstMeta.innerHTML='';
      addFact(firstMeta,t.brand,brand,'product-fact product-brand');
      addFact(firstMeta,t.merchant,merchant,'product-fact product-merchant');
      addFact(firstMeta,t.productType,productType,'product-fact product-type');
    }
    const priceBox=article.querySelector('.price');
    if(priceBox){
      const strong=priceBox.querySelector('strong'),small=priceBox.querySelector('small');
      const rawPrice=Number(offer.price??product.price),shippingRaw=offer.shippingCost??product.shippingCost;
      const shippingKnown=offer.shippingKnown!==false&&shippingRaw!==null&&shippingRaw!==undefined&&shippingRaw!==''&&Number.isFinite(Number(shippingRaw));
      const shipping=shippingKnown?Number(shippingRaw):null;
      if(strong&&Number.isFinite(rawPrice))strong.textContent=money(shippingKnown?rawPrice+shipping:rawPrice);
      if(small){
        if(shippingKnown&&shipping===0)small.textContent=`${t.totalPrice} · ${t.freeShipping}`;
        else if(shippingKnown)small.textContent=`${t.priceOnly} ${money(rawPrice)} + ${t.shipping} ${money(shipping)}`;
        else small.textContent=`${t.priceOnly} · ${t.shippingUnknown}`;
      }
      const oldStatus=priceBox.querySelector('.availability-status');if(oldStatus)oldStatus.remove();
      const availability=availabilityState(product,offer);
      if(availability){
        const status=doc.createElement('span');status.className=`availability-status ${availability==='in'?'is-in-stock':'is-out-of-stock'}`;status.textContent=availability==='in'?t.inStock:t.outOfStock;
        const anchor=priceBox.querySelector('.unavailable,.merchant-link');priceBox.insertBefore(status,anchor||null);
      }
      const unavailable=priceBox.querySelector('.unavailable');
      if(unavailable){
        const link=doc.createElement('a');link.className='merchant-link';link.textContent=t.toMerchant;link.setAttribute('data-affiliate-link','');
        link.dataset.offerDirectUrl=String(offer.directUrl||product.directUrl||'');
        link.dataset.offerAffiliateUrl=String(offer.affiliateUrl||product.affiliateUrl||'');
        link.dataset.offerNetwork=String(offer.network||product?.source?.network||'awin');
        link.dataset.offerSimulated='false';
        const ad=doc.createElement('small');ad.className='merchant-link-note';ad.textContent=t.ad;
        unavailable.replaceWith(link,ad);
      }
    }
    article.dataset.realMerchant='true';article.dataset.liveCatalogDecorated='true';return true;
  }
  function apply(nodes){
    const articles=[];
    if(nodes){for(const node of nodes){if(node?.nodeType!==1)continue;if(node.matches?.('article.product'))articles.push(node);node.querySelectorAll?.('article.product').forEach(article=>articles.push(article));}}
    else doc.querySelectorAll('#cards article.product').forEach(article=>articles.push(article));
    let changed=false;articles.forEach(article=>{if(decorate(article))changed=true;});
    if(changed)root.FundBlickAffiliateOutbound?.refresh?.();
  }
  async function ready(){
    try{
      const list=await root.FundBlickCatalog?.load?.();
      const real=(Array.isArray(list)?list:[]).filter(p=>p?.testData===false);
      byKey=new Map(real.map(p=>[key(p.name,brandFor(p.brand,p.merchant||p.bestOffer?.merchant||p.offers?.[0]?.merchant)),p]));
      apply();
    }catch{}
  }
  const cards=doc.getElementById('cards');
  if(cards)new MutationObserver(records=>{const added=[];for(const record of records)record.addedNodes?.forEach(node=>added.push(node));if(added.length)queueMicrotask(()=>apply(added));}).observe(cards,{childList:true,subtree:false});
  doc.getElementById('language')?.addEventListener('change',()=>queueMicrotask(()=>{doc.querySelectorAll('#cards article.product[data-live-catalog-decorated="true"]').forEach(article=>delete article.dataset.liveCatalogDecorated);apply();}));
  root.addEventListener('DOMContentLoaded',ready,{once:true});
  ready();
})(typeof window!=='undefined'?window:null);
