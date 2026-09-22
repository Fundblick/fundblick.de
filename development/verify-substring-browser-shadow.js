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
const crypto=require('crypto'),path=require('path');
const catalog=path.join(__dirname,'catalog');
const manifest=JSON.parse(fs.readFileSync(path.join(catalog,'manifest.json'),'utf8'));
const index=JSON.parse(fs.readFileSync(path.join(catalog,manifest.searchFile),'utf8'));
if(manifest.itemCount<7)throw new Error('non-trivial substring fixture missing');
const root=JSON.parse(fs.readFileSync(path.join(catalog,manifest.substringRouting.file),'utf8'));
if(!root.d.some(Boolean))throw new Error('substring routing has no populated directories');
const readSha=sha=>JSON.parse(fs.readFileSync(path.join(catalog,'substring',sha.slice(0,12)+'.json'),'utf8'));
const hash=value=>crypto.createHash('sha256').update(String(value)).digest('hex');
const bucket=(gram,count)=>parseInt(hash(gram).slice(0,8),16)%count;
const grams=token=>{const chars=[...token],size=chars.length>=4?4:chars.length>=2?2:1;return [...new Set(Array.from({length:Math.max(1,chars.length-size+1)},(_,i)=>chars.slice(i,i+size).join('')))];};
const postings=route=>{
  if(Array.isArray(route.entry.r))return new Set(route.entry.r);
  const values=[];for(const sha of route.entry.p){const page=readSha(sha);if(page.g!==route.gram)throw new Error('posting gram mismatch');values.push(...page.v)}return new Set(values);
};
const route=gram=>{const sha=root.d[bucket(gram,root.b)];if(!sha)return null;const entry=readSha(sha)[gram];return entry?{gram,entry,count:Array.isArray(entry.r)?entry.r.length:entry.n}:null};
const resolve=query=>{
  const tokens=t.substringQueryTokens(query);let candidates=null;
  for(const token of tokens){
    const routes=grams(token).map(route).filter(Boolean).sort((a,b)=>a.count-b.count||a.gram.localeCompare(b.gram));
    if(!routes.length)return [];
    let set=postings(routes[0]);if(set.size>64&&routes[1])set=t.intersectSets(set,postings(routes[1]));
    candidates=t.intersectSets(candidates,set);
  }
  const verification=readSha(root.c),ids=[];
  for(const ordinal of [...(candidates||[])].sort((a,b)=>a-b)){
    const pageSha=verification.p[Math.floor(ordinal/root.s)],page=pageSha?readSha(pageSha):null,item=page?.[ordinal%root.s];
    if(item&&tokens.every(q=>item.t.some(p=>String(p).includes(q))))ids.push(item.i);
  }
  return ids.sort();
};
for(const [query,name] of [['智能电视','智能电视型号龙一'],['ランニングシューズ','ランニングシューズモデル桜'],['รองเท้าวิ่ง','รองเท้าวิ่งรุ่นสายฟ้า']]){
  const expected=index.find(item=>item.n===name)?.i;if(!expected)throw new Error('fixture missing: '+name);
  eq(resolve(query),[expected],'published substring parity '+query);
}
console.log('FundBlick published substring parity OK');

