'use strict';
(function(root){
  if(!root||!root.document)return;
  const PLACEHOLDER_SVG='<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><rect x="7" y="10" width="34" height="28" rx="4" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="18" cy="20" r="4" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M10 34l9-8 7 6 5-5 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function placeholder(){const box=document.createElement('div');box.className='no-image no-image-placeholder';box.setAttribute('aria-hidden','true');box.innerHTML=PLACEHOLDER_SVG;return box;}
  function cleanExisting(rootNode=document){rootNode.querySelectorAll('.product .no-image').forEach(box=>{if(box.classList.contains('no-image-placeholder'))return;box.classList.add('no-image-placeholder');box.setAttribute('aria-hidden','true');box.innerHTML=PLACEHOLDER_SVG;});}
  function attachFailures(rootNode=document){rootNode.querySelectorAll('.product img:not([data-image-fallback-ready])').forEach(img=>{img.dataset.imageFallbackReady='1';img.addEventListener('error',()=>{const box=placeholder();img.replaceWith(box);},{once:true});});}
  function apply(){cleanExisting();attachFailures();}
  const cards=document.getElementById('cards');if(cards)new MutationObserver(()=>queueMicrotask(apply)).observe(cards,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  root.FundBlickImageFallback={apply};
})(typeof window!=='undefined'?window:null);
