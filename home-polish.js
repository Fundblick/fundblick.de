'use strict';
(function(root){
  if(!root||!root.document)return;
  const form=document.querySelector('#searchForm');
  const input=document.querySelector('#q');
  const language=document.querySelector('#language');
  const voiceStatus=document.querySelector('#voiceStatus');
  const feedback=document.querySelector('#searchFeedback');
  const feedbackText=document.querySelector('#searchFeedbackText');
  const emptySearch={de:'Bitte gib ein Produkt, eine Marke oder ein Modell ein.',tr:'Lütfen bir ürün, marka veya model girin.',ru:'Введите товар, бренд или модель.',ar:'يرجى إدخال منتج أو علامة تجارية أو موديل.',pl:'Wpisz produkt, markę lub model.',ro:'Introdu un produs, o marcă sau un model.',uk:'Введіть товар, бренд або модель.',en:'Please enter a product, brand or model.',it:'Inserisci un prodotto, un marchio o un modello.',bg:'Въведете продукт, марка или модел.',hr:'Unesite proizvod, marku ili model.',el:'Εισαγάγετε προϊόν, μάρκα ή μοντέλο.',sr:'Унесите производ, бренд или модел.',es:'Introduce un producto, una marca o un modelo.',fr:'Saisissez un produit, une marque ou un modèle.',pt:'Introduza um produto, uma marca ou um modelo.',fa:'لطفاً یک محصول، برند یا مدل وارد کنید.',sq:'Shkruaj një produkt, markë ose model.','zh-Hans':'请输入商品、品牌或型号。',ku:'Ji kerema xwe hilberek, markeyek an modelek binivîse.'};
  const currentLang=()=>language?.value||document.documentElement.lang||'de';
  function text(){return emptySearch[currentLang()]||emptySearch.en;}
  function clearLegacyMessage(){
    if(!voiceStatus)return;
    if(voiceStatus.dataset.emptySearch==='1'||voiceStatus.textContent.trim()===text()){
      voiceStatus.textContent='';
      delete voiceStatus.dataset.emptySearch;
    }
  }
  function showFeedback(){
    if(!input||!form||!feedback||!feedbackText)return;
    clearLegacyMessage();
    input.setAttribute('aria-invalid','true');
    form.classList.add('search-attention');
    feedbackText.textContent=text();
    feedback.hidden=false;
    input.focus({preventScroll:true});
  }
  function clearFeedback(){
    if(!input||!form||!feedback)return;
    form.classList.remove('search-attention');
    input.removeAttribute('aria-invalid');
    feedback.hidden=true;
    clearLegacyMessage();
  }
  if(form&&input){
    form.addEventListener('submit',event=>{
      if(input.value.trim()){clearFeedback();return;}
      event.preventDefault();
      event.stopImmediatePropagation();
      showFeedback();
    },true);
    input.addEventListener('input',()=>{if(input.value.trim())clearFeedback();});
  }
  language?.addEventListener('change',()=>queueMicrotask(()=>{
    clearLegacyMessage();
    if(feedback&&!feedback.hidden&&feedbackText)feedbackText.textContent=text();
  }));
  document.querySelectorAll('.showcase').forEach(section=>section.remove());
  root.FundBlickHomePolish={showFeedback,clearFeedback};
})(typeof window!=='undefined'?window:null);
