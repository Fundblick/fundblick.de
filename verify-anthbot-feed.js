'use strict';
const assert=require('node:assert/strict');const n=require('./anthbot-feed-normalizer.js');
const rows=[
 {advertiser_id:'125144',id:'m1',title:'ANTHBOT Genie 800 1500m² 4G',description:'Mähroboter',link:'https://de.anthbot.com/products/genie-800',aw_deep_link:'https://www.awin1.com/cread.php?awinmid=125144&ued=https%3A%2F%2Fde.anthbot.com',image_link:'https://example.com/a.jpg',price:'999.00 EUR',availability:'in_stock',brand:'xcotton',condition:'new',google_product_category:'Home & Garden > Lawn & Garden > Outdoor Power Equipment > Lawn Mowers > Robotic Mowers'},
 {advertiser_id:'125144',id:'r1',title:'Generalüberholter ANTHBOT Genie 1000| 2000m²',description:'',link:'https://de.anthbot.com/products/refurb-genie-1000',aw_deep_link:'https://www.awin1.com/cread.php?awinmid=125144',image_link:'https://example.com/r.jpg',price:'699.00 EUR',availability:'in_stock',brand:'ANTHBOT-DE',condition:'new',google_product_category:'Home & Garden > Lawn & Garden > Outdoor Power Equipment > Lawn Mowers > Robotic Mowers'},
 {advertiser_id:'125144',id:'s1',title:'Shipping Protection - S001',description:'',price:'1.00 EUR'},
 {advertiser_id:'125144',id:'f1',title:'Differenzgebühr',description:'',price:'10.00 EUR'},
 {advertiser_id:'125144',id:'g1',title:'ANTHBOT Geschenkkarte - €699',description:'',price:'699.00 EUR',google_product_category:'Arts & Entertainment > Party & Celebration > Gift Giving > Gift Cards & Certificates'}
];
const selected=n.selectRows(rows);assert.equal(selected.advertiser.length,5);assert.equal(selected.excluded.length,3);assert.equal(selected.eligible.length,2);assert.deepEqual(selected.excluded.map(n.exclusionReason).sort(),['fee-adjustment','gift-card','shipping-protection']);
const products=n.normalize(rows);assert.equal(products.length,2);assert.equal(n.validate(products).length,0);assert.equal(products[0].brand,'ANTHBOT');assert.equal(products[0].category,'home.garden.robot-mowers');assert.equal(products[0].rawAttributes.taxonomyConfidence,'authoritative');assert.equal(products[0].rawAttributes.facets.lawnAreaM2,1500);assert.equal(products[0].rawAttributes.facets.connectivity4G,true);assert.equal(products[1].rawAttributes.condition,'refurbished');assert.equal(products[1].rawAttributes.feedCondition,'new');assert.equal(products[1].rawAttributes.refurbished,true);
console.log('ANTHBOT feed quality gate passed');
