'use strict';
/* Conservative production defaults. facet-schemas.js may replace these with
   category-aware labels. Do not expose shipping/rating/color filters until
   the live merchant feeds provide reliable values for them. */
window.FB_COMMON_FACETS=[
  {key:'price',label:'Produktpreis',type:'price'},
  {key:'brand',label:'Hersteller / Marke',type:'brand'},
  {key:'merchants',label:'Händler',type:'merchant'}
];
