'use strict';
const fs=require('fs');
const vm=require('vm');

const expected=['de','tr','ru','ar','pl','ro','uk','en','it','bg','hr','el','sr','es','fr','pt','fa','sq','zh-Hans','ku'];
const required=['search','button','eyebrow','hero','lead','popular','voiceStart','voiceStop','listening','voiceError'];
const i18nSource=fs.readFileSync('development/frontend-preview/i18n.js','utf8');
const context={window:{}};
vm.createContext(context);
vm.runInContext(i18nSource,context,{filename:'i18n.js'});
const locales=context.window.FUNDBLICK_LOCALES;
const copy=context.window.FUNDBLICK_I18N;
if(!locales||!copy)throw new Error('Frontend locale registry missing');
if(JSON.stringify(Object.keys(locales))!==JSON.stringify(expected))throw new Error('Unexpected frontend locale set/order');
if(JSON.stringify(Object.keys(copy))!==JSON.stringify(expected))throw new Error('Unexpected frontend copy locale set/order');
for(const code of expected){
  if(!locales[code]?.name||!locales[code]?.speech||!locales[code]?.dir)throw new Error('Incomplete locale metadata: '+code);
  for(const key of required)if(!copy[code]?.[key])throw new Error(`Missing ${code}.${key}`);
}
if(locales.ar.dir!=='rtl'||locales.fa.dir!=='rtl')throw new Error('RTL locale metadata missing');
if(locales['zh-Hans'].speech!=='zh-CN')throw new Error('Simplified Chinese speech locale mismatch');

const html=fs.readFileSync('development/frontend-preview/index.html','utf8');
for(const code of expected)if(!html.includes(`option value="${code}"`))throw new Error('Language selector missing '+code);
if(!html.includes('id="voiceButton"'))throw new Error('Voice button missing');
if(!html.includes('id="voiceStatus"'))throw new Error('Voice status region missing');
if(!/noindex,nofollow/.test(html))throw new Error('Development preview must remain noindex');

const app=fs.readFileSync('development/frontend-preview/app.js','utf8');
new vm.Script(app,{filename:'app.js'});
for(const marker of ['SpeechRecognition||window.webkitSpeechRecognition','fundblick-language','document.documentElement.dir','URLSearchParams({q,lang})']){
  if(!app.includes(marker))throw new Error('Frontend language runtime marker missing: '+marker);
}
console.log('FundBlick frontend language contract OK',JSON.stringify({locales:expected.length,rtl:['ar','fa'],voice:true}));
