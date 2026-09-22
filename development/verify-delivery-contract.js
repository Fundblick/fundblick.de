const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('preview.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if(!script)throw new Error('preview script missing');
const names=['countryCode','deliveryEligibility','detailOfferEligibility','selectDetailOffer'];
const source=names.map(n=>{const m=script.match(new RegExp('function '+n+'\\([^]*?\\n\\}'));if(!m)throw new Error(n+' missing');return m[0]}).join('\n');
const ctx={};vm.createContext(ctx);vm.runInContext(source,ctx);
const eq=(actual,expected,label)=>{if(JSON.stringify(actual)!==JSON.stringify(expected))throw new Error(label+': '+JSON.stringify(actual))};
eq(ctx.countryCode(' it '),'IT','normalizes country');
eq(ctx.countryCode('ITA'),null,'rejects invalid country');
eq(ctx.deliveryEligibility({shipsTo:['IT'],markets:['DE'],unknown:false},'it'),{rank:0,state:'eligible'},'explicit eligible');
eq(ctx.deliveryEligibility({shipsTo:['DE'],markets:['DE'],unknown:false},'IT'),{rank:2,state:'unsupported'},'explicit unsupported');
eq(ctx.deliveryEligibility({shipsTo:[],markets:['DE'],unknown:true},'DE'),{rank:0,state:'eligible'},'same market eligible');
eq(ctx.deliveryEligibility({shipsTo:[],markets:['DE'],unknown:true},'IT'),{rank:1,state:'unknown'},'cross-border unknown');
eq(ctx.deliveryEligibility({shipsTo:[],markets:['DE'],unknown:false},'IT'),{rank:2,state:'unsupported'},'no fallback unsupported');
eq(ctx.deliveryEligibility({shipsTo:[' it '],markets:[],unknown:false},'IT'),{rank:0,state:'eligible'},'normalizes published destination');
const product={variants:[{offers:[
  {id:'cheap-unknown',purchasable:true,market:'DE',shipsTo:[],totalPrice:80,currency:'EUR'},
  {id:'it-expensive',purchasable:true,market:'DE',shipsTo:['IT'],totalPrice:100,currency:'EUR'},
  {id:'it-cheap',purchasable:true,market:'DE',shipsTo:['IT'],totalPrice:90,currency:'EUR'},
  {id:'it-no-price',purchasable:true,market:'DE',shipsTo:['IT'],totalPrice:null,currency:'EUR'},
  {id:'not-buyable',purchasable:false,market:'IT',shipsTo:['IT'],totalPrice:1,currency:'EUR'}
]}]};
eq(ctx.selectDetailOffer(product,'IT').id,'it-cheap','eligible beats cheaper unknown and sorts by price');
eq(ctx.selectDetailOffer(product,'FR').id,'cheap-unknown','unknown beats explicitly unsupported');
eq(ctx.selectDetailOffer(product,'DE').id,'cheap-unknown','same-market unknown-shipping offer is eligible');
eq(ctx.selectDetailOffer({variants:[{offers:[
  {id:'missing',purchasable:true,market:'IT',shipsTo:['IT'],totalPrice:null},
  {id:'priced',purchasable:true,market:'IT',shipsTo:['IT'],totalPrice:0}
]}]},'IT').id,'priced','finite zero price beats missing price');
console.log('FundBlick V2 delivery/offer contract OK');
