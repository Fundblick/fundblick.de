'use strict';
(function(){
  const language=window.FundBlickLanguage?.lang||document.documentElement.lang||'de';

  // Stable FundBlick taxonomy IDs. Merchant/source values are aliases only;
  // filtering continues to use the untouched source value from the checkbox/input.
  const aliases={
    Wildkamera:'trail_camera',
    'Solarpanel für Wildkameras':'trail_camera_solar',
    Kamerahalterung:'camera_mount',
    Hocker:'stool_low',
    Mosaiktisch:'mosaic_table',
    Beistelltisch:'side_table',
    Bistrotisch:'bistro_table',
    Couchtisch:'coffee_table',
    'Esstisch / Gartentisch':'dining_garden_table',
    Stuhl:'chair',
    Bank:'bench',
    'Sessel / Sofa':'armchair_sofa',
    'Kommode / Schrank':'dresser_cabinet',
    Regal:'shelf',
    'Paravent / Raumteiler':'room_divider',
    'Organizer / Stiftehalter':'organizer_pen_holder',
    Holz:'wood',
    Metall:'metal',
    Mosaik:'mosaic',
    Keramik:'ceramic',
    Rattan:'rattan',
    Textil:'textile',
    Leder:'leather',
    Orientalisch:'oriental',
    Mediterran:'mediterranean',
    Marokkanisch:'moroccan',
    Wanddekoration:'wall_decoration',
    'Haken / Hakenleiste':'hooks_hook_rail',
    Laterne:'lantern',
    'Hänge- / Pendelleuchte':'hanging_pendant_light',
    Teelichthalter:'tealight_holder'
  };

  // Add languages here without touching merchant data, filter values or URLs.
  const labels={
    en:{trail_camera:'Trail camera',trail_camera_solar:'Solar panel for trail cameras',camera_mount:'Camera mount'},
    ru:{
      trail_camera:'Фотоловушка',trail_camera_solar:'Солнечная панель для фотоловушек',camera_mount:'Крепление для камеры',
      stool_low:'Пуф / табурет',
      mosaic_table:'Мозаичный стол',
      side_table:'Приставной столик',
      bistro_table:'Стол для бистро',
      coffee_table:'Журнальный столик',
      dining_garden_table:'Обеденный / садовый стол',
      chair:'Стул',
      bench:'Скамья',
      armchair_sofa:'Кресло / диван',
      dresser_cabinet:'Комод / шкаф',
      shelf:'Стеллаж',
      room_divider:'Ширма / перегородка',
      organizer_pen_holder:'Органайзер / подставка для ручек',
      wood:'Дерево',
      metal:'Металл',
      mosaic:'Мозаика',
      ceramic:'Керамика',
      rattan:'Ротанг',
      textile:'Текстиль',
      leather:'Кожа',
      oriental:'Восточный стиль',
      mediterranean:'Средиземноморский стиль',
      moroccan:'Марокканский стиль',
      wall_decoration:'Настенный декор',
      hooks_hook_rail:'Крючки / планка с крючками',
      lantern:'Фонарь',
      hanging_pendant_light:'Подвесной светильник',
      tealight_holder:'Подсвечник для чайной свечи'
    }
  };

  Object.assign(aliases,{"LED-Kerze":"led_candle","LED-Dekolicht":"led_decor_light","Lichterkette":"string_lights","Batterien":"batteries","Fernbedienung":"remote_control","Steh- / Tischlampe":"table_floor_lamp","Figur":"figure","Garten / Außenbereich":"outdoor"});
  const additions={"de":{"led_candle":"LED-Kerze","led_decor_light":"LED-Dekolicht","string_lights":"Lichterkette","batteries":"Batterien","remote_control":"Fernbedienung","table_floor_lamp":"Steh- / Tischlampe","figure":"Figur","outdoor":"Garten / Außenbereich"},"en":{"led_candle":"LED candle","led_decor_light":"LED decorative light","string_lights":"String lights","batteries":"Batteries","remote_control":"Remote control","table_floor_lamp":"Floor / table lamp","figure":"Figurine","outdoor":"Garden / outdoors"},"ru":{"led_candle":"Светодиодная свеча","led_decor_light":"Светодиодный декор","string_lights":"Гирлянда","batteries":"Батарейки","remote_control":"Пульт управления","table_floor_lamp":"Напольная / настольная лампа","figure":"Фигурка","outdoor":"Сад / улица"},"tr":{"led_candle":"LED mum","led_decor_light":"LED dekoratif ışık","string_lights":"Işık zinciri","batteries":"Piller","remote_control":"Uzaktan kumanda","table_floor_lamp":"Ayaklı / masa lambası","figure":"Figür","outdoor":"Bahçe / dış mekân"},"ar":{"led_candle":"شمعة LED","led_decor_light":"إضاءة زخرفية LED","string_lights":"سلسلة أضواء","batteries":"بطاريات","remote_control":"جهاز تحكم عن بعد","table_floor_lamp":"مصباح أرضي / مكتبي","figure":"تمثال صغير","outdoor":"حديقة / خارج المنزل"},"pl":{"led_candle":"Świeca LED","led_decor_light":"Dekoracyjne światło LED","string_lights":"Girlanda świetlna","batteries":"Baterie","remote_control":"Pilot","table_floor_lamp":"Lampa stojąca / stołowa","figure":"Figurka","outdoor":"Ogród / na zewnątrz"},"ro":{"led_candle":"Lumânare LED","led_decor_light":"Lumină decorativă LED","string_lights":"Ghirlandă luminoasă","batteries":"Baterii","remote_control":"Telecomandă","table_floor_lamp":"Lampă de podea / masă","figure":"Figurină","outdoor":"Grădină / exterior"},"uk":{"led_candle":"Світлодіодна свічка","led_decor_light":"Світлодіодний декор","string_lights":"Гірлянда","batteries":"Батарейки","remote_control":"Пульт керування","table_floor_lamp":"Підлогова / настільна лампа","figure":"Фігурка","outdoor":"Сад / вулиця"},"it":{"led_candle":"Candela LED","led_decor_light":"Luce decorativa LED","string_lights":"Catena luminosa","batteries":"Batterie","remote_control":"Telecomando","table_floor_lamp":"Lampada da terra / tavolo","figure":"Statuetta","outdoor":"Giardino / esterno"},"bg":{"led_candle":"LED свещ","led_decor_light":"LED декоративна светлина","string_lights":"Светлинна гирлянда","batteries":"Батерии","remote_control":"Дистанционно управление","table_floor_lamp":"Подова / настолна лампа","figure":"Фигурка","outdoor":"Градина / навън"},"hr":{"led_candle":"LED svijeća","led_decor_light":"LED ukrasno svjetlo","string_lights":"Svjetlosni lanac","batteries":"Baterije","remote_control":"Daljinski upravljač","table_floor_lamp":"Podna / stolna svjetiljka","figure":"Figurica","outdoor":"Vrt / vanjski prostor"},"el":{"led_candle":"Κερί LED","led_decor_light":"Διακοσμητικό φως LED","string_lights":"Φωτεινή γιρλάντα","batteries":"Μπαταρίες","remote_control":"Τηλεχειριστήριο","table_floor_lamp":"Επιδαπέδιο / επιτραπέζιο φωτιστικό","figure":"Διακοσμητικό αγαλματίδιο","outdoor":"Κήπος / εξωτερικός χώρος"},"sr":{"led_candle":"LED свећа","led_decor_light":"LED украсно светло","string_lights":"Светлосни ланац","batteries":"Батерије","remote_control":"Даљински управљач","table_floor_lamp":"Подна / стона лампа","figure":"Фигурица","outdoor":"Башта / спољни простор"},"es":{"led_candle":"Vela LED","led_decor_light":"Luz decorativa LED","string_lights":"Guirnalda de luces","batteries":"Pilas","remote_control":"Mando a distancia","table_floor_lamp":"Lámpara de pie / mesa","figure":"Figura","outdoor":"Jardín / exterior"},"fr":{"led_candle":"Bougie LED","led_decor_light":"Lumière décorative LED","string_lights":"Guirlande lumineuse","batteries":"Piles","remote_control":"Télécommande","table_floor_lamp":"Lampadaire / lampe de table","figure":"Figurine","outdoor":"Jardin / extérieur"},"pt":{"led_candle":"Vela LED","led_decor_light":"Luz decorativa LED","string_lights":"Grinalda de luzes","batteries":"Pilhas","remote_control":"Comando à distância","table_floor_lamp":"Candeeiro de pé / mesa","figure":"Figura","outdoor":"Jardim / exterior"},"fa":{"led_candle":"شمع LED","led_decor_light":"چراغ تزئینی LED","string_lights":"ریسه چراغ","batteries":"باتری","remote_control":"کنترل از راه دور","table_floor_lamp":"چراغ ایستاده / رومیزی","figure":"مجسمه کوچک","outdoor":"باغ / فضای باز"},"sq":{"led_candle":"Qiri LED","led_decor_light":"Dritë dekorative LED","string_lights":"Varg dritash","batteries":"Bateri","remote_control":"Telekomandë","table_floor_lamp":"Llambë dyshemeje / tavoline","figure":"Figurinë","outdoor":"Kopsht / jashtë"},"zh-Hans":{"led_candle":"LED蜡烛","led_decor_light":"LED装饰灯","string_lights":"灯串","batteries":"电池","remote_control":"遥控器","table_floor_lamp":"落地灯 / 台灯","figure":"装饰摆件","outdoor":"花园 / 户外"},"ku":{"led_candle":"Mûma LED","led_decor_light":"Ronahiya xemilandinê ya LED","string_lights":"Zincîra ronahiyan","batteries":"Pîl","remote_control":"Kontrola ji dûr","table_floor_lamp":"Çiraya erdê / masê","figure":"Peykerok","outdoor":"Baxçe / derve"}};
  for(const [lang,values] of Object.entries(additions))Object.assign(labels[lang]||(labels[lang]={}),values);
  const colourNames=["Rosa","Weiß","Schwarz","Grau","Blau","Grün","Rot","Gelb","Violet","Karamell","Creme","Beige","Bordeaux","Orange","Sand","Lavendel","Magenta","Messing","Kupfer","Silber","Elfenbein","Minze","Mokka","Petroleum","Curry","Jadegrün","Olivgrün","Salbeigrün","Königsblau","Heidelbeerblau"],colourRows={"de":"Rosa|Weiß|Schwarz|Grau|Blau|Grün|Rot|Gelb|Violett|Karamell|Creme|Beige|Bordeaux|Orange|Sand|Lavendel|Magenta|Messing|Kupfer|Silber|Elfenbein|Minze|Mokka|Petrol|Curry|Jadegrün|Olivgrün|Salbeigrün|Königsblau|Heidelbeerblau|Hell|Dunkel|Verblasst","en":"Pink|White|Black|Grey|Blue|Green|Red|Yellow|Purple|Caramel|Cream|Beige|Burgundy|Orange|Sand|Lavender|Magenta|Brass|Copper|Silver|Ivory|Mint|Mocha|Petrol blue|Curry|Jade green|Olive green|Sage green|Royal blue|Blueberry blue|Light|Dark|Muted","ru":"Розовый|Белый|Чёрный|Серый|Синий|Зелёный|Красный|Жёлтый|Фиолетовый|Карамельный|Кремовый|Бежевый|Бордовый|Оранжевый|Песочный|Лавандовый|Маджента|Латунный|Медный|Серебристый|Слоновая кость|Мятный|Мокко|Сине-зелёный|Карри|Нефритовый зелёный|Оливковый|Шалфейный зелёный|Королевский синий|Черничный синий|Светлый|Тёмный|Приглушённый","tr":"Pembe|Beyaz|Siyah|Gri|Mavi|Yeşil|Kırmızı|Sarı|Mor|Karamel|Krem|Bej|Bordo|Turuncu|Kum|Lavanta|Macenta|Pirinç|Bakır|Gümüş|Fildişi|Nane|Moka|Petrol mavisi|Köri|Yeşim yeşili|Zeytin yeşili|Adaçayı yeşili|Kraliyet mavisi|Yaban mersini mavisi|Açık|Koyu|Soluk","ar":"وردي|أبيض|أسود|رمادي|أزرق|أخضر|أحمر|أصفر|بنفسجي|كراميل|كريمي|بيج|عنابي|برتقالي|رملي|لافندر|أرجواني|نحاسي أصفر|نحاسي|فضي|عاجي|نعناعي|موكا|أزرق بترولي|كاري|أخضر يشمي|أخضر زيتوني|أخضر المريمية|أزرق ملكي|أزرق التوت|فاتح|داكن|باهت","pl":"Różowy|Biały|Czarny|Szary|Niebieski|Zielony|Czerwony|Żółty|Fioletowy|Karmelowy|Kremowy|Beżowy|Bordowy|Pomarańczowy|Piaskowy|Lawendowy|Magenta|Mosiężny|Miedziany|Srebrny|Kość słoniowa|Miętowy|Mokka|Petrolowy|Curry|Jadeitowy zielony|Oliwkowy|Szałwiowy|Królewski niebieski|Jagodowy niebieski|Jasny|Ciemny|Przygaszony","ro":"Roz|Alb|Negru|Gri|Albastru|Verde|Roșu|Galben|Violet|Caramel|Crem|Bej|Bordo|Portocaliu|Nisip|Lavandă|Magenta|Alamă|Cupru|Argintiu|Fildeș|Mentă|Moca|Albastru petrol|Curry|Verde jad|Verde măsliniu|Verde salvie|Albastru regal|Albastru afină|Deschis|Închis|Estompat","uk":"Рожевий|Білий|Чорний|Сірий|Синій|Зелений|Червоний|Жовтий|Фіолетовий|Карамельний|Кремовий|Бежевий|Бордовий|Помаранчевий|Пісочний|Лавандовий|Маджента|Латунний|Мідний|Сріблястий|Слонова кістка|М’ятний|Мокко|Синьо-зелений|Карі|Нефритовий зелений|Оливковий|Шавлієвий зелений|Королівський синій|Чорничний синій|Світлий|Темний|Приглушений","it":"Rosa|Bianco|Nero|Grigio|Blu|Verde|Rosso|Giallo|Viola|Caramello|Crema|Beige|Bordeaux|Arancione|Sabbia|Lavanda|Magenta|Ottone|Rame|Argento|Avorio|Menta|Moka|Blu petrolio|Curry|Verde giada|Verde oliva|Verde salvia|Blu reale|Blu mirtillo|Chiaro|Scuro|Tenue","bg":"Розово|Бяло|Черно|Сиво|Синьо|Зелено|Червено|Жълто|Лилаво|Карамел|Кремаво|Бежово|Бордо|Оранжево|Пясъчно|Лавандула|Магента|Месинг|Мед|Сребро|Слонова кост|Мента|Мока|Петролено синьо|Къри|Нефритено зелено|Маслинено зелено|Градински чай|Кралско синьо|Боровинково синьо|Светло|Тъмно|Приглушено","hr":"Ružičasta|Bijela|Crna|Siva|Plava|Zelena|Crvena|Žuta|Ljubičasta|Karamela|Krem|Bež|Bordo|Narančasta|Pijesak|Lavanda|Magenta|Mjed|Bakar|Srebro|Bjelokost|Menta|Moka|Petrolej plava|Curry|Žad zelena|Maslinasto zelena|Kadulja zelena|Kraljevsko plava|Borovnica plava|Svijetlo|Tamno|Prigušeno","el":"Ροζ|Λευκό|Μαύρο|Γκρι|Μπλε|Πράσινο|Κόκκινο|Κίτρινο|Μωβ|Καραμέλα|Κρεμ|Μπεζ|Μπορντό|Πορτοκαλί|Άμμος|Λεβάντα|Ματζέντα|Ορείχαλκος|Χαλκός|Ασημί|Ελεφαντόδοντο|Μέντα|Μόκα|Μπλε πετρόλ|Κάρι|Πράσινο νεφρίτη|Λαδί|Πράσινο φασκόμηλου|Βασιλικό μπλε|Μπλε μύρτιλου|Ανοιχτό|Σκούρο|Απαλό","sr":"Ружичаста|Бела|Црна|Сива|Плава|Зелена|Црвена|Жута|Љубичаста|Карамела|Крем|Беж|Бордо|Наранџаста|Песак|Лаванда|Магента|Месинг|Бакар|Сребро|Слоновача|Нана|Мока|Петрол плава|Кари|Жад зелена|Маслинасто зелена|Жалфија зелена|Краљевско плава|Боровница плава|Светло|Тамно|Пригушено","es":"Rosa|Blanco|Negro|Gris|Azul|Verde|Rojo|Amarillo|Violeta|Caramelo|Crema|Beige|Burdeos|Naranja|Arena|Lavanda|Magenta|Latón|Cobre|Plata|Marfil|Menta|Moca|Azul petróleo|Curry|Verde jade|Verde oliva|Verde salvia|Azul real|Azul arándano|Claro|Oscuro|Apagado","fr":"Rose|Blanc|Noir|Gris|Bleu|Vert|Rouge|Jaune|Violet|Caramel|Crème|Beige|Bordeaux|Orange|Sable|Lavande|Magenta|Laiton|Cuivre|Argent|Ivoire|Menthe|Moka|Bleu pétrole|Curry|Vert jade|Vert olive|Vert sauge|Bleu royal|Bleu myrtille|Clair|Foncé|Atténué","pt":"Rosa|Branco|Preto|Cinzento|Azul|Verde|Vermelho|Amarelo|Violeta|Caramelo|Creme|Bege|Bordô|Laranja|Areia|Lavanda|Magenta|Latão|Cobre|Prata|Marfim|Menta|Moca|Azul petróleo|Caril|Verde jade|Verde oliva|Verde sálvia|Azul real|Azul mirtilo|Claro|Escuro|Suave","fa":"صورتی|سفید|سیاه|خاکستری|آبی|سبز|قرمز|زرد|بنفش|کاراملی|کرم|بژ|زرشکی|نارنجی|شنی|اسطوخودوسی|سرخابی|برنجی|مسی|نقره‌ای|عاجی|نعنایی|موکا|آبی نفتی|کاری|سبز یشمی|سبز زیتونی|سبز مریم‌گلی|آبی سلطنتی|آبی بلوبری|روشن|تیره|ملایم","sq":"Rozë|Bardhë|Zezë|Gri|Blu|Gjelbër|Kuqe|Verdhë|Vjollcë|Karamel|Krem|Bezhë|Bordo|Portokalli|Rërë|Livando|Magenta|Tunxh|Bakër|Argjend|Fildish|Mente|Moka|Blu nafte|Kari|Gjelbër nefriti|Gjelbër ulliri|Gjelbër sherebele|Blu mbretërore|Blu boronice|Çelët|Errët|Zbehur","zh-Hans":"粉色|白色|黑色|灰色|蓝色|绿色|红色|黄色|紫色|焦糖色|奶油色|米色|酒红色|橙色|沙色|薰衣草色|品红色|黄铜色|铜色|银色|象牙色|薄荷色|摩卡色|石油蓝|咖喱色|翡翠绿|橄榄绿|鼠尾草绿|宝蓝色|蓝莓蓝|浅色|深色|柔和","ku":"Pembe|Spî|Reş|Gewr|Şîn|Kesk|Sor|Zer|Mor|Karamel|Krem|Bej|Bordo|Porteqalî|Qûm|Lavanta|Macenta|Tunc|Sifir|Zîv|Hestiyê fîl|Nane|Moka|Şîna petrolê|Karî|Keska jade|Keska zeytûnê|Keska salviyê|Şîna şahane|Şîna şînberiyê|Vekirî|Tarî|Solî"},colourParts={"Hellrosa":["Rosa","Light"],"Dunkelgrau":["Grau","Dark"],"Dunkelgrün":["Grün","Dark"],"Dunkellila":["Violet","Dark"],"Hellgelb":["Gelb","Light"],"Hellgrau":["Grau","Light"],"Hellkaramell":["Karamell","Light"],"Helllila":["Violet","Light"],"Verblasst Blau":["Blau","Muted"],"Verblasst Grün":["Grün","Muted"],"Verblasst Rot":["Rot","Muted"],"Eisblau":["Blau","Ice"],"Burgunderrot":["Bordeaux",null]},iceLabels={"de":"Eis","en":"Ice","ru":"Ледяной","tr":"Buz","ar":"جليدي","pl":"Lodowy","ro":"Gheață","uk":"Крижаний","it":"Ghiaccio","bg":"Ледено","hr":"Ledeno","el":"Πάγου","sr":"Ледено","es":"Hielo","fr":"Glace","pt":"Gelo","fa":"یخی","sq":"Akull","zh-Hans":"冰","ku":"Qeşayî"};
  for(const [lang,row] of Object.entries(colourRows)){const values=row.split('|'),colourDictionary=Object.fromEntries(colourNames.map((name,i)=>[name,values[i]]));for(const [name,[base,tone]] of Object.entries(colourParts)){const modifier=tone==='Ice'?iceLabels[lang]:values[{Light:30,Dark:31,Muted:32}[tone]];colourDictionary[name]=tone?colourDictionary[base]+' ('+modifier+')':colourDictionary[base];}for(const [name,value] of Object.entries(colourDictionary)){const id='colour:'+name;aliases[name]=id;(labels[lang]||(labels[lang]={}))[id]=value;}}
  const dictionary=labels[language]||{};
  if(!Object.keys(dictionary).length)return;

  const translate=raw=>{
    const id=aliases[String(raw||'').trim()];
    return id&&dictionary[id]||raw;
  };

  function translateCheckboxLabels(){
    document.querySelectorAll('#filters label').forEach(label=>{
      const input=label.querySelector('input[type="checkbox"]');
      if(!input||input.dataset.key==='brand')return;
      const translated=translate(input.value);
      if(translated===input.value)return;
      const text=[...label.childNodes].find(node=>node.nodeType===3&&node.textContent.trim());
      if(text&&text.textContent.trim()!==translated)text.textContent=' '+translated+' ';
    });
  }

  function translateChips(){
    document.querySelectorAll('#chips button[data-remove]').forEach(button=>{
      const raw=button.dataset.remove||'';
      const pos=raw.indexOf(':');
      if(pos<0)return;
      const key=raw.slice(0,pos),value=raw.slice(pos+1);
      if(key==='brand')return;
      const translated=translate(value);
      if(translated!==value&&button.textContent!==translated+' ×')button.textContent=translated+' ×';
    });
  }

  function translateProductTags(){
    document.querySelectorAll('.product .tags span, .product .product-type bdi').forEach(span=>{
      const original=span.textContent.trim();
      const translated=translate(original);
      if(translated!==original)span.textContent=translated;
    });
  }

  let busy=false;
  function apply(){
    if(busy)return;
    busy=true;
    translateCheckboxLabels();
    translateChips();
    translateProductTags();
    busy=false;
  }

  const targets=['filters','chips','cards'].map(id=>document.getElementById(id)).filter(Boolean);
  const observer=new MutationObserver(()=>queueMicrotask(apply));
  targets.forEach(target=>observer.observe(target,{childList:true,subtree:true,characterData:true}));
  apply();

  window.FundBlickTaxonomyI18n={translate,aliases,labels};
})();