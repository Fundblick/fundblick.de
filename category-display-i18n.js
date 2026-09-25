'use strict';
(function(){
  const lang=window.FundBlickLanguage?.lang||'de';
  const labels={
    de:{headphones:'Kopfhörer',tv:'Fernseher',shoes:'Schuhe',heatgun:'Heißluftfön',smartphone:'Smartphones',coffee:'Kaffeemaschinen'},
    tr:{headphones:'Kulaklık',tv:'Televizyon',shoes:'Ayakkabı',heatgun:'Sıcak hava tabancası',smartphone:'Akıllı telefonlar',coffee:'Kahve makineleri'},
    ru:{headphones:'Наушники',tv:'Телевизоры',shoes:'Обувь',heatgun:'Термопистолеты',smartphone:'Смартфоны',coffee:'Кофемашины'},
    ar:{headphones:'سماعات',tv:'تلفزيونات',shoes:'أحذية',heatgun:'مسدسات هواء ساخن',smartphone:'هواتف ذكية',coffee:'آلات قهوة'},
    pl:{headphones:'Słuchawki',tv:'Telewizory',shoes:'Buty',heatgun:'Opalarki',smartphone:'Smartfony',coffee:'Ekspresy do kawy'},
    ro:{headphones:'Căști',tv:'Televizoare',shoes:'Pantofi',heatgun:'Pistoale cu aer cald',smartphone:'Smartphone-uri',coffee:'Aparate de cafea'},
    uk:{headphones:'Навушники',tv:'Телевізори',shoes:'Взуття',heatgun:'Термопістолети',smartphone:'Смартфони',coffee:'Кавомашини'},
    en:{headphones:'Headphones',tv:'Televisions',shoes:'Shoes',heatgun:'Heat guns',smartphone:'Smartphones',coffee:'Coffee machines'},
    it:{headphones:'Cuffie',tv:'Televisori',shoes:'Scarpe',heatgun:'Pistole termiche',smartphone:'Smartphone',coffee:'Macchine da caffè'},
    bg:{headphones:'Слушалки',tv:'Телевизори',shoes:'Обувки',heatgun:'Пистолети за горещ въздух',smartphone:'Смартфони',coffee:'Кафемашини'},
    hr:{headphones:'Slušalice',tv:'Televizori',shoes:'Cipele',heatgun:'Pištolji na vrući zrak',smartphone:'Pametni telefoni',coffee:'Aparati za kavu'},
    el:{headphones:'Ακουστικά',tv:'Τηλεοράσεις',shoes:'Παπούτσια',heatgun:'Πιστόλια θερμού αέρα',smartphone:'Smartphone',coffee:'Καφετιέρες'},
    sr:{headphones:'Слушалице',tv:'Телевизори',shoes:'Обућа',heatgun:'Пиштољи на врућ ваздух',smartphone:'Паметни телефони',coffee:'Апарати за кафу'},
    es:{headphones:'Auriculares',tv:'Televisores',shoes:'Zapatos',heatgun:'Pistolas de aire caliente',smartphone:'Smartphones',coffee:'Cafeteras'},
    fr:{headphones:'Casques',tv:'Téléviseurs',shoes:'Chaussures',heatgun:'Décapeurs thermiques',smartphone:'Smartphones',coffee:'Machines à café'},
    pt:{headphones:'Auscultadores',tv:'Televisores',shoes:'Calçado',heatgun:'Pistolas de ar quente',smartphone:'Smartphones',coffee:'Máquinas de café'},
    fa:{headphones:'هدفون',tv:'تلویزیون',shoes:'کفش',heatgun:'سشوار صنعتی',smartphone:'گوشی هوشمند',coffee:'دستگاه قهوه'},
    sq:{headphones:'Kufje',tv:'Televizorë',shoes:'Këpucë',heatgun:'Pistoleta me ajër të nxehtë',smartphone:'Telefona inteligjentë',coffee:'Aparate kafeje'},
    'zh-Hans':{headphones:'耳机',tv:'电视',shoes:'鞋',heatgun:'热风枪',smartphone:'智能手机',coffee:'咖啡机'},
    ku:{headphones:'Guhdar',tv:'Televîzyon',shoes:'Pêlav',heatgun:'Tabancên hewaya germ',smartphone:'Telefonên jîr',coffee:'Makîneyên qehweyê'}
  };
  const selected=labels[lang]||labels.en;
  const schemas=window.FB_CATEGORY_SCHEMAS||{};
  for(const [id,label] of Object.entries(selected))if(schemas[id])schemas[id].label=label;
  window.FB_CATEGORY_DISPLAY_LABELS=selected;
})();
