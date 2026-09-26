'use strict';
(function(root){
  const CATEGORY_TERMS={
    'pet.equestrian':'pferd pferde reitsport equestrian horse horses',
    'pet.dog':'hund hunde dog dogs',
    'health.supplements':'gesundheit nahrungserganzung nahrungsergänzung supplement supplements',
    'home.furniture':'mobel möbel furniture',
    'home.living':'wohnen haushalt living home',
    'home.lighting':'lampe lampen beleuchtung lighting light',
    'home.decor':'dekoration dekor decor decoration'
  };
  const normalize=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const words=value=>normalize(value).split(/\s+/).filter(Boolean);
  function editDistance(a,b,limit){
    if(a===b)return 0;if(Math.abs(a.length-b.length)>limit)return limit+1;
    let prev=Array.from({length:b.length+1},(_,i)=>i);
    for(let i=1;i<=a.length;i++){
      const row=[i];let rowMin=i;
      for(let j=1;j<=b.length;j++){
        const v=Math.min(prev[j]+1,row[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));row[j]=v;if(v<rowMin)rowMin=v;
      }
      if(rowMin>limit)return limit+1;prev=row;
    }
    return prev[b.length];
  }
  function fuzzyLimit(token){return token.length>=8?2:(token.length>=5?1:0);}
  function tokenMatch(token,text){
    const hay=normalize(text);if(!token)return false;if(hay.includes(token))return true;
    const limit=fuzzyLimit(token);if(!limit)return false;
    return words(hay).some(word=>Math.abs(word.length-token.length)<=limit&&editDistance(token,word,limit)<=limit);
  }
  function semanticText(fields){return [fields.title,fields.brand,fields.description,CATEGORY_TERMS[fields.category]||'',fields.productType].filter(Boolean).join(' ');}
  function matchFields(fields,query){
    const tokens=words(query).filter(token=>token.length>1);if(!tokens.length)return true;
    const all=semanticText(fields);return tokens.every(token=>tokenMatch(token,all));
  }
  function scoreFields(fields,query){
    const phrase=normalize(query);if(!phrase)return 0;
    const tokens=words(phrase).filter(token=>token.length>1);if(!tokens.length)return 0;
    const title=normalize(fields.title),brand=normalize(fields.brand),description=normalize(fields.description),semantic=normalize([description,CATEGORY_TERMS[fields.category]||'',fields.productType].filter(Boolean).join(' '));
    const all=`${title} ${brand} ${semantic}`;
    if(!tokens.every(token=>tokenMatch(token,all)))return -100000;
    let score=0;
    if(title===phrase)score+=120;
    else if(title.startsWith(phrase+' '))score+=95;
    else if(title.includes(phrase))score+=70;
    if(brand===phrase)score+=90;else if(brand.includes(phrase))score+=45;
    for(const token of tokens){
      if(title.includes(token))score+=18;else if(tokenMatch(token,title))score+=10;
      if(brand.includes(token))score+=14;else if(tokenMatch(token,brand))score+=7;
      if(description.includes(token))score+=3;else if(tokenMatch(token,semantic))score+=2;
    }
    return score;
  }
  const api={normalize,words,editDistance,tokenMatch,matchFields,scoreFields,categoryTerms:CATEGORY_TERMS};if(typeof module!=='undefined'&&module.exports)module.exports=api;
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
