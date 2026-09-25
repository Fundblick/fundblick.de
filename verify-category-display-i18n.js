'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync('category-display-i18n.js','utf8');
const locales=['de','tr','ru','ar','pl','ro','uk','en','it','bg','hr','el','sr','es','fr','pt','fa','sq','zh-Hans','ku'];
for(const locale of locales)assert.ok(source.includes(locale==='zh-Hans'?"'zh-Hans':":`${locale}:{`),`missing category labels for ${locale}`);
for(const id of ['headphones','tv','shoes','heatgun','smartphone','coffee'])assert.ok(source.includes(`${id}:`),`missing category ${id}`);
assert.ok(source.includes('FB_CATEGORY_DISPLAY_LABELS'));
console.log('category display localization smoke test passed');
