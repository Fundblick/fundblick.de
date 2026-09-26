'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root){root.FundBlickAffiliateConsent=api;if(root.document)api.install(root);}
})(typeof window!=='undefined'?window:null,function(){
  const COPY={
    de:{title:'Affiliate-Tracking',body:'FundBlick kann für Händlerlinks Affiliate-Netzwerke wie ADCELL und Awin verwenden. Tracking wird nur nach deiner Auswahl aktiviert.',reject:'Ablehnen',accept:'Zustimmen',settings:'Tracking-Einstellungen',privacy:'Datenschutz',saved:'Einstellung gespeichert.'},
    tr:{title:'Affiliate takibi',body:'FundBlick mağaza bağlantıları için ADCELL ve Awin gibi affiliate ağlarını kullanabilir. Takip yalnızca seçiminizden sonra etkinleşir.',reject:'Reddet',accept:'Kabul et',settings:'Takip ayarları',privacy:'Gizlilik',saved:'Ayar kaydedildi.'},
    ru:{title:'Партнёрское отслеживание',body:'FundBlick может использовать партнёрские сети, такие как ADCELL и Awin, для ссылок на магазины. Отслеживание включается только после вашего выбора.',reject:'Отклонить',accept:'Согласиться',settings:'Настройки отслеживания',privacy:'Конфиденциальность',saved:'Настройка сохранена.'},
    ar:{title:'تتبع الشركاء',body:'قد يستخدم FundBlick شبكات تسويق بالعمولة مثل ADCELL وAwin لروابط المتاجر. لا يتم تفعيل التتبع إلا بعد اختيارك.',reject:'رفض',accept:'موافقة',settings:'إعدادات التتبع',privacy:'الخصوصية',saved:'تم حفظ الإعداد.'},
    pl:{title:'Śledzenie afiliacyjne',body:'FundBlick może używać sieci afiliacyjnych takich jak ADCELL i Awin dla linków do sklepów. Śledzenie zostanie włączone dopiero po Twoim wyborze.',reject:'Odrzuć',accept:'Zgadzam się',settings:'Ustawienia śledzenia',privacy:'Prywatność',saved:'Ustawienie zapisane.'},
    ro:{title:'Urmărire afiliată',body:'FundBlick poate folosi rețele de afiliere precum ADCELL și Awin pentru linkurile comercianților. Urmărirea se activează numai după alegerea ta.',reject:'Respinge',accept:'Accept',settings:'Setări de urmărire',privacy:'Confidențialitate',saved:'Setarea a fost salvată.'},
    uk:{title:'Партнерське відстеження',body:'FundBlick може використовувати партнерські мережі, такі як ADCELL і Awin, для посилань на магазини. Відстеження активується лише після вашого вибору.',reject:'Відхилити',accept:'Погодитися',settings:'Налаштування відстеження',privacy:'Конфіденційність',saved:'Налаштування збережено.'},
    en:{title:'Affiliate tracking',body:'FundBlick may use affiliate networks such as ADCELL and Awin for merchant links. Tracking is only activated after your choice.',reject:'Reject',accept:'Accept',settings:'Tracking settings',privacy:'Privacy',saved:'Setting saved.'},
    it:{title:'Tracciamento affiliato',body:'FundBlick può utilizzare reti di affiliazione come ADCELL e Awin per i link ai negozi. Il tracciamento viene attivato solo dopo la tua scelta.',reject:'Rifiuta',accept:'Accetta',settings:'Impostazioni tracking',privacy:'Privacy',saved:'Impostazione salvata.'},
    bg:{title:'Партньорско проследяване',body:'FundBlick може да използва партньорски мрежи като ADCELL и Awin за връзки към търговци. Проследяването се активира само след вашия избор.',reject:'Отказ',accept:'Приемам',settings:'Настройки за проследяване',privacy:'Поверителност',saved:'Настройката е запазена.'},
    hr:{title:'Partnersko praćenje',body:'FundBlick može koristiti partnerske mreže poput ADCELL-a i Awina za poveznice trgovaca. Praćenje se aktivira tek nakon vašeg odabira.',reject:'Odbij',accept:'Prihvati',settings:'Postavke praćenja',privacy:'Privatnost',saved:'Postavka je spremljena.'},
    el:{title:'Παρακολούθηση συνεργατών',body:'Το FundBlick μπορεί να χρησιμοποιεί δίκτυα συνεργατών όπως το ADCELL και το Awin για συνδέσμους εμπόρων. Η παρακολούθηση ενεργοποιείται μόνο μετά την επιλογή σας.',reject:'Απόρριψη',accept:'Αποδοχή',settings:'Ρυθμίσεις παρακολούθησης',privacy:'Απόρρητο',saved:'Η ρύθμιση αποθηκεύτηκε.'},
    sr:{title:'Партнерско праћење',body:'FundBlick може користити партнерске мреже као што су ADCELL и Awin за линкове продавница. Праћење се активира тек након вашег избора.',reject:'Одбиј',accept:'Прихвати',settings:'Подешавања праћења',privacy:'Приватност',saved:'Подешавање је сачувано.'},
    es:{title:'Seguimiento de afiliación',body:'FundBlick puede usar redes de afiliación como ADCELL y Awin para enlaces de comercios. El seguimiento solo se activa después de tu elección.',reject:'Rechazar',accept:'Aceptar',settings:'Ajustes de seguimiento',privacy:'Privacidad',saved:'Ajuste guardado.'},
    fr:{title:'Suivi d’affiliation',body:'FundBlick peut utiliser des réseaux d’affiliation comme ADCELL et Awin pour les liens marchands. Le suivi n’est activé qu’après votre choix.',reject:'Refuser',accept:'Accepter',settings:'Réglages du suivi',privacy:'Confidentialité',saved:'Réglage enregistré.'},
    pt:{title:'Rastreamento de afiliados',body:'A FundBlick pode usar redes de afiliados como ADCELL e Awin para links de lojas. O rastreamento só é ativado após a sua escolha.',reject:'Recusar',accept:'Aceitar',settings:'Definições de rastreamento',privacy:'Privacidade',saved:'Definição guardada.'},
    fa:{title:'ردیابی همکاری در فروش',body:'FundBlick ممکن است برای پیوندهای فروشگاهی از شبکه‌های همکاری در فروش مانند ADCELL و Awin استفاده کند. ردیابی فقط پس از انتخاب شما فعال می‌شود.',reject:'رد',accept:'پذیرش',settings:'تنظیمات ردیابی',privacy:'حریم خصوصی',saved:'تنظیم ذخیره شد.'},
    sq:{title:'Gjurmimi i afiliimit',body:'FundBlick mund të përdorë rrjete afiliimi si ADCELL dhe Awin për lidhjet e tregtarëve. Gjurmimi aktivizohet vetëm pas zgjedhjes suaj.',reject:'Refuzo',accept:'Prano',settings:'Cilësimet e gjurmimit',privacy:'Privatësia',saved:'Cilësimi u ruajt.'},
    'zh-Hans':{title:'联盟跟踪',body:'FundBlick 可能会对商家链接使用 ADCELL、Awin 等联盟网络。只有在你做出选择后才会启用跟踪。',reject:'拒绝',accept:'同意',settings:'跟踪设置',privacy:'隐私',saved:'设置已保存。'},
    ku:{title:'Şopandina hevkariyê',body:'FundBlick dikare ji bo girêdanên firoşkaran torên hevkariyê yên wek ADCELL û Awin bikar bîne. Şopandin tenê piştî hilbijartina te çalak dibe.',reject:'Red bike',accept:'Bipejirîne',settings:'Mîhengên şopandinê',privacy:'Nepenî',saved:'Mîheng hate tomarkirin.'}
  };
  const NETWORKS=['adcell','awin'];
  const LABELS={adcell:'ADCELL',awin:'Awin'};
  const normalizeLang=value=>{const raw=String(value||'').replace('_','-');if(COPY[raw])return raw;const base=raw.toLowerCase().split('-')[0];return Object.keys(COPY).find(k=>k.toLowerCase().split('-')[0]===base)||'de';};
  const readDecision=(storage,key)=>{try{return storage?.getItem(key)||null}catch{return null}};
  const networkEnabled=(config,key)=>Boolean(config?.[key]?.enabled);
  const canTrack=(config,decision,key=null)=>{
    const granted=decision==='granted';
    if(!granted)return false;
    if(key)return Boolean(config?.[key]?.enabled&&config?.[key]?.trackingEnabled);
    return NETWORKS.some(network=>Boolean(config?.[network]?.enabled&&config?.[network]?.trackingEnabled));
  };
  const anyEnabled=config=>NETWORKS.some(key=>networkEnabled(config,key));
  const enabledNames=config=>NETWORKS.filter(key=>networkEnabled(config,key)).map(key=>LABELS[key]);
  const setDataState=(doc,config,decision)=>{
    doc.documentElement.dataset.affiliateNetwork='MULTI';
    doc.documentElement.dataset.affiliateNetworks=enabledNames(config).join(',');
    doc.documentElement.dataset.affiliateEnabled=anyEnabled(config)?'true':'false';
    doc.documentElement.dataset.affiliateTracking=canTrack(config,decision)?'allowed':'blocked';
  };
  function install(root){
    const doc=root.document,config=root.FundBlickAffiliateConfig;if(!doc||!config)return;
    const key=config?.consent?.storageKey||'fundblick-affiliate-consent-v1';let decision=readDecision(root.localStorage,key);
    const lang=()=>normalizeLang(doc.querySelector('#language')?.value||root.FundBlickLanguageLinks?.current?.()||doc.documentElement.lang||'de');
    const copy=()=>COPY[lang()]||COPY.de;
    const statusText=(label,enabled)=>{
      if(lang()==='ru')return enabled?`${label} технически активен.`:`${label} в настоящее время технически отключён.`;
      if(lang()==='en')return enabled?`${label} is technically enabled.`:`${label} is currently technically disabled.`;
      return enabled?`${label} ist technisch aktiviert.`:`${label} ist derzeit technisch deaktiviert.`;
    };
    const updatePrivacyStatus=()=>{
      NETWORKS.forEach(network=>{
        const label=LABELS[network],enabled=networkEnabled(config,network);
        doc.querySelectorAll(`[data-${network}-status]`).forEach(el=>{el.textContent=statusText(label,enabled);});
        doc.querySelectorAll(`[data-${network}-active]`).forEach(el=>{el.hidden=!enabled;});
        doc.querySelectorAll(`[data-${network}-inactive]`).forEach(el=>{el.hidden=enabled;});
      });
    };
    const ensureSettingsButton=()=>{
      doc.querySelectorAll('[data-affiliate-settings]').forEach(btn=>{btn.hidden=!anyEnabled(config);btn.textContent=copy().settings;btn.addEventListener('click',openSettings);});
      if(!anyEnabled(config))return;
      const nav=doc.querySelector('footer nav');if(!nav||nav.querySelector('[data-affiliate-settings]'))return;
      const btn=doc.createElement('button');btn.type='button';btn.className='fb-consent-link';btn.dataset.affiliateSettings='';btn.textContent=copy().settings;btn.addEventListener('click',openSettings);nav.appendChild(btn);
    };
    const removeBanner=()=>doc.querySelector('#fbConsent')?.remove();
    const persist=value=>{decision=value;try{root.localStorage?.setItem(key,value)}catch{}setDataState(doc,config,decision);removeBanner();root.dispatchEvent(new CustomEvent('fundblick:affiliate-consent',{detail:{network:'MULTI',decision,trackingAllowed:canTrack(config,decision)}}));};
    function renderBanner(force=false){
      if(!anyEnabled(config)){removeBanner();return;}if(!force&&decision)return;removeBanner();const t=copy();
      const panel=doc.createElement('section');panel.id='fbConsent';panel.className='fb-consent';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','fbConsentTitle');
      panel.innerHTML=`<div class="fb-consent-card"><div class="fb-consent-copy"><strong id="fbConsentTitle">${t.title}</strong><p>${t.body}</p><a href="datenschutz.html#affiliate-networks">${t.privacy}</a></div><div class="fb-consent-actions"><button type="button" data-consent="denied">${t.reject}</button><button type="button" class="primary" data-consent="granted">${t.accept}</button></div></div>`;
      panel.querySelector('[data-consent="denied"]').addEventListener('click',()=>persist('denied'));
      panel.querySelector('[data-consent="granted"]').addEventListener('click',()=>persist('granted'));
      doc.body.appendChild(panel);
    }
    function openSettings(){renderBanner(true);}
    setDataState(doc,config,decision);updatePrivacyStatus();ensureSettingsButton();if(anyEnabled(config)&&!decision)renderBanner();
    const select=doc.querySelector('#language');if(select)select.addEventListener('change',()=>queueMicrotask(()=>{updatePrivacyStatus();ensureSettingsButton();if(doc.querySelector('#fbConsent'))renderBanner(true);}));
    root.FundBlickAffiliateConsent.state=()=>({decision,trackingAllowed:canTrack(config,decision),enabled:anyEnabled(config),networks:Object.fromEntries(NETWORKS.map(network=>[network,{enabled:networkEnabled(config,network),trackingAllowed:canTrack(config,decision,network)}]))});
    root.FundBlickAffiliateConsent.setDecision=persist;root.FundBlickAffiliateConsent.openSettings=openSettings;
  }
  return {COPY,NETWORKS,LABELS,normalizeLang,readDecision,networkEnabled,canTrack,anyEnabled,install};
});
