'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.FundBlickUniversalSearchIntent = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const QUESTION_PATTERNS = [
    /\b(?:was|wie|welche|welcher|welches|warum|wieso|wofür|wann|wo)\b/iu,
    /\b(?:what|how|which|why|when|where)\b/iu,
    /(?:^|[\s,;!?])(?:что|как|какой|какая|какие|какое|почему|зачем|где|когда)(?=$|[\s,;!?])/iu,
    /(?:^|[\s,;!?])(?:ce|cum|care|de ce|unde|când)(?=$|[\s,;!?])/iu,
    /\b(?:quoi|comment|quel|quelle|quels|quelles|pourquoi|où|quand)\b/iu,
    /\b(?:qué|como|cómo|cuál|cuales|cuáles|por qué|dónde|cuando|cuándo)\b/iu,
    /\b(?:cosa|come|quale|quali|perché|dove|quando)\b/iu,
    /\b(?:co|jak|jaki|jaka|jakie|dlaczego|gdzie|kiedy)\b/iu,
    /\b(?:ne|nasıl|hangi|neden|niçin|nerede|ne zaman)\b/iu,
    /(?:ما|كيف|أي|لماذا|أين|متى)/u,
    /(?:什么|怎么|如何|哪个|为什么|哪里|何时)/u
  ];

  const COMPARISON = /(?:\bvs\.?\b|\bversus\b|vergleich|vergleichen|testbericht|produkttest|erfahrungen|review|reviews|comparison|compare|best(?:e|er|es)?\b|testsieger|сравнен|обзор|отзыв|лучший|лучшие|compar|recenzi|test|meilleur|meilleure|miglior|mejor|najlepsz|karşılaştır|مقارن|مراجعة|أفضل|对比|比较|评测)/iu;
  const VIDEO = /(?:youtube|youtu\.be|\bvideo\b|\bvideos\b|видео|ролик|videoclip|filmuleț|film|tutorial video|видеоролик|فيديو|视频)/iu;
  const TRANSACTIONAL = /(?:kaufen|bestellen|angebot|angebote|preis|preise|shop|händler|gebraucht kaufen|buy|order|price|prices|deal|store|купить|заказать|цена|магазин|cumpăr|cumpără|comand|preț|magazin|acheter|prix|tienda|comprar|precio|comprare|prezzo|kup|cena|satın al|fiyat|شراء|سعر|购买|价格)/iu;
  const LOCAL_EXPLICIT = /(?:in der nähe|in meiner nähe|bei mir|nahe bei|umkreis|vor ort|near me|nearby|close to me|around me|рядом со мной|рядом|поблизости|около меня|în apropiere|lângă mine|aproape de mine|près de moi|cerca de mí|vicino a me|w pobliżu|yakınımda|بالقرب مني|附近)/iu;
  const PLACE_PREPOSITION = /(?:^|[\s,;])(?:in|bei|near|around|в|во|около|în|lângă|près de|cerca de|vicino a|w|we|yakın|في)\s+([\p{L}\p{M}][\p{L}\p{M}.'’-]{2,}(?:[ -][\p{L}\p{M}][\p{L}\p{M}.'’-]{2,}){0,2})/iu;
  const NON_PLACE = new Set(['stock','lager','angebot','sale','shop','internet','web','vergleich','test','review','online','stoc','наличии','наличие']);

  function clean(value) {
    return String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function tokens(value) {
    return clean(value).match(/[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N}+._/-]*/gu) || [];
  }

  function inferQueryLanguage(query, fallback = 'de') {
    const text = clean(query);
    const base = String(fallback || 'de').trim().toLowerCase().split('-')[0] || 'de';
    if (!text) return base;
    if (/[一-龯㐀-䶿]/u.test(text)) return 'zh-hans';
    if (/[؀-ۿ]/u.test(text)) return 'ar';
    if (/[іїєґ]/iu.test(text)) return 'uk';
    if (/[љњђћџј]/iu.test(text)) return 'sr';
    if (/[ъ]/iu.test(text) && !/[ыэё]/iu.test(text)) return 'bg';
    if (/[Ѐ-ӿ]/u.test(text)) return 'ru';
    if (/[ăâîșşțţ]/iu.test(text)) return 'ro';
    if (/[ğışçöü]/iu.test(text)) return 'tr';
    if (/[ąćęłńóśźż]/iu.test(text)) return 'pl';
    if (/[ëç]/iu.test(text) && /\b(?:dhe|është|për|me|nga|një)\b/iu.test(text)) return 'sq';
    return base;
  }

  function hasQuestionIntent(query) {
    return QUESTION_PATTERNS.some(re => re.test(query)) || /\?$/.test(clean(query));
  }

  function locationSignal(query) {
    const text = clean(query);
    if (LOCAL_EXPLICIT.test(text)) return { local:true, place:'' };
    const match = text.match(PLACE_PREPOSITION);
    if (!match) return { local:false, place:'' };
    const candidate = clean(match[1]);
    const first = candidate.toLocaleLowerCase().split(/\s+/)[0];
    if (!candidate || NON_PLACE.has(first)) return { local:false, place:'' };
    return { local:true, place:candidate };
  }

  function exactModelSignal(query) {
    const parts = tokens(query);
    return parts.some(token => /\p{L}/u.test(token) && /\d/u.test(token)) ||
      parts.some(token => /^\d{2,4}[a-z]{1,4}$/iu.test(token)) ||
      /\b(?:r\d{2,3}|\d{2,3}[\/-]\d{2,3}|\d{3,4}\s?(?:w|v|mah|gb|tb))\b/iu.test(query);
  }

  function analyze(query, language = 'de') {
    const normalized = clean(query);
    const uiLanguage = String(language || 'de').toLowerCase();
    const searchLanguage = inferQueryLanguage(normalized, uiLanguage);
    const tokenList = tokens(normalized);
    const location = locationSignal(normalized);
    const informational = hasQuestionIntent(normalized);
    const comparison = COMPARISON.test(normalized);
    const video = VIDEO.test(normalized);
    const transactional = TRANSACTIONAL.test(normalized);
    const exactModel = exactModelSignal(normalized);
    const broad = tokenList.length > 0 && tokenList.length <= 2 && !exactModel;

    let primary = 'product';
    if (location.local) primary = 'local';
    else if (video) primary = 'video';
    else if (comparison) primary = 'comparison';
    else if (informational) primary = 'informational';

    const modes = ['product'];
    if (location.local) modes.push('local');
    if (informational) modes.push('informational');
    if (comparison) modes.push('comparison');
    if (video) modes.push('video');
    if (broad) modes.push('discovery');

    const enrichWeb = Boolean(normalized) && (location.local || informational || comparison || video || broad);
    const desiredTypes = ['product','video','local','comparison','guide'];

    return Object.freeze({
      raw:String(query || ''),
      query:normalized,
      language:uiLanguage,
      searchLanguage,
      tokenCount:tokenList.length,
      primary,
      modes:Object.freeze([...new Set(modes)]),
      desiredTypes:Object.freeze(desiredTypes),
      place:location.place,
      local:location.local,
      informational,
      comparison,
      video,
      transactional,
      exactModel,
      breadth:broad ? 'broad' : 'focused',
      enrichWeb
    });
  }

  function classifyResult(item) {
    const url = clean(item?.url || item?.productUrl);
    let host = '';
    try { host = new URL(url).hostname.toLowerCase().replace(/^www\./, ''); } catch {}
    const text = `${clean(item?.title)} ${clean(item?.description)} ${host}`;
    if (/(^|\.)(youtube\.com|youtu\.be|vimeo\.com)$/.test(host) || VIDEO.test(text)) return 'video';
    if (item?.productCandidate === true || clean(item?.price)) return 'product';
    if (/(maps\.|branchenbuch|gelbeseiten|11880|yelp\.|tripadvisor\.|google\.[^/]+\/maps|standort|filiale|händler|dealer|werkstatt|магазин|magazin)/iu.test(text)) return 'local';
    if (COMPARISON.test(text)) return 'comparison';
    return 'guide';
  }

  function hasTrustedPrice(item) {
    if (!clean(item?.price)) return false;
    const confidence = clean(item?.priceConfidence).toLowerCase();
    return confidence === 'verified' || confidence === 'visible';
  }

  function resultTier(item, type) {
    if (type === 'product' && hasTrustedPrice(item)) return 0;
    if (type === 'product') return 1;
    if (type === 'video') return 2;
    if (type === 'local') return 3;
    if (type === 'comparison') return 4;
    return 5;
  }

  function scoreResult(item, intent, index) {
    const type = classifyResult(item);
    let score = 0;
    const text = `${clean(item?.title)} ${clean(item?.description)}`.toLocaleLowerCase();
    const queryTerms = tokens(intent?.query || '').map(x => x.toLocaleLowerCase()).filter(x => x.length > 2);
    for (const term of queryTerms) if (text.includes(term)) score += 3;
    if (intent?.place && text.includes(String(intent.place).toLocaleLowerCase())) score += 16;
    if (intent?.local && type === 'local') score += 25;
    if (intent?.video && type === 'video') score += 20;
    if (intent?.comparison && type === 'comparison') score += 18;
    if (intent?.informational && type === 'guide') score += 14;
    if (intent?.exactModel && type === 'product') score += 20;
    score -= Math.min(Number(index) || 0, 20) * 0.2;
    return { type, tier:resultTier(item, type), score };
  }

  function rankResults(items, intent) {
    return (Array.isArray(items) ? items : []).map((item, index) => {
      const ranked = scoreResult(item, intent, index);
      return { item:Object.freeze({ ...item, resultType:ranked.type }), index, tier:ranked.tier, score:ranked.score };
    }).sort((a,b) => a.tier-b.tier || b.score-a.score || a.index-b.index).map(entry => entry.item);
  }

  return Object.freeze({ analyze, classifyResult, rankResults, clean, tokens, inferQueryLanguage, locationSignal, exactModelSignal, hasTrustedPrice, resultTier });
});
