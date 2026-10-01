'use strict';
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.FundBlickRefinementUtility=api;})(typeof window!=='undefined'?window:globalThis,function(){
 function present(v){const x=v&&typeof v==='object'&&'value'in v?v.value:v;return x!==undefined&&x!==null&&String(x).trim()!==''}
 function answered(analysis,id){return present(analysis?.attributes?.[id])}
 function entropy(values){const xs=Array.isArray(values)?values:[];if(xs.length<2)return 0;const p=1/xs.length;return Math.min(1,(-xs.length*p*Math.log2(p))/Math.log2(xs.length))}
 function score(f){const coverage=Math.max(0,Math.min(1,Number(f?.coverage)||0)),confidence=Math.max(0,Math.min(1,Number(f?.confidence)||0)),diversity=entropy(f?.values);return Number((.4*coverage+.35*confidence+.25*diversity).toFixed(3))}
 function suggest(analysis,facetState,options={}){const limit=Math.max(1,Math.min(6,Number(options.limit)||4)),minScore=Number.isFinite(options.minScore)?options.minScore:.55;const all=[...(facetState?.primary||[]),...(facetState?.more||[])];return all.filter(f=>f&&f.id!=='price'&&f.refinable!==false&&(f.distinctValues??f.values?.length??0)>=2&&!answered(analysis,f.id)).map(f=>Object.freeze({...f,utilityScore:score(f)})).filter(f=>f.utilityScore>=minScore).sort((a,b)=>b.utilityScore-a.utilityScore||b.coverage-a.coverage||b.confidence-a.confidence||String(a.id).localeCompare(String(b.id))).slice(0,limit)}
 return Object.freeze({suggest,score,entropy,answered});
});