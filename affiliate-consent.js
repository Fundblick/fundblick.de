'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root){root.FundBlickAffiliateConsent=api;if(root.document)api.install(root);}
})(typeof window!=='undefined'?window:null,function(){
  const COPY={
    de:{title:'Affiliate-Tracking',body:'FundBlick kann für Händlerlinks ADCELL verwenden. Tracking wird erst nach deiner Auswahl aktiviert.',reject:'Ablehnen',accept:'Zustimmen',settings:'Tracking-Einstellungen',privacy:'Datenschutz',saved:'Einstellung gespeichert.'},
    tr:{title:'Affiliate takibi',body:'FundBlick mağaza bağlantıları için ADCELL kullanabilir. Takip yalnızca seçiminizden sonra etkinleşir.',reject:'Reddet',accept:'Kabul et',settings:'Takip ayarları',privacy:'Gizlilik',saved:'Ayar kaydedildi.'},
    ru:{title:'Партнёрское отслеживание',body:'FundBlick может использовать ADCELL для ссылок на магазины. Отслеживание включается только после вашего выбора.',reject:'Отклонить',accept:'Согласиться',settings:'Настройки отслеживания',privacy:'Конфиденциальность',saved:'Настройка сохранена.'},
    ar:{title:'تتبع الشركاء',body:'قد يستخدم FundBlick خدمة ADCELL لروابط المتاجر. لا يتم تفعيل التتبع إلا بعد اختيارك.',reject:'رفض',accept:'موافقة',settings:'إعدادات التتبع',privacy:'الخصوصية',saved:'تم حفظ الإعداد.'},
    pl:{title:'Śledzenie afiliacyjne',body:'FundBlick może używać ADCELL dla linków do sklepów. Śledzenie zostanie włączone dopiero po Twoim wyborze.',reject:'Odrzuć',accept:'Zgadzam się',settings:'Ustawienia śledzenia',privacy:'Prywatność',saved:'Ustawienie zapisane.'},
    ro:{title:'Urmărire afiliată',body:'FundBlick poate folosi ADCELL pentru linkurile comercianților. Urmărirea se activează numai după alegerea ta.',reject:'Respinge',accept:'Accept',settings:'Setări de urmărire',privacy:'Confidențialitate',saved:'Setarea a fost salvată.'},
    uk:{title:'Партнерське відстеження',body:'FundBlick може використовувати ADCELL для посилань на магазини. Відстеження активується лише після вашого вибору.',reject:'Відхилити',accept:'Погодитися',settings:'Налаштування відстеження',privacy:'Конфіденційність',saved:'Налаштування збережено.'},
    en:{title:'Affiliate tracking',body:'FundBlick may use ADCELL for merchant links. Tracking is only activated after your choice.',reject:'Reject',accept:'Accept',settings:'Tracking settings',privacy:'Privacy',saved:'Setting saved.'},
    it:{title:'Tracciamento affiliato',body:'FundBlick può utilizzare ADCELL per i link ai negozi. Il tracciamento viene attivato solo dopo la tua scelta.',reject:'Rifiuta',accept:'Accetta',settings:'Impostazioni tracking',privacy:'Privacy',saved:'Impostazione salvata.'},
    bg:{title:'Партньорско проследяване',body:'FundBlick може да използва ADCELL за връзки към търговци. Проследяването се активира само след вашия избор.',reject:'Отказ',accept:'Приемам',settings:'Настройки за проследяване',privacy:'Поверителност',saved:'Настройката е запазена.'},
    hr:{title:'Partnersko praćenje',body:'FundBlick može koristiti ADCELL za poveznice trgovaca. Praćenje se aktivira tek nakon vašeg odabira.',reject:'Odbij',accept:'Prihvati',settings:'Postavke praćenja',privacy:'Privatnost',saved:'Postavka je spremljena.'},
    el:{title:'Παρακολούθηση συνεργατών',body:'Το FundBlick μπορεί να χρησιμοποιεί ADCELL για συνδέσμους εμπόρων. Η παρακολούθηση ενεργοποιείται μόνο μετά την επιλογή σας.',reject:'Απόρριψη',accept:'Αποδοχή',settings:'Ρυθμίσεις παρακολούθησης',privacy:'Απόρρητο',saved:'Η ρύθμιση αποθηκεύτηκε.'},
    sr:{title:'Партнерско праћење',body:'FundBlick може користити ADCELL за линкове продавница. Праћење се активира тек након вашег избора.',reject:'Одбиј',accept:'Прихвати',settings:'Подешавања праћења',privacy:'Приватност',saved:'Подешавање је сачувано.'},
    es:{title:'Seguimiento de afiliación',body:'FundBlick puede usar ADCELL para enlaces de comercios. El seguimiento solo se activa después de tu elección.',reject:'Rechazar',accept:'Aceptar',settings:'Ajustes de seguimiento',privacy:'Privacidad',saved:'Ajuste guardado.'},
    fr:{title:'Suivi d’affiliation',body:'FundBlick peut utiliser ADCELL pour les liens marchands. Le suivi n’est activé qu’après votre choix.',reject:'Refuser',accept:'Accepter',settings:'Réglages du suivi',privacy:'Confidentialité',saved:'Réglage enregistré.'},
    pt:{title:'Rastreamento de afiliados',body:'A FundBlick pode usar ADCELL para links de lojas. O rastreamento só é ativado após a sua escolha.',reject:'Recusar',accept:'Aceitar',settings:'Definições de rastreamento',privacy:'Privacidade',saved:'Definição guardada.'},
    fa:{title:'ردیابی همکاری در فروش',body:'FundBlick ممکن است برای پیوندهای فروشگاهی از ADCELL استفاده کند. ردیابی فقط پس از انتخاب شما فعال می‌شود.',reject:'رد',accept:'پذیرش',settings:'تنظیمات ردیابی',privacy:'حریم خصوصی',saved:'تنظیم ذخیره شد.'},
    sq:{title:'Gjurmimi i afiliimit',body:'FundBlick mund të përdorë ADCELL për lidhjet e tregtarëve. Gjurmimi aktivizohet vetëm pas zgjedhjes suaj.',reject:'Refuzo',accept:'Prano',settings:'Cilësimet e gjurmimit',privacy:'Privatësia',saved:'Cilësimi u ruajt.'},
    'zh-Hans':{title:'联盟跟踪',body:'FundBlick 可能会对商家链接使用 ADCELL。只有在你做出选择后才会启用跟踪。',reject:'拒绝',accept:'同意',settings:'跟踪设置',privacy:'隐私',saved:'设置已保存。'},
    ku:{title:'Şopandina hevkariyê',body:'FundBlick dikare ji bo girêdanên firoşkaran ADCELL bikar bîne. Şopandin tenê piştî hilbijartina te çalak dibe.',reject:'Red bike',accept:'Bipejirîne',settings:'Mîhengên şopandinê',privacy:'Nepenî',saved:'Mîheng hate tomarkirin.'}
  };
  const normalizeLang=value=>{const raw=String(value||'').replace('_','-');if(COPY[raw])return raw;const base=raw.toLowerCase().split('-')[0];return Object.keys(COPY).find(k=>k.toLowerCase().split('-')[0]===base)||'de';};
  const readDecision=(storage,key)=>{try{return storage?.getItem(key)||null}catch{return null}};
  const canTrack=(config,decision)=>Boolean(config?.adcell?.enabled&&config?.adcell?.trackingEnabled&&decision==='granted');
  const setDataState=(doc,config,decision)=>{doc.documentElement.dataset.affiliateNetwork=config?.network||'ADCELL';doc.documentElement.dataset.affiliateEnabled=config?.adcell?.enabled?'true':'false';doc.documentElement.dataset.affiliateTracking=canTrack(config,decision)?'allowed':'blocked';};
  function install(root){
    const doc=root.document,config=root.FundBlickAffiliateConfig;if(!doc||!config?.adcell)return;
    const adcell=config.adcell,key=adcell.consentStorageKey||'fundblick-adcell-consent-v1';let decision=readDecision(root.localStorage,key);
    const lang=()=>normalizeLang(doc.querySelector('#language')?.value||root.FundBlickLanguageLinks?.current?.()||doc.documentElement.lang||'de');
    const copy=()=>COPY[lang()]||COPY.de;
    const updatePrivacyStatus=()=>{
      doc.querySelectorAll('[data-adcell-status]').forEach(el=>{el.textContent=adcell.enabled?'ADCELL ist technisch aktiviert.':'ADCELL ist derzeit technisch deaktiviert.';});
      doc.querySelectorAll('[data-adcell-active]').forEach(el=>{el.hidden=!adcell.enabled;});
      doc.querySelectorAll('[data-adcell-inactive]').forEach(el=>{el.hidden=Boolean(adcell.enabled);});
    };
    const ensureSettingsButton=()=>{
      doc.querySelectorAll('[data-affiliate-settings]').forEach(btn=>{btn.hidden=!adcell.enabled;btn.addEventListener('click',openSettings);});
      if(!adcell.enabled)return;
      const nav=doc.querySelector('footer nav');if(!nav||nav.querySelector('[data-affiliate-settings]'))return;
      const btn=doc.createElement('button');btn.type='button';btn.className='fb-consent-link';btn.dataset.affiliateSettings='';btn.textContent=copy().settings;btn.addEventListener('click',openSettings);nav.appendChild(btn);
    };
    const removeBanner=()=>doc.querySelector('#fbConsent')?.remove();
    const persist=value=>{decision=value;try{root.localStorage?.setItem(key,value)}catch{}setDataState(doc,config,decision);removeBanner();root.dispatchEvent(new CustomEvent('fundblick:affiliate-consent',{detail:{network:'ADCELL',decision,trackingAllowed:canTrack(config,decision)}}));};
    function renderBanner(force=false){
      if(!adcell.enabled){removeBanner();return;}if(!force&&decision)return;removeBanner();const t=copy();
      const panel=doc.createElement('section');panel.id='fbConsent';panel.className='fb-consent';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','fbConsentTitle');
      panel.innerHTML=`<div class="fb-consent-card"><div class="fb-consent-copy"><strong id="fbConsentTitle">${t.title}</strong><p>${t.body}</p><a href="datenschutz.html#affiliate-adcell">${t.privacy}</a></div><div class="fb-consent-actions"><button type="button" data-consent="denied">${t.reject}</button><button type="button" class="primary" data-consent="granted">${t.accept}</button></div></div>`;
      panel.querySelector('[data-consent="denied"]').addEventListener('click',()=>persist('denied'));
      panel.querySelector('[data-consent="granted"]').addEventListener('click',()=>persist('granted'));
      doc.body.appendChild(panel);
    }
    function openSettings(){renderBanner(true);}
    setDataState(doc,config,decision);updatePrivacyStatus();ensureSettingsButton();if(adcell.enabled&&!decision)renderBanner();
    const select=doc.querySelector('#language');if(select)select.addEventListener('change',()=>queueMicrotask(()=>{ensureSettingsButton();if(doc.querySelector('#fbConsent'))renderBanner(true);}));
    root.FundBlickAffiliateConsent.state=()=>({decision,trackingAllowed:canTrack(config,decision),enabled:Boolean(adcell.enabled),trackingEnabled:Boolean(adcell.trackingEnabled)});
    root.FundBlickAffiliateConsent.setDecision=persist;root.FundBlickAffiliateConsent.openSettings=openSettings;
  }
  return {COPY,normalizeLang,readDecision,canTrack,install};
});
