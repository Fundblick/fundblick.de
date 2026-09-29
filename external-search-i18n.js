'use strict';

(function (root) {
  const copy = {
    de:{title:'Weitere Ergebnisse aus dem Web',loading:'Weitere Ergebnisse werden gesucht …',empty:'Keine weiteren Web-Ergebnisse gefunden.',error:'Die Websuche ist momentan nicht verfügbar.',source:'Web-Ergebnis'},
    en:{title:'More results from the web',loading:'Searching for more results …',empty:'No additional web results found.',error:'Web search is currently unavailable.',source:'Web result'},
    ru:{title:'Другие результаты из интернета',loading:'Ищем дополнительные результаты …',empty:'Других результатов в интернете не найдено.',error:'Поиск в интернете сейчас недоступен.',source:'Результат из интернета'},
    ro:{title:'Mai multe rezultate de pe web',loading:'Se caută mai multe rezultate …',empty:'Nu au fost găsite alte rezultate web.',error:'Căutarea web nu este disponibilă momentan.',source:'Rezultat web'},
    tr:{title:'Web’den daha fazla sonuç',loading:'Daha fazla sonuç aranıyor …',empty:'Başka web sonucu bulunamadı.',error:'Web araması şu anda kullanılamıyor.',source:'Web sonucu'},
    it:{title:'Altri risultati dal web',loading:'Ricerca di altri risultati …',empty:'Nessun altro risultato web trovato.',error:'La ricerca web non è al momento disponibile.',source:'Risultato web'},
    es:{title:'Más resultados de la web',loading:'Buscando más resultados …',empty:'No se encontraron más resultados web.',error:'La búsqueda web no está disponible en este momento.',source:'Resultado web'},
    fr:{title:'Plus de résultats sur le Web',loading:'Recherche de résultats supplémentaires …',empty:'Aucun autre résultat Web trouvé.',error:'La recherche Web est momentanément indisponible.',source:'Résultat Web'},
    pl:{title:'Więcej wyników z internetu',loading:'Wyszukiwanie dodatkowych wyników …',empty:'Nie znaleziono dodatkowych wyników.',error:'Wyszukiwanie w internecie jest obecnie niedostępne.',source:'Wynik z internetu'},
    uk:{title:'Інші результати з інтернету',loading:'Шукаємо додаткові результати …',empty:'Інших результатів в інтернеті не знайдено.',error:'Пошук в інтернеті зараз недоступний.',source:'Результат з інтернету'}
  };

  function language() {
    const lang = String(document.documentElement.lang || 'de').trim();
    return lang.split('-')[0].toLowerCase();
  }

  function get() {
    return copy[language()] || copy.en;
  }

  root.FundBlickExternalSearchI18n = Object.freeze({ get });
})(typeof window !== 'undefined' ? window : globalThis);
