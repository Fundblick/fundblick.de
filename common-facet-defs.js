'use strict';
/* Production common facets. Merchant identity is now normalized as a
   dedicated string attribute and is intentionally separate from brand. */
window.FB_COMMON_FACETS=[
  {key:'price',label:'Produktpreis',type:'price'},
  {key:'merchant',label:'Händler',type:'multi'},
  {key:'brand',label:'Hersteller / Marke',type:'brand'}
];