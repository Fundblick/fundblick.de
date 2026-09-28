'use strict';
/* Production common facets. Merchant identity is normalized as a
   dedicated string attribute and is intentionally separate from brand.
   Availability is shared across every search/category view. */
window.FB_COMMON_FACETS=[
  {key:'price',label:'Produktpreis',type:'price'},
  {key:'merchant',label:'Händler',type:'multi'},
  {key:'brand',label:'Hersteller / Marke',type:'brand'},
  {key:'shipping',label:'Verfügbarkeit',type:'multi',values:['Sofort lieferbar']}
];