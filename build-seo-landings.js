'use strict';
const fs=require('node:fs');
const path=require('node:path');

const catalogRoot=process.argv[2]||path.join('build','catalog');
const outRoot=process.argv[3]||path.join('build','seo');
const manifest=JSON.parse(fs.readFileSync(path.join(catalogRoot,'manifest.json'),'utf8'));
const products=[];
for(const entry of Object.values(manifest.shards||{}))products.push(...JSON.parse(fs.readFileSync(path.join(catalogRoot,entry.file),'utf8')));

const real=products.filter(p=>p&&p.testData===false&&p.active!==false&&Number(p.price)>0&&String(p.name||'').trim());
const groupKey=p=>String(p.productGroupId||p.id||'').trim();
const escape=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

const configs=[
  {slug:'wohnen',kind:'category',value:'home.living',title:'Wohnen & Haushalt',description:'Produkte für Wohnen und Haushalt in den angeschlossenen Händlerdaten von FundBlick durchsuchen.'},
  {slug:'moebel',kind:'category',value:'home.furniture',title:'Möbel',description:'Möbel aus den angeschlossenen Händlerdaten von FundBlick durchsuchen und nach passenden Merkmalen filtern.'},
  {slug:'beleuchtung',kind:'category',value:'home.lighting',title:'Beleuchtung',description:'Lampen und Beleuchtungsprodukte in den angeschlossenen Händlerdaten von FundBlick durchsuchen.'},
  {slug:'dekoration',kind:'category',value:'home.decor',title:'Dekoration',description:'Dekorationsprodukte in den angeschlossenen Händlerdaten von FundBlick durchsuchen.'},
  {slug:'pferd-reitsport',kind:'category',value:'pet.equestrian',title:'Pferd & Reitsport',description:'Produkte rund um Pferd und Reitsport in den angeschlossenen Händlerdaten von FundBlick durchsuchen.'},
  {slug:'pferde-ergaenzungsfutter',kind:'type',value:'Ergänzungsfutter',title:'Pferde-Ergänzungsfutter',description:'Ergänzungsfutter für Pferde in den angeschlossenen Händlerdaten von FundBlick durchsuchen.'}
];

function matches(p,c){return c.kind==='category'?p.category===c.value:String(p?.rawAttributes?.productType||'').trim()===c.value;}
function searchUrl(c){return c.kind==='category'?`/search.html?category=${encodeURIComponent(c.value)}`:`/search.html?q=${encodeURIComponent(c.value)}&category=pet.equestrian`;}
function page(c,items){
  const groups=new Set(items.map(groupKey).filter(Boolean));
  const canonical=`https://fundblick.de/themen/${c.slug}/`;
  const count=items.length;
  const sample=[...new Set(items.map(p=>String(p.name||'').trim()).filter(Boolean))].slice(0,6);
  const sampleHtml=sample.map(name=>`<li>${escape(name)}</li>`).join('');
  return `<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>${escape(c.title)} | FundBlick</title>\n<meta name="description" content="${escape(c.description)}">\n<link rel="canonical" href="${canonical}">\n<meta name="robots" content="index,follow">\n<style>body{font-family:system-ui,-apple-system,sans-serif;margin:0;color:#183025;background:#f7faf5}main{max-width:820px;margin:auto;padding:32px 20px 48px}a{color:#183025}h1{font-size:clamp(2rem,7vw,3.4rem);margin:.3em 0}.card{background:white;border:1px solid #dbe7d8;border-radius:16px;padding:22px;margin:18px 0}.cta{display:inline-block;background:#c9ec92;padding:12px 16px;border-radius:10px;font-weight:800;text-decoration:none}.meta{color:#5d6f63;font-size:.95rem}li{margin:.5em 0}</style>\n</head>\n<body><main>\n<p><a href="/">← FundBlick</a></p>\n<h1>${escape(c.title)}</h1>\n<p>${escape(c.description)}</p>\n<div class="card"><p class="meta">Aktueller Datenbestand: ${count} Produkte aus ${groups.size} Produktgruppen.</p><p><a class="cta" href="${escape(searchUrl(c))}">Produkte in FundBlick ansehen</a></p></div>\n<section class="card"><h2>Beispiele aus dem aktuellen Datenbestand</h2><ul>${sampleHtml}</ul><p class="meta">Produktnamen stammen aus den angebundenen Händlerdaten. Preise und Verfügbarkeit können sich ändern.</p></section>\n</main></body></html>\n`;
}

fs.rmSync(outRoot,{recursive:true,force:true});
fs.mkdirSync(path.join(outRoot,'themen'),{recursive:true});
const urls=[];
for(const c of configs){
  const items=real.filter(p=>matches(p,c));
  const groups=new Set(items.map(groupKey).filter(Boolean));
  const minGroups=c.kind==='category'?10:8;
  if(groups.size<minGroups)throw new Error(`${c.slug}: only ${groups.size} distinct product groups; refusing thin SEO page`);
  const dir=path.join(outRoot,'themen',c.slug);fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'index.html'),page(c,items));
  urls.push(`https://fundblick.de/themen/${c.slug}/`);
  console.log(`SEO landing built: ${c.slug} products=${items.length} groups=${groups.size}`);
}
const all=['https://fundblick.de/',...urls];
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${all.map(url=>`  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(outRoot,'sitemap.xml'),sitemap);
fs.writeFileSync(path.join(outRoot,'landing-manifest.json'),JSON.stringify({version:1,pages:configs.map(c=>({slug:c.slug,kind:c.kind,value:c.value,url:`/themen/${c.slug}/`}))},null,2)+'\n');
console.log(`SEO landing build OK: ${configs.length} pages`);
