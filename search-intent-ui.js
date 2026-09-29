'use strict';

(function(){
  const engine=window.FundBlickUniversalSearchIntent;
  const form=document.querySelector('.search-form');
  if(!engine||!form)return;

  const params=new URLSearchParams(location.search);
  const query=String(params.get('rawq')||params.get('q')||'').trim();
  if(!query)return;

  const lang=(document.documentElement.lang||'de').toLowerCase().split('-')[0];
  const copy={
    de:{offers:'Angebote',info:'Erklärung',video:'Videos',local:'In meiner Nähe',assume:q=>`Ich suche zuerst nach Angeboten für „${q}“.`,ask:q=>`Was meinst du mit „${q}“? Ich starte mit Angeboten.`},
    en:{offers:'Offers',info:'Explanation',video:'Videos',local:'Near me',assume:q=>`I’ll start with offers for “${q}”.`,ask:q=>`What do you mean by “${q}”? I’ll start with offers.`},
    ru:{offers:'Предложения',info:'Объяснение',video:'Видео',local:'Рядом со мной',assume:q=>`Сначала ищу предложения по запросу «${q}».`,ask:q=>`Что вы имеете в виду под «${q}»? Начну с предложений.`},
    ro:{offers:'Oferte',info:'Explicație',video:'Video',local:'În apropiere',assume:q=>`Caut mai întâi oferte pentru „${q}”.`,ask:q=>`Ce înseamnă „${q}” pentru tine? Încep cu oferte.`},
    tr:{offers:'Teklifler',info:'Açıklama',video:'Videolar',local:'Yakınımda',assume:q=>`Önce “${q}” için teklifleri arıyorum.`,ask:q=>`“${q}” ile neyi kastediyorsun? Tekliflerle başlıyorum.`}
  }[lang]||null;
  const t=copy||{offers:'Offers',info:'Explanation',video:'Videos',local:'Near me',assume:q=>`I’ll start with offers for “${q}”.`,ask:q=>`What do you mean by “${q}”? I’ll start with offers.`};

  let intent;
  try{intent=engine.analyze(query,lang)}catch{return}
  const explicit=params.get('intentView')||'offers';
  const ambiguous=intent.tokenCount===1&&!intent.exactModel&&!intent.transactional&&query.length<=18;

  const box=document.createElement('section');
  box.className='intent-choice';
  box.setAttribute('aria-label','Search intent');
  const message=document.createElement('p');
  message.className='intent-choice-message';
  message.textContent=ambiguous?t.ask(query):t.assume(query);
  box.appendChild(message);

  const choices=document.createElement('div');
  choices.className='intent-choice-chips';
  const defs=[['offers',t.offers],['info',t.info],['video',t.video],['local',t.local]];
  for(const [value,label] of defs){
    const a=document.createElement('a');
    const next=new URLSearchParams(location.search);
    next.set('intentView',value);
    a.href=`${location.pathname}?${next.toString()}`;
    a.className='intent-choice-chip';
    if(explicit===value){a.classList.add('is-active');a.setAttribute('aria-current','true')}
    a.dataset.intentView=value;
    a.textContent=label;
    choices.appendChild(a);
  }
  box.appendChild(choices);
  form.insertAdjacentElement('afterend',box);
})();
