'use strict';
(function () {
  const SCHEMAS=typeof window!=='undefined'?(window.FB_CATEGORY_SCHEMAS||{}):{};
  const COLOR_WORDS={Schwarz:/\bblack\b|\bschwarz\b/i,Weiß:/\bwhite\b|\bwei[ßs]\b/i,Blau:/\bblue\b|\bblau\b/i,Rot:/\bred\b|\brot\b/i};
  const FALLBACK_RULES=[
    {id:'headphones',label:'Kopfhörer',query:/kopfh[oö]rer|headphones?|earbuds?|in.?ear|over.?ear/i,product:/headphones?|earbuds?|earphones?|kopfh[oö]rer/i},
    {id:'tv',label:'Fernseher',query:/fernseher|television|\btv\b|\boled\b|\bqled\b/i,product:/television|smart tv|fernseher|\btv\b/i},
    {id:'shoes',label:'Schuhe',query:/\b(?:schuhe?|sneakers?|laufschuhe?|running shoes|boots?)\b/i,product:/\b(?:shoes?|sneakers?|cleats?|heels?|sandals?|espadrilles?|boots?|slippers?|schuhe?)\b/i},
    {id:'smartphone',label:'Smartphone',query:/smartphones?|handys?|iphone|galaxy|pixel phone/i,product:/smartphones?|iphone|mobile phone|galaxy|pixel phone/i},
    {id:'coffee',label:'Kaffeemaschine',query:/kaffeemaschine|coffee maker|coffee machine|espresso machine/i,product:/coffee maker|coffee machine|espresso machine|kaffeemaschine/i},
    {id:'heatgun',label:'Heißluftfön',query:/hei[ßs]luftf[oö]n|hei[ßs]luftgebläse|heat gun/i,product:/heat gun|hei[ßs]luftf[oö]n|hei[ßs]luftgebläse/i}
  ];

  const queryAliases=[
    [/(?:наушники|навушники|kulakl[ıi]k|cuffie|سماعات|headphones?|słuchawki|căști|слушалки|slušalice|ακουστικά|слушалице|auriculares|casques?|écouteurs|auscultadores|هدفون|kufje|耳机|guhêdar(?:ên)?)/giu,'Kopfhörer'],
    [/(?:обувь|взуття|ayakkab[ıi]|scarpe|أحذية|shoes?|buty|pantofi|обувки|cipele|παπούτσια|обућа|zapatos|chaussures|calçado|کفش|këpucë|鞋|pêlav)/giu,'Schuhe'],
    [/(?:смартфон[ыа]?|смартфон[иів]?|ak[ıi]ll[ıi] telefonlar?|هواتف ذكية|هاتف ذكي|smartphones?|smartfony|telefon inteligent|смартфони|pametni telefoni|smartphone-uri?|teléfono inteligente|téléphone intelligent|telemóvel inteligente|گوشی هوشمند|telefon inteligjent|智能手机|telefonên jîr)/giu,'Smartphone'],
    [/(?:телевизор[ыа]?|телевізор[иів]?|televizyon|televisione|تلفاز|تلفزيون|telewizor|televizor|телевизор|τηλεόραση|televisor|téléviseur|televisão|تلویزیون|电视|televîzyon)/giu,'Fernseher'],
    [/(?:кофемашин[аыу]|кавомашин[аыу]|kahve makinesi|macchina da caffè|آلة قهوة|ekspres do kawy|aparat de cafea|кафемашина|aparat za kavu|καφετιέρα|aparat za kafu|cafetera|machine à café|máquina de café|دستگاه قهوه|aparat kafeje|咖啡机|makîneya qehweyê)/giu,'Kaffeemaschine'],
    [/(?:беспроводн(?:ые|ой|ая)|бездротов(?:і|ий|а)|kablosuz|senza fili|لاسلكي(?:ة)?|bezprzewodow\w*|fără fir|безжичн\w*|bežičn\w*|ασύρματ\w*|бежичн\w*|inalámbric\w*|sans fil|sem fios|بی‌سیم|pa tela|无线|bê têl|wireless)/giu,'kabellos']
  ];

  const qEl=typeof document!=='undefined'?document.querySelector('#query'):null;
  if(!qEl){if(typeof module!=='undefined')module.exports={detect,normalize,features};return;}

  const language=window.FundBlickLanguage||{lang:'de',config:{locale:'de-DE'},t:{},translate:key=>key};
  const tx=key=>language.translate(key);
  const locale=language.config?.locale||'de-DE';
  const facetLabels={connection:'connection',form:'form',features:'features',battery:'battery',screen:'screen',panel:'panel',size:'size',color:'color',storage:'storage',power:'power',shipping:'shipping'};
  const categoryLabels={headphones:'categoryHeadphones',shoes:'categoryShoes',smartphone:'categoryPhones'};
  const valueLabels={
    de:{Kabellos:'Kabellos',Kabelgebunden:'Kabelgebunden',Schwarz:'Schwarz',Weiß:'Weiß',Blau:'Blau',Rot:'Rot'},
    tr:{Kabellos:'Kablosuz',Kabelgebunden:'Kablolu',Schwarz:'Siyah',Weiß:'Beyaz',Blau:'Mavi',Rot:'Kırmızı'},
    ru:{Kabellos:'Беспроводные',Kabelgebunden:'Проводные',Schwarz:'Чёрный',Weiß:'Белый',Blau:'Синий',Rot:'Красный'},
    ar:{Kabellos:'لاسلكي',Kabelgebunden:'سلكي',Schwarz:'أسود',Weiß:'أبيض',Blau:'أزرق',Rot:'أحمر'},
    pl:{Kabellos:'Bezprzewodowe',Kabelgebunden:'Przewodowe',Schwarz:'Czarny',Weiß:'Biały',Blau:'Niebieski',Rot:'Czerwony'},
    ro:{Kabellos:'Fără fir',Kabelgebunden:'Cu fir',Schwarz:'Negru',Weiß:'Alb',Blau:'Albastru',Rot:'Roșu'},
    uk:{Kabellos:'Бездротові',Kabelgebunden:'Дротові',Schwarz:'Чорний',Weiß:'Білий',Blau:'Синій',Rot:'Червоний'},
    en:{Kabellos:'Wireless',Kabelgebunden:'Wired',Schwarz:'Black',Weiß:'White',Blau:'Blue',Rot:'Red'},
    it:{Kabellos:'Senza fili',Kabelgebunden:'Con cavo',Schwarz:'Nero',Weiß:'Bianco',Blau:'Blu',Rot:'Rosso'},
    bg:{Kabellos:'Безжични',Kabelgebunden:'С кабел',Schwarz:'Черен',Weiß:'Бял',Blau:'Син',Rot:'Червен'},
    hr:{Kabellos:'Bežično',Kabelgebunden:'Žično',Schwarz:'Crna',Weiß:'Bijela',Blau:'Plava',Rot:'Crvena'},
    el:{Kabellos:'Ασύρματο',Kabelgebunden:'Ενσύρματο',Schwarz:'Μαύρο',Weiß:'Λευκό',Blau:'Μπλε',Rot:'Κόκκινο'},
    sr:{Kabellos:'Бежично',Kabelgebunden:'Жично',Schwarz:'Црна',Weiß:'Бела',Blau:'Плава',Rot:'Црвена'},
    es:{Kabellos:'Inalámbrico',Kabelgebunden:'Con cable',Schwarz:'Negro',Weiß:'Blanco',Blau:'Azul',Rot:'Rojo'},
    fr:{Kabellos:'Sans fil',Kabelgebunden:'Filaire',Schwarz:'Noir',Weiß:'Blanc',Blau:'Bleu',Rot:'Rouge'},
    pt:{Kabellos:'Sem fios',Kabelgebunden:'Com fios',Schwarz:'Preto',Weiß:'Branco',Blau:'Azul',Rot:'Vermelho'},
    fa:{Kabellos:'بی‌سیم',Kabelgebunden:'سیمی',Schwarz:'مشکی',Weiß:'سفید',Blau:'آبی',Rot:'قرمز'},
    sq:{Kabellos:'Pa tela',Kabelgebunden:'Me kabllo',Schwarz:'E zezë',Weiß:'E bardhë',Blau:'Blu',Rot:'E kuqe'},
    'zh-Hans':{Kabellos:'无线',Kabelgebunden:'有线',Schwarz:'黑色',Weiß:'白色',Blau:'蓝色',Rot:'红色'},
    ku:{Kabellos:'Bê têl',Kabelgebunden:'Bi têl',Schwarz:'Reş',Weiß:'Spî',Blau:'Şîn',Rot:'Sor'}
  };
  const displayValue=value=>valueLabels[language.lang]?.[value]||String(value);
  const removeWord={de:'Filter entfernen',tr:'Filtreyi kaldır',ru:'Удалить фильтр',ar:'إزالة الفلتر',pl:'Usuń filtr',ro:'Elimină filtrul',uk:'Прибрати фільтр',en:'Remove filter',it:'Rimuovi filtro',bg:'Премахни филтъра',hr:'Ukloni filtar',el:'Αφαίρεση φίλτρου',sr:'Уклони филтер',es:'Eliminar filtro',fr:'Retirer le filtre',pt:'Remover filtro',fa:'حذف فیلتر',sq:'Hiq filtrin','zh-Hans':'移除筛选',ku:'Parzûnê rake'};

  const filtersEl=document.querySelector('#filters'),cardsEl=document.querySelector('#cards'),summaryEl=document.querySelector('#summary'),chipsEl=document.querySelector('#chips'),sortEl=document.querySelector('#sort');
  const params=new URLSearchParams(location.search);
  const state={query:params.get('q')||'',min:asNumber(params.get('min')),max:asNumber(params.get('max')),brands:new Set((params.get('brand')||'').split(',').filter(Boolean)),facets:{},sort:params.get('sort')||'relevance'};
  let products=[],category=null,base=[];
  try{const saved=JSON.parse(params.get('facets')||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))for(const [k,v] of Object.entries(saved))if(Array.isArray(v))state.facets[k]=new Set(v.map(String));}catch{}
  qEl.value=state.query;if([...sortEl.options].some(x=>x.value===state.sort))sortEl.value=state.sort;

  function asNumber(v){return v!==null&&v!==''&&Number.isFinite(Number(v))&&Number(v)>=0?Number(v):null}
  const maybeNumber=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase(locale).trim();
  const money=n=>new Intl.NumberFormat(locale,{style:'currency',currency:'EUR'}).format(n);
  const escapeRegExp=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const valuesOf=v=>Array.isArray(v)?v:(v===undefined||v===null||v===''?[]:[v]);

  function detect(query){
    if(typeof window.FB_detectCategory==='function'){const hit=window.FB_detectCategory(query);if(hit)return hit;}
    return FALLBACK_RULES.find(c=>c.query.test(query))||null;
  }
  function schemaFor(id){return SCHEMAS[id]||null}
  function categoryTermsRegex(cat){const terms=(schemaFor(cat?.id)?.terms||[]).filter(Boolean);return terms.length?new RegExp(terms.sort((a,b)=>b.length-a.length).map(escapeRegExp).join('|'),'ig'):FALLBACK_RULES.find(x=>x.id===cat?.id)?.query||null}
  function inferFamily(text,taxonomy){
    if(taxonomy.startsWith('fashion.shoes'))return 'shoes';
    if(taxonomy.startsWith('electronics.televisions'))return 'tv';
    for(const [id,schema] of Object.entries(SCHEMAS))if((schema.terms||[]).some(term=>norm(text).includes(norm(term))))return id;
    return FALLBACK_RULES.find(c=>c.product.test(text))?.id||null;
  }

  function features(product){
    const text=`${product.name||''} ${product.description||''}`;const found={};const put=(key,value)=>{if(value!==undefined&&value!==null&&value!=='')found[key]=value};const add=(key,value)=>{if(!value)return;const list=Array.isArray(found[key])?found[key]:(found[key]?[found[key]]:[]);if(!list.includes(value))list.push(value);found[key]=list};
    if(product.family==='headphones'){
      if(/bluetooth|wireless|kabellos/i.test(text))put('connection','Kabellos');else if(/wired|kabelgebunden|mit kabel/i.test(text))put('connection','Kabelgebunden');
      const form=text.match(/(over|in|on)[- ]?ear/i);if(form)put('form',form[1][0].toUpperCase()+form[1].slice(1).toLowerCase()+'-Ear');
      if(/noise cancell?ing|\bANC\b/i.test(text))add('features','Active Noise Cancelling');if(/multipoint/i.test(text))add('features','Multipoint');if(/microphone|mikrofon|mic\b/i.test(text))add('features','Mikrofon');if(/foldable|faltbar/i.test(text))add('features','Faltbar');
      const battery=text.match(/(\d{1,3})\s*(?:hours?|stunden|h)\s*(?:battery|akku)?/i);if(battery)put('battery',Number(battery[1]));
      const bt=text.match(/bluetooth\s*(?:version\s*)?(5(?:\.[0-4])?)/i);if(bt)put('bluetooth',bt[1]);const cable=text.match(/(\d(?:[.,]\d)?)\s*m\s*(?:cable|kabel)/i);if(cable)put('cableLength',cable[1].replace(',','.'));
    }
    if(product.family==='tv'){
      const screen=text.match(/\b(\d{2,3})\s*(?:inch(?:es)?|zoll|["″])/i);if(screen)put('screen',screen[1]);const panel=text.match(/\b(OLED|QLED|Mini-LED|LED)\b/i);if(panel)put('panel',panel[1].toUpperCase());
      if(/\b8K\b/i.test(text))put('resolution','8K');else if(/\b4K\b|UHD/i.test(text))put('resolution','4K UHD');const refresh=text.match(/\b(60|100|120|144)\s*Hz\b/i);if(refresh)put('refresh',Number(refresh[1]));
      if(/HDR/i.test(text))add('features','HDR');if(/HDMI\s*2\.1/i.test(text))add('features','HDMI 2.1');if(/Dolby Vision/i.test(text))add('features','Dolby Vision');if(/gaming/i.test(text))add('features','Gaming');
    }
    if(product.family==='shoes'){
      const size=text.match(/(?:size|gr[oö][ßs]e|EU)\s*(3[6-9]|4[0-6])\b/i);if(size)put('size',size[1]);if(/women|damen/i.test(text))put('audience','Damen');else if(/men|herren/i.test(text))put('audience','Herren');else if(/unisex/i.test(text))put('audience','Unisex');
      if(/leather|leder/i.test(text))put('material','Leder');else if(/mesh/i.test(text))put('material','Mesh');else if(/textil|textile/i.test(text))put('material','Textil');else if(/synthet/i.test(text))put('material','Synthetik');
      if(/waterproof|wasserdicht/i.test(text))add('features','Wasserdicht');if(/breathable|atmungsaktiv/i.test(text))add('features','Atmungsaktiv');if(/cushion|dämpfung/i.test(text))add('features','Dämpfung');if(/wide fit|breite passform/i.test(text))add('features','Breite Passform');if(/trail/i.test(text))put('terrain','Trail');else if(/road|straße/i.test(text))put('terrain','Straße');
    }
    if(product.family==='smartphone'){
      const storage=text.match(/\b(64|128|256|512|1024)\s*GB\b/i);if(storage)put('storage',storage[1]);const ram=text.match(/\b(6|8|12|16)\s*GB\s*(?:RAM|Arbeitsspeicher)/i);if(ram)put('ram',Number(ram[1]));const screen=text.match(/\b(6[.,][1-9])\s*(?:inch|zoll|["″])/i);if(screen)put('screen',screen[1].replace(',','.'));if(/\b5G\b/i.test(text))add('features','5G');if(/dual[- ]?sim/i.test(text))add('features','Dual-SIM');if(/\besim\b/i.test(text))add('features','eSIM');
    }
    if(product.family==='heatgun'){
      const power=text.match(/\b(\d{3,4})\s*(?:W|Watt)\b/i);if(power)put('power',Number(power[1]));const temp=text.match(/\b(\d{3})\s*°?C\b/i);if(temp)put('temperature',Number(temp[1]));const airflow=text.match(/\b(\d{3,4})\s*l\/?min\b/i);if(airflow)put('airflow',Number(airflow[1]));if(/display/i.test(text))add('features','Display');if(/koffer|case/i.test(text))add('features','Koffer');if(/düsen|nozzle/i.test(text))add('features','Düsen-Set');if(/temperaturregelung|temperature control/i.test(text))add('features','Temperaturregelung');
    }
    if(product.family==='coffee'){
      if(/vollautomat|bean[- ]to[- ]cup/i.test(text))put('type','Vollautomat');else if(/siebträger|portafilter/i.test(text))put('type','Siebträger');else if(/kapsel|capsule|pod/i.test(text))put('type','Kapselmaschine');else if(/filter/i.test(text))put('type','Filtermaschine');if(/timer/i.test(text))add('features','Timer');if(/milch|milk/i.test(text))add('features','Milchsystem');if(/mahlwerk|grinder/i.test(text))add('features','Mahlwerk');if(/thermokanne|thermal carafe/i.test(text))add('features','Thermokanne');const capacity=text.match(/(\d(?:[.,]\d)?)\s*l(?:iter)?\b/i);if(capacity)put('capacity',Number(capacity[1].replace(',','.')));
    }
    if(['shoes','smartphone'].includes(product.family))for(const [color,re] of Object.entries(COLOR_WORDS))if(re.test(text)){put('color',color);break}
    return found;
  }

  function normalize(raw){
    if(!raw||raw.active===false||!raw.name||!Number.isFinite(Number(raw.price))||Number(raw.price)<0)return null;
    const text=`${raw.name} ${raw.description||''}`,taxonomy=String(raw.category||''),family=inferFamily(text,taxonomy),price=Number(raw.price),shippingCost=maybeNumber(raw.shippingCost),rating=maybeNumber(raw.rating),merchantCount=maybeNumber(raw.merchantCount),deliveryDays=maybeNumber(raw.deliveryDays),totalPriceKnown=shippingCost!==null,totalPrice=totalPriceKnown?price+shippingCost:null;
    const p={name:String(raw.name),brand:String(raw.brand||''),description:String(raw.description||''),category:String(raw.category||''),price,shippingCost,totalPrice,totalPriceKnown,image:String(raw.image||''),family,rating,merchantCount,inStock:raw.inStock===true,deliveryDays};
    p.attrs=features(p);
    if(rating!==null)p.attrs.rating=rating;
    if(merchantCount!==null)p.attrs.merchants=merchantCount;
    const shipping=[];if(shippingCost===0)shipping.push('Kostenloser Versand');if(p.inStock)shipping.push('Sofort lieferbar');if(deliveryDays!==null&&deliveryDays<=3)shipping.push('Lieferung ≤ 3 Werktage');if(shipping.length)p.attrs.shipping=shipping;
    return p;
  }

  function facetDef(key){return schemaFor(category?.id)?.facets?.find(f=>f.key===key)||(window.FB_COMMON_FACETS||[]).find(f=>f.key===key)||null}
  function facetTitle(facet){const key=facetLabels[facet.key];if(key){const translated=tx(key);if(translated&&translated!==key)return translated}return facet.label||facet.key}
  function selectedArrayState(){return Object.fromEntries(Object.entries(state.facets).map(([k,v])=>[k,[...v]]))}
  function facetVisible(facet){return typeof window.FB_facetVisible==='function'?window.FB_facetVisible(facet,selectedArrayState(),state.query):true}
  function optionLabel(facet,value){if(facet.type==='threshold')return `≥ ${displayValue(value)}${facet.unit?' '+facet.unit:''}`;return `${displayValue(value)}${facet.unit?' '+facet.unit:''}`}
  function productHasOption(p,key,value,facet){const vals=valuesOf(p.attrs[key]);if(facet?.type==='threshold')return vals.some(v=>Number(v)>=Number(value));return vals.some(v=>String(v)===String(value))}
  function facetMatches(p,key,set){if(!set?.size)return true;const facet=facetDef(key)||{type:'multi'};if(facet.type==='threshold'){const threshold=Math.max(...[...set].map(Number).filter(Number.isFinite));return valuesOf(p.attrs[key]).some(v=>Number(v)>=threshold)}if(key==='shipping')return [...set].every(value=>productHasOption(p,key,value,facet));return [...set].some(value=>productHasOption(p,key,value,facet))}

  function interpret(query){
    const constraints={};let clean=query;
    const max=query.match(/(?:unter|bis|max(?:imal)?|under|up to)\s*(\d+(?:[,.]\d+)?)\s*(?:€|euro)?/i),min=query.match(/(?:[üu]ber|ab|mindestens|over|from)\s*(\d+(?:[,.]\d+)?)\s*(?:€|euro)?/i);
    if(max&&state.max===null)state.max=Number(max[1].replace(',','.'));if(min&&state.min===null)state.min=Number(min[1].replace(',','.'));for(const match of [max,min])if(match)clean=clean.replace(match[0],' ');
    if(category?.id==='headphones'){if(/bluetooth|wireless|kabellos/i.test(clean))constraints.connection='Kabellos';if(/kabelgebunden|wired/i.test(clean))constraints.connection='Kabelgebunden';const form=clean.match(/over[- ]?ear|in[- ]?ear|on[- ]?ear/i);if(form)constraints.form=form[0].replace(' ','-').replace(/^\w/,x=>x.toUpperCase());if(/noise cancell?ing|\bANC\b/i.test(clean))constraints.features='Active Noise Cancelling'}
    if(category?.id==='tv'){const screen=clean.match(/\b(43|50|55|65|75)\s*(?:zoll|inch(?:es)?|["″])/i);if(screen)constraints.screen=screen[1];const panel=clean.match(/\b(OLED|QLED|Mini-LED|LED)\b/i);if(panel)constraints.panel=panel[1].toUpperCase();if(/\b8K\b/i.test(clean))constraints.resolution='8K';else if(/\b4K\b|UHD/i.test(clean))constraints.resolution='4K UHD'}
    if(category?.id==='shoes'){const size=clean.match(/(?:gr[oö][ßs]e|size|EU)\s*(3[6-9]|4[0-6])\b/i);if(size)constraints.size=size[1];if(/herren|men/i.test(clean))constraints.audience='Herren';if(/damen|women/i.test(clean))constraints.audience='Damen'}
    if(category?.id==='smartphone'){const storage=clean.match(/\b(128|256|512|1024)\s*GB\b/i);if(storage)constraints.storage=storage[1];if(/\b5G\b/i.test(clean))constraints.features='5G'}
    if(category?.id==='heatgun'){const power=clean.match(/\b(1200|1600|2000|2200)\s*W(?:att)?\b/i);if(power)constraints.power=power[1];const temp=clean.match(/\b(400|500|600|650)\s*°?C\b/i);if(temp)constraints.temperature=temp[1]}
    if(category?.id==='coffee'&&/timer/i.test(clean))constraints.features='Timer';
    for(const [key,value] of Object.entries(constraints)){if(!state.facets[key])state.facets[key]=new Set();state.facets[key].add(String(value));clean=clean.replace(new RegExp(escapeRegExp(String(value)),'i'),' ')}
    const categoryRegex=categoryTermsRegex(category);if(categoryRegex)clean=clean.replace(categoryRegex,' ');
    clean=clean.replace(/\b(?:bluetooth|wireless|kabellos|kabelgebunden|wired|zoll|inch|size|gr[oö][ßs]e|EU|GB|euro|watt)\b/gi,' ');
    return norm(clean).split(/[^\p{L}\p{N}]+/u).filter(x=>x.length>1);
  }

  function queryMatch(p,tokens){if(category&&p.family!==category.id)return false;const hay=norm([p.name,p.brand,p.category,p.description].join(' '));return tokens.every(t=>hay.includes(t))}
  function filtered(skip){return base.filter(p=>{if((state.min!==null||state.max!==null)&&!p.totalPriceKnown)return false;if(state.min!==null&&p.totalPrice<state.min||state.max!==null&&p.totalPrice>state.max)return false;if(skip!=='brand'&&state.brands.size&&!state.brands.has(p.brand))return false;return Object.entries(state.facets).every(([key,set])=>skip===key||facetMatches(p,key,set))})}
  function optionsForKey(key){const set=new Set(base.flatMap(p=>valuesOf(key==='brand'?p.brand:p.attrs[key])).filter(v=>v!==''&&v!==undefined&&v!==null).map(String));return [...set].sort((a,b)=>a.localeCompare(b,locale,{numeric:true}))}
  function optionsForFacet(facet){const configured=(facet.values||[]).map(String);return configured.length?configured:optionsForKey(facet.key)}
  function group(key,label,values,facet={key,label,type:'multi'}){if(!values.length)return '';const selected=key==='brand'?state.brands:state.facets[key]||new Set();return `<section class="facet"><h2>${esc(key==='brand'?tx('manufacturer'):facetTitle(facet))}</h2>${values.map(value=>{const count=filtered(key).filter(p=>key==='brand'?p.brand===value:productHasOption(p,key,value,facet)).length;return `<label><input type="checkbox" data-key="${esc(key)}" value="${esc(value)}" ${selected.has(String(value))?'checked':''}>${esc(optionLabel(facet,value))}<span>${count}</span></label>`}).join('')}</section>`}

  function renderFilters(){
    const schema=schemaFor(category?.id),specialized=(schema?.facets||[]).filter(facetVisible).map(f=>group(f.key,f.label,optionsForFacet(f),f)).join(''),colorValues=optionsForKey('color'),common=window.FB_COMMON_FACETS||[],commonGroup=key=>{const f=common.find(x=>x.key===key);return f?group(f.key,f.label,optionsForFacet(f),f):''};
    filtersEl.innerHTML=`<section class="facet"><h2>${esc(tx('price'))}</h2><div class="price-row"><label>${esc(tx('from'))}<input class="number-input" id="min" type="number" min="0" step="0.01" value="${state.min??''}"></label><label>${esc(tx('to'))}<input class="number-input" id="max" type="number" min="0" step="0.01" value="${state.max??''}"></label></div><button class="apply-price" id="apply-price" type="button">${esc(tx('apply'))}</button></section>${group('brand','Hersteller',optionsForKey('brand'),{key:'brand',label:'Hersteller',type:'multi'})}${commonGroup('shipping')}${commonGroup('rating')}${colorValues.length?group('color','Farbe',colorValues,{key:'color',label:tx('color'),type:'multi'}):''}${specialized}${commonGroup('merchants')}`;
    filtersEl.querySelectorAll('input[type=checkbox]').forEach(el=>el.addEventListener('change',()=>{const set=el.dataset.key==='brand'?state.brands:(state.facets[el.dataset.key]??=new Set());el.checked?set.add(String(el.value)):set.delete(String(el.value));render()}));
    filtersEl.querySelector('#apply-price').addEventListener('click',()=>{state.min=asNumber(filtersEl.querySelector('#min').value);state.max=asNumber(filtersEl.querySelector('#max').value);render()});
  }

  function renderChips(){const chips=[];if(state.min!==null)chips.push(['min',`${tx('from')} ${money(state.min)}`]);if(state.max!==null)chips.push(['max',`${tx('to')} ${money(state.max)}`]);for(const brand of state.brands)chips.push(['brand:'+brand,`${tx('manufacturer')}: ${brand}`]);for(const [key,values] of Object.entries(state.facets))for(const value of values){const facet=facetDef(key)||{type:'multi'};chips.push([key+':'+value,optionLabel(facet,value)])}chipsEl.innerHTML=chips.map(([key,label])=>`<button type="button" data-remove="${esc(key)}" aria-label="${esc(removeWord[language.lang]||removeWord.en)}: ${esc(label)}">${esc(label)} ×</button>`).join('');chipsEl.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{const [key,...rest]=b.dataset.remove.split(':'),value=rest.join(':');if(key==='min'||key==='max')state[key]=null;else if(key==='brand')state.brands.delete(value);else state.facets[key]?.delete(value);render()}))}
  function writeUrl(){const url=new URL(location.href),set=(key,value)=>value==null||value===''?url.searchParams.delete(key):url.searchParams.set(key,String(value));set('q',state.query);set('lang',language.lang);set('min',state.min);set('max',state.max);set('brand',[...state.brands].join(','));const facetData=Object.fromEntries(Object.entries(state.facets).filter(([,s])=>s.size).map(([k,s])=>[k,[...s]]));set('facets',Object.keys(facetData).length?JSON.stringify(facetData):'');set('sort',state.sort==='relevance'?'':state.sort);history.replaceState(null,'',url)}
  function comparePrice(a,b,direction){if(a.totalPriceKnown&&b.totalPriceKnown)return direction*(a.totalPrice-b.totalPrice);if(a.totalPriceKnown)return -1;if(b.totalPriceKnown)return 1;return 0}
  function card(p){const tags=Object.entries(p.attrs).filter(([key])=>!['rating','merchants','shipping'].includes(key)).flatMap(([,v])=>valuesOf(v)).slice(0,4).map(x=>`<span>${esc(displayValue(x))}</span>`).join(''),offerMeta=[p.rating!==null?`★ ${p.rating.toLocaleString(locale,{maximumFractionDigits:1})}`:'',p.merchantCount!==null?`🏪 ${p.merchantCount}`:''].filter(Boolean).join(' · '),shownPrice=p.totalPriceKnown?p.totalPrice:p.price,priceDetail=p.totalPriceKnown?`${money(p.price)} + ${money(p.shippingCost)} 🚚`:tx('testPrice');return `<article class="product">${p.image?`<img src="${esc(p.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:`<div class="no-image" aria-hidden="true">${esc(tx('results'))}</div>`}<div><p><bdi>${esc(p.brand||p.category)}</bdi> · ${esc(tx('testData'))}</p><h2 dir="auto">${esc(p.name)}</h2><p dir="auto">${esc(p.description.slice(0,150))}</p>${offerMeta?`<p>${esc(offerMeta)}</p>`:''}<div class="tags">${tags}</div></div><div class="price"><strong>${money(shownPrice)}</strong><small>${esc(priceDetail)}</small><span class="unavailable">${esc(tx('noOffer'))}</span></div></article>`}
  function render(){renderFilters();renderChips();let list=filtered();if(state.sort==='price-asc')list.sort((a,b)=>comparePrice(a,b,1));else if(state.sort==='price-desc')list.sort((a,b)=>comparePrice(a,b,-1));else if(state.sort==='brand')list.sort((a,b)=>a.brand.localeCompare(b.brand,locale));const categoryText=categoryLabels[category?.id]?tx(categoryLabels[category.id]).replace(/^[^\p{L}\p{N}]+/u,''):(category?.label||'');summaryEl.textContent=`${list.length} ${list.length===1?tx('oneFound'):tx('found')}${categoryText?' · '+categoryText:''}`;cardsEl.innerHTML=list.length?list.slice(0,100).map(card).join(''):`<div class="empty"><h2>${esc(tx('noResults'))}</h2><p>${esc(tx('noResultsHelp'))}</p></div>`;writeUrl()}

  document.querySelector('.search-form').addEventListener('submit',e=>{e.preventDefault();state.query=qEl.value.trim();state.brands.clear();state.facets={};state.min=null;state.max=null;runSearch()});
  document.querySelector('#reset').addEventListener('click',()=>{state.min=state.max=null;state.brands.clear();state.facets={};render()});
  sortEl.addEventListener('change',()=>{state.sort=sortEl.value;render()});
  function runSearch(){const translated=queryAliases.reduce((q,[pattern,value])=>q.replace(pattern,value),state.query);category=detect(translated);const tokens=interpret(translated);base=products.filter(p=>queryMatch(p,tokens));render()}
  const readProducts=url=>fetch(url).then(r=>{if(!r.ok)throw Error('Product data unavailable: '+url);return r.json()}).then(data=>{if(!Array.isArray(data))throw Error('Invalid product data');return data});
  Promise.all([readProducts('products.json'),cardsEl.dataset.catalogUrl?readProducts(cardsEl.dataset.catalogUrl):Promise.resolve([])]).then(groups=>{products=groups.flat().map(normalize).filter(Boolean);runSearch()}).catch(()=>{summaryEl.textContent=tx('loadError');cardsEl.innerHTML=`<div class="empty"><h2>${esc(tx('loadError'))}</h2><p>${esc(tx('tryLater'))}</p></div>`});
})();
