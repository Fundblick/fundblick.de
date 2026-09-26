'use strict';
/* Conservative production defaults. Do not expose a merchant filter from
   merchantCount: that field is a numeric offer count, not a merchant name.
   A real merchant-name facet will be enabled only when normalized feeds
   expose merchant identity as a dedicated attribute. */
window.FB_COMMON_FACETS=[
  {key:'price',label:'Produktpreis',type:'price'},
  {key:'brand',label:'Hersteller / Marke',type:'brand'}
];
