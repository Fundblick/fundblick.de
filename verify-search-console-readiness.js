'use strict';
const fs = require('node:fs');

const requiredFiles = ['search-console-collector.js','search-console-collector.spec.js','.github/workflows/search-console-report.yml'];
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing Search Console file: ${file}`);
}
const collector = fs.readFileSync('search-console-collector.js','utf8');
const workflow = fs.readFileSync('.github/workflows/search-console-report.yml','utf8');
for (const secret of ['SEARCH_CONSOLE_CLIENT_ID','SEARCH_CONSOLE_CLIENT_SECRET','SEARCH_CONSOLE_REFRESH_TOKEN']) {
  if (!workflow.includes(`secrets.${secret}`)) throw new Error(`Workflow missing protected secret: ${secret}`);
  if (collector.includes(`'${secret}':`) || collector.includes(`"${secret}":`)) throw new Error(`Possible embedded secret value for ${secret}`);
}
if (!collector.includes('webmasters/v3')) throw new Error('Collector does not target Search Console API');
if (!collector.includes("dataState: 'final'")) throw new Error('Collector must default to final Search Console data');
if (!workflow.includes('permissions:\n  contents: read')) throw new Error('Workflow permissions must remain read-only');
console.log('Search Console readiness gate OK');
