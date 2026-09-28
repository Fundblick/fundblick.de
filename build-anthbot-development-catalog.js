'use strict';
const path=require('node:path');
const input=process.argv[2];
const outputRoot=process.argv[3]||path.join('build','anthbot-catalog');
if(!input)throw new Error('Usage: node build-anthbot-development-catalog.js <125144-retail-de_DE.csv[.gz]> [output-dir]');
process.argv=['node','build-merchant-feed-catalog.js','anthbot',input,outputRoot];
require('./build-merchant-feed-catalog.js');
