'use strict';
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.FundBlickQueryFacetBlueprint=api;})(typeof window!=='undefined'?window:globalThis,function(){
 const BLUEPRINTS={
  'computing.memory':{label:{de:'Arbeitsspeicher (RAM)',en:'Memory (RAM)'},facets:['memory_generation','memory_capacity','memory_speed','memory_form_factor','memory_modules','brand','price']},
  'automotive.spark_plug':{label:{de:'Zündkerzen',en:'Spark plugs'},facets:['application','vehicle_make','vehicle_model','engine','thread_size','heat_range','electrode_gap','material','brand','price']},
  'automotive.motor_oil':{label:{de:'Motoröl',en:'Motor oil'},facets:['viscosity','volume','specification','approval','brand','unit_price','price']},
  'tools.cordless_drill':{label:{de:'Akku-Bohrschrauber',en:'Cordless drill'},facets:['voltage','battery_capacity','torque','brand','model','price']},
  'electronics.television':{label:{de:'Fernseher',en:'Television'},facets:['screen_size','display_technology','resolution','brand','model','price']},
  'fashion.shoes':{label:{de:'Schuhe',en:'Shoes'},facets:['size','audience','color','brand','model','price']},
  'baby.stroller':{label:{de:'Kinderwagen',en:'Stroller'},facets:['type','age_group','weight','color','brand','price']},
  'computing.laptop':{label:{de:'Laptop / Notebook',en:'Laptop / notebook'},facets:['processor','memory','storage','screen_size','brand','price']},
  'electronics.smartphone':{label:{de:'Smartphone',en:'Smartphone'},facets:['storage','memory','screen_size','brand','model','price']},
  'electronics.headphones':{label:{de:'Kopfhörer',en:'Headphones'},facets:['type','connectivity','noise_cancelling','color','brand','price']},
  'home.vacuum':{label:{de:'Staubsauger',en:'Vacuum cleaner'},facets:['type','power','capacity','brand','price']},
  'home.washing_machine':{label:{de:'Waschmaschine',en:'Washing machine'},facets:['capacity','spin_speed','energy_class','brand','price']},
  'garden.robot_mower':{label:{de:'Mähroboter',en:'Robot mower'},facets:['max_area','max_slope','cutting_width','brand','price']},
  'cycling.bicycle':{label:{de:'Fahrrad',en:'Bicycle'},facets:['frame_size','wheel_size','gears','brand','price']}
 };
 function clean(v){return String(v||'').normalize('NFKC').replace(/\s+/g,' ').trim()}
 function number(text,re){const m=text.match(re);return m?Number(String(m[1]).replace(',','.')):null}
 function classify(q){
  const s=clean(q),l=s.toLocaleLowerCase();
  if(/\b(?:laptop|notebook)\b/iu.test(l))return'computing.laptop';
  if(/\b(?:smartphone|handy|iphone)\b/iu.test(l))return'electronics.smartphone';
  if(/\b(?:ram|arbeitsspeicher|ddr[345]?|sodimm|so-dimm|dimm)\b/iu.test(l))return'computing.memory';
  if(/\b(?:zündkerz(?:e|en)|spark\s*plug(?:s)?)\b/iu.test(l))return'automotive.spark_plug';
  if(/\b(?:motoröl|motor oil|engine oil|\d{1,2}w[- ]?\d{2})\b/iu.test(l))return'automotive.motor_oil';
  if(/\b(?:akkuschrauber|akku[- ]?bohrschrauber|cordless drill)\b/iu.test(l))return'tools.cordless_drill';
  if(/\b(?:fernseher|tv|television|oled|qled)\b/iu.test(l))return'electronics.television';
  if(/\b(?:laufschuh|laufschuhe|running shoes?|sneaker|schuhe)\b/iu.test(l))return'fashion.shoes';
  if(/\b(?:kinderwagen|buggy|stroller)\b/iu.test(l))return'baby.stroller';
  if(/\b(?:kopfhörer|headphones?|earbuds?)\b/iu.test(l))return'electronics.headphones';
  if(/\b(?:staubsauger|vacuum cleaner)\b/iu.test(l))return'home.vacuum';
  if(/\b(?:waschmaschine|washing machine)\b/iu.test(l))return'home.washing_machine';
  if(/\b(?:mähroboter|rasenroboter|robot mower)\b/iu.test(l))return'garden.robot_mower';
  if(/\b(?:fahrrad|bike|bicycle)\b/iu.test(l))return'cycling.bicycle';
  return null;
 }
 function constraints(q,category){
  const s=clean(q),l=s.toLocaleLowerCase(),a={};
  if(category==='computing.memory'){
   const gen=l.match(/\bddr\s*([345])\b/iu);if(gen)a.memory_generation='DDR'+gen[1];
   const cap=number(l,/\b(4|8|16|24|32|48|64|96|128)\s*gb\b/iu);if(cap)a.memory_capacity={value:cap,unit:'GB'};
   const speed=number(l,/\b(\d{3,5})\s*(?:mhz|mt\/s)\b/iu);if(speed)a.memory_speed={value:speed,unit:'MHz'};
   if(/\b(?:so[- ]?dimm|sodimm|laptop|notebook)\b/iu.test(l))a.memory_form_factor='SO-DIMM';else if(/\bdimm\b/iu.test(l))a.memory_form_factor='DIMM';
  }else if(category==='automotive.motor_oil'){
   const vis=l.match(/\b(\d{1,2})w[- ]?(\d{2})\b/iu);if(vis)a.viscosity=vis[1].toUpperCase()+'W-'+vis[2];
   const vol=number(l,/\b(\d+(?:[.,]\d+)?)\s*(?:l|liter)\b/iu);if(vol)a.volume={value:vol,unit:'l'};
  }else if(category==='tools.cordless_drill'){
   const v=number(l,/\b(\d+(?:[.,]\d+)?)\s*v\b/iu);if(v)a.voltage={value:v,unit:'V'};
  }else if(category==='electronics.television'){
   const z=number(l,/\b(\d{2,3})\s*(?:zoll|inch|["″])/iu);if(z)a.screen_size={value:z,unit:'in'};
   if(/\boled\b/iu.test(l))a.display_technology='OLED';else if(/\bqled\b/iu.test(l))a.display_technology='QLED';
  }else if(category==='computing.laptop'||category==='electronics.smartphone'){
   const ram=l.match(/\b(4|8|16|24|32|48|64|96|128)\s*gb\s*(?:ram|arbeitsspeicher|memory)\b/iu);if(ram)a.memory={value:Number(ram[1]),unit:'GB'};
   const storageMatches=[...l.matchAll(/\b(64|128|256|512|1024|2048)\s*(gb|tb)\b/giu)].filter(m=>!/(?:ram|arbeitsspeicher|memory)\b/iu.test(l.slice(m.index+m[0].length,m.index+m[0].length+20)));const storage=storageMatches[0];if(storage){let value=Number(storage[1]);if(storage[2].toLowerCase()==='tb')value*=1024;a.storage={value,unit:'GB'}}
   const z=number(l,/\b(\d{2}(?:[.,]\d)?)\s*(?:zoll|inch|["″])/iu);if(z)a.screen_size={value:z,unit:'in'};
  }else if(category==='home.washing_machine'){
   const cap=number(l,/\b(\d{1,2}(?:[.,]\d)?)\s*kg\b/iu);if(cap)a.capacity={value:cap,unit:'kg'};
   const rpm=number(l,/\b(\d{3,4})\s*(?:u\/min|rpm)\b/iu);if(rpm)a.spin_speed={value:rpm,unit:'rpm'};
  }else if(category==='garden.robot_mower'){
   const area=number(l,/\b(\d{2,5})\s*(?:m²|m2|qm)\b/iu);if(area)a.max_area={value:area,unit:'m²'};
  }else if(category==='fashion.shoes'){
   const sz=number(l,/\b(?:größe|gr\.?|size)\s*(\d{2}(?:[.,]5)?)\b/iu);if(sz)a.size=sz;
   if(/\b(?:damen|women|woman)\b/iu.test(l))a.audience='women';else if(/\b(?:herren|men|man)\b/iu.test(l))a.audience='men';
  }
  return a;
 }
 function analyze(query,language='de'){
  const category=classify(query),schema=category?BLUEPRINTS[category]:null,attrs=constraints(query,category);
  return Object.freeze({query:clean(query),category,confidence:category?.startsWith('computing.memory')||category==='automotive.spark_plug'?'high':category?'medium':'unknown',label:schema?.label?.[String(language||'de').split('-')[0]]||schema?.label?.de||'',facets:Object.freeze([...(schema?.facets||['brand','price'])]),attributes:Object.freeze(attrs),needsSemanticFallback:!category});
 }
 return Object.freeze({analyze,classify,constraints,BLUEPRINTS});
});