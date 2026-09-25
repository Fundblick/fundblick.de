'use strict';
(function(){
  const supported=['de','tr','ru','ar','pl','ro','uk','en','it','bg','hr','el','sr','es','fr','pt','fa','sq','zh-Hans','ku'];
  function normalize(value){const raw=String(value||'').trim().replace(/_/g,'-');if(!raw)return null;if(supported.includes(raw))return raw;const lower=raw.toLowerCase();if(lower==='zh'||lower.startsWith('zh-cn')||lower.startsWith('zh-sg')||lower.startsWith('zh-hans'))return 'zh-Hans';const base=lower.split('-')[0];return supported.find(x=>x.toLowerCase()===base)||null;}
  function current(){const params=new URLSearchParams(location.search),select=document.querySelector('#language');let saved=null;try{saved=localStorage.getItem('fundblick-language')}catch{}return normalize(params.get('lang'))||normalize(window.FundBlickLanguage?.lang)||normalize(select?.value)||normalize(saved)||normalize(document.documentElement.lang)||'de';}
  function eligible(anchor){const href=anchor.getAttribute('href');if(!href||href.startsWith('#')||href.startsWith('mailto:')||href.startsWith('tel:')||href.startsWith('javascript:'))return false;try{const url=new URL(href,location.href);return url.origin===location.origin}catch{return false}}
  function apply(lang=current()){
    document.querySelectorAll('a[href]').forEach(anchor=>{if(!eligible(anchor))return;const url=new URL(anchor.getAttribute('href'),location.href);url.searchParams.set('lang',lang);anchor.href=url.pathname+url.search+url.hash;});
    document.documentElement.dataset.navigationLanguage=lang;
  }
  const select=document.querySelector('#language');if(select)select.addEventListener('change',()=>queueMicrotask(()=>apply(normalize(select.value)||'de')));
  apply();
  window.FundBlickLanguageLinks={apply,current};
})();
