'use strict';
(function(root){
  if(!root||!root.document)return;
  const form=document.querySelector('#searchForm');
  const input=document.querySelector('#q');
  const language=document.querySelector('#language');
  const voiceStatus=document.querySelector('#voiceStatus');
  const feedback=document.querySelector('#searchFeedback');
  const feedbackText=document.querySelector('#searchFeedbackText');
  const emptySearch={de:'Bitte gib ein Produkt, eine Marke oder ein Modell ein.',tr:'Lütfen bir ürün, marka veya model girin.',ru:'Введите товар, бренд или модель.',ar:'يرجى إدخال منتج أو علامة تجارية أو موديل.',pl:'Wpisz produkt, markę lub model.',ro:'Introdu un produs, o marcă sau un model.',uk:'Введіть товар, бренд або модель.',en:'Please enter a product, brand or model.',it:'Inserisci un prodotto, un marchio o un modello.',bg:'Въведете продукт, марка или модел.',hr:'Unesite proizvod, marku ili model.',el:'Εισαγάγετε προϊόν, μάρκα ή μοντέλο.',sr:'Унесите производ, бренд или модел.',es:'Introduce un producto, una marca o un modelo.',fr:'Saisissez un produit, une marque ou un modèle.',pt:'Introduza um produto, uma marca ou um modelo.',fa:'لطفاً یک محصول، برند یا مدل وارد کنید.',sq:'Shkruaj një produkt, markë ose model.','zh-Hans':'请输入商品、品牌或型号。',ku:'Ji kerema xwe hilberek, markeyek an modelek binivîse.'};
  const valueCopy={
    de:{eyebrow:'WARUM FUNDBLICK?',title:'So arbeitet FundBlick für dich.',lead:'Weniger Sucherei, weniger Preisfallen – und schneller zum wirklich erreichbaren Gesamtpreis.',searchTitle:'Produkt suchen',searchText:'Produkt, Marke oder Modell eingeben. FundBlick führt dich direkt zu passenden Treffern und Filtern.',compareTitle:'Gesamtpreis statt Lockpreis',compareText:'Produktpreis, Versand und verfügbare Händlerangebote werden gemeinsam betrachtet – nicht nur der auffällige Einstiegspreis.',promoTitle:'Aktionen ohne Code-Lotterie',promoText:'Verifizierte Gutscheine und Aktionen werden nur dann berücksichtigt, wenn sie zum Angebot und zu ihren Bedingungen passen.'},
    tr:{eyebrow:'NEDEN FUNDBLICK?',title:'FundBlick senin için böyle çalışır.',lead:'Daha az arama, daha az fiyat tuzağı – ulaşılabilir toplam fiyata daha hızlı ulaş.',searchTitle:'Ürünü ara',searchText:'Ürün, marka veya modeli gir. FundBlick seni uygun sonuçlara ve filtrelere götürür.',compareTitle:'Etiket fiyatı değil toplam fiyat',compareText:'Ürün fiyatı, kargo ve mevcut mağaza teklifleri birlikte değerlendirilir.',promoTitle:'Kod denemeden kampanyalar',promoText:'Doğrulanmış kupon ve kampanyalar yalnızca teklif ve koşullar gerçekten uyuyorsa hesaba katılır.'},
    ru:{eyebrow:'ЗАЧЕМ FUNDBLICK?',title:'Вот как FundBlick работает для вас.',lead:'Меньше поисков и ценовых ловушек — быстрее к реально достижимой итоговой цене.',searchTitle:'Найти товар',searchText:'Введите товар, бренд или модель. FundBlick приведёт к подходящим результатам и фильтрам.',compareTitle:'Итоговая цена вместо приманки',compareText:'Цена товара, доставка и доступные предложения магазинов рассматриваются вместе.',promoTitle:'Акции без перебора кодов',promoText:'Проверенные купоны и акции учитываются только тогда, когда они действительно подходят к предложению и условиям.'},
    ar:{eyebrow:'لماذا FUNDBLICK؟',title:'هكذا يعمل FundBlick من أجلك.',lead:'بحث أقل وفخاخ سعرية أقل، ووصول أسرع إلى السعر الإجمالي القابل للتحقيق فعلاً.',searchTitle:'ابحث عن المنتج',searchText:'أدخل المنتج أو العلامة أو الموديل، وسيقودك FundBlick إلى النتائج والفلاتر المناسبة.',compareTitle:'السعر الإجمالي لا السعر الجاذب',compareText:'يتم النظر إلى سعر المنتج والشحن وعروض المتاجر المتاحة معاً.',promoTitle:'عروض بلا تجريب أكواد عشوائي',promoText:'لا تُحتسب القسائم والعروض الموثقة إلا إذا كانت مناسبة فعلاً للعرض وشروطه.'},
    pl:{eyebrow:'DLACZEGO FUNDBLICK?',title:'Tak FundBlick pracuje dla Ciebie.',lead:'Mniej szukania i pułapek cenowych – szybciej do realnie osiągalnej ceny całkowitej.',searchTitle:'Wyszukaj produkt',searchText:'Wpisz produkt, markę lub model. FundBlick prowadzi do pasujących wyników i filtrów.',compareTitle:'Cena całkowita zamiast wabika',compareText:'Cena produktu, wysyłka i dostępne oferty sklepów są analizowane razem.',promoTitle:'Promocje bez loterii kodów',promoText:'Zweryfikowane kupony i promocje są uwzględniane tylko wtedy, gdy pasują do oferty i warunków.'},
    ro:{eyebrow:'DE CE FUNDBLICK?',title:'Așa lucrează FundBlick pentru tine.',lead:'Mai puțină căutare, mai puține capcane de preț și mai repede la prețul total realizabil.',searchTitle:'Caută produsul',searchText:'Introdu produsul, marca sau modelul. FundBlick te duce la rezultate și filtre potrivite.',compareTitle:'Preț total, nu preț-capcană',compareText:'Prețul produsului, transportul și ofertele disponibile sunt analizate împreună.',promoTitle:'Promoții fără loteria codurilor',promoText:'Cupoanele și promoțiile verificate sunt luate în calcul doar când se potrivesc ofertei și condițiilor.'},
    uk:{eyebrow:'НАВІЩО FUNDBLICK?',title:'Так FundBlick працює для вас.',lead:'Менше пошуків і цінових пасток — швидше до реально доступної підсумкової ціни.',searchTitle:'Знайти товар',searchText:'Введіть товар, бренд або модель. FundBlick приведе до відповідних результатів і фільтрів.',compareTitle:'Підсумкова ціна замість приманки',compareText:'Ціна товару, доставка та доступні пропозиції магазинів розглядаються разом.',promoTitle:'Акції без перебору кодів',promoText:'Перевірені купони й акції враховуються лише тоді, коли вони справді підходять до пропозиції та умов.'},
    en:{eyebrow:'WHY FUNDBLICK?',title:'How FundBlick works for you.',lead:'Less searching, fewer price traps, and a faster route to the total price you can actually get.',searchTitle:'Search for the product',searchText:'Enter a product, brand or model. FundBlick takes you straight to relevant results and filters.',compareTitle:'Total price, not teaser price',compareText:'Product price, shipping and available merchant offers are considered together.',promoTitle:'Promotions without code roulette',promoText:'Verified coupons and promotions only count when they really match the offer and its conditions.'},
    it:{eyebrow:'PERCHÉ FUNDBLICK?',title:'Ecco come FundBlick lavora per te.',lead:'Meno ricerche, meno trappole di prezzo e più velocemente al prezzo totale realmente ottenibile.',searchTitle:'Cerca il prodotto',searchText:'Inserisci prodotto, marchio o modello. FundBlick ti porta ai risultati e filtri pertinenti.',compareTitle:'Prezzo totale, non prezzo-esca',compareText:'Prezzo del prodotto, spedizione e offerte disponibili vengono considerati insieme.',promoTitle:'Promozioni senza lotteria di codici',promoText:'Coupon e promozioni verificati contano solo se corrispondono davvero all’offerta e alle condizioni.'},
    bg:{eyebrow:'ЗАЩО FUNDBLICK?',title:'Ето как FundBlick работи за вас.',lead:'По-малко търсене и ценови капани – по-бързо до реално постижимата крайна цена.',searchTitle:'Търси продукт',searchText:'Въведи продукт, марка или модел. FundBlick те води към подходящи резултати и филтри.',compareTitle:'Крайна, не примамлива цена',compareText:'Цената, доставката и наличните оферти от търговци се разглеждат заедно.',promoTitle:'Промоции без пробване на кодове',promoText:'Проверени купони и промоции се отчитат само когато наистина важат за офертата и условията.'},
    hr:{eyebrow:'ZAŠTO FUNDBLICK?',title:'Ovako FundBlick radi za tebe.',lead:'Manje traženja i cjenovnih zamki – brže do stvarno ostvarive ukupne cijene.',searchTitle:'Traži proizvod',searchText:'Unesi proizvod, marku ili model. FundBlick vodi do relevantnih rezultata i filtara.',compareTitle:'Ukupna cijena umjesto mamca',compareText:'Cijena proizvoda, dostava i dostupne ponude trgovaca promatraju se zajedno.',promoTitle:'Akcije bez lutrije kodova',promoText:'Provjereni kuponi i akcije računaju se samo kada stvarno odgovaraju ponudi i uvjetima.'},
    el:{eyebrow:'ΓΙΑΤΙ FUNDBLICK;',title:'Έτσι δουλεύει το FundBlick για εσάς.',lead:'Λιγότερη αναζήτηση και παγίδες τιμών – γρηγορότερα στην πραγματικά διαθέσιμη συνολική τιμή.',searchTitle:'Αναζήτηση προϊόντος',searchText:'Πληκτρολογήστε προϊόν, μάρκα ή μοντέλο. Το FundBlick σας οδηγεί στα σχετικά αποτελέσματα και φίλτρα.',compareTitle:'Συνολική τιμή, όχι τιμή-δόλωμα',compareText:'Η τιμή προϊόντος, τα μεταφορικά και οι διαθέσιμες προσφορές εξετάζονται μαζί.',promoTitle:'Προσφορές χωρίς δοκιμές κωδικών',promoText:'Επαληθευμένα κουπόνια και προσφορές υπολογίζονται μόνο όταν ταιριάζουν πραγματικά στην προσφορά και στους όρους.'},
    sr:{eyebrow:'ЗАШТО FUNDBLICK?',title:'Овако FundBlick ради за вас.',lead:'Мање тражења и ценовних замки – брже до стварно достижне укупне цене.',searchTitle:'Тражи производ',searchText:'Унесите производ, бренд или модел. FundBlick води до релевантних резултата и филтера.',compareTitle:'Укупна цена уместо мамца',compareText:'Цена производа, достава и доступне понуде продаваца посматрају се заједно.',promoTitle:'Акције без лутрије кодова',promoText:'Проверени купони и акције рачунају се само када заиста одговарају понуди и условима.'},
    es:{eyebrow:'¿POR QUÉ FUNDBLICK?',title:'Así trabaja FundBlick para ti.',lead:'Menos búsquedas y trampas de precio, y más rápido al precio total realmente alcanzable.',searchTitle:'Busca el producto',searchText:'Introduce producto, marca o modelo. FundBlick te lleva a resultados y filtros relevantes.',compareTitle:'Precio total, no precio gancho',compareText:'El precio del producto, el envío y las ofertas disponibles se valoran conjuntamente.',promoTitle:'Promociones sin ruleta de códigos',promoText:'Los cupones y promociones verificados solo cuentan cuando realmente se aplican a la oferta y sus condiciones.'},
    fr:{eyebrow:'POURQUOI FUNDBLICK ?',title:'Voici comment FundBlick travaille pour vous.',lead:'Moins de recherches et de pièges de prix, plus vite vers le prix total réellement accessible.',searchTitle:'Rechercher le produit',searchText:'Saisissez produit, marque ou modèle. FundBlick vous mène aux résultats et filtres pertinents.',compareTitle:'Prix total, pas prix d’appel',compareText:'Prix du produit, livraison et offres marchands disponibles sont considérés ensemble.',promoTitle:'Promos sans roulette de codes',promoText:'Les coupons et promotions vérifiés ne comptent que s’ils correspondent réellement à l’offre et à ses conditions.'},
    pt:{eyebrow:'PORQUÊ FUNDBLICK?',title:'É assim que o FundBlick trabalha para si.',lead:'Menos procura e armadilhas de preço – mais depressa ao preço total realmente alcançável.',searchTitle:'Pesquisar produto',searchText:'Introduza produto, marca ou modelo. O FundBlick leva-o aos resultados e filtros relevantes.',compareTitle:'Preço total, não preço de chamariz',compareText:'Preço do produto, envio e ofertas disponíveis são analisados em conjunto.',promoTitle:'Promoções sem roleta de códigos',promoText:'Cupões e promoções verificados só contam quando realmente se aplicam à oferta e às condições.'},
    fa:{eyebrow:'چرا FUNDBLICK؟',title:'FundBlick این‌طور برای شما کار می‌کند.',lead:'جستجوی کمتر، تله‌های قیمتی کمتر و رسیدن سریع‌تر به قیمت نهایی واقعاً قابل دستیابی.',searchTitle:'جستجوی محصول',searchText:'محصول، برند یا مدل را وارد کنید. FundBlick شما را به نتایج و فیلترهای مرتبط می‌رساند.',compareTitle:'قیمت نهایی، نه قیمت فریبنده',compareText:'قیمت محصول، ارسال و پیشنهادهای موجود فروشندگان با هم بررسی می‌شوند.',promoTitle:'تخفیف بدون آزمون‌وخطای کدها',promoText:'کوپن‌ها و تخفیف‌های تأییدشده فقط وقتی لحاظ می‌شوند که واقعاً با پیشنهاد و شرایط آن سازگار باشند.'},
    sq:{eyebrow:'PSE FUNDBLICK?',title:'Kështu punon FundBlick për ty.',lead:'Më pak kërkim dhe kurthe çmimesh – më shpejt te çmimi total që mund të arrihet realisht.',searchTitle:'Kërko produktin',searchText:'Shkruaj produktin, markën ose modelin. FundBlick të çon te rezultatet dhe filtrat përkatës.',compareTitle:'Çmimi total, jo çmimi karrem',compareText:'Çmimi i produktit, transporti dhe ofertat e disponueshme shihen së bashku.',promoTitle:'Oferta pa lotari kodesh',promoText:'Kuponët dhe ofertat e verifikuara llogariten vetëm kur përputhen vërtet me ofertën dhe kushtet.'},
    'zh-Hans':{eyebrow:'为什么选择 FUNDBLICK？',title:'FundBlick 这样为你工作。',lead:'少一点搜索，少一点价格陷阱，更快找到真正可获得的总价。',searchTitle:'搜索商品',searchText:'输入商品、品牌或型号。FundBlick 会带你到相关结果和筛选项。',compareTitle:'看总价，不看诱导价',compareText:'商品价格、运费和可用商家报价会一起比较。',promoTitle:'优惠不再靠试码',promoText:'只有经过验证且确实符合报价与使用条件的优惠券和活动才会计入。'},
    ku:{eyebrow:'ÇIMA FUNDBLICK?',title:'FundBlick ji bo te wisa dixebite.',lead:'Lêgerîn û xefikên bihayê kêmtir – zûtir bigihîje bihayê giştî yê bi rastî dikare were bidestxistin.',searchTitle:'Hilberê bigere',searchText:'Hilber, marka an model binivîse. FundBlick te dibe encam û parzûnên têkildar.',compareTitle:'Bihayê giştî, ne bihayê kişandina balê',compareText:'Bihayê hilberê, şandin û pêşniyarên firoşkaran bi hev re tên nirxandin.',promoTitle:'Kampanya bê ceribandina kodan',promoText:'Kupon û kampanyayên hatine piştrastkirin tenê dema ku bi rastî li pêşniyar û şertan tên, tên hesabkirin.'}
  };
  const currentLang=()=>language?.value||document.documentElement.lang||'de';
  function text(){return emptySearch[currentLang()]||emptySearch.en;}
  function applyValueCopy(){const copy=valueCopy[currentLang()]||valueCopy.en;document.querySelectorAll('[data-value-key]').forEach(el=>{const value=copy[el.dataset.valueKey];if(value)el.textContent=value;});}
  function focusDesktopSearch(){
    if(!input||typeof root.matchMedia!=='function')return;
    if(root.matchMedia('(min-width: 761px)').matches&&document.activeElement===document.body){root.requestAnimationFrame?.(()=>input.focus({preventScroll:true}));}
  }
  function clearLegacyMessage(){
    if(!voiceStatus)return;
    if(voiceStatus.dataset.emptySearch==='1'||voiceStatus.textContent.trim()===text()){
      voiceStatus.textContent='';
      delete voiceStatus.dataset.emptySearch;
    }
  }
  function showFeedback(){
    if(!input||!form||!feedback||!feedbackText)return;
    clearLegacyMessage();
    input.setAttribute('aria-invalid','true');
    form.classList.add('search-attention');
    feedbackText.textContent=text();
    feedback.hidden=false;
    input.focus({preventScroll:true});
  }
  function clearFeedback(){
    if(!input||!form||!feedback)return;
    form.classList.remove('search-attention');
    input.removeAttribute('aria-invalid');
    feedback.hidden=true;
    clearLegacyMessage();
  }
  if(form&&input){
    form.addEventListener('submit',event=>{
      if(input.value.trim()){clearFeedback();return;}
      event.preventDefault();
      event.stopImmediatePropagation();
      showFeedback();
    },true);
    input.addEventListener('input',()=>{if(input.value.trim())clearFeedback();});
  }
  language?.addEventListener('change',()=>queueMicrotask(()=>{
    clearLegacyMessage();
    applyValueCopy();
    if(feedback&&!feedback.hidden&&feedbackText)feedbackText.textContent=text();
  }));
  document.querySelectorAll('.showcase').forEach(section=>section.remove());
  applyValueCopy();
  focusDesktopSearch();
  root.FundBlickHomePolish={showFeedback,clearFeedback,applyValueCopy,focusDesktopSearch};
})(typeof window!=='undefined'?window:null);
