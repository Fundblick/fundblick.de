'use strict';

const assert = require('node:assert/strict');
const intent = require('./universal-search-intent.js');

const winter = intent.analyze('Winterreifen', 'de');
assert.equal(winter.breadth, 'broad');
assert.equal(winter.enrichWeb, true);
assert.equal(winter.primary, 'product');
assert.equal(winter.searchLanguage, 'de');
assert.ok(winter.modes.includes('discovery'));

const exact = intent.analyze('Bosch GSR 18V-55', 'de');
assert.equal(exact.exactModel, true);
assert.equal(exact.breadth, 'focused');
assert.equal(exact.enrichWeb, false);
assert.equal(exact.primary, 'product');

const localDe = intent.analyze('Ich brauche Zündkerzen in Rottweil', 'de');
assert.equal(localDe.local, true);
assert.equal(localDe.primary, 'local');
assert.equal(localDe.place.toLocaleLowerCase(), 'rottweil');
assert.equal(localDe.enrichWeb, true);

const infoRu = intent.analyze('какие зимние шины лучше', 'de');
assert.equal(infoRu.searchLanguage, 'ru');
assert.equal(infoRu.informational, true);
assert.equal(infoRu.primary, 'informational');
assert.equal(infoRu.enrichWeb, true);

const videoRu = intent.analyze('видео шуруповёрт', 'de');
assert.equal(videoRu.searchLanguage, 'ru');
assert.equal(videoRu.video, true);
assert.equal(videoRu.primary, 'video');

const localRo = intent.analyze('bujii în Brașov', 'de');
assert.equal(localRo.searchLanguage, 'ro');
assert.equal(localRo.local, true);
assert.equal(localRo.primary, 'local');
assert.equal(localRo.place.toLocaleLowerCase(), 'brașov');

const uk = intent.analyze('які зимові шини краще', 'de');
assert.equal(uk.searchLanguage, 'uk');

assert.equal(intent.classifyResult({url:'https://www.youtube.com/watch?v=1',title:'Winterreifen erklärt'}), 'video');
assert.equal(intent.classifyResult({url:'https://shop.example/p/1',title:'Bosch GSR',price:'99,99 EUR',productCandidate:true}), 'product');
assert.equal(intent.classifyResult({url:'https://example.com/ratgeber',title:'Welche Winterreifen sind sinnvoll?',description:'Ratgeber'}), 'guide');

const items=[
  {url:'https://youtube.com/watch?v=1',title:'Winterreifen erklärt'},
  {url:'https://shop.example/p/2',title:'Winterreifen ohne Preis',productCandidate:true},
  {url:'https://shop.example/p/1',title:'Winterreifen kaufen',price:'99 EUR',priceConfidence:'verified',productCandidate:true},
  {url:'https://example.com/test',title:'Winterreifen Test Vergleich'}
];

let ranked=intent.rankResults(items,{...intent.analyze('Winterreifen','de'),explicitView:'offers'});
assert.equal(ranked[0].title,'Winterreifen kaufen');
assert.equal(ranked[1].resultType,'product');
assert.equal(ranked[2].resultType,'video');

ranked=intent.rankResults(items,{...intent.analyze('Winterreifen','de'),explicitView:'video'});
assert.equal(ranked[0].resultType,'video');

ranked=intent.rankResults(items,{...intent.analyze('Winterreifen','de'),explicitView:'info'});
assert.equal(ranked[0].resultType,'comparison');

const localItems=[
  {url:'https://maps.example/store',title:'Winterreifen Händler Filiale',description:'Standort vor Ort'},
  {url:'https://shop.example/p/1',title:'Winterreifen kaufen',price:'99 EUR',priceConfidence:'verified',productCandidate:true}
];
ranked=intent.rankResults(localItems,{...intent.analyze('Winterreifen','de'),explicitView:'local'});
assert.equal(ranked[0].resultType,'local');

console.log('Universal search intent: multilingual routing + explicit user intent views OK');
