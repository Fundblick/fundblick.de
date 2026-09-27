'use strict';
(function(){
  const root=document.querySelector('#external-results');
  if(!root)return;

  const params=new URLSearchParams(location.search);
  const rawLang=params.get('lang')||document.documentElement.lang||'de';
  const COPY={
    de:{label:'Hinweise zu Amazon-Angeboten',heading:'Amazon-Hinweis',associate:'Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.',content:'Bestimmte auf dieser Website angezeigte Inhalte stammen von Amazon. Diese Inhalte werden in der vorliegenden Form bereitgestellt und können jederzeit geändert oder entfernt werden.',price:'Der angegebene Amazon-Preis kann seit der letzten Aktualisierung gestiegen sein. Maßgeblich ist der Preis auf Amazon.de zum Zeitpunkt des Kaufs.',link:'(bezahlter Link)',pricePrefix:'Amazon-Preis: Stand'},
    en:{label:'Information about Amazon offers',heading:'Amazon notice',associate:'As an Amazon Associate I earn from qualifying purchases.',content:'Certain content displayed on this website comes from Amazon. This content is provided as is and may be changed or removed at any time.',price:'The stated Amazon price may have changed since the last update. The price shown on Amazon.de at the time of purchase is decisive.',link:'(paid link)',pricePrefix:'Amazon price: as of'},
    tr:{label:'Amazon teklifleri hakkında bilgiler',heading:'Amazon bilgisi',associate:'Bir Amazon iş ortağı olarak uygun satın alımlardan gelir elde ederim.',content:'Bu web sitesinde gösterilen bazı içerikler Amazon kaynaklıdır. Bu içerikler olduğu gibi sunulur ve herhangi bir zamanda değiştirilebilir veya kaldırılabilir.',price:'Belirtilen Amazon fiyatı son güncellemeden sonra değişmiş olabilir. Satın alma anında Amazon.de üzerinde gösterilen fiyat geçerlidir.',link:'(ücretli bağlantı)',pricePrefix:'Amazon fiyatı: güncelleme'},
    ru:{label:'Информация о предложениях Amazon',heading:'Информация Amazon',associate:'Как участник партнерской программы Amazon я получаю доход от соответствующих покупок.',content:'Некоторые материалы на этом сайте предоставлены Amazon. Они отображаются в предоставленном виде и могут быть изменены или удалены в любое время.',price:'Указанная цена Amazon могла измениться после последнего обновления. Определяющей является цена на Amazon.de в момент покупки.',link:'(платная ссылка)',pricePrefix:'Цена Amazon: по состоянию на'},
    ar:{label:'معلومات حول عروض Amazon',heading:'تنبيه Amazon',associate:'بصفتي شريكًا في Amazon، أكسب من المشتريات المؤهلة.',content:'بعض المحتوى المعروض على هذا الموقع مصدره Amazon. يتم تقديم هذا المحتوى كما هو وقد يتم تغييره أو إزالته في أي وقت.',price:'قد يكون سعر Amazon المعروض قد تغير منذ آخر تحديث. السعر المعتمد هو السعر الظاهر على Amazon.de وقت الشراء.',link:'(رابط مدفوع)',pricePrefix:'سعر Amazon: اعتبارًا من'},
    pl:{label:'Informacje o ofertach Amazon',heading:'Informacja Amazon',associate:'Jako Partner Amazon zarabiam na kwalifikujących się zakupach.',content:'Niektóre treści wyświetlane na tej stronie pochodzą z Amazon. Są udostępniane w obecnej formie i mogą zostać w każdej chwili zmienione lub usunięte.',price:'Podana cena Amazon mogła ulec zmianie od ostatniej aktualizacji. Wiążąca jest cena na Amazon.de w momencie zakupu.',link:'(link płatny)',pricePrefix:'Cena Amazon: stan na'},
    ro:{label:'Informații despre ofertele Amazon',heading:'Notă Amazon',associate:'Ca Partener Amazon, câștig din achizițiile eligibile.',content:'Anumite conținuturi afișate pe acest site provin de la Amazon. Acestea sunt furnizate ca atare și pot fi modificate sau eliminate în orice moment.',price:'Prețul Amazon afișat se poate fi modificat de la ultima actualizare. Prețul valabil este cel afișat pe Amazon.de în momentul cumpărării.',link:'(link plătit)',pricePrefix:'Preț Amazon: actualizat la'},
    uk:{label:'Інформація про пропозиції Amazon',heading:'Повідомлення Amazon',associate:'Як партнер Amazon, я отримую дохід від відповідних покупок.',content:'Деякий вміст на цьому сайті походить від Amazon. Він надається у поточному вигляді та може бути змінений або видалений у будь-який час.',price:'Вказана ціна Amazon могла змінитися після останнього оновлення. Визначальною є ціна на Amazon.de на момент покупки.',link:'(платне посилання)',pricePrefix:'Ціна Amazon: станом на'},
    it:{label:'Informazioni sulle offerte Amazon',heading:'Avviso Amazon',associate:'In qualità di affiliato Amazon, ricevo un guadagno dagli acquisti idonei.',content:'Alcuni contenuti visualizzati su questo sito provengono da Amazon. Sono forniti nello stato attuale e possono essere modificati o rimossi in qualsiasi momento.',price:'Il prezzo Amazon indicato potrebbe essere cambiato dall’ultimo aggiornamento. Fa fede il prezzo mostrato su Amazon.de al momento dell’acquisto.',link:'(link a pagamento)',pricePrefix:'Prezzo Amazon: aggiornato alle'},
    bg:{label:'Информация за офертите на Amazon',heading:'Бележка за Amazon',associate:'Като партньор на Amazon печеля от отговарящи на условията покупки.',content:'Определено съдържание на този сайт идва от Amazon. То се предоставя в настоящия си вид и може да бъде променено или премахнато по всяко време.',price:'Посочената цена в Amazon може да се е променила след последната актуализация. Валидна е цената в Amazon.de към момента на покупката.',link:'(платена връзка)',pricePrefix:'Цена в Amazon: към'},
    hr:{label:'Informacije o Amazon ponudama',heading:'Amazon obavijest',associate:'Kao Amazon partner zarađujem od kvalificiranih kupnji.',content:'Određeni sadržaj prikazan na ovoj stranici dolazi s Amazona. Sadržaj se prikazuje u postojećem obliku i može se promijeniti ili ukloniti u bilo kojem trenutku.',price:'Navedena Amazon cijena možda se promijenila od posljednjeg ažuriranja. Mjerodavna je cijena na Amazon.de u trenutku kupnje.',link:'(plaćena poveznica)',pricePrefix:'Amazon cijena: stanje u'},
    el:{label:'Πληροφορίες για προσφορές Amazon',heading:'Σημείωση Amazon',associate:'Ως συνεργάτης της Amazon κερδίζω από επιλέξιμες αγορές.',content:'Ορισμένο περιεχόμενο που εμφανίζεται σε αυτόν τον ιστότοπο προέρχεται από την Amazon. Παρέχεται ως έχει και μπορεί να αλλάξει ή να αφαιρεθεί ανά πάσα στιγμή.',price:'Η αναγραφόμενη τιμή Amazon μπορεί να έχει αλλάξει από την τελευταία ενημέρωση. Ισχύει η τιμή στο Amazon.de κατά τη στιγμή της αγοράς.',link:'(πληρωμένος σύνδεσμος)',pricePrefix:'Τιμή Amazon: ενημέρωση'},
    sr:{label:'Информације о Amazon понудама',heading:'Amazon обавештење',associate:'Као Amazon партнер зарађујем од квалификованих куповина.',content:'Одређени садржај приказан на овом сајту потиче од Amazon-а. Приказује се у постојећем облику и може бити измењен или уклоњен у било ком тренутку.',price:'Наведена Amazon цена се можда променила од последњег ажурирања. Меродавна је цена на Amazon.de у тренутку куповине.',link:'(плаћени линк)',pricePrefix:'Amazon цена: стање у'},
    es:{label:'Información sobre ofertas de Amazon',heading:'Aviso de Amazon',associate:'Como afiliado de Amazon, obtengo ingresos por compras que cumplen los requisitos.',content:'Ciertos contenidos mostrados en este sitio web proceden de Amazon. Se ofrecen tal cual y pueden modificarse o eliminarse en cualquier momento.',price:'El precio de Amazon indicado puede haber cambiado desde la última actualización. El precio válido es el mostrado en Amazon.de en el momento de la compra.',link:'(enlace pagado)',pricePrefix:'Precio de Amazon: actualizado a las'},
    fr:{label:'Informations sur les offres Amazon',heading:'Information Amazon',associate:'En tant que Partenaire Amazon, je réalise un bénéfice sur les achats remplissant les conditions requises.',content:'Certains contenus affichés sur ce site proviennent d’Amazon. Ils sont fournis en l’état et peuvent être modifiés ou supprimés à tout moment.',price:'Le prix Amazon indiqué peut avoir changé depuis la dernière mise à jour. Le prix applicable est celui affiché sur Amazon.de au moment de l’achat.',link:'(lien rémunéré)',pricePrefix:'Prix Amazon : mise à jour à'},
    pt:{label:'Informações sobre ofertas da Amazon',heading:'Aviso Amazon',associate:'Como Associado Amazon, ganho com compras qualificadas.',content:'Alguns conteúdos apresentados neste site são fornecidos pela Amazon. São apresentados no estado atual e podem ser alterados ou removidos a qualquer momento.',price:'O preço Amazon indicado pode ter mudado desde a última atualização. O preço válido é o apresentado em Amazon.de no momento da compra.',link:'(link pago)',pricePrefix:'Preço Amazon: atualizado às'},
    fa:{label:'اطلاعات درباره پیشنهادهای Amazon',heading:'اطلاعیه Amazon',associate:'به‌عنوان شریک Amazon از خریدهای واجد شرایط درآمد کسب می‌کنم.',content:'بخشی از محتوای نمایش‌داده‌شده در این وب‌سایت از Amazon است. این محتوا همان‌گونه که ارائه شده نمایش داده می‌شود و ممکن است هر زمان تغییر کند یا حذف شود.',price:'قیمت اعلام‌شده Amazon ممکن است از آخرین به‌روزرسانی تغییر کرده باشد. قیمت معتبر، قیمت نمایش‌داده‌شده در Amazon.de در زمان خرید است.',link:'(پیوند پولی)',pricePrefix:'قیمت Amazon: تا زمان'},
    sq:{label:'Informacion për ofertat e Amazon',heading:'Njoftim Amazon',associate:'Si partner i Amazon fitoj nga blerjet e kualifikuara.',content:'Disa përmbajtje të shfaqura në këtë faqe vijnë nga Amazon. Ato paraqiten në formën aktuale dhe mund të ndryshohen ose hiqen në çdo kohë.',price:'Çmimi i treguar në Amazon mund të ketë ndryshuar që nga përditësimi i fundit. Vlen çmimi në Amazon.de në momentin e blerjes.',link:'(lidhje e paguar)',pricePrefix:'Çmimi Amazon: gjendja në'},
    ku:{label:'Agahdarî derbarê pêşniyarên Amazon de',heading:'Agahdariya Amazon',associate:'Wek hevkarê Amazon, ez ji kirînên guncan dahat werdigirim.',content:'Hin naverokên ku li vê malperê têne nîşandan ji Amazon in. Ew bi forma xwe ya heyî têne pêşkêş kirin û dikarin her dem bên guhertin an rakirin.',price:'Bihayê Amazon ê nîşankirî dikare ji nûvekirina dawî ve guherîbe. Bihayê li Amazon.de di dema kirînê de derbasdar e.',link:'(girêdana pereyî)',pricePrefix:'Bihayê Amazon: heta'},
    'zh-Hans':{label:'Amazon 商品信息',heading:'Amazon 提示',associate:'作为 Amazon 合作伙伴，我可从符合条件的购买中获得收益。',content:'本网站显示的部分内容来自 Amazon。该内容按现状提供，并可能随时更改或删除。',price:'所示 Amazon 价格自上次更新后可能已发生变化。购买时以 Amazon.de 显示的价格为准。',link:'（付费链接）',pricePrefix:'Amazon 价格：更新于'}
  };
  const copy=COPY[rawLang]||COPY[rawLang.split('-')[0]]||COPY.en;
  const DISCLOSURE_ID='amazon-associate-disclosure';

  function formatTime(date){
    try{return new Intl.DateTimeFormat(rawLang,{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Berlin',timeZoneName:'short'}).format(date)}
    catch{return date.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}
  }

  function amazonCards(){return [...root.querySelectorAll('.external-product[data-provider="amazon-creators-api"],.external-product[data-provider="amazon-creators-api-relay"]')]}

  function ensureDisclosure(cards){
    let box=root.querySelector('#'+DISCLOSURE_ID);
    if(!cards.length){box?.remove();return}
    if(!box){
      box=document.createElement('aside');
      box.id=DISCLOSURE_ID;
      box.className='amazon-disclosure';
      box.setAttribute('aria-label',copy.label);
      box.innerHTML=`<strong>${copy.heading}</strong><p>${copy.associate}</p><p>${copy.content}</p><p>${copy.price}</p>`;
      box.dataset.amazonDisclosureReady='1';
      const heading=root.querySelector('.external-results-heading');
      (heading?.parentNode||root).insertBefore(box,heading?.nextSibling||root.firstChild);
    }
  }

  function decorate(){
    const cards=amazonCards();
    const now=new Date();
    ensureDisclosure(cards);
    for(const card of cards){
      if(card.dataset.amazonCompliance==='1')continue;
      const price=card.querySelector('.price');
      if(!price)continue;

      const cta=price.querySelector('.external-cta');
      if(cta&&!price.querySelector('.amazon-link-disclosure')){
        const disclosure=document.createElement('small');
        disclosure.className='amazon-link-disclosure';
        disclosure.textContent=copy.link;
        cta.insertAdjacentElement('afterend',disclosure);
        const id='amazon-link-disclosure-'+Math.random().toString(36).slice(2,10);
        disclosure.id=id;
        cta.setAttribute('aria-describedby',(cta.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean).concat(id).join(' '));
      }

      if(!price.querySelector('.amazon-price-notice')){
        const note=document.createElement('small');
        note.className='amazon-price-notice';
        note.textContent=`${copy.pricePrefix} ${formatTime(now)}. ${copy.price}`;
        price.appendChild(note);
      }
      card.dataset.amazonCompliance='1';
    }
  }

  let scheduled=false;
  const scheduleDecorate=()=>{
    if(scheduled)return;
    scheduled=true;
    queueMicrotask(()=>{scheduled=false;decorate()});
  };
  const observer=new MutationObserver(scheduleDecorate);
  observer.observe(root,{childList:true,subtree:true});
  window.addEventListener('fundblick:external-search',scheduleDecorate);
  decorate();
})();
