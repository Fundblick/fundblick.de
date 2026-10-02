'use strict';
const path=require('node:path');
const input=process.argv[2];
const outputRoot=process.argv[3]||path.join('build','amazgifts-catalog');
if(!input)throw new Error('Usage: node build-amazgifts-development-catalog.js <datafeed_3106259.csv[.gz]> [output-dir]');
process.argv=['node','build-merchant-feed-catalog.js','amazgifts',input,outputRoot];
require('./build-merchant-feed-catalog.js');
