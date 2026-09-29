'use strict';

(function (root, factory) {
  const api = factory(root);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.FundBlickExternalSearchUI = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  const fallback = {title:'Weitere Ergebnisse aus dem Web',loading:'Weitere Ergebnisse werden gesucht …',empty:'Keine weiteren Web-Ergebnisse gefunden.',error:'Die Websuche ist momentan nicht verfügbar.',source:'Web-Ergebnis'};
  function text(){try{return root?.FundBlickExternalSearchI18n?.get?.()||fallback}catch{return fallback}}
  function safeHttpUrl(value){try{const url=new URL(String(value||''));return /^https?:$/.test(url.protocol)?url.href:null}catch{return null}}
  function usableResults(items){return (Array.isArray(items)?items:[]).map(item=>({item,href:safeHttpUrl(item?.url)})).filter(entry=>entry.href)}
  function render(container,state={}){
    if(!container)return;const t=text();container.replaceChildren();container.hidden=false;
    const heading=document.createElement('h2');heading.className='external-results-title';heading.textContent=t.title;container.appendChild(heading);
    if(state.loading){const status=document.createElement('p');status.className='external-results-status';status.setAttribute('role','status');status.textContent=t.loading;container.appendChild(status);return}
    const results=usableResults(state.results);
    if(state.error||!results.length){const status=document.createElement('p');status.className='external-results-status';status.setAttribute('role','status');status.textContent=state.error?t.error:t.empty;container.appendChild(status);return}
    const note=document.createElement('p');note.className='external-results-status';note.textContent='Ergänzende Webtreffer. Produktdaten werden nur angezeigt, wenn die Suchquelle sie ausdrücklich liefert.';container.appendChild(note);
    const list=document.createElement('div');list.className='external-results-list';
    for(const {item,href} of results){
      const article=document.createElement('article');article.className='external-result-card';
      if(item.productCandidate) article.classList.add('external-product-candidate');
      const imageHref=safeHttpUrl(item.image);
      if(imageHref){const image=document.createElement('img');image.className='external-result-image';image.src=imageHref;image.alt='';image.loading='lazy';image.referrerPolicy='no-referrer';article.appendChild(image)}
      const body=document.createElement('div');body.className='external-result-body';
      const title=document.createElement('h3');const link=document.createElement('a');link.href=href;link.target='_blank';link.rel='noopener noreferrer';link.textContent=String(item.title||href);title.appendChild(link);body.appendChild(title);
      if(item.merchant||item.host){const merchant=document.createElement('small');merchant.className='external-result-host';merchant.textContent=String(item.merchant||item.host);body.appendChild(merchant)}
      if(item.price){const price=document.createElement('strong');price.className='external-result-price';price.textContent=String(item.price);body.appendChild(price)}
      if(item.description){const description=document.createElement('p');description.textContent=String(item.description);body.appendChild(description)}
      const source=document.createElement('small');source.textContent=item.productCandidate?(item.price||imageHref?'Web-Produkt · Quelldaten':'Webtreffer · mögliche Produktseite'):t.source;body.appendChild(source);article.appendChild(body);list.appendChild(article);
    }
    container.appendChild(list);
  }
  function hide(container){if(!container)return;container.replaceChildren();container.hidden=true}
  return Object.freeze({render,hide,safeHttpUrl,usableResults});
});
