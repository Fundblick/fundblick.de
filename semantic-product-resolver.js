'use strict';
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.FundBlickSemanticProductResolver=api;})(typeof window!=='undefined'?window:globalThis,function(){
 const norm=v=>String(v||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const tokens=v=>new Set(norm(v).split(/\s+/).filter(x=>x.length>1));
 const GENERIC=new Set(['fur','mit','ohne','und','oder','der','die','das','ein','eine','von','in','auf','neu','kaufen','angebot','angebote','produkt']);
 function meaningful(v){return [...tokens(v)].filter(x=>!GENERIC.has(x))}
 function grams(v){const s='  '+norm(v)+'  ',g=new Set();for(let i=0;i<s.length-2;i++)g.add(s.slice(i,i+3));return g}
 function similarity(a,b){const x=grams(a),y=grams(b);if(!x.size||!y.size)return 0;let hit=0;for(const g of x)if(y.has(g))hit++;return 2*hit/(x.size+y.size)}
 function fuzzyTokenScore(q,c){let best=0;for(const a of q)for(const b of c){if(a.length<4||b.length<4)continue;best=Math.max(best,similarity(a,b))}return best}
 function score(query,candidate){
  const q=meaningful(query),c=meaningful(candidate);if(!q.length||!c.length)return 0;
  const cs=new Set(c);let hit=0;for(const x of q)if(cs.has(x))hit++;
  const exact=norm(query)===norm(candidate)?1:0,contained=norm(query).includes(norm(candidate))||norm(candidate).includes(norm(query))?1:0,fuzzy=fuzzyTokenScore(q,c);
  const lexical=(hit/Math.max(1,Math.min(q.length,c.length)))*0.72+contained*0.18+exact*0.1;
  return Math.min(1,Math.max(lexical,fuzzy>=.72?fuzzy*.82:0));
 }
 function evidenceFromResults(results=[]){
  const map=new Map();
  for(const r of results||[]){const cat=String(r?.category||r?.rawAttributes?.category||'').trim();if(!cat)continue;const label=String(r?.rawAttributes?.productType||r?.productType||r?.name||'').trim();const row=map.get(cat)||{id:cat,labels:new Set(),count:0};row.count++;if(label)row.labels.add(label);map.set(cat,row)}
  return [...map.values()].map(x=>({id:x.id,labels:[...x.labels],count:x.count}));
 }
 function resolve(query,options={}){
  const candidates=[];for(const c of options.taxonomy||[]){const labels=[c.id,c.label,...(c.terms||[]),...(c.labels||[])].filter(Boolean);let best=0;for(const l of labels)best=Math.max(best,score(query,l));if(best)candidates.push({id:c.id,label:c.label||c.id,score:best,source:'taxonomy'})}
  for(const e of evidenceFromResults(options.results)){let best=score(query,e.id);for(const l of e.labels)best=Math.max(best,score(query,l));if(best)candidates.push({id:e.id,label:e.labels[0]||e.id,score:Math.min(1,best+Math.min(.12,e.count*.02)),source:'evidence'})}
  candidates.sort((a,b)=>b.score-a.score);const top=candidates[0]||null,second=candidates[1]||null;const margin=top?top.score-(second?.score||0):0;
  const confidence=!top?'unknown':top.score>=.82&&margin>=.08?'high':top.score>=.58&&margin>=.04?'medium':'low';
  return Object.freeze({query:String(query||''),category:confidence==='unknown'?null:top?.id||null,label:top?.label||'',confidence,score:top?.score||0,margin,candidates:Object.freeze(candidates.slice(0,5)),needsRemoteFallback:!top||confidence==='low'});
 }
 return Object.freeze({resolve,score,similarity,evidenceFromResults});
});