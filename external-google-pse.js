'use strict';
(function(){
  const params=new URLSearchParams(location.search);
  const cfg=window.FundBlickExternalWebFallbackConfig||{};
  const containerId='external-web-fallback';
  const root=document.getElementById(containerId);
  const query=document.getElementById('query');
  if(!root||!query)return;

  const mock=params.get('externalGoogleMock')==='1';
  const enabled=(cfg.enabled===true||mock)&&cfg.provider==='google-programmable-search-element';
  const cx=mock?'dev-test-cx':String(cfg.cx||'').trim();
  if(!enabled||!cx)return;

  let loaded=false;
  let loading=null;
  let rendered=false;

  function hide(){
    root.hidden=true;
    root.innerHTML='';
    rendered=false;
  }

  function loadGoogle(){
    if(loaded&&window.google?.search?.cse?.element)return Promise.resolve();
    if(loading)return loading;
    loading=new Promise((resolve,reject)=>{
      const existing=document.querySelector('script[data-fundblick-google-pse="1"]');
      if(existing){existing.addEventListener('load',()=>{loaded=true;resolve()},{once:true});existing.addEventListener('error',reject,{once:true});return}
      window.__gcse=window.__gcse||{};
      window.__gcse.parsetags='explicit';
      const script=document.createElement('script');
      script.async=true;
      script.src=`https://cse.google.com/cse.js?cx=${encodeURIComponent(cx)}`;
      script.dataset.fundblickGooglePse='1';
      script.referrerPolicy='no-referrer-when-downgrade';
      script.onload=()=>{loaded=true;resolve()};
      script.onerror=()=>reject(new Error('google-pse-load-failed'));
      document.head.appendChild(script);
    }).finally(()=>{loading=null});
    return loading;
  }

  async function renderWebFallback(searchQuery){
    const q=String(searchQuery||'').trim();
    if(!q){hide();return}
    try{
      await loadGoogle();
      const api=window.google?.search?.cse?.element;
      if(!api||typeof api.render!=='function')throw new Error('google-pse-api-unavailable');
      root.hidden=false;
      root.innerHTML='<div class="external-web-fallback-heading"><p class="eyebrow">WEB-SUCHE</p><h2>Weitere Webergebnisse</h2><p>Diese Ergebnisse werden von Google bereitgestellt und können Werbung enthalten.</p></div><div id="external-google-pse-results"></div>';
      api.render({div:'external-google-pse-results',tag:'searchresults-only',gname:'fundblick-web-fallback',attributes:{queryParameterName:'q'}});
      const element=api.getElement?.('fundblick-web-fallback');
      if(element&&typeof element.execute==='function')element.execute(q);
      rendered=true;
      try{window.dispatchEvent(new CustomEvent('fundblick:external-web-fallback',{detail:{provider:'google-programmable-search-element',status:'rendered',queryLength:q.length}}))}catch{}
    }catch(error){
      hide();
      console.warn('FundBlick web fallback failed:',error);
      try{window.dispatchEvent(new CustomEvent('fundblick:external-web-fallback',{detail:{provider:'google-programmable-search-element',status:'error',queryLength:q.length}}))}catch{}
    }
  }

  window.addEventListener('fundblick:external-search',event=>{
    const d=event.detail||{};
    if(d.reason!=='below-threshold'||d.externalCount>0){if(rendered)hide();return}
    renderWebFallback(query.value);
  });
})();
