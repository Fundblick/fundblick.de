'use strict';
window.FB_CATEGORY_SCHEMAS={
 headphones:{label:'Kopfhörer',icon:'🎧',terms:['kopfhörer','kopfhoerer','headphone','headphones','earbuds','in-ear','over-ear'],facets:[
  {key:'connection',label:'Verbindung',type:'multi',values:['Kabellos','Kabelgebunden']},
  {key:'form',label:'Bauform',type:'multi',values:['Over-Ear','In-Ear','On-Ear']},
  {key:'features',label:'Funktionen',type:'multi',values:['Active Noise Cancelling','Multipoint','Mikrofon','Faltbar']},
  {key:'battery',label:'Akkulaufzeit',type:'threshold',unit:'h',values:[20,40,60],when:{facet:'connection',not:'Kabelgebunden'}},
  {key:'bluetooth',label:'Bluetooth',type:'multi',values:['5.0','5.2','5.3','5.4'],when:{facet:'connection',not:'Kabelgebunden'}},
  {key:'cableLength',label:'Kabellänge',type:'multi',unit:'m',values:['1.0','1.2','1.5','2.0','3.0'],when:{facet:'connection',equals:'Kabelgebunden'}}
 ]},
 tv:{label:'Fernseher',icon:'📺',terms:['fernseher','tv','oled','qled','smart tv'],facets:[
  {key:'screen',label:'Bildschirmdiagonale',type:'multi',unit:'Zoll',values:['43','50','55','65','75']},
  {key:'panel',label:'Bildschirmtechnik',type:'multi',values:['OLED','QLED','Mini-LED','LED']},
  {key:'resolution',label:'Auflösung',type:'multi',values:['4K UHD','8K']},
  {key:'refresh',label:'Bildwiederholrate',type:'threshold',unit:'Hz',values:[60,100,120,144]},
  {key:'features',label:'Ausstattung',type:'multi',values:['HDR','HDMI 2.1','Dolby Vision','Gaming']}
 ]},
 shoes:{label:'Schuhe',icon:'👟',terms:['schuhe','schuh','sneaker','laufschuhe','running shoes','boots'],facets:[
  {key:'size',label:'Größe',type:'multi',values:['36','37','38','39','40','41','42','43','44','45','46']},
  {key:'audience',label:'Passform / Zielgruppe',type:'multi',values:['Damen','Herren','Unisex']},
  {key:'material',label:'Material',type:'multi',values:['Textil','Leder','Synthetik','Mesh']},
  {key:'features',label:'Eigenschaften',type:'multi',values:['Wasserdicht','Atmungsaktiv','Dämpfung','Breite Passform']},
  {key:'terrain',label:'Untergrund',type:'multi',values:['Straße','Trail','Allround'],when:{queryIncludes:['laufschuh','running']}}
 ]},
 heatgun:{label:'Heißluftfön',icon:'♨️',terms:['heißluftfön','heissluftfön','heißluftgebläse','heissluftgebläse','heat gun'],facets:[
  {key:'power',label:'Leistung',type:'threshold',unit:'W',values:[1200,1600,2000,2200]},
  {key:'temperature',label:'Max. Temperatur',type:'threshold',unit:'°C',values:[400,500,600,650]},
  {key:'airflow',label:'Luftmenge',type:'threshold',unit:'l/min',values:[300,400,500]},
  {key:'features',label:'Ausstattung',type:'multi',values:['Temperaturregelung','Display','Koffer','Düsen-Set']}
 ]},
 smartphone:{label:'Smartphone',icon:'📱',terms:['smartphone','handy','iphone','galaxy','pixel'],facets:[
  {key:'storage',label:'Speicher',type:'multi',unit:'GB',values:['128','256','512','1024']},
  {key:'screen',label:'Displaygröße',type:'multi',unit:'Zoll',values:['6.1','6.3','6.5','6.7','6.9']},
  {key:'features',label:'Mobilfunk & SIM',type:'multi',values:['5G','Dual-SIM','eSIM']},
  {key:'ram',label:'Arbeitsspeicher',type:'threshold',unit:'GB',values:[6,8,12,16]}
 ]}
};
window.FB_COMMON_FACETS=[{key:'price',label:'Gesamtpreis inkl. Versand',type:'price'},{key:'brand',label:'Hersteller',type:'brand'},{key:'shipping',label:'Versand & Verfügbarkeit',type:'delivery'},{key:'rating',label:'Bewertung',type:'rating'},{key:'color',label:'Farbe',type:'multi-common'},{key:'merchants',label:'Händler & Angebote',type:'merchant'}];
window.FB_detectCategory=function(query){const q=String(query||'').toLocaleLowerCase('de');let best=null,bestLen=0;for(const [key,s] of Object.entries(window.FB_CATEGORY_SCHEMAS)){for(const term of s.terms){if(q.includes(term)&&term.length>bestLen){best={key,...s};bestLen=term.length}}}return best||{key:'headphones',...window.FB_CATEGORY_SCHEMAS.headphones};};
window.FB_extractIntent=function(query,category){const raw=String(query||''),q=raw.toLocaleLowerCase('de'),out=[];const push=(facet,value,label)=>{if(!out.some(x=>x.facet===facet&&String(x.value)===String(value)))out.push({facet,value,label:label||String(value)})};let m=q.match(/(?:unter|bis|max(?:imal)?\.?)[ ]*(\d+(?:[.,]\d+)?)\s*(?:€|euro)/);if(m)push('priceMax',Number(m[1].replace(',','.')),`bis ${m[1]} €`);m=q.match(/(?:über|ab|mind(?:estens)?\.?)[ ]*(\d+(?:[.,]\d+)?)\s*(?:€|euro)/);if(m)push('priceMin',Number(m[1].replace(',','.')),`ab ${m[1]} €`);if(/kostenlos(?:er|e)? versand|versandkostenfrei/.test(q))push('shipping',true,'kostenloser Versand');if(/sofort lieferbar|auf lager/.test(q))push('stock',true,'sofort lieferbar');if(category.key==='tv'){m=q.match(/(43|50|55|65|75)\s*(?:zoll|\")/);if(m)push('screen',m[1],`${m[1]} Zoll`);['OLED','QLED','Mini-LED','LED'].forEach(v=>{if(q.includes(v.toLowerCase()))push('panel',v,v)});if(/4k|uhd/.test(q))push('resolution','4K UHD','4K UHD');if(/8k/.test(q))push('resolution','8K','8K')}
if(category.key==='headphones'){if(/bluetooth|kabellos|wireless/.test(q))push('connection','Kabellos','Kabellos');if(/kabelgebunden|mit kabel/.test(q))push('connection','Kabelgebunden','Kabelgebunden');if(/over[- ]?ear/.test(q))push('form','Over-Ear','Over-Ear');if(/in[- ]?ear/.test(q))push('form','In-Ear','In-Ear');if(/on[- ]?ear/.test(q))push('form','On-Ear','On-Ear');if(/noise cancelling|anc/.test(q))push('features','Active Noise Cancelling','Active Noise Cancelling')}
if(category.key==='shoes'){m=q.match(/(?:größe|gr\.?)[ ]*(3[6-9]|4[0-6])/);if(m)push('size',m[1],`Größe ${m[1]}`);if(/herren|men/.test(q))push('audience','Herren','Herren');if(/damen|women/.test(q))push('audience','Damen','Damen');if(/wasserdicht/.test(q))push('features','Wasserdicht','Wasserdicht')}
if(category.key==='smartphone'){m=q.match(/(128|256|512|1024)\s*gb/);if(m)push('storage',m[1],`${m[1]} GB`);if(/\b5g\b/.test(q))push('features','5G','5G');if(/dual[- ]?sim/.test(q))push('features','Dual-SIM','Dual-SIM');if(/\besim\b/.test(q))push('features','eSIM','eSIM')}
if(category.key==='heatgun'){m=q.match(/(1200|1600|2000|2200)\s*w(?:att)?/);if(m)push('power',Number(m[1]),`ab ${m[1]} W`);m=q.match(/(400|500|600|650)\s*°?c/);if(m)push('temperature',Number(m[1]),`ab ${m[1]} °C`)}return out;};
window.FB_facetVisible=function(facet,state,query){if(!facet.when)return true;const w=facet.when;if(w.queryIncludes&&!w.queryIncludes.some(x=>String(query).toLowerCase().includes(x)))return false;const vals=state?.[w.facet]||[];if(w.equals&&!vals.includes(w.equals))return false;if(w.not&&vals.includes(w.not))return false;return true;};