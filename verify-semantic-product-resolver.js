'use strict';
const assert=require('assert');const s=require('./semantic-product-resolver.js');
let x=s.resolve('Mosaiktisch rund 60 cm',{taxonomy:[{id:'home.furniture',label:'Möbel',terms:['Tisch','Mosaiktisch','Gartentisch']},{id:'home.lighting',label:'Beleuchtung',terms:['Lampe','Leuchte']}]});assert.equal(x.category,'home.furniture');assert(x.score>=.58);
x=s.resolve('unbekanntes Spezialteil',{taxonomy:[{id:'home.furniture',label:'Möbel',terms:['Tisch']}]});assert.equal(x.needsRemoteFallback,true);
x=s.resolve('Pferde Zusatzfutter',{results:[{category:'pet.equestrian',rawAttributes:{productType:'Ergänzungsfutter'}},{category:'pet.equestrian',rawAttributes:{productType:'Pferde Zusatzfutter'}}]});assert.equal(x.category,'pet.equestrian');
console.log('semantic product resolver checks passed');