'use strict';
(function(){
  const language=window.FundBlickLanguage?.lang||document.documentElement.lang||'de';

  // Stable FundBlick taxonomy IDs. Merchant/source values are aliases only;
  // filtering continues to use the untouched source value from the checkbox/input.
  const aliases={
    Hocker:'stool_low',
    Mosaiktisch:'mosaic_table',
    Beistelltisch:'side_table',
    Bistrotisch:'bistro_table',
    Couchtisch:'coffee_table',
    'Esstisch / Gartentisch':'dining_garden_table',
    Stuhl:'chair',
    Bank:'bench',
    'Sessel / Sofa':'armchair_sofa',
    'Kommode / Schrank':'dresser_cabinet',
    Regal:'shelf',
    Holz:'wood',
    Metall:'metal',
    Mosaik:'mosaic',
    Keramik:'ceramic',
    Rattan:'rattan',
    Textil:'textile',
    Leder:'leather',
    Orientalisch:'oriental',
    Mediterran:'mediterranean',
    Marokkanisch:'moroccan',
    Wanddekoration:'wall_decoration',
    'Haken / Hakenleiste':'hooks_hook_rail',
    Laterne:'lantern',
    'Hänge- / Pendelleuchte':'hanging_pendant_light',
    Teelichthalter:'tealight_holder'
  };

  // Add languages here without touching merchant data, filter values or URLs.
  const labels={
    ru:{
      stool_low:'Пуф / табурет',
      mosaic_table:'Мозаичный стол',
      side_table:'Приставной столик',
      bistro_table:'Стол для бистро',
      coffee_table:'Журнальный столик',
      dining_garden_table:'Обеденный / садовый стол',
      chair:'Стул',
      bench:'Скамья',
      armchair_sofa:'Кресло / диван',
      dresser_cabinet:'Комод / шкаф',
      shelf:'Стеллаж',
      wood:'Дерево',
      metal:'Металл',
      mosaic:'Мозаика',
      ceramic:'Керамика',
      rattan:'Ротанг',
      textile:'Текстиль',
      leather:'Кожа',
      oriental:'Восточный стиль',
      mediterranean:'Средиземноморский стиль',
      moroccan:'Марокканский стиль',
      wall_decoration:'Настенный декор',
      hooks_hook_rail:'Крючки / планка с крючками',
      lantern:'Фонарь',
      hanging_pendant_light:'Подвесной светильник',
      tealight_holder:'Подсвечник для чайной свечи'
    }
  };

  const dictionary=labels[language]||{};
  if(!Object.keys(dictionary).length)return;

  const translate=raw=>{
    const id=aliases[String(raw||'').trim()];
    return id&&dictionary[id]||raw;
  };

  function translateCheckboxLabels(){
    document.querySelectorAll('#filters label').forEach(label=>{
      const input=label.querySelector('input[type="checkbox"]');
      if(!input||input.dataset.key==='brand')return;
      const translated=translate(input.value);
      if(translated===input.value)return;
      const text=[...label.childNodes].find(node=>node.nodeType===3&&node.textContent.trim());
      if(text&&text.textContent.trim()!==translated)text.textContent=' '+translated+' ';
    });
  }

  function translateChips(){
    document.querySelectorAll('#chips button[data-remove]').forEach(button=>{
      const raw=button.dataset.remove||'';
      const pos=raw.indexOf(':');
      if(pos<0)return;
      const key=raw.slice(0,pos),value=raw.slice(pos+1);
      if(key==='brand')return;
      const translated=translate(value);
      if(translated!==value&&button.textContent!==translated+' ×')button.textContent=translated+' ×';
    });
  }

  function translateProductTags(){
    document.querySelectorAll('.product .tags span').forEach(span=>{
      const original=span.textContent.trim();
      const translated=translate(original);
      if(translated!==original)span.textContent=translated;
    });
  }

  let busy=false;
  function apply(){
    if(busy)return;
    busy=true;
    translateCheckboxLabels();
    translateChips();
    translateProductTags();
    busy=false;
  }

  const targets=['filters','chips','cards'].map(id=>document.getElementById(id)).filter(Boolean);
  const observer=new MutationObserver(()=>queueMicrotask(apply));
  targets.forEach(target=>observer.observe(target,{childList:true,subtree:true,characterData:true}));
  apply();

  window.FundBlickTaxonomyI18n={translate,aliases,labels};
})();