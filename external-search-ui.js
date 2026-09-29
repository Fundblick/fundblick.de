'use strict';

(function (root, factory) {
  const api = factory(root);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.FundBlickExternalSearchUI = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  const fallback = {
    title:'More results from the web',
    loading:'Searching for more results …',
    empty:'No additional web results found.',
    error:'Web search is currently unavailable.',
    source:'Web result',
    note:'Additional results from external sources.',
    productSource:'Web product',
    videoSource:'Video',
    guideSource:'Guide',
    comparisonSource:'Comparison',
    localSource:'Local result'
  };

  const currencySymbols={EUR:'€',USD:'$',GBP:'£',CHF:'CHF',PLN:'PLN',CZK:'CZK',RON:'RON',MDL:'MDL',RUB:'₽'};
  const domainCurrency={
    ru:'RUB',ro:'RON',md:'MDL',pl:'PLN',cz:'CZK',ch:'CHF',uk:'GBP',gb:'GBP',
    de:'EUR',at:'EUR',fr:'EUR',it:'EUR',es:'EUR',pt:'EUR',nl:'EUR',be:'EUR',fi:'EUR',ie:'EUR',gr:'EUR'
  };

  function text(){try{return root?.FundBlickExternalSearchI18n?.get?.()||fallback}catch{return fallback}}
  function language(){try{return root?.FundBlickExternalSearchI18n?.language?.()||document.documentElement.lang||'de'}catch{return 'de'}}
  function safeHttpUrl(value){try{const url=new URL(String(value||''));return /^https?:$/.test(url.protocol)?url.href:null}catch{return null}}
  function usableResults(items){return (Array.isArray(items)?items:[]).map(item=>({item,href:safeHttpUrl(item?.url)})).filter(entry=>entry.href)}

  function currencyFromUrl(value){
    try{
      const host=new URL(String(value||'')).hostname.toLowerCase().replace(/^www\./,'');
      const tld=host.split('.').pop();
      return domainCurrency[tld]||'';
    }catch{return ''}
  }

  function currencyCode(raw,currency,url){
    const explicit=String(currency||'').trim().toUpperCase();
    if(/^(EUR|USD|GBP|CHF|PLN|CZK|RON|MDL|RUB)$/.test(explicit))return explicit;
    const text=String(raw||'').toUpperCase();
    const code=text.match(/\b(EUR|USD|GBP|CHF|PLN|CZK|RON|MDL|RUB)\b/);
    if(code)return code[1];
    if(text.includes('€'))return 'EUR';
    if(text.includes('£'))return 'GBP';
    if(text.includes('$'))return 'USD';
    if(text.includes('₽')||/\bРУБ(?:\.|Л(?:Ь|Я|ЕЙ)?)?\b/i.test(text)||/(?:^|\s)Р\.(?:\s|$)/i.test(text))return 'RUB';
    return currencyFromUrl(url);
  }

  function visiblePriceFromText(value){
    const text=String(value||'').replace(/\s+/g,' ').trim();
    if(!text)return '';
    const amount='(?:\\d{1,3}(?:[.\\s\\u00a0\\u202f]\\d{3})+(?:[,\\.]\\d{2})?|\\d{1,7}(?:[,\\.]\\d{2})?)';
    const unit='(?:€|EUR|USD|GBP|CHF|PLN|CZK|RON|MDL|RUB|₽|руб(?:\\.|ль|ля|лей)?)';
    const re=new RegExp(`(?:${unit}\\s*${amount}|${amount}\\s*${unit})`,'i');
    const match=text.match(re);
    return match?match[0].trim():'';
  }

  function visiblePrice(item){
    const sources=[item?.title,item?.description];
    for(const source of sources){
      const found=visiblePriceFromText(source);
      if(found)return found;
    }
    return '';
  }

  function numericAmount(raw){
    let text=String(raw??'').trim();
    if(!text)return NaN;
    text=text.replace(/\b(?:EUR|USD|GBP|CHF|PLN|CZK|RON|MDL|RUB)\b/gi,'')
      .replace(/(?:руб(?:\.|ль|ля|лей)?|₽)/gi,'')
      .replace(/[€$£]/g,'')
      .replace(/\s|\u00a0|\u202f/g,'')
      .replace(/[^0-9,.-]/g,'');
    if(!text)return NaN;
    const comma=text.lastIndexOf(',');
    const dot=text.lastIndexOf('.');
    if(comma>=0&&dot>=0){
      const decimal=comma>dot?',':'.';
      const thousands=decimal===','?'.':',';
      text=text.split(thousands).join('').replace(decimal,'.');
    }else if(comma>=0){
      const decimals=text.length-comma-1;
      text=decimals===2?text.replace(/\./g,'').replace(',','.') : text.replace(/,/g,'');
    }else if(dot>=0){
      const decimals=text.length-dot-1;
      text=decimals===2?text.replace(/,/g,'') : text.replace(/\./g,'');
    }
    const amount=Number(text);
    return Number.isFinite(amount)?amount:NaN;
  }

  function formatPrice(value,currency,url){
    const raw=String(value??'').trim();
    if(!raw)return '';
    const amount=numericAmount(raw);
    if(!Number.isFinite(amount))return raw;
    const code=currencyCode(raw,currency,url);
    const locale=language();
    let number;
    try{
      number=new Intl.NumberFormat(locale,{minimumFractionDigits:2,maximumFractionDigits:2}).format(amount);
    }catch{
      number=amount.toFixed(2);
    }
    if(!code)return number;
    const unit=currencySymbols[code]||code;
    return `${number} ${unit}`;
  }

  function merchantLabel(item){
    const merchant=String(item?.merchant||'').trim();
    const title=String(item?.title||'').trim();
    if(merchant && merchant.length<=60 && merchant.toLocaleLowerCase()!==title.toLocaleLowerCase())return merchant;
    return String(item?.host||'').trim();
  }

  function sourceLabel(item,t){
    const type=String(item?.resultType||'').trim();
    if(type==='video')return t.videoSource||fallback.videoSource;
    if(type==='guide')return t.guideSource||fallback.guideSource;
    if(type==='comparison')return t.comparisonSource||fallback.comparisonSource;
    if(type==='local')return t.localSource||fallback.localSource;
    if(type==='product'||item?.productCandidate)return t.productSource||fallback.productSource;
    return t.source||fallback.source;
  }

  function render(container,state={}){
    if(!container)return;
    const t=text();
    container.replaceChildren();
    container.hidden=false;

    const heading=document.createElement('h2');
    heading.className='external-results-title';
    heading.textContent=t.title;
    container.appendChild(heading);

    if(state.loading){
      const status=document.createElement('p');
      status.className='external-results-status';
      status.setAttribute('role','status');
      status.textContent=t.loading;
      container.appendChild(status);
      return;
    }

    const results=usableResults(state.results);
    if(state.error||!results.length){
      const status=document.createElement('p');
      status.className='external-results-status';
      status.setAttribute('role','status');
      status.textContent=state.error?t.error:t.empty;
      container.appendChild(status);
      return;
    }

    const note=document.createElement('p');
    note.className='external-results-status';
    note.textContent=t.note||fallback.note;
    container.appendChild(note);

    const list=document.createElement('div');
    list.className='external-results-list';

    for(const {item,href} of results){
      const article=document.createElement('article');
      article.className='external-result-card';
      if(item.productCandidate)article.classList.add('external-product-candidate');
      if(item.resultType)article.dataset.resultType=String(item.resultType);

      const imageHref=safeHttpUrl(item.image);
      if(imageHref){
        const image=document.createElement('img');
        image.className='external-result-image';
        image.src=imageHref;
        image.alt='';
        image.loading='lazy';
        image.referrerPolicy='no-referrer';
        article.appendChild(image);
      }

      const body=document.createElement('div');
      body.className='external-result-body';

      const title=document.createElement('h3');
      const link=document.createElement('a');
      link.href=href;
      link.target='_blank';
      link.rel='noopener noreferrer';
      link.textContent=String(item.title||href);
      title.appendChild(link);
      body.appendChild(title);

      const merchantText=merchantLabel(item);
      if(merchantText){
        const merchant=document.createElement('small');
        merchant.className='external-result-host';
        merchant.textContent=merchantText;
        body.appendChild(merchant);
      }

      const sourcePrice=visiblePrice(item);
      const displayPrice=sourcePrice
        ? formatPrice(sourcePrice,'',href)
        : formatPrice(item.price,item.currency,href);
      if(displayPrice){
        const price=document.createElement('strong');
        price.className='external-result-price';
        price.textContent=displayPrice;
        body.appendChild(price);
      }

      if(item.description){
        const description=document.createElement('p');
        description.className='external-result-description';
        description.textContent=String(item.description);
        body.appendChild(description);
      }

      const source=document.createElement('small');
      source.className='external-result-source';
      source.textContent=sourceLabel(item,t);
      body.appendChild(source);

      article.appendChild(body);
      list.appendChild(article);
    }

    container.appendChild(list);
  }

  function hide(container){if(!container)return;container.replaceChildren();container.hidden=true}
  return Object.freeze({render,hide,safeHttpUrl,usableResults,formatPrice,merchantLabel,currencyCode,currencyFromUrl,visiblePriceFromText,visiblePrice,sourceLabel});
});
