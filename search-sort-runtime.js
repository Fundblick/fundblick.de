'use strict';
(function(root){
  function numberFromMoney(text){
    const raw=String(text||'').replace(/\s/g,'').replace(/[^\d,.-]/g,'');
    if(!raw)return Number.POSITIVE_INFINITY;
    const comma=raw.lastIndexOf(','),dot=raw.lastIndexOf('.');
    let normalized=raw;
    if(comma>dot)normalized=raw.replace(/\./g,'').replace(',','.');
    else if(dot>comma&&comma>=0)normalized=raw.replace(/,/g,'');
    else if(comma>=0)normalized=raw.replace(',','.');
    const value=Number(normalized);
    return Number.isFinite(value)?value:Number.POSITIVE_INFINITY;
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={numberFromMoney};
  if(!root||!root.document)return;
  const doc=root.document;
  const cards=doc.getElementById('cards');
  const sort=doc.getElementById('sort');
  if(!cards||!sort)return;

  let scheduled=false;
  let applying=false;
  const collator=new Intl.Collator(doc.documentElement.lang||'de',{numeric:true,sensitivity:'base'});
  function visiblePrice(article){return numberFromMoney(article.querySelector('.price strong')?.textContent);}
  function brand(article){
    const explicit=article.querySelector('.product-brand bdi,[data-brand]');
    if(explicit)return String(explicit.getAttribute('data-brand')||explicit.textContent||'').trim();
    const meta=[...article.querySelectorAll('p')].find(p=>/^\s*(Hersteller|Marke|Manufacturer|Brand)\s*:/i.test(p.textContent||''));
    return String(meta?.querySelector('bdi')?.textContent||meta?.textContent?.replace(/^\s*[^:]+:\s*/,'')||'').trim();
  }
  function name(article){return String(article.querySelector('h2')?.textContent||'').trim();}

  function compare(a,b,mode){
    if(mode==='price-asc'||mode==='price-desc'){
      const av=visiblePrice(a),bv=visiblePrice(b),direction=mode==='price-desc'?-1:1;
      if(av!==bv)return direction*(av-bv);
    }else if(mode==='brand'){
      const byBrand=collator.compare(brand(a),brand(b));
      if(byBrand)return byBrand;
    }else return 0;
    return collator.compare(name(a),name(b));
  }

  function apply(){
    scheduled=false;
    if(applying)return;
    const mode=sort.value;
    if(!['price-asc','price-desc','brand'].includes(mode))return;
    const list=[...cards.querySelectorAll(':scope > article.product')];
    if(list.length<2)return;
    const ordered=[...list].sort((a,b)=>compare(a,b,mode));
    if(ordered.every((article,index)=>article===list[index]))return;
    applying=true;
    const fragment=doc.createDocumentFragment();
    ordered.forEach(article=>fragment.appendChild(article));
    cards.appendChild(fragment);
    applying=false;
    root.FundBlickResultsPaging?.apply?.(true);
  }

  function schedule(){if(scheduled||applying)return;scheduled=true;requestAnimationFrame(()=>queueMicrotask(apply));}
  sort.addEventListener('change',schedule);
  new MutationObserver(records=>{
    if(applying)return;
    if(records.some(record=>record.type==='childList'||record.type==='characterData'))schedule();
  }).observe(cards,{childList:true,subtree:true,characterData:true});
  schedule();
  root.FundBlickVisibleSort={apply,numberFromMoney,brand};
})(typeof window!=='undefined'?window:null);
