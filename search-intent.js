'use strict';
(function(){
  const RULES={
    max:[/(?:unter|bis|max(?:imal)?|höchstens|under|up to|at most|moins de|jusqu(?:’|')?à|max(?:imum)?|hasta|máximo|menos de|fino a|massimo|sotto|até|máximo|poniżej|do|макс(?:имум)?|до|până la|maxim|sub|en fazla|altında|максимум|най-много|najviše|έως|μέχρι|највише|حد أقصى|أقل من|حداکثر|کمتر از|deri në|maksimum|最多|低于|heta|max)/iu],
    min:[/(?:über|ab|mindestens|mehr als|over|from|at least|more than|au moins|à partir de|plus de|al menos|desde|más de|almeno|da|più di|pelo menos|a partir de|mais de|od|co najmniej|минимум|от|не менее|de la|cel puțin|peste|en az|üzerinde|мінімум|від|поне|над|najmanje|τουλάχιστον|από|најмање|од|على الأقل|أكثر من|حداقل|بیش از|të paktën|nga|至少|高于|herî kêm|ji)/iu]
  };
  const shippingFree=/(?:kostenlos(?:er|e)? versand|versandkostenfrei|free shipping|livraison gratuite|envío gratis|spedizione gratuita|frete grátis|darmowa dostawa|бесплатн(?:ая|ой) доставк|transport gratuit|ücretsiz kargo|безкоштовна доставк|безплатна доставк|besplatna dostava|δωρεάν αποστολή|бесплатна достава|شحن مجاني|ارسال رایگان|transport falas|免运费|şandina belaş)/iu;
  const inStock=/(?:sofort lieferbar|auf lager|lieferbar|in stock|available now|en stock|disponible|disponibile|em stock|dostępny|в наличии|în stoc|stokta|наявн|в наличност|na zalihi|σε απόθεμα|на стању|متوفر|موجود|në stok|有货|heye)/iu;
  const fast=/(?:lieferung|zustellung|delivery|livraison|entrega|consegna|dostawa|доставк|livrare|teslimat|isporuka|παράδοση|испорука|توصيل|ارسال|dorëzim|配送)[^\d]{0,12}(?:≤|bis|within|sous|en|entro|w ciągu|до|în|içinde|за|u roku|εντός|року|خلال|تا|brenda|内)?\s*(\d{1,2})\s*(?:werk(?:tag|tage|tagen)|business days?|days?|jours?|días?|giorni|dias|dni|дн(?:я|ей)|zile|gün|дні|дена|dana|ημέρες|дана|أيام|روز|ditë|天|roj)/iu;
  const rating=/(?:bewertung|rating|rated|note|valoraci[oó]n|valutazione|avalia[cç][aã]o|ocena|рейтинг|evaluare|puan|оцінка|оценка|αξιολόγηση|оцена|تقييم|امتیاز|vlerësim|评分)[^\d]{0,10}(\d(?:[.,]\d)?)/iu;
  const merchants=/(?:mindestens|at least|au moins|al menos|almeno|pelo menos|co najmniej|минимум|cel puțin|en az|щонайменше|поне|najmanje|τουλάχιστον|најмање|على الأقل|حداقل|të paktën|至少|herî kêm)?\s*(\d{1,2})\s*(?:händler|shops?|stores?|marchands?|tiendas?|negozi|lojas|sklep(?:y|ów)?|магазин(?:а|ов)?|comercianți|mağaza|магазинів|магазина|trgovin(?:e|a)|καταστήματα|продавница|متاجر|فروشگاه|dyqane|商家|firoşgeh)/iu;
  const priceNumber='(\\d+(?:[.,]\\d+)?)';
  function matchPrice(query,kind){for(const prefix of RULES[kind]){const re=new RegExp(prefix.source+'\\s*'+priceNumber+'\\s*(?:€|eur|euro)?',prefix.flags);const m=query.match(re);if(m)return {value:Number(m[1].replace(',','.')),match:m[0]};}return null;}
  function parse(query){
    const raw=String(query||'');let clean=raw;const filters={facets:{}};
    const max=matchPrice(clean,'max'),min=matchPrice(clean,'min');
    if(max){filters.max=max.value;clean=clean.replace(max.match,' ')}
    if(min){filters.min=min.value;clean=clean.replace(min.match,' ')}
    if(shippingFree.test(clean)){filters.facets.shipping=['Kostenloser Versand'];clean=clean.replace(shippingFree,' ')}
    if(inStock.test(clean)){(filters.facets.shipping??=[]).push('Sofort lieferbar');clean=clean.replace(inStock,' ')}
    const fastMatch=clean.match(fast);if(fastMatch&&Number(fastMatch[1])<=3){(filters.facets.shipping??=[]).push('Lieferung ≤ 3 Werktage');clean=clean.replace(fastMatch[0],' ')}
    const ratingMatch=clean.match(rating);if(ratingMatch){filters.facets.rating=[String(Number(ratingMatch[1].replace(',','.')))];clean=clean.replace(ratingMatch[0],' ')}
    const merchantMatch=clean.match(merchants);if(merchantMatch){filters.facets.merchants=[String(Number(merchantMatch[1]))];clean=clean.replace(merchantMatch[0],' ')}
    return {raw,clean:clean.replace(/\s+/g,' ').trim(),filters};
  }
  function hasIntent(parsed){return parsed.filters.min!==undefined||parsed.filters.max!==undefined||Object.keys(parsed.filters.facets).length>0;}
  function mergeFacetParams(url,extra){let current={};try{const parsed=JSON.parse(url.searchParams.get('facets')||'{}');if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))current=parsed;}catch{}for(const [key,values] of Object.entries(extra||{}))current[key]=[...new Set([...(current[key]||[]).map(String),...values.map(String)])];if(Object.keys(current).length)url.searchParams.set('facets',JSON.stringify(current));else url.searchParams.delete('facets');}
  function applyParsed(url,parsed,{rememberRaw=true}={}){
    if(parsed.filters.min!==undefined)url.searchParams.set('min',String(parsed.filters.min));
    if(parsed.filters.max!==undefined)url.searchParams.set('max',String(parsed.filters.max));
    mergeFacetParams(url,parsed.filters.facets);
    if(rememberRaw&&parsed.raw&&parsed.clean!==parsed.raw)url.searchParams.set('rawq',parsed.raw);else if(!rememberRaw)url.searchParams.delete('rawq');
    url.searchParams.set('q',parsed.clean||parsed.raw);
    return url;
  }
  function preprocessLocation(){if(typeof location==='undefined')return;const url=new URL(location.href),q=url.searchParams.get('q')||'';if(!q)return;const parsed=parse(q);if(!hasIntent(parsed))return;applyParsed(url,parsed);history.replaceState(null,'',url);}
  function attachSubmitCapture(){const form=document.querySelector('.search-form'),input=document.querySelector('#query');if(!form||!input)return;const rawFromUrl=new URL(location.href).searchParams.get('rawq');if(rawFromUrl)input.value=rawFromUrl;form.addEventListener('submit',event=>{const parsed=parse(input.value.trim());if(!hasIntent(parsed))return;event.preventDefault();event.stopImmediatePropagation();const url=new URL(location.href);['min','max','brand','facets','sort','rawq'].forEach(key=>url.searchParams.delete(key));applyParsed(url,parsed);location.assign(url.toString());},true);}
  window.FB_parseSearchIntent=parse;
  preprocessLocation();
  if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attachSubmitCapture,{once:true});else attachSubmitCapture();}
  if(typeof module!=='undefined')module.exports={parse,hasIntent};
})();
