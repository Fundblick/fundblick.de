const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('preview.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if(!script)throw new Error('preview script missing');
new vm.Script(script);
for(const required of [
  'async function sha256HexText',
  'async function loadShadowSearchRoot',
  'async function shadowPostings',
  'function legacySearchIds',
  'async function shadowSearchIds',
  'async function runShadowSearchComparison'
]) if(!script.includes(required))throw new Error('shadow search function missing: '+required);
if(!script.includes("publicationManifest?.searchRouting"))throw new Error('shadow search is not gated by routing metadata');
if(!script.includes("dataset.shadowSearch=ok?'ok':'mismatch'"))throw new Error('shadow comparison state missing');
if(!script.includes("dataset.shadowSearch='error'"))throw new Error('shadow error state missing');
if(!script.includes('runShadowSearchComparison(searchInput.value)'))throw new Error('search flow does not invoke shadow comparison');
if(!script.includes("r.file!=='search/'+r.sha256.slice(0,12)+'.json'"))throw new Error('search routing manifest validation missing');
console.log('FundBlick browser shadow search contract OK');
