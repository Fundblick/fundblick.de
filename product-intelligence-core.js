'use strict';

(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.FundBlickProductIntelligence=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  const classes=[
    {id:'automotive.motor_oil',terms:[/\b(?:motoröl|motoroel|engine oil|olio motore|масло моторное|моторное масло)\b/i,/\b(?:0w|5w|10w|15w|20w)[- ]?\d{2}\b/i],facets:['brand','viscosity','volume','specification','approval','price','unit_price']},
    {id:'fashion.shoes',terms:[/\b(?:schuh|schuhe|sneaker|turnschuh|shoe|shoes|кроссовк|обув|pantof|adidași|scarpe)\w*/i],facets:['brand','audience','size','color','model','price']},
    {id:'electronics.television',terms:[/\b(?:fernseher|tv|television|smart tv|телевизор|televizor)\b/i],facets:['brand','screen_size','display_technology','resolution','model','price']},
    {id:'electronics.smartphone',terms:[/\b(?:smartphone|handy|mobiltelefon|phone|iphone|смартфон|telefon)\b/i],facets:['brand','model','storage','color','connectivity','price']},
    {id:'tools.cordless_drill',terms:[/\b(?:akkuschrauber|akku[- ]?bohrschrauber|cordless drill|шуруповерт|mașină de găurit|trapano avvitatore)\b/i],facets:['brand','voltage','battery_capacity','torque','model','price']},
    {id:'computing.laptop',terms:[/\b(?:laptop|notebook|ноутбук)\b/i],facets:['brand','screen_size','processor','memory','storage','price']}
  ];
  const brands=['adidas','apple','samsung','bosch','castrol','liqui moly','mobil','shell','sony','lg','lenovo','hp','dell','asus','acer','makita','dewalt','metabo','milwaukee'];
  function clean(v){return String(v||'').normalize('NFKC').replace(/[‐‑‒–—]/g,'-').replace(/\s+/g,' ').trim()}
  function matchValue(text,re,transform){const m=text.match(re);return m?transform?transform(m):m[0]:null}
  function normalizeQuery(query){const original=clean(query);return {original,normalized:original.toLocaleLowerCase()}}
  function classify(query){
    const q=normalizeQuery(query);let best=null,bestScore=0;
    for(const item of classes){let hits=0;for(const re of item.terms)if(re.test(q.normalized))hits++;const score=Math.min(0.99,hits/item.terms.length+0.45*(hits>0));if(hits&&score>bestScore){best=item;bestScore=score}}
    return best?{category:best.id,confidence:Number(bestScore.toFixed(2)),facets:[...best.facets]}:{category:null,confidence:0,facets:['brand','price']};
  }
  function extract(query,category){
    const text=normalizeQuery(query).normalized;const out={};
    const brand=brands.find(b=>text.includes(b));if(brand)out.brand={value:brand,confidence:'HIGH'};
    const viscosity=matchValue(text,/\b(0w|5w|10w|15w|20w)[- ]?(20|30|40|50|60)\b/i,m=>`${m[1].toUpperCase()}-${m[2]}`);if(viscosity)out.viscosity={value:viscosity,confidence:'HIGH'};
    const volume=matchValue(text,/\b(\d+(?:[.,]\d+)?)\s*(l|liter|litre|ltr)\b/i,m=>({value:Number(m[1].replace(',','.')),unit:'l'}));if(volume)out.volume={...volume,confidence:'HIGH'};
    const voltage=matchValue(text,/\b(\d+(?:[.,]\d+)?)\s*v(?:olt)?\b/i,m=>({value:Number(m[1].replace(',','.')),unit:'V'}));if(voltage)out.voltage={...voltage,confidence:'HIGH'};
    const storage=matchValue(text,/\b(\d+)\s*(gb|tb)\b/i,m=>({value:Number(m[1]),unit:m[2].toUpperCase()}));if(storage)out.storage={...storage,confidence:'HIGH'};
    const screen=matchValue(text,/\b(\d{2,3}(?:[.,]\d+)?)\s*(?:zoll|inch|\")\b/i,m=>({value:Number(m[1].replace(',','.')),unit:'in'}));if(screen)out.screen_size={...screen,confidence:'HIGH'};
    if(category==='fashion.shoes'){const size=matchValue(text,/\b(?:eu\s*|gr(?:öße|\.)?\s*)?(3[5-9]|4[0-9]|5[0-2])\b/i,m=>Number(m[1]));if(size)out.size={value:size,system:'EU',confidence:'MEDIUM'}}
    return out;
  }
  function analyze(query){const normalized=normalizeQuery(query);const cls=classify(query);return Object.freeze({...normalized,...cls,attributes:extract(query,cls.category)});}
  return Object.freeze({analyze,classify,extract,normalizeQuery,classes});
});
