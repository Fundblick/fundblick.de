'use strict';
(function(root){
  const normalize=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  function scoreFields(fields,query){
    const phrase=normalize(query);if(!phrase)return 0;
    const tokens=phrase.split(/\s+/).filter(token=>token.length>1);if(!tokens.length)return 0;
    const title=normalize(fields.title),brand=normalize(fields.brand),description=normalize(fields.description),all=`${title} ${brand} ${description}`;
    if(!tokens.every(token=>all.includes(token)))return -100000;
    let score=0;if(title===phrase)score+=120;else if(title.includes(phrase))score+=70;if(brand===phrase)score+=90;else if(brand.includes(phrase))score+=45;
    for(const token of tokens){if(title.includes(token))score+=18;if(brand.includes(token))score+=14;if(description.includes(token))score+=3;}
    return score;
  }
  const api={normalize,scoreFields};if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(!root||!root.document)return;root.FundBlickSearchRelevance=api;
  const cards=document.getElementById('cards'),sort=document.getElementById('sort'),query=document.getElementById('query');if(!cards||!sort||!query)return;
  let busy=false;
  function fields(article){const heading=article.querySelector('h2');const description=heading?.nextElementSibling;const meta=heading?.previousElementSibling;return {title:heading?.textContent||'',description:description?.textContent||'',brand:meta?.textContent?.split('·')[0]||''};}
  function apply(){
    if(busy||sort.value!=='relevance')return;const q=query.value.trim();if(!q)return;
    const list=[...cards.querySelectorAll(':scope > article.product')];if(list.length<2)return;
    const ranked=list.map((node,index)=>({node,index,score:scoreFields(fields(node),q)})).sort((a,b)=>b.score-a.score||a.index-b.index);
    if(ranked.every((entry,index)=>entry.node===list[index]))return;
    busy=true;const fragment=document.createDocumentFragment();ranked.forEach(entry=>fragment.appendChild(entry.node));cards.appendChild(fragment);busy=false;
  }
  const observer=new MutationObserver(()=>queueMicrotask(apply));observer.observe(cards,{childList:true,subtree:true,characterData:true});sort.addEventListener('change',()=>queueMicrotask(apply));query.addEventListener('change',()=>queueMicrotask(apply));queueMicrotask(apply);
})(typeof window!=='undefined'?window:null);
