'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync('live-health.js','utf8');
for(const token of ['language-api','category-schema','common-facets','intent-parser','search-input','filters-root','cards-root','FundBlickHealth'])assert.ok(source.includes(token),`missing ${token}`);
console.log('live health asset smoke test passed');
