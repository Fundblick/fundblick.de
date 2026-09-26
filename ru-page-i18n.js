'use strict';
(function(){
  const lang=()=>window.FundBlickLanguageLinks?.current?.()||new URLSearchParams(location.search).get('lang')||document.documentElement.lang||'de';
  const textMap={
    'Startseite':'Главная','Produktsuche · Preisvergleich':'Поиск товаров · Сравнение цен',
    'Hier gibt es nichts zu finden.':'Здесь ничего не найдено.','Die aufgerufene Seite existiert nicht oder wurde verschoben.':'Запрошенная страница не существует или была перемещена.','Zur Produktsuche':'К поиску товаров',
    'Impressum':'Выходные данные','Angaben gemäß § 5 DDG':'Сведения согласно § 5 DDG','Kontakt':'Контакты','Deutschland':'Германия','Stand: 17. September 2026':'Версия от 17 сентября 2026 г.',
    'Datenschutzerklärung':'Политика конфиденциальности','Stand: 26. September 2026':'Версия от 26 сентября 2026 г.',
    '1. Verantwortlicher':'1. Ответственное лицо','Verantwortlicher für die Verarbeitung personenbezogener Daten im Rahmen dieses Internetangebots ist:':'Ответственным за обработку персональных данных в рамках данного интернет-предложения является:',
    '2. Hosting über GitHub Pages':'2. Хостинг через GitHub Pages','Die derzeit öffentlich erreichbare Website wird über GitHub Pages bereitgestellt.':'В настоящее время общедоступный сайт размещается с помощью GitHub Pages.',
    '3. Kontaktaufnahme per E-Mail':'3. Связь по электронной почте','4. Cookies, Analyse und Tracking':'4. Файлы cookie, аналитика и отслеживание','4a. Sprachwahl und Spracheingabe':'4a. Выбор языка и голосовой ввод','4b. Affiliate-Dienste':'4b. Партнёрские сервисы',
    '5. Empfänger und Dienstleister':'5. Получатели и поставщики услуг','6. Speicherdauer':'6. Срок хранения','7. Rechte betroffener Personen':'7. Права субъектов данных','8. Beschwerderecht':'8. Право на подачу жалобы','9. Datensicherheit':'9. Безопасность данных',
    'Tracking-Einstellungen öffnen':'Открыть настройки отслеживания','ADCELL ist derzeit technisch deaktiviert.':'ADCELL в настоящее время технически отключён.','Awin ist für ausgewählte Händlerlinks aktiv.':'Awin активен для выбранных ссылок на магазины.'
  };
  const privacyParagraphs={
    'FundBlick setzt derzeit selbst keine Analyse-, Marketing- oder sonstigen nicht technisch erforderlichen Cookies oder vergleichbaren Tracking-Technologien ein.':'В настоящее время FundBlick самостоятельно не использует аналитические, маркетинговые или иные технически необязательные файлы cookie либо сопоставимые технологии отслеживания.',
    'Wenn Sie die Sprache der Website auswählen, speichert FundBlick diese Auswahl unter dem Schlüssel fundblick-language im lokalen Speicher Ihres Browsers. Damit wird Ihre bevorzugte Oberflächensprache beim nächsten Besuch wieder angezeigt. FundBlick erhält daraus keine Kennung und setzt hierfür keinen Analysedienst ein. Die Auswahl können Sie über die Einstellungen Ihres Browsers löschen.':'При выборе языка сайта FundBlick сохраняет этот выбор под ключом fundblick-language в локальном хранилище браузера. Благодаря этому при следующем посещении снова отображается выбранный язык интерфейса. FundBlick не получает из этого идентификатор и не использует для этого аналитические сервисы. Вы можете удалить этот выбор в настройках браузера.',
    'FundBlick kann Händlerangebote über Affiliate-Netzwerke vermitteln. Wenn ein Nutzer über einen entsprechend gekennzeichneten Händlerlink zu einem Händler wechselt und dort eine Transaktion ausführt, kann FundBlick eine Vergütung erhalten. Der vom Händler verlangte Preis erhöht sich dadurch nicht.':'FundBlick может направлять пользователей к предложениям магазинов через партнёрские сети. Если пользователь переходит к магазину по соответствующим образом обозначенной ссылке и совершает там транзакцию, FundBlick может получить вознаграждение. Цена, взимаемая магазином, при этом не увеличивается.'
  };
  function replaceText(root=document.body){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{const raw=node.nodeValue,trim=raw.trim();if(!trim)return;const replacement=textMap[trim]||privacyParagraphs[trim];if(replacement)node.nodeValue=raw.replace(trim,replacement);});
  }
  function apply(){if(lang()!=='ru')return;document.documentElement.lang='ru';replaceText();if(document.title==='Impressum – FundBlick')document.title='Выходные данные – FundBlick';if(document.title==='Datenschutz – FundBlick')document.title='Конфиденциальность – FundBlick';if(document.title==='Seite nicht gefunden – FundBlick')document.title='Страница не найдена – FundBlick';}
  apply();document.addEventListener('DOMContentLoaded',apply);window.addEventListener('pageshow',apply);
})();
