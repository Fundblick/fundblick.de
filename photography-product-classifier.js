'use strict';
// Main-item evidence only. Accessories precede the equipment named as their use.
const rules=[
 ['accessories','Foto- / Videozubehör',/adapter|austauschbajonett|clip\b|cage\b|baseplate|makroschlitten|fokusschiene|filterhalter|adapterring|klammer|clamp|montagesatz|saugnapf|spreader|horseshoe|schnellwechselplatte|release plate|humidor|kontroll.schrank/i],
 ['filters','Objektivfilter',/uv.filter|polfilter|grauverlaufsfilter|graufilter|\bcpl\b|\bfilter\b/i],
 ['tripod-heads','Stativkopf',/kugelkopf|neigekopf|tiltkopf|nivellierkopf|levelhead|videoneiger|videokopf|fluidkopf|gimbal head|kardankopf|stativkopf/i],
 ['lighting','Fotobeleuchtung',/softbox|led.dauerlicht|led.panel|panel.lampe|lichtstab|röhrenlicht|taschenlicht/i],
 ['lenses','Objektiv',/objektiv|cine.lens|kinoobjektiv/i],
 ['tripods','Stativ',/stativ|tripod|monopod/i],
 ['optics','Fernglas / Spektiv',/ferngläser|fernglas\b|spektiv/i]
];
function classify(name,sourceType=''){
 // Explicit source type may identify model-only titles; never inspect descriptions.
 const title=String(name||'').split(' - ')[0];
 // A complete tripod kit has priority over its included head.
 if(/(?:dreibein|einbein|broadcast|kamera|kompakt|video|outdoor|tisch|reise).?stativ|stativ.set|stativ.kit|tripod kit/i.test(title))return {category:'electronics.photo.tripods',family:'photography',productType:'Stativ'};
 for(const evidence of [title,String(sourceType||'')])for(const [slug,type,re] of rules)if(re.test(evidence))return {category:'electronics.photo.'+slug,family:'photography',productType:type};
 return null;
}
module.exports={classify};
