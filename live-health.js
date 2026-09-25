'use strict';
(function(){
  const checks=[];
  function record(name,ok,detail=''){checks.push({name,ok:Boolean(ok),detail:String(detail||'')});}
  function run(){
    record('language-api',Boolean(window.FundBlickLanguage),'search-i18n loaded');
    record('category-schema',Boolean(window.FB_CATEGORY_SCHEMAS&&Object.keys(window.FB_CATEGORY_SCHEMAS).length),'facet schemas loaded');
    record('common-facets',Array.isArray(window.FB_COMMON_FACETS),'common facets loaded');
    record('intent-parser',typeof window.FB_parseSearchIntent==='function','intent parser loaded');
    record('search-input',Boolean(document.querySelector('#query')),'search input present');
    record('filters-root',Boolean(document.querySelector('#filters')),'filter root present');
    record('cards-root',Boolean(document.querySelector('#cards')),'cards root present');
    window.FundBlickHealth={ok:checks.every(x=>x.ok),checks,checkedAt:new Date().toISOString()};
    document.documentElement.dataset.searchHealth=window.FundBlickHealth.ok?'ok':'degraded';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
