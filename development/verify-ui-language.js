const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('preview.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if(!script)throw new Error('preview script missing');
const stateStart=script.indexOf("let uiLanguage='de';");
const start=script.indexOf("const UI_LANGUAGES=");
const end=script.indexOf("const HANDOFF_VOCAB=");
if(stateStart<0||start<0||end<0||end<=start)throw new Error('UI language block missing');
const source="let uiLanguage='de';\nfunction handoffLanguage(value){const tag=String(value||'').trim().toLowerCase().replace(/_/g,'-');const primary=tag.split('-')[0];return /^[a-z]{2,3}$/.test(primary)?primary:null;}\n"+script.slice(start,end)+"\n;globalThis.__ui={UI_LANGUAGES,UI_TEXT,supportedUiLanguage,uiText};";
const ctx={Intl};vm.createContext(ctx);vm.runInContext(source,ctx);
const u=ctx.__ui;
if(JSON.stringify(u.UI_LANGUAGES)!==JSON.stringify(['de','en','ru','ro']))throw new Error('Unexpected UI language set');
for(const language of u.UI_LANGUAGES){
  for(const key of ['search','deliveryEligible','deliveryUnknown','deliveryUnsupported','details','handoffOffer','merchantLanguage']){
    if(!u.UI_TEXT[language]?.[key])throw new Error('Missing UI text '+language+' '+key);
  }
}
if(u.supportedUiLanguage('ru-RU')!=='ru')throw new Error('RU language normalization failed');
if(u.supportedUiLanguage('fr')!=='de')throw new Error('Unsupported language fallback failed');
if(u.uiText('search','ro')!=='Caută')throw new Error('Romanian UI text failed');
if(!html.includes('id="ui-language"'))throw new Error('UI language selector missing');
if(!script.includes("params.set('lang',uiLanguage)"))throw new Error('UI language URL state missing');
if(!script.includes('function currentUiLanguage(){return uiLanguage}'))throw new Error('Merchant handoff is not bound to explicit UI language state');
console.log('FundBlick UI language contract OK');
