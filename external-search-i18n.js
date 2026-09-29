'use strict';

(function (root) {
  const copy = {
    de:{title:'Weitere Ergebnisse aus dem Web',loading:'Weitere Ergebnisse werden gesucht …',empty:'Keine weiteren Web-Ergebnisse gefunden.',error:'Die Websuche ist momentan nicht verfügbar.',source:'Web-Ergebnis',note:'Ergänzende Treffer aus externen Quellen.',productSource:'Web-Produkt',videoSource:'Video',guideSource:'Ratgeber',comparisonSource:'Vergleich / Test',localSource:'Lokaler Treffer'},
    tr:{title:'Web’den daha fazla sonuç',loading:'Daha fazla sonuç aranıyor …',empty:'Başka web sonucu bulunamadı.',error:'Web araması şu anda kullanılamıyor.',source:'Web sonucu'},
    ru:{title:'Другие результаты из интернета',loading:'Ищем дополнительные результаты …',empty:'Других результатов в интернете не найдено.',error:'Поиск в интернете сейчас недоступен.',source:'Результат из интернета',note:'Дополнительные результаты из внешних источников.',productSource:'Товар из интернета',videoSource:'Видео',guideSource:'Справочная информация',comparisonSource:'Сравнение / тест',localSource:'Местный результат'},
    ar:{title:'نتائج إضافية من الويب',loading:'جارٍ البحث عن نتائج إضافية …',empty:'لم يتم العثور على نتائج إضافية على الويب.',error:'البحث على الويب غير متاح حاليًا.',source:'نتيجة من الويب'},
    pl:{title:'Więcej wyników z internetu',loading:'Wyszukiwanie dodatkowych wyników …',empty:'Nie znaleziono dodatkowych wyników.',error:'Wyszukiwanie w internecie jest obecnie niedostępne.',source:'Wynik z internetu'},
    ro:{title:'Mai multe rezultate de pe web',loading:'Se caută mai multe rezultate …',empty:'Nu au fost găsite alte rezultate web.',error:'Căutarea web nu este disponibilă momentan.',source:'Rezultat web',note:'Rezultate suplimentare din surse externe.',productSource:'Produs de pe web',videoSource:'Video',guideSource:'Ghid / informații',comparisonSource:'Comparație / test',localSource:'Rezultat local'},
    uk:{title:'Інші результати з інтернету',loading:'Шукаємо додаткові результати …',empty:'Інших результатів в інтернеті не знайдено.',error:'Пошук в інтернеті зараз недоступний.',source:'Результат з інтернету'},
    en:{title:'More results from the web',loading:'Searching for more results …',empty:'No additional web results found.',error:'Web search is currently unavailable.',source:'Web result',note:'Additional results from external sources.',productSource:'Web product',videoSource:'Video',guideSource:'Guide / information',comparisonSource:'Comparison / review',localSource:'Local result'},
    it:{title:'Altri risultati dal web',loading:'Ricerca di altri risultati …',empty:'Nessun altro risultato web trovato.',error:'La ricerca web non è al momento disponibile.',source:'Risultato web'},
    bg:{title:'Още резултати от интернет',loading:'Търсят се още резултати …',empty:'Не са намерени допълнителни резултати.',error:'Търсенето в интернет временно не е достъпно.',source:'Резултат от интернет'},
    hr:{title:'Više rezultata s weba',loading:'Traže se dodatni rezultati …',empty:'Nisu pronađeni dodatni web rezultati.',error:'Web pretraživanje trenutačno nije dostupno.',source:'Web rezultat'},
    el:{title:'Περισσότερα αποτελέσματα από το διαδίκτυο',loading:'Αναζήτηση περισσότερων αποτελεσμάτων …',empty:'Δεν βρέθηκαν άλλα αποτελέσματα στο διαδίκτυο.',error:'Η αναζήτηση στο διαδίκτυο δεν είναι διαθέσιμη αυτή τη στιγμή.',source:'Αποτέλεσμα διαδικτύου'},
    sr:{title:'Још резултата са веба',loading:'Траже се додатни резултати …',empty:'Нису пронађени додатни веб резултати.',error:'Веб претрага тренутно није доступна.',source:'Веб резултат'},
    es:{title:'Más resultados de la web',loading:'Buscando más resultados …',empty:'No se encontraron más resultados web.',error:'La búsqueda web no está disponible en este momento.',source:'Resultado web'},
    fr:{title:'Plus de résultats sur le Web',loading:'Recherche de résultats supplémentaires …',empty:'Aucun autre résultat Web trouvé.',error:'La recherche Web est momentanément indisponible.',source:'Résultat Web'},
    pt:{title:'Mais resultados da Web',loading:'A procurar mais resultados …',empty:'Não foram encontrados mais resultados na Web.',error:'A pesquisa na Web não está disponível neste momento.',source:'Resultado da Web'},
    fa:{title:'نتایج بیشتر از وب',loading:'در حال جستجوی نتایج بیشتر …',empty:'نتیجهٔ دیگری در وب پیدا نشد.',error:'جستجوی وب در حال حاضر در دسترس نیست.',source:'نتیجهٔ وب'},
    sq:{title:'Më shumë rezultate nga uebi',loading:'Po kërkohen rezultate të tjera …',empty:'Nuk u gjetën rezultate të tjera në ueb.',error:'Kërkimi në ueb nuk është i disponueshëm për momentin.',source:'Rezultat nga uebi'},
    'zh-hans':{title:'更多网页结果',loading:'正在搜索更多结果…',empty:'未找到更多网页结果。',error:'网页搜索暂时不可用。',source:'网页结果'},
    ku:{title:'Encamên din ên ji webê',loading:'Encamên din tên lêgerîn …',empty:'Encamên din ên webê nehatin dîtin.',error:'Lêgerîna webê niha ne berdest e.',source:'Encama webê'}
  };

  function language() {
    const lang = String(document.documentElement.lang || 'de').trim().toLowerCase();
    if (copy[lang]) return lang;
    return lang.split('-')[0];
  }

  function get() {
    return copy[language()] || copy.en;
  }

  root.FundBlickExternalSearchI18n = Object.freeze({ get, language });
})(typeof window !== 'undefined' ? window : globalThis);
