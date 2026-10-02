'use strict';
(function(root,factory){const api=factory(root);if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.FundBlickProductResultAttributeExtractor=api;})(typeof window!=='undefined'?window:globalThis,function(root){
 const units=typeof require==='function'?require('./product-unit-normalizer.js'):root.FundBlickProductUnitNormalizer;
 const storageParser=typeof require==='function'?require('./product-storage-parser.js'):root.FundBlickProductStorageParser;
 const brands=['adidas','nike','puma','apple','samsung','bosch','castrol','liqui moly','mobil','shell','sony','lg','lenovo','hp','dell','asus','acer','makita','dewalt','metabo','milwaukee','continental','michelin','goodyear','philips','dyson','miele','siemens','delonghi','krups','gardena','husqvarna','worx','stihl','kärcher','kaercher','cube','trek','giant','haibike','cybex','bugaboo'];
 const fashion=typeof require==='function'?require('./product-fashion-attributes.js'):root.FundBlickProductFashionAttributes;
 function text(item){return `${item?.title||''} ${item?.description||''}`.normalize('NFKC').replace(/[‐‑‒–—]/g,'-').replace(/\s+/g,' ').trim()}function high(value,extra={}){return{value,...extra,confidence:'HIGH'}}function medium(value,extra={}){return{value,...extra,confidence:'MEDIUM'}}function num(v){return Number(String(v).replace(',','.'))}function put(a,id,value,extra={},confidence='HIGH'){if(value!=null&&!a[id])a[id]=confidence==='HIGH'?high(value,extra):medium(value,extra)}
 function extractText(item,analysis={}){const s=text(item),l=s.toLocaleLowerCase(),a={...(item?.attributes||{})},cat=analysis?.category||'';const foundBrands=brands.filter(b=>new RegExp(`(?:^|[^\\p{L}\\p{N}])${b.replace(/\s+/g,'[\\s-]+')}(?=$|[^\\p{L}\\p{N}])`,'iu').test(l));const brand=foundBrands.length===1?foundBrands[0]:null;if(brand&&!a.brand)a.brand=high(brand==='kaercher'?'kärcher':brand);
 let m=s.match(/\b(0W|5W|10W|15W|20W)[- ]?(20|30|40|50|60)\b/i);if(m)put(a,'viscosity',`${m[1].toUpperCase()}-${m[2]}`);m=s.match(/\b(\d+(?:[.,]\d+)?)\s*(ml|l|liter|litre|ltr)\b/i);if(m&&!a.volume){let n=num(m[1]);if(m[2].toLowerCase()==='ml')n/=1000;a.volume=high(n,{unit:'l'})}m=s.match(/\b(\d+(?:[.,]\d+)?)\s*v(?:olt)?\b/i);if(m)put(a,'voltage',num(m[1]),{unit:'V'});m=s.match(/\b(\d+(?:[.,]\d+)?)\s*ah\b/i);if(m)put(a,'battery_capacity',num(m[1]),{unit:'Ah'});for(const [id,value]of Object.entries(storageParser.parse(s,cat).attributes))put(a,id,value.value,{unit:value.unit},value.confidence);m=s.match(/\b(\d{2,3}(?:[.,]\d+)?)\s*(?:zoll|inch|\")\b/i);if(m)put(a,'screen_size',num(m[1]),{unit:'in'});m=s.match(/\b(\d{2,3})\s*hz\b/i);if(m)put(a,'refresh_rate',num(m[1]),{unit:'Hz'});m=s.match(/\b(\d{2,4})\s*w(?:att)?\b/i);if(m&&cat!=='automotive.motor_oil')put(a,'power',num(m[1]),{unit:'W'});m=s.match(/\b(\d{2,4})\s*nm\b/i);if(m)put(a,'torque',num(m[1]),{unit:'Nm'});
 if(cat==='automotive.tires'){m=s.match(/\b(\d{3})\/(\d{2})\s*r?(\d{2})\b/i);if(m){put(a,'width',num(m[1]),{unit:'mm'});put(a,'aspect_ratio',num(m[2]),{unit:'%'});put(a,'rim_size',num(m[3]),{unit:'in'})}if(/winter/i.test(l))put(a,'season','winter');else if(/sommer|summer/i.test(l))put(a,'season','summer');else if(/allwetter|allseason|all-season/i.test(l))put(a,'season','all-season')}
 if(cat==='computing.memory'){
  m=s.match(/\bddr\s*([345])\b/i);if(m)put(a,'memory_generation','DDR'+m[1]);
  const kit=s.match(/\b([1248])\s*[x×]\s*(4|8|16|24|32|48|64)\s*gb\b/i);if(kit){put(a,'memory_modules',num(kit[1]),{unit:'pc'});put(a,'memory_capacity',num(kit[1])*num(kit[2]),{unit:'GB'})}else{m=s.match(/\b(4|8|16|24|32|48|64|96|128|256)\s*gb\b/i);if(m)put(a,'memory_capacity',num(m[1]),{unit:'GB'})}
  m=s.match(/\b(\d{3,5})\s*(?:mhz|mt\/s)\b/i);if(m)put(a,'memory_speed',num(m[1]),{unit:'MHz'});
  if(/\b(?:so[- ]?dimm|sodimm)\b/i.test(l))put(a,'memory_form_factor','SO-DIMM');else if(/\bdimm\b/i.test(l))put(a,'memory_form_factor','DIMM');
  
 }
 Object.assign(a,fashion.extract(s,cat).attributes);if(cat==='fashion.clothing'){m=s.match(/\b(XXS|XS|S|M|L|XL|XXL|3XL|4XL)\b/i);if(m)put(a,'size',m[1].toUpperCase(),{},'MEDIUM')}
 if(cat==='electronics.television'||cat==='computing.monitor'){if(/\b(oled)\b/i.test(l))put(a,'display_technology','OLED');else if(/\b(qled)\b/i.test(l))put(a,'display_technology','QLED');else if(/\b(mini[- ]?led)\b/i.test(l))put(a,'display_technology','Mini-LED');if(/\b4k|uhd\b/i.test(l))put(a,'resolution','4K');else if(/\b8k\b/i.test(l))put(a,'resolution','8K');else if(/\bfull[- ]?hd|1080p\b/i.test(l))put(a,'resolution','Full HD')}
 if(cat==='electronics.headphones'){if(/\bbluetooth|wireless|kabellos\b/i.test(l))put(a,'connectivity','wireless');if(/\bnoise cancelling|noise-cancelling|anc\b/i.test(l))put(a,'noise_cancelling','yes');if(/\bin[- ]?ear|earbuds?\b/i.test(l))put(a,'type','in-ear');else if(/\bover[- ]?ear\b/i.test(l))put(a,'type','over-ear')}
 if(cat==='garden.robot_mower'){m=s.match(/\b(?:bis\s*)?(\d{2,5})\s*m(?:²|2)\b/i);if(m)put(a,'max_area',num(m[1]),{unit:'m²'});m=s.match(/\b(\d{1,2})\s*%\s*(?:steigung|slope)?/i);if(m)put(a,'max_slope',num(m[1]),{unit:'%'})}
 if(cat==='garden.lawn_mower'||cat==='garden.robot_mower'){m=s.match(/\b(\d{2,3})\s*cm\s*(?:schnittbreite|cutting width)?/i);if(m)put(a,'cutting_width',num(m[1]),{unit:'cm'})}
 if(cat==='appliance.washing_machine'){m=s.match(/\b(\d{1,2}(?:[.,]\d+)?)\s*kg\b/i);if(m)put(a,'capacity',num(m[1]),{unit:'kg'});m=s.match(/\b(\d{3,4})\s*(?:u\/min|rpm)\b/i);if(m)put(a,'spin_speed',num(m[1]),{unit:'rpm'})}
 if(cat==='sports.bicycle'||cat==='sports.ebike'){m=s.match(/\b(?:rahmen(?:höhe)?|frame)\s*(\d{2})\s*cm\b/i);if(m)put(a,'frame_size',num(m[1]),{unit:'cm'});m=s.match(/\b(2[04689])\s*(?:zoll|inch|\")\b/i);if(m)put(a,'wheel_size',num(m[1]),{unit:'in'});m=s.match(/\b(\d{1,2})\s*(?:gang|gänge|speed)\b/i);if(m)put(a,'gears',num(m[1]))}
 return{...item,attributes:a}}

 function urlText(item){try{const url=new URL(String(item?.url||item?.productUrl||''));if(!/^https?:$/.test(url.protocol))return'';return decodeURIComponent(url.pathname).replace(/\b(\d{3})-(\d{2})-r?(\d{2})\b/gi,'$1/$2 R$3').replace(/\b(\d+)-(\d{1,2})-?(ah)\b/gi,'$1.$2 $3').replace(/[-_]+/g,' ')}catch{return''}}
 function signature(attr,id){if(['storage','memory','volume','weight','quantity','battery_capacity'].includes(id))return String(units.facetValue(id,attr)).toLowerCase()+'|'+id;const defaultUnit={volume:"l",voltage:"V",battery_capacity:"Ah",screen_size:"in",width:"mm",aspect_ratio:"%",rim_size:"in",size:"EU"}[id]||"";return String(attr?.value??attr).toLocaleLowerCase()+'|'+String(attr?.unit||attr?.system||defaultUnit).toLocaleLowerCase()}
 function sourceAttributes(value,analysis){const attrs=extractText({title:value},analysis).attributes,ambiguities=[...fashion.extract(value,analysis?.category).ambiguities];const volumes=[...String(value||'').matchAll(/\b(\d+(?:[.,]\d+)?)\s*(ml|l|liter|litre|ltr)\b/gi)].map(m=>num(m[1])*(m[2].toLowerCase()==='ml'?.001:1));if(new Set(volumes).size>1){delete attrs.volume;ambiguities.push('volume')}const viscosities=[...String(value||'').matchAll(/\b(0w|5w|10w|15w|20w)[- ]?(20|30|40|50|60)\b/gi)].map(m=>m[1].toUpperCase()+'-'+m[2]);if(new Set(viscosities).size>1){delete attrs.viscosity;ambiguities.push('viscosity')}for(const id of storageParser.parse(value,analysis?.category).ambiguities){delete attrs[id];ambiguities.push(id)}Object.defineProperty(attrs,'ambiguities',{value:ambiguities});return attrs}
 function extract(item,analysis={}){
  const title=sourceAttributes(text({title:item?.title}),analysis),url=sourceAttributes(urlText(item),analysis),description=sourceAttributes(text({description:item?.description}),analysis),structured=item?.attributes||{};
  const attrs={},evidence={},conflicts=[...new Set([...title.ambiguities,...url.ambiguities])];
  for(const id of new Set([...Object.keys(structured),...Object.keys(title),...Object.keys(url),...Object.keys(description)])){
   if(conflicts.includes(id))continue;const strong=[structured[id],title[id],url[id]].filter(v=>v!=null);
   if(new Set(strong.map(value=>signature(value,id))).size>1){conflicts.push(id);continue}
   const source=structured[id]!=null?'structured':title[id]!=null?'title':url[id]!=null?'url':'description';
   // A snippet can name alternative products, so it cannot establish the product's brand.
   if(source==='description'&&id==='brand')continue;
   const value=({structured,title,url,description})[source][id];
   if(value!=null){attrs[id]=source==='description'?{...value,confidence:'MEDIUM'}:value;evidence[id]=source}
  }
  return{...item,attributes:attrs,attributeEvidence:evidence,attributeConflicts:conflicts};
 }
 function extractAll(items,analysis){return(Array.isArray(items)?items:[]).map(x=>extract(x,analysis))}return Object.freeze({extract,extractAll});
});