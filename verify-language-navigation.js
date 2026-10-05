'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const expected=['de','tr','ru','ar','pl','ro','uk','en','it','bg','hr','el','sr','es','fr','pt','fa','sq','zh-Hans','ku'];
const source=fs.readFileSync('language-links.js','utf8');
const match=source.match(/const supported=\[([^\]]+)\]/);
assert.ok(match,'supported language registry missing');
const actual=[...match[1].matchAll(/'([^']+)'/g)].map(x=>x[1]);
assert.deepEqual(actual,expected,'language navigation must mirror the 20-language live registry');
for(const file of ['search.html','datenschutz.html']){
  const html=fs.readFileSync(file,'utf8');
  assert.ok(html.includes('language-links.js'),`${file} must preserve language across internal navigation`);
}
for(const [file,runtime] of [['impressum.html','legal-i18n.js'],['404.html','error-i18n.js']])assert.ok(fs.readFileSync(file,'utf8').includes(runtime),file+' must load its current language runtime');
assert.ok(source.includes("href.startsWith('mailto:')"),'mailto links must never receive a language parameter');
assert.ok(source.includes("href.startsWith('tel:')"),'telephone links must never receive a language parameter');
assert.ok(source.includes('url.origin===location.origin'),'language propagation must remain same-origin only');
const home=fs.readFileSync('index.html','utf8');
assert.ok(home.includes('home-i18n.js'),'homepage must load its current language runtime');
assert.ok(home.includes('id="searchForm"'),'homepage search form missing');
assert.ok(home.includes('id="q"'),'homepage search input missing');
const vm=require('node:vm');
for(const [file,attribute,key] of [['legal-i18n.js','legalI18n','imprintTitle'],['error-i18n.js','errorI18n','title']]){
  const node={dataset:{[attribute]:key},textContent:''};
  const document={body:{dataset:{legalPage:'impressum'}},documentElement:{},querySelectorAll:()=>[node]};
  vm.runInNewContext(fs.readFileSync(file,'utf8'),{document,localStorage:{getItem:()=> 'ru'},location:{search:'?lang=ru'},URLSearchParams});
  assert.equal(document.documentElement.lang,'ru',file+' honors Russian navigation context');
  assert.match(node.textContent,/[А-Яа-я]/,file+' renders Russian content');
}
for(const lang of expected){
  const hrefs=['/','search.html?q=Bosch#results','impressum.html?lang=de','https://merchant.example/product','mailto:help@example.com','tel:123','#categories'];
  const links=hrefs.map(href=>({href,getAttribute(){return this.href;}}));
  const document={documentElement:{lang:'de',dataset:{}},body:{classList:{contains:()=>false}},head:{appendChild(){}},querySelector:()=>null,querySelectorAll:()=>links,createElement:()=>({setAttribute(){},addEventListener(){}})};
  const location={href:'https://fundblick.de/search.html?lang='+lang,origin:'https://fundblick.de',search:'?lang='+lang};
  const window={};
  vm.runInNewContext(source,{window,document,location,URL,URLSearchParams,Promise,queueMicrotask,localStorage:{getItem:()=>null}});
  for(let i=0;i<3;i++)assert.equal(new URL(links[i].href,location.href).searchParams.get('lang'),lang,'internal navigation retains '+lang);
  assert.equal(new URL(links[1].href,location.href).searchParams.get('q'),'Bosch','search query survives');
  assert.equal(new URL(links[1].href,location.href).hash,'#results','fragment survives');
  assert.deepEqual(links.slice(3).map(link=>link.href),hrefs.slice(3),'external/contact/fragment links are untouched');
  window.FundBlickLanguageLinks.apply(lang);
  assert.equal(new URL(links[0].href,location.href).searchParams.getAll('lang').length,1,'repeat application stays idempotent');
}
console.log('Language navigation: 20 locales retain internal query/fragment and leave external links untouched');
