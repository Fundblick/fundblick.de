'use strict';
window.FB_COMMON_FACETS=[
  {key:'price',label:'Gesamtpreis inkl. Versand',type:'price'},
  {key:'brand',label:'Hersteller',type:'brand'},
  {key:'shipping',label:'Versand & Verfügbarkeit',type:'multi',values:['Kostenloser Versand','Sofort lieferbar','Lieferung ≤ 3 Werktage']},
  {key:'rating',label:'Bewertung',type:'threshold',unit:'★',values:[4,4.5]},
  {key:'color',label:'Farbe',type:'multi-common'},
  {key:'merchants',label:'Händler & Angebote',type:'threshold',unit:'🏪',values:[2,3,5]}
];
