'use strict';
(function(root){
  const n=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const RULES={
    furniture:{
      type:[['Hocker',/\b(hocker|schemel|ottoman|pouf|puff)\b/i],['Mosaiktisch',/\bmosaik(?:tisch| table)|mosaic table\b/i],['Beistelltisch',/\b(beistelltisch|sidetable|side table)\b/i],['Bistrotisch',/\b(bistrotisch|bistro table)\b/i],['Couchtisch',/\b(couchtisch|coffee table)\b/i],['Esstisch / Gartentisch',/\b(esstisch|gartentisch|dining table|garden table)\b/i],['Stuhl',/\b(stuhl|chair)\b/i],['Bank',/\b(bank|sitzbank|bench)\b/i],['Sessel / Sofa',/\b(sessel|sofa|couch|armchair)\b/i],['Kommode / Schrank',/\b(kommode|schrank|sideboard|cabinet|wardrobe)\b/i],['Regal',/\b(regal|shelf|shelving)\b/i]],
      material:[['Holz',/\b(holz|wood|mango(?:holz)?|akazie|teak)\b/i],['Metall',/\b(metall|metal|stahl|steel|eisen|iron)\b/i],['Mosaik',/\b(mosaik|mosaic)\b/i],['Keramik',/\b(keramik|ceramic)\b/i],['Rattan',/\b(rattan|geflecht|wicker)\b/i],['Textil',/\b(textil|stoff|fabric|velvet|samt)\b/i],['Leder',/\b(leder|leather)\b/i]],
      style:[['Marokkanisch',/\b(marokkan|maroccan|moroccan)\w*/i],['Orientalisch',/\b(oriental|arabisch|arabic)\w*/i],['Mediterran',/\b(mediterran|mediterranean)\w*/i],['Vintage',/\b(vintage|retro|antik|antique)\w*/i],['Industrial',/\bindustrial\w*/i],['Modern',/\b(modern|zeitlos|minimalist)\w*/i]]
    },
    lighting:{
      type:[['Hänge- / Pendelleuchte',/\b(hangeleuchte|pendelleuchte|pendellampe|hangelampe|pendant light)\b/i],['Wandlampe',/\b(wandlampe|wandleuchte|wall light|wall lamp)\b/i],['Deckenleuchte',/\b(deckenlampe|deckenleuchte|ceiling light)\b/i],['Steh- / Tischlampe',/\b(stehlampe|stehleuchte|tischlampe|tischleuchte|floor lamp|table lamp)\b/i],['Laterne',/\b(laterne|lantern)\b/i],['Windlicht',/\bwindlicht\w*/i],['Teelichthalter',/\b(teelichthalter|tealight holder)\b/i]],
      material:[['Messing',/\b(messing|brass)\b/i],['Kupfer',/\b(kupfer|copper)\b/i],['Metall',/\b(metall|metal|stahl|steel|eisen|iron)\b/i],['Glas',/\b(glas|glass)\b/i],['Holz',/\b(holz|wood)\b/i]],
      style:[['Marokkanisch',/\b(marokkan|maroccan|moroccan)\w*/i],['Orientalisch',/\b(oriental|arabisch|arabic)\w*/i],['Mediterran',/\b(mediterran|mediterranean)\w*/i],['Vintage',/\b(vintage|retro|antik|antique)\w*/i],['Industrial',/\bindustrial\w*/i],['Modern',/\b(modern|zeitlos|minimalist)\w*/i]]
    },
    decor:{
      type:[['Vase',/\b(vase|vasen)\b/i],['Figur',/\b(figur|statue|skulptur|sculpture)\b/i],['Spiegel',/\b(spiegel|mirror)\b/i],['Kissen',/\b(kissen|cushion|pillow)\b/i],['Schale / Tablett',/\b(schale|tablett|tray|bowl)\b/i],['Wanddekoration',/\b(wanddeko|wanddekoration|wall decor|wall art)\b/i]],
      material:[['Metall',/\b(metall|metal|stahl|steel|eisen|iron)\b/i],['Holz',/\b(holz|wood)\b/i],['Glas',/\b(glas|glass)\b/i],['Keramik',/\b(keramik|ceramic)\b/i],['Textil',/\b(textil|stoff|fabric)\b/i],['Stein',/\b(stein|stone|marmor|marble)\b/i]],
      style:[['Marokkanisch',/\b(marokkan|maroccan|moroccan)\w*/i],['Orientalisch',/\b(oriental|arabisch|arabic)\w*/i],['Mediterran',/\b(mediterran|mediterranean)\w*/i],['Vintage',/\b(vintage|retro|antik|antique)\w*/i],['Industrial',/\bindustrial\w*/i],['Modern',/\b(modern|zeitlos|minimalist)\w*/i]]
    },
    living:{
      type:[['Korb / Aufbewahrung',/\b(korb|basket|aufbewahrung|storage)\b/i],['Waschbecken',/\b(waschbecken|washbasin|sink)\b/i],['Brunnen',/\b(brunnen|fountain)\b/i],['Wohnaccessoire',/\b(wohnaccessoire|home accessory)\b/i]],
      material:[['Metall',/\b(metall|metal|stahl|steel|eisen|iron)\b/i],['Holz',/\b(holz|wood)\b/i],['Keramik',/\b(keramik|ceramic)\b/i],['Stein',/\b(stein|stone|marmor|marble)\b/i],['Textil',/\b(textil|stoff|fabric)\b/i],['Naturfaser',/\b(jute|seegras|seagrass|bambus|bamboo|naturfaser)\b/i],['Glas',/\b(glas|glass)\b/i]],
      room:[['Bad',/\b(bad|badezimmer|bathroom)\b/i],['Garten / Außenbereich',/\b(garten|outdoor|aussen|außen|terrasse|patio)\b/i],['Wohnbereich',/\b(wohnen|wohnzimmer|living room|indoor)\b/i]]
    }
  };
  function textOf(p){return [p?.name,p?.title,p?.description,p?.category,p?.taxonomy,p?.brand].filter(Boolean).join(' ')}
  function classify(product,family){const rules=RULES[family];if(!rules)return {};const text=n(textOf(product));const out={};for(const [facet,values] of Object.entries(rules)){const hits=[];for(const [label,re] of values){re.lastIndex=0;if(re.test(text))hits.push(label)}if(hits.length)out[facet]=hits.length===1?hits[0]:hits;}return out;}
  const api={classify,rules:RULES};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.FBHomeFacetClassifier=api;
})(typeof window!=='undefined'?window:globalThis);
