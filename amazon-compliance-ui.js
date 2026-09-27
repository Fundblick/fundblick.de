'use strict';
(function(){
  const root=document.querySelector('#external-results');
  if(!root)return;

  const DISCLOSURE_ID='amazon-associate-disclosure';
  const PRICE_NOTICE='Der angegebene Amazon-Preis kann seit der letzten Aktualisierung gestiegen sein. Maßgeblich ist der Preis auf Amazon.de zum Zeitpunkt des Kaufs.';
  const CONTENT_NOTICE='Bestimmte auf dieser Website angezeigte Inhalte stammen von Amazon. Diese Inhalte werden in der vorliegenden Form bereitgestellt und können jederzeit geändert oder entfernt werden.';
  const ASSOCIATE_NOTICE='Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.';

  function formatTime(date){
    try{return new Intl.DateTimeFormat('de-DE',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Berlin',timeZoneName:'short'}).format(date)}
    catch{return date.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}
  }

  function amazonCards(){return [...root.querySelectorAll('.external-product[data-provider="amazon-creators-api"],.external-product[data-provider="amazon-creators-api-relay"]')]}

  function ensureDisclosure(cards){
    let box=root.querySelector('#'+DISCLOSURE_ID);
    if(!cards.length){box?.remove();return}
    if(!box){
      box=document.createElement('aside');
      box.id=DISCLOSURE_ID;
      box.className='amazon-disclosure';
      box.setAttribute('aria-label','Hinweise zu Amazon-Angeboten');
      const heading=root.querySelector('.external-results-heading');
      (heading?.parentNode||root).insertBefore(box,heading?.nextSibling||root.firstChild);
    }
    box.innerHTML=`<strong>Amazon-Hinweis</strong><p>${ASSOCIATE_NOTICE}</p><p>${CONTENT_NOTICE}</p><p>${PRICE_NOTICE}</p>`;
  }

  function decorate(){
    const cards=amazonCards();
    const now=new Date();
    ensureDisclosure(cards);
    for(const card of cards){
      if(card.dataset.amazonCompliance==='1')continue;
      const price=card.querySelector('.price');
      if(!price)continue;
      const note=document.createElement('small');
      note.className='amazon-price-notice';
      note.textContent=`Amazon-Preis: Stand ${formatTime(now)}. ${PRICE_NOTICE}`;
      price.appendChild(note);
      card.dataset.amazonCompliance='1';
    }
  }

  const observer=new MutationObserver(decorate);
  observer.observe(root,{childList:true,subtree:true});
  window.addEventListener('fundblick:external-search',()=>queueMicrotask(decorate));
  decorate();
})();
