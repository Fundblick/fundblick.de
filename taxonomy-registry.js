'use strict';
(function(root){
  const registry={
    version:1,
    principle:'canonical-product-type-plus-facets',
    families:{
      furniture:{label:'Möbel',types:['Hocker','Mosaiktisch','Beistelltisch','Bistrotisch','Couchtisch','Esstisch / Gartentisch','Stuhl','Bank','Sessel / Sofa','Kommode / Schrank','Regal']},
      lighting:{label:'Beleuchtung',types:['Hänge- / Pendelleuchte','Wandlampe','Deckenleuchte','Steh- / Tischlampe','Laterne','Windlicht','Teelichthalter','Lampenfassung / Anschluss']},
      decor:{label:'Dekoration',types:['Vase / Blumentopf','Figur','Spiegel','Kissen / Sitzkissen','Schale / Tablett','Wanddekoration','Haken / Hakenleiste','Korb','Teppich','Fliese','Kerze / Kerzenhalter','Dose / Box / Schmuckkasten']},
      living:{label:'Wohnen / Haushalt',types:['Blumentopf / Pflanzgefäß','Korb / Aufbewahrung','Waschbecken','Brunnen','Teppich','Badaccessoire','Küchenaccessoire','Textilie','Wohnaccessoire']}
    },
    facets:{
      material:['Holz','Metall','Mosaik','Keramik','Rattan','Textil','Leder','Messing','Kupfer','Silber / Metalloptik','Glas','Stein','Naturfaser'],
      style:['Marokkanisch','Orientalisch','Mediterran','Boho / Ethno','Vintage','Industrial','Modern'],
      room:['Bad','Küche / Essen','Garten / Außenbereich','Wohnbereich']
    }
  };
  function hasType(family,type){return !!registry.families[family]?.types.includes(type)}
  function hasFacet(facet,value){return !!registry.facets[facet]?.includes(value)}
  const api={registry,hasType,hasFacet};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.FBTaxonomyRegistry=api;
})(typeof window!=='undefined'?window:globalThis);
