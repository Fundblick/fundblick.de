'use strict';
const fs=require('fs'),path=require('path');
const {classify,inferFamily}=require('./home-facet-classifier.js');
const dir=process.argv[2]||'catalog';
const manifest=path.join(dir,'manifest.json');
if(!fs.existsSync(manifest))throw new Error(`Missing manifest: ${manifest}`);
function files(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const p=path.join(d,e.name);return e.isDirectory()?files(p):e.isFile()&&e.name.endsWith('.json')&&p!==manifest?[p]:[]})}
function products(v,out=[]){if(Array.isArray(v)){v.forEach(x=>products(x,out));return out}if(v&&typeof v==='object'){if(('name'in v||'title'in v)&&('url'in v||'price'in v||'category'in v)){out.push(v);return out}Object.values(v).forEach(x=>products(x,out))}return out}
const all=[];for(const f of files(dir)){try{products(JSON.parse(fs.readFileSync(f,'utf8')),all)}catch{}}
const uniq=[...new Map(all.map((p,i)=>[String(p.id||p.sku||p.url||`${p.name||p.title}#${i}`),p])).values()].filter(p=>!p.simulated&&!p.isTest&&!p.testData);
const fallback={'home.furniture':'furniture','home.lighting':'lighting','home.decor':'decor','home.living':'living'};
const gaps={type:[],material:[],style:[]},suspicious=[];
const norm=s=>String(s||'').toLowerCase();
for(const p of uniq){const fam=inferFamily(p,fallback[p.category]);const a=classify(p,fam);for(const k of Object.keys(gaps))if(!a[k])gaps[k].push({family:fam,name:p.name||p.title||'',category:p.category||''});const styles=Array.isArray(a.style)?a.style:a.style?[a.style]:[];const text=norm([p.name,p.title,p.description,p.googleProductCategory,p.rawAttributes?.pattern].filter(Boolean).join(' '));for(const style of styles){const direct=style==='Marokkanisch'?/marokkan|maroccan|moroccan/.test(text):style==='Orientalisch'?/oriental|arabisch|arabic/.test(text):style==='Mediterran'?/mediterran|mediterranean/.test(text):style==='Vintage'?/vintage|retro|antik|antique/.test(text):style==='Industrial'?/industrial/.test(text):style==='Modern'?/modern|zeitlos|minimalist/.test(text):true;if(!direct)suspicious.push({style,family:fam,name:p.name||p.title||''});}}
function tokens(rows){const stop=new Set(['und','der','die','das','mit','aus','für','von','ein','eine','im','in','cm','set']);const m={};for(const r of rows){for(const w of norm(r.name).replace(/[^a-zäöüß0-9]+/g,' ').split(/\s+/)){if(w.length<4||stop.has(w))continue;m[w]=(m[w]||0)+1}}return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,30)}
console.log(`PRODUCTS=${uniq.length}`);for(const k of Object.keys(gaps)){console.log(`\nMISSING_${k.toUpperCase()}=${gaps[k].length}`);console.log('TOP_TITLE_TOKENS='+tokens(gaps[k]).map(([w,n])=>`${w}:${n}`).join(', '));console.log('SAMPLES');gaps[k].slice(0,40).forEach(x=>console.log(`${x.family}\t${x.category}\t${x.name}`));}console.log(`\nSUSPICIOUS_STYLE=${suspicious.length}`);suspicious.slice(0,100).forEach(x=>console.log(`${x.style}\t${x.family}\t${x.name}`));
