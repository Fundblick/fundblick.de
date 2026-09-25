'use strict';
(function(){
  const input=document.querySelector('#q');
  const box=document.querySelector('#suggestions');
  const form=document.querySelector('#searchForm');
  const languageSelect=document.querySelector('#language');
  const voiceButton=document.querySelector('#voiceButton');
  const voiceStatus=document.querySelector('#voiceStatus');
  const submitButton=form?.querySelector('button[type="submit"]');
  const proofLink=document.querySelector('.proof-link');
  const i18n=window.FUNDBLICK_I18N||{};
  const locales=window.FUNDBLICK_LOCALES||{};
  const supported=Object.keys(locales);
  const samples={
    de:[{q:'Bluetooth Kopfhörer',m:'Kategorie · Audio'},{q:'Bluetooth Kopfhörer Over-Ear',m:'Suche · Merkmal Over-Ear'},{q:'Sony WH-CH720N',m:'Produkt · Händlerangebote'},{q:'Kaffeemaschine mit Timer',m:'Suche · Timer'}],
    tr:[{q:'Bluetooth kulaklık',m:'Kategori · Ses'},{q:'kablosuz kulaklık',m:'Arama'},{q:'Sony WH-CH720N',m:'Ürün · mağaza teklifleri'},{q:'zaman ayarlı kahve makinesi',m:'Arama · zamanlayıcı'}],
    ru:[{q:'Bluetooth наушники',m:'Категория · Аудио'},{q:'беспроводные наушники',m:'Поиск'},{q:'Sony WH-CH720N',m:'Товар · предложения магазинов'},{q:'кофемашина с таймером',m:'Поиск · таймер'}],
    ar:[{q:'سماعات Bluetooth',m:'فئة · صوت'},{q:'سماعات لاسلكية',m:'بحث'},{q:'Sony WH-CH720N',m:'منتج · عروض متاجر'},{q:'ماكينة قهوة بمؤقت',m:'بحث · مؤقت'}],
    pl:[{q:'słuchawki Bluetooth',m:'Kategoria · Audio'},{q:'słuchawki bezprzewodowe',m:'Wyszukiwanie'},{q:'Sony WH-CH720N',m:'Produkt · oferty sklepów'},{q:'ekspres do kawy z timerem',m:'Wyszukiwanie · timer'}],
    ro:[{q:'căști Bluetooth',m:'Categorie · Audio'},{q:'căști fără fir',m:'Căutare'},{q:'Sony WH-CH720N',m:'Produs · oferte comercianți'},{q:'aparat de cafea cu temporizator',m:'Căutare · temporizator'}],
    uk:[{q:'Bluetooth навушники',m:'Категорія · Аудіо'},{q:'бездротові навушники',m:'Пошук'},{q:'Sony WH-CH720N',m:'Товар · пропозиції магазинів'},{q:'кавоварка з таймером',m:'Пошук · таймер'}],
    en:[{q:'Bluetooth headphones',m:'Category · Audio'},{q:'wireless over-ear headphones',m:'Search · Over-Ear'},{q:'Sony WH-CH720N',m:'Product · merchant offers'},{q:'coffee machine with timer',m:'Search · Timer'}],
    it:[{q:'cuffie Bluetooth',m:'Categoria · Audio'},{q:'cuffie senza fili',m:'Ricerca'},{q:'Sony WH-CH720N',m:'Prodotto · offerte rivenditori'},{q:'macchina da caffè con timer',m:'Ricerca · timer'}],
    bg:[{q:'Bluetooth слушалки',m:'Категория · Аудио'},{q:'безжични слушалки',m:'Търсене'},{q:'Sony WH-CH720N',m:'Продукт · оферти'},{q:'кафемашина с таймер',m:'Търсене · таймер'}],
    hr:[{q:'Bluetooth slušalice',m:'Kategorija · Audio'},{q:'bežične slušalice',m:'Pretraga'},{q:'Sony WH-CH720N',m:'Proizvod · ponude trgovaca'},{q:'aparat za kavu s timerom',m:'Pretraga · timer'}],
    el:[{q:'ακουστικά Bluetooth',m:'Κατηγορία · Ήχος'},{q:'ασύρματα ακουστικά',m:'Αναζήτηση'},{q:'Sony WH-CH720N',m:'Προϊόν · προσφορές'},{q:'καφετιέρα με χρονοδιακόπτη',m:'Αναζήτηση · χρονοδιακόπτης'}],
    sr:[{q:'Bluetooth slušalice',m:'Категорија · Аудио'},{q:'bežične slušalice',m:'Претрага'},{q:'Sony WH-CH720N',m:'Производ · понуде'},{q:'aparat za kafu sa tajmerom',m:'Претрага · тајмер'}],
    es:[{q:'auriculares Bluetooth',m:'Categoría · Audio'},{q:'auriculares inalámbricos',m:'Búsqueda'},{q:'Sony WH-CH720N',m:'Producto · ofertas'},{q:'cafetera con temporizador',m:'Búsqueda · temporizador'}],
    fr:[{q:'casque Bluetooth',m:'Catégorie · Audio'},{q:'casque sans fil',m:'Recherche'},{q:'Sony WH-CH720N',m:'Produit · offres'},{q:'machine à café avec minuterie',m:'Recherche · minuterie'}],
    pt:[{q:'auscultadores Bluetooth',m:'Categoria · Áudio'},{q:'auscultadores sem fios',m:'Pesquisa'},{q:'Sony WH-CH720N',m:'Produto · ofertas'},{q:'máquina de café com temporizador',m:'Pesquisa · temporizador'}],
    fa:[{q:'هدفون Bluetooth',m:'دسته · صدا'},{q:'هدفون بی‌سیم',m:'جستجو'},{q:'Sony WH-CH720N',m:'محصول · پیشنهادها'},{q:'دستگاه قهوه با تایمر',m:'جستجو · تایمر'}],
    sq:[{q:'kufje Bluetooth',m:'Kategori · Audio'},{q:'kufje pa tela',m:'Kërkim'},{q:'Sony WH-CH720N',m:'Produkt · oferta'},{q:'aparat kafeje me kohëmatës',m:'Kërkim · kohëmatës'}],
    'zh-Hans':[{q:'蓝牙耳机',m:'分类 · 音频'},{q:'无线耳机',m:'搜索'},{q:'Sony WH-CH720N',m:'商品 · 商家报价'},{q:'带定时器的咖啡机',m:'搜索 · 定时器'}],
    ku:[{q:'guhêdarên Bluetooth',m:'Beş · Deng'},{q:'guhêdarên bê têl',m:'Lêgerîn'},{q:'Sony WH-CH720N',m:'Hilber · pêşniyar'},{q:'makîneya qehweyê bi demjimêr',m:'Lêgerîn · demjimêr'}]
  };
  const emptySearch={de:'Bitte gib ein Produkt, eine Marke oder ein Modell ein.',tr:'Lütfen bir ürün, marka veya model girin.',ru:'Введите товар, бренд или модель.',ar:'يرجى إدخال منتج أو علامة تجارية أو موديل.',pl:'Wpisz produkt, markę lub model.',ro:'Introdu un produs, o marcă sau un model.',uk:'Введіть товар, бренд або модель.',en:'Please enter a product, brand or model.',it:'Inserisci un prodotto, un marchio o un modello.',bg:'Въведете продукт, марка или модел.',hr:'Unesite proizvod, marku ili model.',el:'Εισαγάγετε προϊόν, μάρκα ή μοντέλο.',sr:'Унесите производ, бренд или модел.',es:'Introduce un producto, una marca o un modelo.',fr:'Saisissez un produit, une marque ou un modèle.',pt:'Introduza um produto, uma marca ou um modelo.',fa:'لطفاً یک محصول، برند یا مدل وارد کنید.',sq:'Shkruaj një produkt, markë ose model.','zh-Hans':'请输入商品、品牌或型号。',ku:'Ji kerema xwe hilberek, markeyek an modelek binivîse.'};
  let lang='de',hits=[],active=-1,recognition=null,listening=false;

  function normalizeLanguage(value){const raw=String(value||'').trim().replace(/_/g,'-');if(!raw)return null;if(locales[raw])return raw;const lower=raw.toLowerCase();if(lower==='zh'||lower.startsWith('zh-cn')||lower.startsWith('zh-sg')||lower.startsWith('zh-hans'))return 'zh-Hans';const base=lower.split('-')[0];return supported.find(code=>code.toLowerCase()===base)||null;}
  function initialLanguage(){const fromUrl=normalizeLanguage(new URLSearchParams(location.search).get('lang'));if(fromUrl)return fromUrl;try{const saved=normalizeLanguage(localStorage.getItem('fundblick-language'));if(saved)return saved}catch{}for(const candidate of navigator.languages||[navigator.language]){const match=normalizeLanguage(candidate);if(match)return match}return 'de';}
  function t(){return i18n[lang]||i18n.de||{}}
  function norm(s){return String(s||'').normalize('NFKD').toLocaleLowerCase(lang==='zh-Hans'?'zh-CN':lang).replace(/[\u0300-\u036f]/g,'').trim()}
  function close(){if(!box||!input)return;box.hidden=true;input.setAttribute('aria-expanded','false');input.setAttribute('aria-activedescendant','');active=-1}
  function setActive(n){if(!hits.length)return;active=(n+hits.length)%hits.length;box.querySelectorAll('[role="option"]').forEach((b,i)=>{const on=i===active;b.setAttribute('aria-selected',String(on));if(on){input.setAttribute('aria-activedescendant',b.id);b.scrollIntoView({block:'nearest'})}})}
  function clearEmptySearch(){if(!input||!voiceStatus)return;input.removeAttribute('aria-invalid');if(voiceStatus.dataset.emptySearch==='1'){voiceStatus.textContent='';delete voiceStatus.dataset.emptySearch}}
  function showEmptySearch(){if(!input)return;input.setAttribute('aria-invalid','true');input.focus();if(voiceStatus){voiceStatus.textContent=emptySearch[lang]||emptySearch.en;voiceStatus.dataset.emptySearch='1'}}
  function choose(i){if(i<0||i>=hits.length)return;input.value=hits[i].q;clearEmptySearch();close();input.focus()}
  function render(){if(!input||!box)return;const q=norm(input.value);hits=q?(samples[lang]||samples.de).filter(x=>norm(x.q).includes(q)).slice(0,6):[];box.innerHTML='';active=-1;box.hidden=!hits.length;input.setAttribute('aria-expanded',String(Boolean(hits.length)));input.setAttribute('aria-activedescendant','');hits.forEach((item,i)=>{const b=document.createElement('button');b.type='button';b.role='option';b.id='suggestion-'+i;b.setAttribute('aria-selected','false');const text=document.createElement('span');text.textContent=item.q;const meta=document.createElement('small');meta.textContent=item.m;meta.style.marginLeft='auto';meta.style.color='#66756c';b.append(text,meta);b.addEventListener('pointerdown',e=>e.preventDefault());b.addEventListener('click',()=>choose(i));box.appendChild(b)});}
  function updateQuickExamples(){const buttons=[...document.querySelectorAll('.quick button')];const rows=samples[lang]||samples.de;buttons.forEach((button,index)=>{if(rows[index])button.textContent=rows[index].q});}
  function updateVoiceButton(){if(!voiceButton)return;const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;voiceButton.hidden=!SpeechRecognition;const text=t();voiceButton.setAttribute('aria-label',listening?text.voiceStop:text.voiceStart);voiceButton.title=listening?text.voiceStop:text.voiceStart;voiceButton.setAttribute('aria-pressed',String(listening));}
  function applyLanguage(next,{persist=true}={}){const normalized=normalizeLanguage(next)||'de';lang=normalized;const config=locales[lang]||locales.de;const text=t();document.documentElement.lang=lang;document.documentElement.dir=config.dir||'ltr';if(languageSelect)languageSelect.value=lang;if(input)input.placeholder=text.search||i18n.de.search;if(submitButton)submitButton.textContent=text.button||i18n.de.button;document.querySelectorAll('[data-i18n]').forEach(el=>{const value=text[el.dataset.i18n];if(value)el.textContent=value});updateQuickExamples();updateVoiceButton();if(proofLink){const proofQuery=(samples[lang]||samples.de)[0]?.q||'Bluetooth Kopfhörer';proofLink.href='search.html?'+new URLSearchParams({q:proofQuery,lang}).toString()}if(input?.getAttribute('aria-invalid')==='true')showEmptySearch();if(persist){try{localStorage.setItem('fundblick-language',lang)}catch{}}close();}
  function submitSearch(){const q=input?.value.trim();if(!q){showEmptySearch();return false;}clearEmptySearch();const params=new URLSearchParams({q,lang});location.href='search.html?'+params.toString();return true;}
  function stopVoice(){if(recognition&&listening){try{recognition.stop()}catch{}}}
  function startVoice(){const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SpeechRecognition||!input)return;if(listening){stopVoice();return}recognition=new SpeechRecognition();recognition.lang=(locales[lang]||locales.de).speech;recognition.interimResults=false;recognition.maxAlternatives=1;recognition.onstart=()=>{listening=true;if(voiceStatus)voiceStatus.textContent=t().listening||'';updateVoiceButton()};recognition.onresult=event=>{const transcript=event.results?.[0]?.[0]?.transcript?.trim();if(transcript){input.value=transcript;clearEmptySearch();render();input.focus()}};recognition.onerror=()=>{if(voiceStatus)voiceStatus.textContent=t().voiceError||i18n.de.voiceError};recognition.onend=()=>{listening=false;updateVoiceButton();if(voiceStatus&&voiceStatus.textContent===(t().listening||''))voiceStatus.textContent=''};try{recognition.start()}catch{if(voiceStatus)voiceStatus.textContent=t().voiceError||i18n.de.voiceError}}

  if(input){input.addEventListener('input',()=>{if(input.value.trim())clearEmptySearch();render()});input.addEventListener('keydown',e=>{if(e.key==='ArrowDown'&&hits.length){e.preventDefault();setActive(active+1)}else if(e.key==='ArrowUp'&&hits.length){e.preventDefault();setActive(active-1)}else if(e.key==='Enter'&&active>=0){e.preventDefault();choose(active);form?.requestSubmit()}else if(e.key==='Escape')close()})}
  if(form)form.addEventListener('submit',e=>{e.preventDefault();submitSearch()});
  document.querySelectorAll('.quick button').forEach(b=>b.addEventListener('click',()=>{input.value=b.textContent;clearEmptySearch();input.focus();render()}));
  if(languageSelect)languageSelect.addEventListener('change',e=>applyLanguage(e.target.value));
  if(voiceButton)voiceButton.addEventListener('click',startVoice);
  document.addEventListener('click',e=>{if(!e.target.closest('.search'))close()});
  applyLanguage(initialLanguage(),{persist:false});
})();
