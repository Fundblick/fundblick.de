'use strict';
(function(root){
  if(!root||!root.document)return;
  const select=document.querySelector('#language');
  const container=document.querySelector('.category-links');
  const normalize=value=>String(value||'').trim();
  const labels={
    de:{'home.living':'Wohnen & Haushalt','home.furniture':'Möbel','home.lighting':'Lampen & Beleuchtung','home.decor':'Dekoration','pet.equestrian':'Pferd & Reitsport','pet.dog':'Hund','health.supplements':'Gesundheit & Nahrungsergänzung','home.garden.robot-mowers':'Mähroboter','home.garden.robot-mower-accessories':'Mähroboter-Zubehör'},
    en:{'home.living':'Home & Living','home.furniture':'Furniture','home.lighting':'Lighting','home.decor':'Decoration','pet.equestrian':'Horses & Equestrian','pet.dog':'Dogs','health.supplements':'Health & Supplements','home.garden.robot-mowers':'Robot lawn mowers','home.garden.robot-mower-accessories':'Robot mower accessories'},
    tr:{'home.living':'Ev & Yaşam','home.furniture':'Mobilya','home.lighting':'Aydınlatma','home.decor':'Dekorasyon','pet.equestrian':'At & Binicilik','pet.dog':'Köpek','health.supplements':'Sağlık & Takviyeler','home.garden.robot-mowers':'Robot çim biçme makineleri','home.garden.robot-mower-accessories':'Robot çim biçme makinesi aksesuarları'},
    ru:{'home.living':'Дом и быт','home.furniture':'Мебель','home.lighting':'Освещение','home.decor':'Декор','pet.equestrian':'Лошади и конный спорт','pet.dog':'Собаки','health.supplements':'Здоровье и пищевые добавки','home.garden.robot-mowers':'Роботы-газонокосилки','home.garden.robot-mower-accessories':'Аксессуары для роботов-газонокосилок'},
    ar:{'home.living':'المنزل والمعيشة','home.furniture':'أثاث','home.lighting':'إضاءة','home.decor':'ديكور','pet.equestrian':'الخيل والفروسية','pet.dog':'الكلاب','health.supplements':'الصحة والمكملات','home.garden.robot-mowers':'جزازات العشب الروبوتية','home.garden.robot-mower-accessories':'ملحقات جزازات العشب الروبوتية'},
    pl:{'home.living':'Dom i wnętrze','home.furniture':'Meble','home.lighting':'Oświetlenie','home.decor':'Dekoracje','pet.equestrian':'Konie i jeździectwo','pet.dog':'Psy','health.supplements':'Zdrowie i suplementy','home.garden.robot-mowers':'Roboty koszące','home.garden.robot-mower-accessories':'Akcesoria do robotów koszących'},
    ro:{'home.living':'Casă & Locuință','home.furniture':'Mobilier','home.lighting':'Iluminat','home.decor':'Decorațiuni','pet.equestrian':'Cai & Echitație','pet.dog':'Câini','health.supplements':'Sănătate & Suplimente','home.garden.robot-mowers':'Roboți de tuns iarba','home.garden.robot-mower-accessories':'Accesorii pentru roboți de tuns iarba'},
    uk:{'home.living':'Дім і побут','home.furniture':'Меблі','home.lighting':'Освітлення','home.decor':'Декор','pet.equestrian':'Коні та кінний спорт','pet.dog':'Собаки','health.supplements':'Здоров’я та добавки','home.garden.robot-mowers':'Роботи-газонокосарки','home.garden.robot-mower-accessories':'Аксесуари для роботів-газонокосарок'},
    it:{'home.living':'Casa & Abitare','home.furniture':'Mobili','home.lighting':'Illuminazione','home.decor':'Decorazione','pet.equestrian':'Cavalli & Equitazione','pet.dog':'Cani','health.supplements':'Salute & Integratori','home.garden.robot-mowers':'Robot tagliaerba','home.garden.robot-mower-accessories':'Accessori per robot tagliaerba'},
    fr:{'home.living':'Maison & Habitat','home.furniture':'Meubles','home.lighting':'Éclairage','home.decor':'Décoration','pet.equestrian':'Chevaux & Équitation','pet.dog':'Chiens','health.supplements':'Santé & Compléments','home.garden.robot-mowers':'Robots tondeuses','home.garden.robot-mower-accessories':'Accessoires pour robots tondeuses'},
    es:{'home.living':'Hogar','home.furniture':'Muebles','home.lighting':'Iluminación','home.decor':'Decoración','pet.equestrian':'Caballos & Equitación','pet.dog':'Perros','health.supplements':'Salud & Suplementos','home.garden.robot-mowers':'Robots cortacésped','home.garden.robot-mower-accessories':'Accesorios para robots cortacésped'},
    pt:{'home.living':'Casa','home.furniture':'Móveis','home.lighting':'Iluminação','home.decor':'Decoração','pet.equestrian':'Cavalos & Equitação','pet.dog':'Cães','health.supplements':'Saúde & Suplementos','home.garden.robot-mowers':'Robôs corta-relva','home.garden.robot-mower-accessories':'Acessórios para robôs corta-relva'}
  };
  function lang(){return select?.value||document.documentElement.lang||'de';}
  function label(category){return labels[lang()]?.[category]||labels.en[category]||category;}
  function normalizeManifest(payload){return Array.isArray(payload?.categories)?payload.categories.map(item=>({id:normalize(item?.id),count:Number(item?.count)||0})).filter(item=>item.id&&item.count>0):[];}
  function linkFor(category,count){const a=document.createElement('a');a.dataset.liveCategory='true';a.href='search.html?'+new URLSearchParams({category,lang:lang()}).toString();a.textContent=label(category);a.title=`${count} Produkt${count===1?'':'e'}`;a.dataset.catalogCategory=category;return a;}
  async function apply(){
    if(!container)return;
    try{
      const response=await fetch('catalog/categories.json',{cache:'no-store'});
      if(!response.ok)throw new Error(`Category manifest unavailable (${response.status})`);
      const categories=normalizeManifest(await response.json());
      if(!categories.length)throw new Error('Category manifest is empty');
      container.innerHTML='';
      for(const {id,count} of categories)container.appendChild(linkFor(id,count));
      container.closest('.hero-categories')?.removeAttribute('hidden');
    }catch(error){
      console.warn('FundBlick live categories unavailable',error);
      /* Keep the server-rendered/static fallback links rather than hiding categories. */
    }
  }
  select?.addEventListener('change',()=>queueMicrotask(apply));
  root.FundBlickHomeCategories={apply,label,normalizeManifest};
  apply();
})(typeof window!=='undefined'?window:null);