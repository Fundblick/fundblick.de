'use strict';
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.FundBlickProductResultDeduper=api;})(typeof window!=='undefined'?window:globalThis,function(){
 function clean(v){return String(v||'').normalize('NFKC').toLocaleLowerCase().replace(/https?:\/\/\S+/g,' ').replace(/\b(?:eur|usd|gbp|chf|pln|czk|ron|mdl|rub)\b/gi,' ').replace(/[€$£₽]/g,' ').replace(/\b\d{1,7}(?:[.,]\d{2})?\b(?=\s*(?:€|eur|usd|gbp|chf|pln|czk|ron|mdl|rub))/gi,' ').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim()}
 function identifier(v){return String(v??'').normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,'').trim()}
 function host(v){try{return new URL(String(v||'')).hostname.toLowerCase().replace(/^www\./,'')}catch{return''}}
 function titleKey(item){return clean(item?.title).split(' ').filter(Boolean).slice(0,12).join(' ')}
 function key(item){const stable=identifier(item?.gtin||item?.ean||item?.sku||item?.mpn);if(stable)return`id:${stable}`;const t=titleKey(item);if(!t)return'';const h=host(item?.url||item?.productUrl);return h?`title:${t}|host:${h}`:''}
 function quality(item){let n=0;if(item?.image)n+=2;if(item?.price!=null)n+=2;if(item?.priceConfidence==='verified')n+=2;if(item?.description)n+=1;if(item?.merchant)n+=1;return n}
 function dedupe(items){const out=[],seen=new Map();for(const item of Array.isArray(items)?items:[]){const k=key(item);if(!k){out.push(item);continue}if(!seen.has(k)){seen.set(k,out.length);out.push(item);continue}const i=seen.get(k);if(quality(item)>quality(out[i]))out[i]=item}return out}
 return Object.freeze({dedupe,key,titleKey,quality,identifier});
});