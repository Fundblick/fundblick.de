'use strict';

(function (root, factory) {
  const api = factory(root);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.FundBlickExternalSearchUI = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  const fallback = {
    title:'More results from the web', loading:'Searching for more results …', empty:'No additional web results found.',
    error:'Web search is currently unavailable.', source:'Web result', note:'Additional results from external sources.',
    productSource:'Web product', videoSource:'Video', guideSource:'Guide', comparisonSource:'Comparison', localSource:'Local result'
  };
  const currencySymbols={EUR:'€',USD:'$',GBP:'£',CHF:'CHF',PLN:'PLN',CZK:'CZK',RON:'RON',MDL:'MDL',RUB:'₽'};
  const domainCurrency={ru:'RUB',ro:'RON',md:'MDL',pl:'PLN',cz:'CZK',ch:'CHF',uk:'GBP',gb:'GBP',de:'EUR',at:'EUR',fr:'EUR',it:'EUR',es:'EUR',pt:'EUR',nl:'EUR',be:'EUR',fi:'EUR',ie:'EUR',gr:'EUR'};
  const NON_OFFER_PATH=/(?:^|\/)(?:news|nachrichten|blog|magazin|ratgeber|guide|press|presse|announcement|announcements|neuigkeiten|article|articles|story|stories)(?:\/|$)/i;
  const VIDEO_HOST=/(^|\.)(youtube\.com|youtu\.be|vimeo\.com)$/i;

  function text(){try{return root?.FundBlickExternalSearchI18n?.get?.()||fallback}catch{return fallback}}
  function language(){try{return root?.FundBlickExternalSearchI18n?.language?.()||document.documentElement.lang||'de'}catch{return 'de'}}
  function safeHttpUrl(value){try{const url=new URL(String(value||''));return /^https?:$/.test(url.protocol)?url.href:null}catch{return null}}
  function currencyFromUrl(value){try{const host=new URL(String(value||'')).hostname.toLowerCase().replace(/^www\./,'');const tld=host.split('.').pop();return domainCurrency[tld]||''}catch{return ''}}
  function currencyCode(raw,currency,url){const explicit=String(currency||'').trim().toUpperCase();if(/^(EUR|USD|GBP|CHF|PLN|CZK|RON|MDL|RUB)$/.test(explicit))return explicit;const value=String(raw||'').toUpperCase();const code=value.match(/\b(EUR|USD|GBP|CHF|PLN|CZK|RON|MDL|RUB)\b/);if(code)return code[1];if(value.includes('€'))return'EUR';if(value.includes('£'))return'GBP';if(value.includes('$'))return'USD';if(value.includes('₽')||/\bРУБ(?:\.|Л(?:Ь|Я|ЕЙ)?)?\b/i.test(value)||/(?:^|\s)Р\.(?:\s|$)/i.test(value))return'RUB';return currencyFromUrl(url)}
  function visiblePriceFromText(value){const valueText=String(value||'').replace(/\s+/g,' ').trim();if(!valueText)return'';const amount='(?:\\d{1,3}(?:[.\\s\\u00a0\\u202f]\\d{3})+(?:[,\\.]\\d{2})?|\\d{1,7}(?:[,\\.]\\d{2})?)';const unit='(?:€|EUR|USD|GBP|CHF|PLN|CZK|RON|MDL|RUB|₽|руб(?:\\.|ль|ля|лей)?)';const re=new RegExp(`(?:${unit}\\s*${amount}|${amount}\\s*${unit})`,'i');const match=valueText.match(re);return match?match[0].trim():''}
  function visiblePrice(item){for(const source of [item?.title,item?.description]){const found=visiblePriceFromText(source);if(found)return found}return''}
  function numericAmount(raw){let value=String(raw??'').trim();if(!value)return NaN;value=value.replace(/\b(?:EUR|USD|GBP|CHF|PLN|CZK|RON|MDL|RUB)\b/gi,'').replace(/(?:руб(?:\.|ль|ля|лей)?|₽)/gi,'').replace(/[€$£]/g,'').replace(/\s|\u00a0|\u202f/g,'').replace(/[^0-9,.-]/g,'');if(!value)return NaN;const comma=value.lastIndexOf(','),dot=value.lastIndexOf('.');if(comma>=0&&dot>=0){const decimal=comma>dot?',':'.',thousands=decimal===','?'.':',';value=value.split(thousands).join('').replace(decimal,'.')}else if(comma>=0){const decimals=value.length-comma-1;value=(decimals===1||decimals===2)?value.replace(/\./g,'').replace(',','.'):value.replace(/,/g,'')}else if(dot>=0){const decimals=value.length-dot-1;value=(decimals===1||decimals===2)?value.replace(/,/g,''):value.replace(/\./g,'')}const amount=Number(value);return Number.isFinite(amount)?amount:NaN}
  function formatPrice(value,currency,url){const raw=String(value??'').trim();if(!raw)return'';const amount=numericAmount(raw);if(!Number.isFinite(amount))return raw;const code=currencyCode(raw,currency,url);let number;try{number=new Intl.NumberFormat(language(),{minimumFractionDigits:2,maximumFractionDigits:2}).format(amount)}catch{number=amount.toFixed(2)}if(!code)return number;return`${number} ${currencySymbols[code]||code}`}
  function trustedPrice(item,href){const sourcePrice=visiblePrice(item);if(sourcePrice)return formatPrice(sourcePrice,'',href);const confidence=String(item?.priceConfidence||'').trim().toLowerCase();if(confidence!=='verified')return'';return formatPrice(item?.price,item?.currency,href)}
  function offerEligible(item){
    const href=safeHttpUrl(item?.url||item?.productUrl);if(!href)return false;
    let parsed;try{parsed=new URL(href)}catch{return false}
    const host=parsed.hostname.toLowerCase().replace(/^www\./,'');
    if(VIDEO_HOST.test(host)||NON_OFFER_PATH.test(parsed.pathname))return false;
    const productSignal=item?.productCandidate===true||String(item?.resultType||'')==='product';
    if(!productSignal)return false;
    if(!safeHttpUrl(item?.image))return false;
    if(!trustedPrice(item,href))return false;
    return true;
  }
  function usableResults(items,state={}){let values=Array.isArray(items)?items:[];const view=String(state?.intent?.explicitView||'').toLowerCase();if(view==='offers')values=values.filter(offerEligible);return values.map(item=>({item,href:safeHttpUrl(item?.url||item?.productUrl)})).filter(entry=>entry.href)}
  function merchantLabel(item){const merchant=String(item?.merchant||'').trim(),title=String(item?.title||'').trim();if(merchant&&merchant.length<=60&&merchant.toLocaleLowerCase()!==title.toLocaleLowerCase())return merchant;return String(item?.host||'').trim()}
  function sourceLabel(item,t){const type=String(item?.resultType||'').trim();if(type==='video')return t.videoSource||fallback.videoSource;if(type==='guide')return t.guideSource||fallback.guideSource;if(type==='comparison')return t.comparisonSource||fallback.comparisonSource;if(type==='local')return t.localSource||fallback.localSource;if(type==='product'||item?.productCandidate)return t.productSource||fallback.productSource;return t.source||fallback.source}
  function render(container,state={}){
    if(!container)return;const t=text();container.replaceChildren();container.hidden=false;
    const heading=document.createElement('h2');heading.className='external-results-title';heading.textContent=t.title;container.appendChild(heading);
    if(state.loading){const status=document.createElement('p');status.className='external-results-status';status.setAttribute('role','status');status.textContent=t.loading;container.appendChild(status);return}
    const results=usableResults(state.results,state);
    if(state.error||!results.length){const status=document.createElement('p');status.className='external-results-status';status.setAttribute('role','status');status.textContent=state.error?t.error:t.empty;container.appendChild(status);return}
    const note=document.createElement('p');note.className='external-results-status';note.textContent=t.note||fallback.note;container.appendChild(note);
    const list=document.createElement('div');list.className='external-results-list';
    for(const {item,href} of results){
      const article=document.createElement('article');article.className='external-result-card';if(item.productCandidate)article.classList.add('external-product-candidate');if(item.resultType)article.dataset.resultType=String(item.resultType);
      const imageHref=safeHttpUrl(item.image);if(imageHref){const image=document.createElement('img');image.className='external-result-image';image.src=imageHref;image.alt='';image.loading='lazy';image.referrerPolicy='no-referrer';article.appendChild(image)}
      const body=document.createElement('div');body.className='external-result-body';const title=document.createElement('h3');const link=document.createElement('a');link.href=href;link.target='_blank';link.rel='noopener noreferrer';link.textContent=String(item.title||href);title.appendChild(link);body.appendChild(title);
      const merchantText=merchantLabel(item);if(merchantText){const merchant=document.createElement('small');merchant.className='external-result-host';merchant.textContent=merchantText;body.appendChild(merchant)}
      const displayPrice=trustedPrice(item,href);if(displayPrice){const price=document.createElement('strong');price.className='external-result-price';price.textContent=displayPrice;body.appendChild(price)}
      if(item.description){const description=document.createElement('p');description.className='external-result-description';description.textContent=String(item.description);body.appendChild(description)}
      const source=document.createElement('small');source.className='external-result-source';source.textContent=sourceLabel(item,t);body.appendChild(source);article.appendChild(body);list.appendChild(article)
    }
    container.appendChild(list);
  }
  function hide(container){if(!container)return;container.replaceChildren();container.hidden=true}
  return Object.freeze({render,hide,safeHttpUrl,usableResults,offerEligible,formatPrice,trustedPrice,merchantLabel,currencyCode,currencyFromUrl,visiblePriceFromText,visiblePrice,sourceLabel});
});
