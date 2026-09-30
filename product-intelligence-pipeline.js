'use strict';
(function(root,factory){const api=factory(root);if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.FundBlickProductIntelligencePipeline=api;})(typeof window!=='undefined'?window:globalThis,function(root){
 const req=name=>typeof require==='function'?require(name):null;
 const core=req('./product-intelligence-core.js')||root?.FundBlickProductIntelligence;
 const extractor=req('./product-result-attribute-extractor.js')||root?.FundBlickProductResultAttributeExtractor;
 const units=req('./product-unit-normalizer.js')||root?.FundBlickProductUnitNormalizer;
 const facets=req('./product-facet-engine.js')||root?.FundBlickProductFacetEngine;
 function run(query,results,options={}){if(!core||!extractor||!units||!facets)throw new Error('Product intelligence dependencies unavailable');const analysis=core.analyze(query);const extracted=extractor.extractAll(results,analysis);const enriched=extracted.map(units.enrich);const facetState=facets.derive(analysis,enriched,options.facets||{});return Object.freeze({query:String(query||''),analysis,results:enriched,facets:facetState});}
 return Object.freeze({run});
});