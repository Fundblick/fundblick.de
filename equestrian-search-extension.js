'use strict';
(function(root){
  if(!root)return;
  const schema=root.FB_CATEGORY_SCHEMAS?.equestrian;
  if(schema){
    const extraTerms=['pferdegesundheit','pferdefutter','pferdepflege','horse','horses','horse supplement','лошадь','лошади','лошадей','конь','кони','конный спорт'];
    schema.terms=[...new Set([...(schema.terms||[]),...extraTerms])];
    const lang=root.FundBlickLanguage?.lang||document.documentElement.lang||'de';
    const labels={de:'Pferd & Reitsport',en:'Horse & equestrian',ru:'Лошади и конный спорт'};
    if(labels[lang])schema.label=labels[lang];
  }

  const base=root.FBHomeFacetClassifier;
  if(!base||base.__equestrianExtended)return;
  const originalInfer=base.inferFamily.bind(base);
  const originalClassify=base.classify.bind(base);
  const equestrianCategory=value=>String(value||'').toLowerCase()==='pet.equestrian';
  const equestrianText=product=>[product?.name,product?.title,product?.description,product?.category,product?.googleProductCategory].filter(Boolean).join(' ');
  const typeFor=product=>{
    const text=equestrianText(product);
    if(/\bbundle\b/i.test(text))return 'Bundle';
    if(/ice\s*clay|pflege|care\b/i.test(text)&&!/supplement|zusatzfutter|ergänzungsfutter/i.test(text))return 'Pferdepflege';
    return 'Ergänzungsfutter';
  };
  base.inferFamily=function(product,fallback){
    if(equestrianCategory(product?.category))return 'equestrian';
    return originalInfer(product,fallback);
  };
  base.classify=function(product,family){
    const effective=equestrianCategory(product?.category)||family==='equestrian'?'equestrian':base.inferFamily(product,family);
    if(effective==='equestrian')return {type:typeFor(product)};
    return originalClassify(product,family);
  };
  base.__equestrianExtended=true;
})(typeof window!=='undefined'?window:globalThis);
