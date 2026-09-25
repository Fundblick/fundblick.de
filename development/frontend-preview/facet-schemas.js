'use strict';
window.FB_CATEGORY_SCHEMAS={
 headphones:{label:'Kopfhörer',icon:'🎧',terms:['kopfhörer','kopfhoerer','headphone','headphones','earbuds','in-ear','over-ear'],facets:[
  {key:'form',label:'Bauform',type:'multi',values:['Over-Ear','In-Ear','On-Ear']},
  {key:'features',label:'Funktionen',type:'multi',values:['Active Noise Cancelling','Multipoint','Mikrofon','Faltbar']},
  {key:'battery',label:'Akkulaufzeit',type:'threshold',unit:'h',values:[20,40,60]},
  {key:'bluetooth',label:'Bluetooth',type:'multi',values:['5.0','5.2','5.3','5.4']}
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
  {key:'features',label:'Eigenschaften',type:'multi',values:['Wasserdicht','Atmungsaktiv','Dämpfung','Breite Passform']}
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
window.FB_COMMON_FACETS=[
 {key:'price',label:'Gesamtpreis inkl. Versand',type:'price'},
 {key:'brand',label:'Hersteller',type:'brand'},
 {key:'shipping',label:'Versand & Verfügbarkeit',type:'delivery'},
 {key:'rating',label:'Bewertung',type:'rating'},
 {key:'color',label:'Farbe',type:'multi-common'},
 {key:'merchants',label:'Händler & Angebote',type:'merchant'}
];
window.FB_detectCategory=function(query){const q=String(query||'').toLocaleLowerCase('de');let best=null,bestLen=0;for(const [key,s] of Object.entries(window.FB_CATEGORY_SCHEMAS)){for(const term of s.terms){if(q.includes(term)&&term.length>bestLen){best={key,...s};bestLen=term.length}}}return best||{key:'headphones',...window.FB_CATEGORY_SCHEMAS.headphones};};