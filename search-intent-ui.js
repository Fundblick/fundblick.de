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
    de:{offers:'Angebote',info:'Erklärung',video:'Videos',local:'In meiner Nähe',assume:q=>`Ich suche zuerst nach Angeboten für „${q}“.`,ask:q=>`Was meinst du mit „${q}“? Ich starte mit Angeboten.`,where:'Wo soll ich suchen?',place:'Ort oder PLZ',useLocation:'Standort verwenden',radius:'Umkreis',open:'Jetzt geöffnet',stock:'Produkt vor Ort verfügbar',pickup:'Abholung möglich',submit:'Lokale Angebote finden',geoWait:'Standort wird ermittelt …',geoOk:'Standort übernommen',geoFail:'Standort konnte nicht ermittelt werden. Bitte Ort oder PLZ eingeben.'},
    en:{offers:'Offers',info:'Explanation',video:'Videos',local:'Near me',assume:q=>`I’ll start with offers for “${q}”.`,ask:q=>`What do you mean by “${q}”? I’ll start with offers.`,where:'Where should I search?',place:'City or postal code',useLocation:'Use my location',radius:'Radius',open:'Open now',stock:'Product available locally',pickup:'Pickup available',submit:'Find local offers',geoWait:'Getting location …',geoOk:'Location added',geoFail:'Could not get your location. Enter a city or postal code.'},
    ru:{offers:'Предложения',info:'Объяснение',video:'Видео',local:'Рядом со мной',assume:q=>`Сначала ищу предложения по запросу «${q}».`,ask:q=>`Что вы имеете в виду под «${q}»? Начну с предложений.`,where:'Где искать?',place:'Город или индекс',useLocation:'Использовать геопозицию',radius:'Радиус',open:'Открыто сейчас',stock:'Товар есть в магазине',pickup:'Самовывоз',submit:'Найти рядом',geoWait:'Определяю местоположение …',geoOk:'Местоположение добавлено',geoFail:'Не удалось определить местоположение. Укажите город или индекс.'},
    ro:{offers:'Oferte',info:'Explicație',video:'Video',local:'În apropiere',assume:q=>`Caut mai întâi oferte pentru „${q}”.`,ask:q=>`Ce înseamnă „${q}” pentru tine? Încep cu oferte.`,where:'Unde să caut?',place:'Oraș sau cod poștal',useLocation:'Folosește locația mea',radius:'Rază',open:'Deschis acum',stock:'Produs disponibil local',pickup:'Ridicare disponibilă',submit:'Găsește oferte locale',geoWait:'Se determină locația …',geoOk:'Locație adăugată',geoFail:'Locația nu a putut fi determinată. Introdu orașul sau codul poștal.'},
    tr:{offers:'Teklifler',info:'Açıklama',video:'Videolar',local:'Yakınımda',assume:q=>`Önce “${q}” için teklifleri arıyorum.`,ask:q=>`“${q}” ile neyi kastediyorsun? Tekliflerle başlıyorum.`,where:'Nerede arayayım?',place:'Şehir veya posta kodu',useLocation:'Konumumu kullan',radius:'Yarıçap',open:'Şimdi açık',stock:'Ürün mağazada mevcut',pickup:'Teslim alma mevcut',submit:'Yerel teklifleri bul',geoWait:'Konum belirleniyor …',geoOk:'Konum eklendi',geoFail:'Konum belirlenemedi. Şehir veya posta kodu girin.'}
  }[lang]||null;
  const t=copy||{offers:'Offers',info:'Explanation',video:'Videos',local:'Near me',assume:q=>`I’ll start with offers for “${q}”.`,ask:q=>`What do you mean by “${q}”? I’ll start with offers.`,where:'Where should I search?',place:'City or postal code',useLocation:'Use my location',radius:'Radius',open:'Open now',stock:'Product available locally',pickup:'Pickup available',submit:'Find local offers',geoWait:'Getting location …',geoOk:'Location added',geoFail:'Could not get your location. Enter a city or postal code.'};

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
    next.delete('web');
    for(const key of ['localPlace','localRadius','localOpen','localStock','localPickup','localLat','localLon'])next.delete(key);
    a.href=`${location.pathname}?${next.toString()}`;
    a.className='intent-choice-chip';
    if(explicit===value){a.classList.add('is-active');a.setAttribute('aria-current','true')}
    a.dataset.intentView=value;
    a.textContent=label;
    choices.appendChild(a);
  }
  box.appendChild(choices);

  if(explicit==='local'){
    const panel=document.createElement('form');
    panel.className='local-search-panel';
    panel.setAttribute('aria-label',t.local);

    const title=document.createElement('strong');
    title.className='local-search-title';
    title.textContent=t.where;
    panel.appendChild(title);

    const placeRow=document.createElement('div');
    placeRow.className='local-search-place-row';
    const place=document.createElement('input');
    place.type='text';
    place.name='localPlace';
    place.placeholder=t.place;
    place.value=params.get('localPlace')||'';
    place.autocomplete='postal-code';
    placeRow.appendChild(place);

    const geo=document.createElement('button');
    geo.type='button';
    geo.className='local-location-button';
    geo.textContent=t.useLocation;
    placeRow.appendChild(geo);
    panel.appendChild(placeRow);

    const geoStatus=document.createElement('small');
    geoStatus.className='local-search-status';
    panel.appendChild(geoStatus);

    const radiusWrap=document.createElement('label');
    radiusWrap.className='local-search-radius';
    radiusWrap.textContent=`${t.radius}: `;
    const radius=document.createElement('select');
    radius.name='localRadius';
    for(const km of [5,10,25,50,100]){
      const opt=document.createElement('option');
      opt.value=String(km); opt.textContent=`${km} km`;
      if((params.get('localRadius')||'25')===String(km))opt.selected=true;
      radius.appendChild(opt);
    }
    radiusWrap.appendChild(radius);
    panel.appendChild(radiusWrap);

    const flags=document.createElement('div');
    flags.className='local-search-flags';
    const addFlag=(name,label)=>{
      const l=document.createElement('label');
      const cb=document.createElement('input');
      cb.type='checkbox'; cb.name=name; cb.checked=params.get(name)==='1';
      l.append(cb,document.createTextNode(` ${label}`));
      flags.appendChild(l);
    };
    addFlag('localOpen',t.open);
    addFlag('localStock',t.stock);
    addFlag('localPickup',t.pickup);
    panel.appendChild(flags);

    const submit=document.createElement('button');
    submit.type='submit';
    submit.className='local-search-submit';
    submit.textContent=t.submit;
    panel.appendChild(submit);

    let lat=params.get('localLat')||'';
    let lon=params.get('localLon')||'';

    geo.addEventListener('click',()=>{
      if(!navigator.geolocation){geoStatus.textContent=t.geoFail;return}
      geo.disabled=true; geoStatus.textContent=t.geoWait;
      navigator.geolocation.getCurrentPosition(pos=>{
        lat=String(pos.coords.latitude.toFixed(5));
        lon=String(pos.coords.longitude.toFixed(5));
        place.value=t.useLocation;
        geoStatus.textContent=t.geoOk;
        geo.disabled=false;
      },()=>{geoStatus.textContent=t.geoFail;geo.disabled=false},{enableHighAccuracy:false,timeout:8000,maximumAge:300000});
    });

    panel.addEventListener('submit',ev=>{
      ev.preventDefault();
      const next=new URLSearchParams(location.search);
      next.set('intentView','local');
      next.set('web','1');
      const placeValue=place.value.trim();
      if(placeValue&&placeValue!==t.useLocation)next.set('localPlace',placeValue);else next.delete('localPlace');
      next.set('localRadius',radius.value);
      for(const name of ['localOpen','localStock','localPickup']){
        const cb=panel.elements.namedItem(name);
        if(cb&&cb.checked)next.set(name,'1');else next.delete(name);
      }
      if(lat&&lon){next.set('localLat',lat);next.set('localLon',lon)}else{next.delete('localLat');next.delete('localLon')}
      location.href=`${location.pathname}?${next.toString()}`;
    });

    box.appendChild(panel);
  }

  form.insertAdjacentElement('afterend',box);
})();
