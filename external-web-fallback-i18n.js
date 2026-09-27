'use strict';
(function(){
  const copy={
    de:{eyebrow:'WEBSUCHE',title:'Weitere Webergebnisse',note:'Diese Ergebnisse werden von Google bereitgestellt und können Werbung enthalten.'},
    tr:{eyebrow:'WEB ARAMASI',title:'Diğer web sonuçları',note:'Bu sonuçlar Google tarafından sağlanır ve reklam içerebilir.'},
    ru:{eyebrow:'ПОИСК В ИНТЕРНЕТЕ',title:'Другие результаты в интернете',note:'Эти результаты предоставляются Google и могут содержать рекламу.'},
    ar:{eyebrow:'بحث الويب',title:'نتائج أخرى من الويب',note:'يتم توفير هذه النتائج بواسطة Google وقد تتضمن إعلانات.'},
    pl:{eyebrow:'WYSZUKIWANIE W SIECI',title:'Więcej wyników z internetu',note:'Te wyniki są dostarczane przez Google i mogą zawierać reklamy.'},
    ro:{eyebrow:'CĂUTARE WEB',title:'Alte rezultate de pe web',note:'Aceste rezultate sunt furnizate de Google și pot conține reclame.'},
    uk:{eyebrow:'ПОШУК В ІНТЕРНЕТІ',title:'Інші результати в інтернеті',note:'Ці результати надає Google, і вони можуть містити рекламу.'},
    en:{eyebrow:'WEB SEARCH',title:'More web results',note:'These results are provided by Google and may contain ads.'},
    it:{eyebrow:'RICERCA WEB',title:'Altri risultati dal web',note:'Questi risultati sono forniti da Google e possono contenere annunci.'},
    bg:{eyebrow:'ТЪРСЕНЕ В МРЕЖАТА',title:'Още резултати от мрежата',note:'Тези резултати се предоставят от Google и може да съдържат реклами.'},
    hr:{eyebrow:'WEB PRETRAGA',title:'Više rezultata s weba',note:'Ove rezultate pruža Google i mogu sadržavati oglase.'},
    el:{eyebrow:'ΑΝΑΖΗΤΗΣΗ ΣΤΟΝ ΙΣΤΟ',title:'Περισσότερα αποτελέσματα ιστού',note:'Αυτά τα αποτελέσματα παρέχονται από την Google και ενδέχεται να περιέχουν διαφημίσεις.'},
    sr:{eyebrow:'WEB PRETRAGA',title:'Još rezultata sa veba',note:'Ove rezultate pruža Google i mogu sadržati oglase.'},
    es:{eyebrow:'BÚSQUEDA WEB',title:'Más resultados de la web',note:'Estos resultados los proporciona Google y pueden incluir anuncios.'},
    fr:{eyebrow:'RECHERCHE WEB',title:'Plus de résultats sur le web',note:'Ces résultats sont fournis par Google et peuvent contenir des annonces.'},
    pt:{eyebrow:'PESQUISA NA WEB',title:'Mais resultados da web',note:'Estes resultados são fornecidos pela Google e podem conter anúncios.'},
    fa:{eyebrow:'جست‌وجوی وب',title:'نتایج بیشتر از وب',note:'این نتایج توسط Google ارائه می‌شوند و ممکن است شامل تبلیغات باشند.'},
    sq:{eyebrow:'KËRKIM NË WEB',title:'Më shumë rezultate nga webi',note:'Këto rezultate ofrohen nga Google dhe mund të përmbajnë reklama.'},
    'zh-Hans':{eyebrow:'网页搜索',title:'更多网页结果',note:'这些结果由 Google 提供，可能包含广告。'},
    ku:{eyebrow:'LÊGERÎNA WEBÊ',title:'Encamên din ên webê',note:'Ev encam ji hêla Google ve tên peydakirin û dibe ku reklam tê de hebin.'}
  };
  const raw=(new URLSearchParams(location.search).get('lang')||document.documentElement.lang||'de');
  window.FundBlickExternalWebI18n=copy[raw]||copy[raw.split('-')[0]]||copy.en;
})();
