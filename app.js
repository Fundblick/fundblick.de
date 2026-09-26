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
  const emptySearch={de:'Bitte gib ein Produkt, eine Marke oder ein Modell ein.',en:'Please enter a product, brand or model.'};
  let lang='de',hits=[],active=-1,recognition=null,listening=false,liveRows=[];
  function normalizeLanguage(value){const raw=String(value||'').trim().replace(/_/g,'-');if(!raw)return null;if(locales[raw])return raw;const lower=raw.toLowerCase();if(lower==='zh'||lower.startsWith('zh-cn')||lower.startsWith('zh-sg')||lower.startsWith('zh-hans'))return 'zh-Hans';const base=lower.split('-')[0];return supported.find(code=>code.toLowerCase()===base)||null;}
  function initialLanguage(){const fromUrl=normalizeLanguage(new URLSearchParams(location.search).get('lang'));if(fromUrl)return fromUrl;try{const saved=normalizeLanguage(localStorage.getItem('fundblick-language'));if(saved)return saved}catch{}for(const candidate of navigator.languages||[navigator.language]){const match=normalizeLanguage(candidate);if(match)return match}return 'de';}
  function t(){return i18n[lang]||i18n.de||{}}
  function norm(s){return String(s||'').normalize('NFKD').toLocaleLowerCase(lang==='zh-Hans'?'zh-CN':lang).replace(/[\u0300-\u036f]/g,'').trim()}
  function close(){if(!box||!input)return;box.hidden=true;input.setAttribute('aria-expanded','false');input.setAttribute('aria-activedescendant','');active=-1}
  function setActive(n){if(!hits.length)return;active=(n+hits.length)%hits.length;box.querySelectorAll('[role="option"]').forEach((b,i)=>{const on=i===active;b.setAttribute('aria-selected',String(on));if(on){input.setAttribute('aria-activedescendant',b.id);b.scrollIntoView({block:'nearest'})}})}
  function clearEmptySearch(){if(!input||!voiceStatus)return;input.removeAttribute('aria-invalid');if(voiceStatus.dataset.emptySearch==='1'){voiceStatus.textContent='';delete voiceStatus.dataset.emptySearch}}
  function showEmptySearch(){if(!input)return;input.setAttribute('aria-invalid','true');input.focus();if(voiceStatus){voiceStatus.textContent=emptySearch[lang]||emptySearch.en;voiceStatus.dataset.emptySearch='1'}}
  function choose(i){if(i<0||i>=hits.length)return;input.value=hits[i].q;clearEmptySearch();close();input.focus()}
  function render(){if(!input||!box)return;const q=norm(input.value);hits=q?liveRows.filter(x=>norm(x.q).includes(q)).slice(0,8):liveRows.slice(0,8);box.innerHTML='';active=-1;box.hidden=!hits.length;input.setAttribute('aria-expanded',String(Boolean(hits.length)));input.setAttribute('aria-activedescendant','');hits.forEach((item,i)=>{const b=document.createElement('button');b.type='button';b.role='option';b.id='suggestion-'+i;b.setAttribute('aria-selected','false');const text=document.createElement('span');text.textContent=item.q;const meta=document.createElement('small');meta.textContent=item.m;meta.style.marginLeft='auto';meta.style.color='#66756c';b.append(text,meta);b.addEventListener('pointerdown',e=>e.preventDefault());b.addEventListener('click',()=>choose(i));box.appendChild(b)});}
  async function loadLiveSuggestions(){try{const meta=await window.FundBlickCatalog?.meta?.();const rows=Array.isArray(meta?.index)?meta.index:[];const seen=new Set();liveRows=[];for(const row of rows){for(const [value,type] of [[row.n,'Produkt'],[row.b,'Marke'],[row.c,'Kategorie']]){const text=String(value||'').trim(),key=norm(text);if(!text||seen.has(key))continue;seen.add(key);liveRows.push({q:text,m:type});if(liveRows.length>=300)break}if(liveRows.length>=300)break}if(input?.value)render();}catch(error){console.warn('FundBlick live suggestions unavailable',error)}}
  function updateVoiceButton(){if(!voiceButton)return;const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;voiceButton.hidden=!SpeechRecognition;const text=t();voiceButton.setAttribute('aria-label',listening?text.voiceStop:text.voiceStart);voiceButton.title=listening?text.voiceStop:text.voiceStart;voiceButton.setAttribute('aria-pressed',String(listening));}
  function applyLanguage(next,{persist=true}={}){const normalized=normalizeLanguage(next)||'de';lang=normalized;const config=locales[lang]||locales.de;const text=t();document.documentElement.lang=lang;document.documentElement.dir=config.dir||'ltr';if(languageSelect)languageSelect.value=lang;if(input)input.placeholder=text.search||i18n.de.search;if(submitButton)submitButton.textContent=text.button||i18n.de.button;document.querySelectorAll('[data-i18n]').forEach(el=>{const value=text[el.dataset.i18n];if(value)el.textContent=value});updateVoiceButton();if(proofLink){proofLink.href='search.html?'+new URLSearchParams({q:liveRows[0]?.q||'',lang}).toString()}if(input?.getAttribute('aria-invalid')==='true')showEmptySearch();if(persist){try{localStorage.setItem('fundblick-language',lang)}catch{}}close();}
  function submitSearch(){const q=input?.value.trim();if(!q){showEmptySearch();return false;}clearEmptySearch();location.href='search.html?'+new URLSearchParams({q,lang}).toString();return true;}
  function stopVoice(){if(recognition&&listening){try{recognition.stop()}catch{}}}
  function startVoice(){const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SpeechRecognition||!input)return;if(listening){stopVoice();return}recognition=new SpeechRecognition();recognition.lang=(locales[lang]||locales.de).speech;recognition.interimResults=false;recognition.maxAlternatives=1;recognition.onstart=()=>{listening=true;if(voiceStatus)voiceStatus.textContent=t().listening||'';updateVoiceButton()};recognition.onresult=event=>{const transcript=event.results?.[0]?.[0]?.transcript?.trim();if(transcript){input.value=transcript;clearEmptySearch();render();input.focus()}};recognition.onerror=()=>{if(voiceStatus)voiceStatus.textContent=t().voiceError||i18n.de.voiceError};recognition.onend=()=>{listening=false;updateVoiceButton()};try{recognition.start()}catch{}}
  if(input){input.addEventListener('input',()=>{if(input.value.trim())clearEmptySearch();render()});input.addEventListener('focus',render);input.addEventListener('keydown',e=>{if(e.key==='ArrowDown'&&hits.length){e.preventDefault();setActive(active+1)}else if(e.key==='ArrowUp'&&hits.length){e.preventDefault();setActive(active-1)}else if(e.key==='Enter'&&active>=0){e.preventDefault();choose(active);form?.requestSubmit()}else if(e.key==='Escape')close()})}
  if(form)form.addEventListener('submit',e=>{e.preventDefault();submitSearch()});
  if(languageSelect)languageSelect.addEventListener('change',e=>applyLanguage(e.target.value));
  if(voiceButton)voiceButton.addEventListener('click',startVoice);
  document.addEventListener('click',e=>{if(!e.target.closest('.search'))close()});
  applyLanguage(initialLanguage(),{persist:false});loadLiveSuggestions();
})();