'use strict';
const assert=require('node:assert/strict');
const q=require('./search-intent-query.js');

assert.equal(q.refine('Bleistift','offers','de'),'Bleistift kaufen Preis Angebot');
assert.equal(q.refine('Bleistift','info','de'),'Bleistift Erklärung Ratgeber');
assert.equal(q.refine('Bleistift','video','de'),'Bleistift Video');
assert.equal(q.refine('Bleistift','local','de'),'Bleistift Händler Geschäft vor Ort');
assert.notEqual(q.refine('Bleistift','offers','de'),q.refine('Bleistift','video','de'));
assert.equal(q.refine('карандаш','video','ru'),'карандаш видео');
console.log('Intent query routing: distinct external result pools OK');
