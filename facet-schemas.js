'use strict';
const FB_LANG=window.FundBlickLanguage?.lang||'de';
const FB_EXTRA_LABELS={
 de:{bluetooth:'Bluetooth-Version',cableLength:'Kabellänge',resolution:'Auflösung',refresh:'Bildwiederholrate',audience:'Passform / Zielgruppe',material:'Material',terrain:'Untergrund',temperature:'Max. Temperatur',airflow:'Luftmenge',ram:'Arbeitsspeicher',type:'Gerätetyp',capacity:'Wassertank'},
 tr:{bluetooth:'Bluetooth sürümü',cableLength:'Kablo uzunluğu',resolution:'Çözünürlük',refresh:'Yenileme hızı',audience:'Kullanıcı grubu',material:'Malzeme',terrain:'Zemin',temperature:'Maks. sıcaklık',airflow:'Hava akışı',ram:'RAM',type:'Cihaz türü',capacity:'Su haznesi'},
 ru:{bluetooth:'Версия Bluetooth',cableLength:'Длина кабеля',resolution:'Разрешение',refresh:'Частота обновления',audience:'Посадка / группа',material:'Материал',terrain:'Покрытие',temperature:'Макс. температура',airflow:'Поток воздуха',ram:'Оперативная память',type:'Тип устройства',capacity:'Бак для воды'},
 ar:{bluetooth:'إصدار Bluetooth',cableLength:'طول الكابل',resolution:'الدقة',refresh:'معدل التحديث',audience:'الفئة المستهدفة',material:'المادة',terrain:'نوع السطح',temperature:'أقصى حرارة',airflow:'تدفق الهواء',ram:'الذاكرة RAM',type:'نوع الجهاز',capacity:'خزان الماء'},
 pl:{bluetooth:'Wersja Bluetooth',cableLength:'Długość kabla',resolution:'Rozdzielczość',refresh:'Częstotliwość odświeżania',audience:'Grupa docelowa',material:'Materiał',terrain:'Nawierzchnia',temperature:'Maks. temperatura',airflow:'Przepływ powietrza',ram:'Pamięć RAM',type:'Typ urządzenia',capacity:'Zbiornik wody'},
 ro:{bluetooth:'Versiune Bluetooth',cableLength:'Lungime cablu',resolution:'Rezoluție',refresh:'Rată de reîmprospătare',audience:'Grupă țintă',material:'Material',terrain:'Suprafață',temperature:'Temperatură max.',airflow:'Debit de aer',ram:'Memorie RAM',type:'Tip aparat',capacity:'Rezervor apă'},
 uk:{bluetooth:'Версія Bluetooth',cableLength:'Довжина кабелю',resolution:'Роздільна здатність',refresh:'Частота оновлення',audience:'Цільова група',material:'Матеріал',terrain:'Покриття',temperature:'Макс. температура',airflow:'Потік повітря',ram:'Оперативна пам’ять',type:'Тип пристрою',capacity:'Бак для води'},
 en:{bluetooth:'Bluetooth version',cableLength:'Cable length',resolution:'Resolution',refresh:'Refresh rate',audience:'Fit / audience',material:'Material',terrain:'Terrain',temperature:'Max. temperature',airflow:'Airflow',ram:'RAM',type:'Device type',capacity:'Water tank'},
 it:{bluetooth:'Versione Bluetooth',cableLength:'Lunghezza cavo',resolution:'Risoluzione',refresh:'Frequenza di aggiornamento',audience:'Vestibilità / target',material:'Materiale',terrain:'Terreno',temperature:'Temperatura max.',airflow:'Flusso d’aria',ram:'RAM',type:'Tipo di apparecchio',capacity:'Serbatoio acqua'},
 bg:{bluetooth:'Версия Bluetooth',cableLength:'Дължина на кабела',resolution:'Резолюция',refresh:'Честота на опресняване',audience:'Целева група',material:'Материал',terrain:'Настилка',temperature:'Макс. температура',airflow:'Въздушен поток',ram:'RAM памет',type:'Тип уред',capacity:'Резервоар за вода'},
 hr:{bluetooth:'Bluetooth verzija',cableLength:'Duljina kabela',resolution:'Rezolucija',refresh:'Brzina osvježavanja',audience:'Ciljana skupina',material:'Materijal',terrain:'Podloga',temperature:'Maks. temperatura',airflow:'Protok zraka',ram:'RAM',type:'Vrsta uređaja',capacity:'Spremnik vode'},
 el:{bluetooth:'Έκδοση Bluetooth',cableLength:'Μήκος καλωδίου',resolution:'Ανάλυση',refresh:'Ρυθμός ανανέωσης',audience:'Κοινό / εφαρμογή',material:'Υλικό',terrain:'Έδαφος',temperature:'Μέγ. θερμοκρασία',airflow:'Ροή αέρα',ram:'RAM',type:'Τύπος συσκευής',capacity:'Δοχείο νερού'},
 sr:{bluetooth:'Bluetooth верзија',cableLength:'Дужина кабла',resolution:'Резолуција',refresh:'Освежавање',audience:'Циљна група',material:'Материјал',terrain:'Подлога',temperature:'Макс. температура',airflow:'Проток ваздуха',ram:'RAM',type:'Тип уређаја',capacity:'Резервоар за воду'},
 es:{bluetooth:'Versión Bluetooth',cableLength:'Longitud del cable',resolution:'Resolución',refresh:'Frecuencia de actualización',audience:'Público / ajuste',material:'Material',terrain:'Terreno',temperature:'Temperatura máx.',airflow:'Caudal de aire',ram:'RAM',type:'Tipo de aparato',capacity:'Depósito de agua'},
 fr:{bluetooth:'Version Bluetooth',cableLength:'Longueur du câble',resolution:'Résolution',refresh:'Fréquence de rafraîchissement',audience:'Public / coupe',material:'Matière',terrain:'Terrain',temperature:'Température max.',airflow:'Débit d’air',ram:'RAM',type:'Type d’appareil',capacity:'Réservoir d’eau'},
 pt:{bluetooth:'Versão Bluetooth',cableLength:'Comprimento do cabo',resolution:'Resolução',refresh:'Taxa de atualização',audience:'Público / ajuste',material:'Material',terrain:'Terreno',temperature:'Temperatura máx.',airflow:'Fluxo de ar',ram:'RAM',type:'Tipo de aparelho',capacity:'Depósito de água'},
 fa:{bluetooth:'نسخه Bluetooth',cableLength:'طول کابل',resolution:'وضوح تصویر',refresh:'نرخ نوسازی',audience:'گروه هدف',material:'جنس',terrain:'سطح',temperature:'حداکثر دما',airflow:'جریان هوا',ram:'RAM',type:'نوع دستگاه',capacity:'مخزن آب'},
 sq:{bluetooth:'Versioni Bluetooth',cableLength:'Gjatësia e kabllos',resolution:'Rezolucioni',refresh:'Shpejtësia e rifreskimit',audience:'Grupi i synuar',material:'Materiali',terrain:'Terreni',temperature:'Temperatura maks.',airflow:'Rrjedha e ajrit',ram:'RAM',type:'Lloji i pajisjes',capacity:'Rezervuari i ujit'},
 'zh-Hans':{bluetooth:'蓝牙版本',cableLength:'线缆长度',resolution:'分辨率',refresh:'刷新率',audience:'适用人群',material:'材质',terrain:'路面类型',temperature:'最高温度',airflow:'风量',ram:'运行内存',type:'设备类型',capacity:'水箱容量'},
 ku:{bluetooth:'Versiyona Bluetooth',cableLength:'Dirêjahiya kabloyê',resolution:'Rezolûsyon',refresh:'Rêjeya nûkirinê',audience:'Komê armanc',material:'Materyal',terrain:'Zemîn',temperature:'Germa herî zêde',airflow:'Herikîna hewayê',ram:'RAM',type:'Cureyê amûrê',capacity:'Depoya avê'}
};
const fbLabel=(key,fallback)=>FB_EXTRA_LABELS[FB_LANG]?.[key]||FB_EXTRA_LABELS.en[key]||fallback;
window.FB_CATEGORY_SCHEMAS={
 headphones:{label:'Kopfhörer',icon:'🎧',terms:['kopfhörer','kopfhoerer','headphone','headphones','earbuds','in-ear','over-ear'],facets:[
  {key:'connection',label:'Verbindung',type:'multi',values:['Kabellos','Kabelgebunden']},
  {key:'form',label:'Bauform',type:'multi',values:['Over-Ear','In-Ear','On-Ear']},
  {key:'features',label:'Funktionen',type:'multi',values:['Active Noise Cancelling','Multipoint','Mikrofon','Faltbar']},
  {key:'battery',label:'Akkulaufzeit',type:'threshold',unit:'h',values:[20,40,60],when:{facet:'connection',not:'Kabelgebunden'}},
  {key:'bluetooth',label:fbLabel('bluetooth','Bluetooth-Version'),type:'multi',values:['5.0','5.2','5.3','5.4'],when:{facet:'connection',not:'Kabelgebunden'}},
  {key:'cableLength',label:fbLabel('cableLength','Kabellänge'),type:'multi',unit:'m',values:['1.0','1.2','1.5','2.0','3.0'],when:{facet:'connection',equals:'Kabelgebunden'}}
 ]},
 tv:{label:'Fernseher',icon:'📺',terms:['fernseher','tv','oled','qled','smart tv'],facets:[
  {key:'screen',label:'Bildschirmdiagonale',type:'multi',unit:'Zoll',values:['43','50','55','65','75']},
  {key:'panel',label:'Bildschirmtechnik',type:'multi',values:['OLED','QLED','Mini-LED','LED']},
  {key:'resolution',label:fbLabel('resolution','Auflösung'),type:'multi',values:['4K UHD','8K']},
  {key:'refresh',label:fbLabel('refresh','Bildwiederholrate'),type:'threshold',unit:'Hz',values:[60,100,120,144]},
  {key:'features',label:'Ausstattung',type:'multi',values:['HDR','HDMI 2.1','Dolby Vision','Gaming']}
 ]},
 shoes:{label:'Schuhe',icon:'👟',terms:['schuhe','schuh','sneaker','laufschuhe','running shoes','boots'],facets:[
  {key:'size',label:'Größe',type:'multi',values:['36','37','38','39','40','41','42','43','44','45','46']},
  {key:'audience',label:fbLabel('audience','Passform / Zielgruppe'),type:'multi',values:['Damen','Herren','Unisex']},
  {key:'material',label:fbLabel('material','Material'),type:'multi',values:['Textil','Leder','Synthetik','Mesh']},
  {key:'features',label:'Eigenschaften',type:'multi',values:['Wasserdicht','Atmungsaktiv','Dämpfung','Breite Passform']},
  {key:'terrain',label:fbLabel('terrain','Untergrund'),type:'multi',values:['Straße','Trail','Allround'],when:{queryIncludes:['laufschuh','running']}}
 ]},
 heatgun:{label:'Heißluftfön',icon:'♨️',terms:['heißluftfön','heissluftfön','heißluftgebläse','heissluftgebläse','heat gun'],facets:[
  {key:'power',label:'Leistung',type:'threshold',unit:'W',values:[1200,1600,2000,2200]},
  {key:'temperature',label:fbLabel('temperature','Max. Temperatur'),type:'threshold',unit:'°C',values:[400,500,600,650]},
  {key:'airflow',label:fbLabel('airflow','Luftmenge'),type:'threshold',unit:'l/min',values:[300,400,500]},
  {key:'features',label:'Ausstattung',type:'multi',values:['Temperaturregelung','Display','Koffer','Düsen-Set']}
 ]},
 smartphone:{label:'Smartphone',icon:'📱',terms:['smartphone','handy','iphone','galaxy','pixel'],facets:[
  {key:'storage',label:'Speicher',type:'multi',unit:'GB',values:['128','256','512','1024']},
  {key:'screen',label:'Displaygröße',type:'multi',unit:'Zoll',values:['6.1','6.3','6.5','6.7','6.9']},
  {key:'features',label:'Mobilfunk & SIM',type:'multi',values:['5G','Dual-SIM','eSIM']},
  {key:'ram',label:fbLabel('ram','Arbeitsspeicher'),type:'threshold',unit:'GB',values:[6,8,12,16]}
 ]},
 coffee:{label:'Kaffeemaschine',icon:'☕',terms:['kaffeemaschine','kaffeevollautomat','coffee maker','coffee machine','espresso machine'],facets:[
  {key:'type',label:fbLabel('type','Gerätetyp'),type:'multi',values:['Filtermaschine','Vollautomat','Siebträger','Kapselmaschine']},
  {key:'features',label:'Funktionen',type:'multi',values:['Timer','Milchsystem','Mahlwerk','Thermokanne']},
  {key:'capacity',label:fbLabel('capacity','Wassertank'),type:'threshold',unit:'l',values:[1,1.5,2]}
 ]}
};
window.FB_COMMON_FACETS=[
 {key:'price',label:'Gesamtpreis inkl. Versand',type:'price'},
 {key:'brand',label:'Hersteller',type:'brand'},
 {key:'shipping',label:'Versand & Verfügbarkeit',type:'delivery'},
 {key:'rating',label:'Bewertung',type:'rating'},
 {key:'color',label:'Farbe',type:'multi-common'},
 {key:'merchants',label:'Händler & Angebote',type:'merchant'}
];
window.FB_detectCategory=function(query){const q=String(query||'').toLocaleLowerCase('de');let best=null,bestLen=0;for(const [key,s] of Object.entries(window.FB_CATEGORY_SCHEMAS)){for(const term of s.terms){if(q.includes(term)&&term.length>bestLen){best={key,...s};bestLen=term.length}}}return best;};
window.FB_facetVisible=function(facet,state,query){if(!facet.when)return true;const w=facet.when;if(w.queryIncludes&&!w.queryIncludes.some(x=>String(query).toLowerCase().includes(x)))return false;const vals=state?.[w.facet]||[];if(w.equals&&!vals.includes(w.equals))return false;if(w.not&&vals.includes(w.not))return false;return true;};
