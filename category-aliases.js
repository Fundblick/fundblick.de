'use strict';
(function(){
  const aliases={
    headphones:['наушники','навушники','kulaklık','cuffie','سماعات','słuchawki','căști','слушалки','slušalice','ακουστικά','слушалице','auriculares','casque','écouteurs','auscultadores','هدفون','kufje','耳机','guhêdar'],
    tv:['телевизор','телевізор','televizyon','televisione','تلفاز','تلفزيون','telewizor','televizor','телевизор','τηλεόραση','televisor','téléviseur','televisão','تلویزیون','电视','televîzyon'],
    shoes:['обувь','взуття','ayakkabı','scarpe','أحذية','buty','pantofi','обувки','cipele','παπούτσια','обућа','zapatos','chaussures','calçado','کفش','këpucë','鞋','pêlav'],
    smartphone:['смартфон','akıllı telefon','هواتف ذكية','هاتف ذكي','smartfony','telefon inteligent','смартфони','pametni telefon','teléfono inteligente','téléphone intelligent','telemóvel inteligente','گوشی هوشمند','telefon inteligjent','智能手机','telefonên jîr'],
    coffee:['кофемашина','кавомашина','kahve makinesi','macchina da caffè','آلة قهوة','ekspres do kawy','aparat de cafea','кафемашина','aparat za kavu','καφετιέρα','aparat za kafu','cafetera','machine à café','máquina de café','دستگاه قهوه','aparat kafeje','咖啡机','makîneya qehweyê'],
    heatgun:['строительный фен','термофен','будівельний фен','sıcak hava tabancası','pistola termica','مسدس حراري','opalarka','pistol cu aer cald','пистолет за горещ въздух','pištolj na vrući zrak','πιστόλι θερμού αέρα','пиштољ за врућ ваздух','pistola de calor','décapeur thermique','pistola de ar quente','سشوار صنعتی','pistoletë ajri të nxehtë','热风枪','tabanca hewaya germ']
  };
  const schemas=window.FB_CATEGORY_SCHEMAS||{};
  for(const [key,terms] of Object.entries(aliases)){
    const schema=schemas[key];if(!schema)continue;
    schema.terms=[...new Set([...(schema.terms||[]),...terms])];
  }
  const standardHomeFacets=[
    {key:'productType',label:'Produkttyp',type:'multi'},
    {key:'material',label:'Material',type:'multi'},
    {key:'color',label:'Farbe',type:'multi'}
  ];
  const home={
    'home.living':{label:'Wohnen & Haushalt',icon:'🏠',terms:['home.living','wohnen','haushalt','waschbecken','brunnen','tablett','blumentopf','fliesen','tajine'],facets:standardHomeFacets},
    'home.furniture':{label:'Möbel',icon:'🪑',terms:['home.furniture','möbel','moebel','tisch','stuhl','sessel','sofa','kommode','regal','schrank'],facets:standardHomeFacets},
    'home.lighting':{label:'Lampen & Beleuchtung',icon:'💡',terms:['home.lighting','lampe','leuchte','beleuchtung','laterne','windlicht','teelichthalter'],facets:standardHomeFacets},
    'home.decor':{label:'Dekoration',icon:'🪴',terms:['home.decor','dekoration','deko','kissen','korb','teppich','schale','vase'],facets:standardHomeFacets}
  };
  for(const [key,schema] of Object.entries(home))schemas[key]={...(schemas[key]||{}),...schema};
  window.FB_detectCategory=function(query){const q=String(query||'').toLocaleLowerCase('de');let best=null,bestLen=0;for(const [key,s] of Object.entries(schemas)){for(const term of s.terms||[]){const token=String(term).toLocaleLowerCase('de');if(q.includes(token)&&token.length>bestLen){best={id:key,key,...s};bestLen=token.length}}}return best;};
})();