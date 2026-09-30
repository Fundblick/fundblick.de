'use strict';
// Isolated evaluation adapter. Never loaded by the website.
function create(snapshot){if(snapshot?.runtimeEnabled!==false)throw Error('Taxonomy evaluation must stay disabled for runtime');const nodes=new Map(snapshot.nodes.map(x=>[x.id,x])),attributes=new Map(snapshot.attributes.map(x=>[x.id,x])),mappings=new Map(snapshot.mappings.map(x=>[x.fundblick,x]));
 function resolve(id){const mapping=mappings.get(id);if(!mapping)return null;let node=nodes.get(mapping.shopify);if(!node)throw Error('Missing mapped taxonomy node');const category=node,chain=[],seen=new Set(),effective=new Map();while(node){if(seen.has(node.id))throw Error('Taxonomy parent cycle');seen.add(node.id);chain.unshift(node);node=node.parentId?nodes.get(node.parentId):null;if(chain[0].parentId&&!node)throw Error('Missing taxonomy parent')}
  // Candidate inheritance only: taxonomy assignment does not determine visible facets.
  for(const entry of chain)for(const attributeId of entry.attributeIds){if(!attributes.has(attributeId))throw Error('Missing taxonomy attribute');effective.set(attributeId,{...attributes.get(attributeId),definedAt:entry.id})}
  return{fundblick:id,taxonomyId:category.id,labels:category.labels,relation:mapping.relation,requiredExtension:mapping.requiredExtension||null,breadcrumb:chain.map(x=>({id:x.id,labels:x.labels})),candidateAttributes:[...effective.values()]};
 }
 return Object.freeze({resolve});
}
module.exports={create};
