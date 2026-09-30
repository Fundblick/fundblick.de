'use strict';
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.FundBlickProductStorageParser=api;})(typeof window!=='undefined'?window:globalThis,function(){
 const capacities=new Set([4,8,16,32,64,128,256,512,1024,2048,4096,8192]);
 function baseValue(value){return Number(value?.value??value)*(String(value?.unit||'GB').toUpperCase()==='TB'?1000:1)}
 function parse(value,category=''){
  const text=String(value||'').normalize('NFKC'),found=[],ambiguities=[],attributes={};
  for(const m of text.matchAll(/\b(\d+(?:[.,]\d+)?)\s*(gb|tb)\b/gi)){
   let amount=Number(m[1].replace(',','.'));const unit=m[2].toUpperCase();
   const before=text.slice(0,m.index),after=text.slice(m.index+m[0].length);
   const ramAfter=/^\s*(?:ram|arbeitsspeicher)\b/i.test(after),diskAfter=/^\s*(?:ssd|hdd|rom|festplatte)\b/i.test(after);
   const label=before.match(/\b(ram|arbeitsspeicher|ssd|hdd|rom|festplatte)\s*[:=]?\s*$/i);
   const prefix=label&&!/\b\d+(?:[.,]\d+)?\s*(?:gb|tb)\s*$/i.test(before.slice(0,label.index));
   const id=prefix?(/^(?:ram|arbeitsspeicher)$/i.test(label[1])?'memory':'storage'):ramAfter?'memory':diskAfter?'storage':null;
   // Phone slugs sometimes join RAM and storage, e.g. 8256GB. Do not treat this as 8256 GB.
   if(category==='electronics.smartphone'&&unit==='GB'&&!capacities.has(amount)){
    const combined=m[1].match(/^(4|6|8|12|16|24|32|64)(64|128|256|512|1024)$/);
    if(combined){found.push({id:'memory',value:Number(combined[1]),unit,confidence:'MEDIUM'});amount=Number(combined[2])}
   }
   found.push({id,value:amount,unit,confidence:'HIGH'});
  }
  for(const entry of found){
   if(entry.id)continue;
   const larger=found.some(other=>other!==entry&&other.id!=='memory'&&baseValue(other)>baseValue(entry));
   const inferredRam=entry.unit==='GB'&&entry.value<=64&&((category==='computing.laptop'&&found.length===1)||(['computing.laptop','electronics.smartphone'].includes(category)&&larger));
   entry.id=inferredRam?'memory':'storage';if(inferredRam)entry.confidence='MEDIUM';
  }
  for(const id of ['storage','memory']){
   const entries=found.filter(entry=>entry.id===id);
   if(new Set(entries.map(baseValue)).size>1){ambiguities.push(id);continue}
   if(entries.length){const {value,unit,confidence}=entries[0];attributes[id]={value,unit,confidence}}
  }
  return{attributes,ambiguities};
 }
 return Object.freeze({parse,baseValue});
});
