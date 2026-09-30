'use strict';
const assert=require('node:assert/strict');
const q=require('./search-intent-query.js');

assert.equal(q.refine('Bleistift','offers','de'),'Bleistift kaufen Preis Angebot');
assert.equal(q.refine('Bleistift','info','de'),'Bleistift Erklärung Ratgeber');
assert.equal(q.refine('Bleistift','video','de'),'Bleistift Video');
assert.equal(q.refine('Bleistift','local','de',{}),'Bleistift Händler Geschäft vor Ort 25 km');
assert.equal(q.refine('Bleistift','local','de',{place:'Rottweil',radius:10}),'Bleistift Händler Geschäft vor Ort Rottweil 10 km');
assert.equal(q.refine('Bleistift','local','de',{lat:'48.21',lon:'8.50',radius:500,openNow:true,inStock:true,pickup:true}),'Bleistift Händler Geschäft vor Ort 48.21,8.50 200 km jetzt geöffnet vor Ort verfügbar Abholung Click & Collect');
assert.notEqual(q.refine('Bleistift','offers','de'),q.refine('Bleistift','video','de'));
assert.equal(q.refine('карандаш','video','ru'),'карандаш видео');
console.log('Intent query routing: distinct external result pools + local radius/options OK');
