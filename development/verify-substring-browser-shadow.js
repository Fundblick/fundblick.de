const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('preview.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if(!script)throw new Error('preview script missing');
new vm.Script(script);
for(const needle of [
  'function loadSubstringRoot()',
  'function substringQueryTokens(value)',
  'async function substringRouteForGram(root,gram)',
  'async function substringShadowSearchIds(value)',
  'const exactTerms=terms.filter(isExactShadowToken),substringTerms=terms.filter(token=>!isExactShadowToken(token));',
  "document.documentElement.dataset.shadowSearch=ok?'ok':'mismatch'"
]){
  if(!script.includes(needle))throw new Error('substring browser shadow contract missing: '+needle);
}
if(script.includes("if(!supportsExactShadowQuery(value)){document.documentElement.dataset.shadowSearch='unsupported';return;}"))throw new Error('legacy exact-only gate still blocks substring shadow queries');
const pureStart=script.indexOf('function isExactShadowToken');
const pureEnd=script.indexOf('async function substringShadowSearchIds');
if(pureStart<0||pureEnd<=pureStart)throw new Error('pure substring helper block missing');
const pure=script.slice(pureStart,pureEnd)+"\n;globalThis.__t={isExactShadowToken,substringUniqueNgrams,substringQueryTokens,intersectSets};";
const ctx={normalizeSearch:value=>String(value??'').normalize('NFKD').replace(/(\p{Script=Latin})\p{M}+/gu,'$1').toLocaleLowerCase().normalize('NFC').replace(/[^\p{L}\p{M}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ')};
vm.createContext(ctx);vm.runInContext(pure,ctx);
const t=ctx.__t,eq=(a,b,l)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw new Error(l+': '+JSON.stringify(a))};
eq(t.isExactShadowToken('bosch'),true,'Latin exact');
eq(t.isExactShadowToken('телевизор'),true,'Cyrillic exact');
eq(t.isExactShadowToken('智能电视'),false,'CJK substring');
eq(t.isExactShadowToken('รองเท้าวิ่ง'),false,'Thai substring');
eq(t.substringQueryTokens('Bosch 智能电视'),['智能电视'],'mixed query token plan');
eq(t.substringUniqueNgrams('智能电视',2),['智能','能电','电视'],'CJK bigrams');
eq([...t.intersectSets(new Set([1,2,3]),new Set([2,3,4]))],[2,3],'set intersection');
console.log('FundBlick substring browser shadow contract OK');
