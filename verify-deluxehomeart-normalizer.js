'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {getMerchant,assertInput}=require('./merchant-feed-registry.js');
assertInput(getMerchant('deluxehomeart'),'120411-110455-de_DE-DeluxeHomeartShop_feed_-_DE.csv.gz');
assert.throws(()=>assertInput(getMerchant('deluxehomeart'),'125144-wrong.csv.gz'));
const normalizer=require('./deluxehomeart-feed-normalizer.js');
const {classify,inferFamily}=require('./home-facet-classifier.js');
const {registry}=require('./taxonomy-registry.js');
assert.deepEqual(normalizer.parseCsv('\ufeffa,b\r\n"one, two","line\n""quoted"""\r\n'),[{a:'one, two',b:'line\n"quoted"'}]);
for(const input of ['a,b\n"open,x','a,a\nx,y','a,b\nx,y,z','a,b\n"x"bad,y'])assert.throws(()=>normalizer.parseCsv(input));
const row={merchant_id:'120411',data_feed_id:'110455',merchant_product_id:'55310657651062',aw_product_id:'42709791941',product_name:'LED-Blockkerzen Ø 5 x 12,5 cm, Rosa',description:'Mit Fernbedienung erhältlich. Für Tisch und Vase geeignet.',product_type:'LED Blockkerzen',brand_name:'Deluxe Homeart',colour:'Rose',search_price:'9.95',currency:'EUR',in_stock:'1',is_for_sale:'1',merchant_deep_link:'https://deluxehomeartshop.de/products/led-blockkerzen-o-5-x-12-5-cm-rosa',aw_deep_link:'https://www.awin1.com/pclick.php?p=42709791941&a=3106259&m=120411',merchant_image_url:'https://cdn.shopify.com/s/files/1/0612/2599/2348/files/Indoor-06_Winter_Day_RF-0432.png?v=1761742379'};
const p=normalizer.normalizeRow(row);assert.deepEqual(normalizer.validate([p]),[]);
assert.equal(p.name,row.product_name);assert.equal(p.brand,row.brand_name);assert.equal(p.price,9.95);assert.equal(p.shippingCost,null);assert.equal(p.deliveryDays,null);assert.equal(p.rawAttributes.facets.color,'Rosa');assert.equal(p.category,'home.decor');assert.equal(classify(p).type,'LED-Kerze');
assert(normalizer.validate([p,p]).some(e=>e.includes('duplicate')));
for(const url of ['http://deluxehomeartshop.de/products/a','https://deluxehomeartshop.de.evil.example/products/a','https://user:password@deluxehomeartshop.de/products/a','https://deluxehomeartshop.de/'])assert.equal(normalizer.validDirect(url),false);
assert.equal(normalizer.validAffiliate(row.aw_deep_link.replace('3106259','1234'),row.aw_product_id),false);
assert.equal(normalizer.validAffiliate(row.aw_deep_link,'1234'),false);
assert.equal(normalizer.normalizeRow({...row,search_price:'',in_stock:''}).price,null);assert.equal(normalizer.normalizeRow({...row,in_stock:''}).availability,'UNKNOWN');
assert.equal(normalizer.selectRows([row,{...row,data_feed_id:'another'},{...row,merchant_id:'another'}]).eligible.length,1);
const cases=[
 [{name:'Glatt schwarz',rawAttributes:{productType:'LED Tischlampe'}},'lighting','Steh- / Tischlampe'],
 [{name:'LED Blockkerzen Ø 7,5 x 15 cm Salbeigrün',description:'Für Tisch, Vase und Garten',rawAttributes:{productType:'LED bloklys'}},'decor','LED-Kerze'],
 [{name:'LED-Schwimmleuchten Ø 6,1 cm (2 Stück) Creme',description:'Setzen Sie die Lichter in eine Vase.',rawAttributes:{productType:'LED Schwimmlicht'}},'decor','LED-Dekolicht'],
 [{name:'4 x AAA-Batterien',description:'Passend für Stabkerzen und Kegelkerzen',rawAttributes:{productType:''}},'lighting','Batterien'],
 [{name:'Fernbedienung',description:'Passend für Kerzen und Tischlampen',rawAttributes:{productType:'Fjernbetjening'}},'lighting','Fernbedienung']
];
for(const [product,family,type] of cases){assert.equal(inferFamily(product),family);assert.equal(classify(product).type,type);assert(!Array.isArray(classify(product).type));assert(registry.families[family].types.includes(type));}
assert.equal(normalizer.normalizeRow({...row,product_name:'Draußen LED Blockkerzen 3er-Pack'}).rawAttributes.facets.room,'Garten / Außenbereich');
assert.equal(normalizer.normalizeRow(row).rawAttributes.facets.room,undefined,'No invented indoor classification');
if(process.argv[2]){const payload=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const products=Array.isArray(payload)?payload:payload.products;assert.equal(products.length,592);assert.equal(new Set(products.map(p=>p.id)).size,592);for(const p of products){const a=classify(p);assert(registry.families[inferFamily(p)].types.includes(a.type));assert.notEqual(inferFamily(p),'furniture');}assert.equal(products.filter(p=>p.brand==='Ikon Copenhagen').length,16);assert.equal(products.filter(p=>classify(p).type==='Batterien').length,5);}
const vm=require('node:vm'),window={};vm.runInNewContext(fs.readFileSync('facet-schemas.js','utf8'),{window});
for(const [q,family] of [['Tischlampe','lighting'],['Schwimmleuchten','decor'],['Fernbedienung','lighting'],['Batterien','lighting'],['LED Blockkerzen','decor'],['Beistelltisch','furniture']])assert.equal(window.FB_detectCategory(q).id,family,q);
console.log('DeluxeHomeart normalizer: strict CSV, source fidelity, identity/URL contracts, unknown data and main-item classification passed');
