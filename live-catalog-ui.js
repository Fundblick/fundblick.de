'use strict';
(function(root){
  if(!root||!root.document)return;
  const doc=root.document;
  const COPY={
    de:{merchant:'Händler',shippingUnknown:'Versandkosten beim Händler prüfen',toMerchant:'Zum Händler',ad:'Werbelink',priceOnly:'Produktpreis'},
    en:{merchant:'Merchant',shippingUnknown:'Check shipping costs with merchant',toMerchant:'Go to merchant',ad:'Affiliate link',priceOnly:'Product price'},
    tr:{merchant:'Satıcı',shippingUnknown:'Kargo ücretini satıcıda kontrol edin',toMerchant:'Satıcıya git',ad:'Reklam bağlantısı',priceOnly:'Ürün fiyatı'},
    ru:{merchant:'Продавец',shippingUnknown:'Стоимость доставки уточняйте у продавца',toMerchant:'К продавцу',ad:'Рекламная ссылка',priceOnly:'Цена товара'},
    ar:{merchant:'التاجر',shippingUnknown:'تحقق من تكلفة الشحن لدى التاجر',toMerchant:'إلى التاجر',ad:'رابط إعلاني',priceOnly:'سعر المنتج'},
    pl:{merchant:'Sprzedawca',shippingUnknown:'Sprawdź koszt wysyłki u sprzedawcy',toMerchant:'Do sklepu',ad:'Link reklamowy',priceOnly:'Cena produktu'},
    ro:{merchant:'Comerciant',shippingUnknown:'Verifică livrarea la comerciant',toMerchant:'La comerciant',ad:'Link afiliat',priceOnly:'Preț produs'},
    uk:{merchant:'Продавець',shippingUnknown:'Вартість доставки уточнюйте у продавця',toMerchant:'До продавця',ad:'Рекламне посилання',priceOnly:'Ціна товару'},
    it:{merchant:'Rivenditore',shippingUnknown:'Verifica le spese di spedizione dal rivenditore',toMerchant:'Vai al rivenditore',ad:'Link affiliato',priceOnly:'Prezzo prodotto'},
    fr:{merchant:'Marchand',shippingUnknown:'Vérifier les frais de livraison chez le marchand',toMerchant:'Voir le marchand',ad:'Lien affilié',priceOnly:'Prix du produit'},
    es:{merchant:'Tienda',shippingUnknown:'Consulta los gastos de envío en la tienda',toMerchant:'Ir a la tienda',ad:'Enlace publicitario',priceOnly:'Precio del producto'},
    pt:{merchant:'Loja',shippingUnknown:'Verifique os portes na loja',toMerchant:'Ir para a loja',ad:'Link afiliado',priceOnly:'Preço do produto'}
  };
  const pack=()=>COPY[root.FundBlickLanguage?.lang]||COPY.en;
  const norm=v=>String(v||'').trim().toLowerCase();
  let byKey=new Map();
  function key(name,brand){return `${norm(name)}\u0000${norm(brand)}`;}
  function productFor(article){
    const name=article.querySelector('h2')?.textContent||'';
    const brand=article.querySelector('p bdi')?.textContent||'';
    return byKey.get(key(name,brand))||[...byKey.values()].find(p=>norm(p.name)===norm(name))||null;
  }
  function decorate(article){
    if(!article||article.dataset.liveCatalogDecorated==='true')return false;
    const product=productFor(article);if(!product||product.testData!==false)return false;
    const t=pack(),offer=product.bestOffer||product.offers?.[0]||{};
    const firstMeta=article.querySelector('div > p');
    if(firstMeta){firstMeta.innerHTML='';const bdi=doc.createElement('bdi');bdi.textContent=product.brand||product.category||'';firstMeta.append(bdi,doc.createTextNode(` · ${t.merchant}: ${product.merchant||offer.merchant||''}`));}
    const priceBox=article.querySelector('.price');
    if(priceBox){
      const small=priceBox.querySelector('small');
      if(small)small.textContent=offer.shippingKnown===false||offer.shippingCost==null?`${t.priceOnly} · ${t.shippingUnknown}`:small.textContent;
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
      byKey=new Map(real.map(p=>[key(p.name,p.brand),p]));
      apply();
    }catch{}
  }
  const cards=doc.getElementById('cards');
  if(cards)new MutationObserver(records=>{const added=[];for(const record of records)record.addedNodes?.forEach(node=>added.push(node));if(added.length)queueMicrotask(()=>apply(added));}).observe(cards,{childList:true,subtree:false});
  doc.getElementById('language')?.addEventListener('change',()=>queueMicrotask(()=>{doc.querySelectorAll('#cards article.product[data-live-catalog-decorated="true"]').forEach(article=>delete article.dataset.liveCatalogDecorated);apply();}));
  root.addEventListener('DOMContentLoaded',ready,{once:true});
  ready();
})(typeof window!=='undefined'?window:null);
