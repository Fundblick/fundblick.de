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
    productSource:'Web product'
  };

  function text(){try{return root?.FundBlickExternalSearchI18n?.get?.()||fallback}catch{return fallback}}
  function language(){try{return root?.FundBlickExternalSearchI18n?.language?.()||document.documentElement.lang||'de'}catch{return 'de'}}
  function safeHttpUrl(value){try{const url=new URL(String(value||''));return /^https?:$/.test(url.protocol)?url.href:null}catch{return null}}
  function usableResults(items){return (Array.isArray(items)?items:[]).map(item=>({item,href:safeHttpUrl(item?.url)})).filter(entry=>entry.href)}

  function formatPrice(value,currency){
    const raw=String(value??'').trim();
    if(!raw)return '';
    if(/[€$£]|\b(?:EUR|USD|GBP|CHF|PLN|CZK|RON|MDL)\b/i.test(raw))return raw;
    const normalized=raw.replace(/\s/g,'').replace(',','.');
    const amount=Number(normalized);
    if(!Number.isFinite(amount))return raw;
    const code=String(currency||'').trim().toUpperCase();
    if(!/^[A-Z]{3}$/.test(code))return new Intl.NumberFormat(language()).format(amount);
    try{return new Intl.NumberFormat(language(),{style:'currency',currency:code,minimumFractionDigits:2,maximumFractionDigits:2}).format(amount)}catch{return `${new Intl.NumberFormat(language(),{minimumFractionDigits:2,maximumFractionDigits:2}).format(amount)} ${code}`}
  }

  function merchantLabel(item){
    const merchant=String(item?.merchant||'').trim();
    const title=String(item?.title||'').trim();
    if(merchant && merchant.length<=60 && merchant.toLocaleLowerCase()!==title.toLocaleLowerCase())return merchant;
    return String(item?.host||'').trim();
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

      const displayPrice=formatPrice(item.price,item.currency);
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
      source.textContent=item.productCandidate?(t.productSource||fallback.productSource):(t.source||fallback.source);
      body.appendChild(source);

      article.appendChild(body);
      list.appendChild(article);
    }

    container.appendChild(list);
  }

  function hide(container){if(!container)return;container.replaceChildren();container.hidden=true}
  return Object.freeze({render,hide,safeHttpUrl,usableResults,formatPrice,merchantLabel});
});
