'use strict';

const BRAVE_ENDPOINT = 'https://api.search.brave.com/res/v1/web/search';
const DEFAULT_COUNT = 10;
const MAX_COUNT = 20;
const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 120;

const json = (body, status = 200, extraHeaders = {}) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
    'content-security-policy': "default-src 'none'; frame-ancestors 'none'",
    'x-frame-options': 'DENY',
    'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    ...extraHeaders
  }
});

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const configured = String(env.ALLOWED_ORIGIN || 'https://fundblick.de').trim();
  const allowed = configured.split(',').map(v => v.trim()).filter(Boolean);
  const matched = allowed.includes(origin);
  return {
    ...(matched ? { 'access-control-allow-origin': origin } : {}),
    'access-control-allow-methods': 'GET, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '600',
    'vary': 'Origin'
  };
}

function originAllowed(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  const allowed = String(env.ALLOWED_ORIGIN || 'https://fundblick.de').split(',').map(v => v.trim()).filter(Boolean);
  return allowed.includes(origin);
}

function cleanQuery(value) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_QUERY_LENGTH);
}

function safeUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return /^https?:$/.test(url.protocol) ? url.href.slice(0, 2048) : '';
  } catch {
    return '';
  }
}

function cleanText(value, max) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function valueAtPath(item, path) {
  let value = item;
  for (const part of path.split('.')) value = value?.[part];
  return value;
}

function firstValue(item, paths) {
  for (const path of paths) {
    const value = valueAtPath(item, path);
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return '';
}

function flattenObjects(value, max = 40) {
  const out = [];
  const queue = Array.isArray(value) ? [...value] : [value];
  while (queue.length && out.length < max) {
    const current = queue.shift();
    if (Array.isArray(current)) {
      queue.unshift(...current);
      continue;
    }
    if (!current || typeof current !== 'object') continue;
    out.push(current);
    for (const key of ['product','offer','offers','seller','merchant','brand']) {
      const nested = current[key];
      if (Array.isArray(nested)) queue.push(...nested);
      else if (nested && typeof nested === 'object') queue.push(nested);
    }
  }
  return out;
}

function structuredCandidates(item) {
  const roots = [];
  if (item?.product) roots.push(item.product);
  if (item?.product_cluster) roots.push(item.product_cluster);
  if (item?.deep_results?.schemas) roots.push(item.deep_results.schemas);
  return flattenObjects(roots, 60);
}

function structuredValue(item, keys) {
  for (const candidate of structuredCandidates(item)) {
    for (const key of keys) {
      const value = candidate?.[key];
      if (value !== undefined && value !== null && String(value).trim() !== '') return value;
    }
  }
  return '';
}

function priceFromText(value) {
  const text = cleanText(value, 4000);
  if (!text) return '';
  const amount = '(?:\\d{1,3}(?:[.\\s\\u00a0\\u202f]\\d{3})+(?:[,\\.]\\d{2})?|\\d{1,7}(?:[,\\.]\\d{2})?)';
  const unit = '(?:€|EUR|USD|GBP|CHF|PLN|CZK|RON|MDL|RUB|₽|руб(?:\\.|ль|ля|лей)?)';
  const match = text.match(new RegExp(`(?:${unit}\\s*${amount}|${amount}\\s*${unit})`, 'i'));
  return match ? cleanText(match[0], 80) : '';
}

function visiblePrice(item) {
  const sources = [item?.title, item?.description, ...(Array.isArray(item?.extra_snippets) ? item.extra_snippets : [])];
  for (const source of sources) {
    const price = priceFromText(source);
    if (price) return price;
  }
  return '';
}

function explicitPrice(item) {
  // A price that is visibly attached to the result is stronger evidence than a
  // nested schema price, which may describe a different offer on an overview page.
  const visible = visiblePrice(item);
  if (visible) return visible;

  const structured = firstValue(item, [
    'price','product.price','product.offers.price','offer.price',
    'product.price_string','product.priceString'
  ]) || structuredValue(item, ['price','lowPrice','highPrice','priceText','price_string','priceString']);
  if (typeof structured === 'number' && Number.isFinite(structured)) return String(structured);
  const structuredText = cleanText(structured, 80);
  if (/\d/.test(structuredText)) return structuredText;
  return '';
}

function normalizeCurrency(value) {
  const raw = cleanText(value, 30).toUpperCase();
  if (!raw) return '';
  if (raw === '€' || raw.includes('EUR')) return 'EUR';
  if (raw === '$' || raw.includes('USD')) return 'USD';
  if (raw === '£' || raw.includes('GBP')) return 'GBP';
  if (raw === '₽' || raw.includes('RUB') || /РУБ(?:\.|ЛЬ|ЛЯ|ЛЕЙ)?/.test(raw)) return 'RUB';
  const code = raw.match(/\b(EUR|USD|GBP|CHF|PLN|CZK|RON|MDL|RUB)\b/);
  return code ? code[1] : '';
}

function explicitCurrency(item, price) {
  const value = firstValue(item, [
    'currency','priceCurrency','product.currency','product.priceCurrency',
    'product.offers.priceCurrency','offer.priceCurrency'
  ]) || structuredValue(item, ['currency','priceCurrency','price_currency']);
  return normalizeCurrency(price) || normalizeCurrency(value);
}

function explicitImage(item) {
  const direct = firstValue(item, [
    'thumbnail.src','thumbnail.original','thumbnail.url','image.src','image.url',
    'product.image','product.image_url','product.thumbnail.src','offer.image'
  ]);
  const structured = structuredValue(item, ['image','imageUrl','image_url','thumbnailUrl','thumbnail_url','contentUrl']);
  const value = direct || structured;
  if (Array.isArray(value)) return safeUrl(value[0]?.url || value[0]?.src || value[0]?.contentUrl || value[0]);
  if (value && typeof value === 'object') return safeUrl(value.url || value.src || value.contentUrl);
  return safeUrl(value);
}

function explicitProductUrl(item) {
  const value = firstValue(item, ['product.url','product.product_url','offer.url']) || structuredValue(item, ['url','productUrl','product_url','offerUrl']);
  return safeUrl(value) || safeUrl(item?.url);
}

function explicitMerchant(item) {
  const value = firstValue(item, ['product.merchant','product.seller','offer.merchant','offer.seller','merchant','seller','store']) ||
    structuredValue(item, ['merchant','seller','store','brand','name']) ||
    firstValue(item, ['profile.long_name','profile.name']);
  if (value && typeof value === 'object') return cleanText(value.name || value.long_name || '', 120);
  return cleanText(value, 120);
}

function normalizeAvailability(value) {
  const raw = cleanText(value, 120).toLowerCase().replace(/[\s_-]+/g, '');
  if (!raw) return 'unknown';
  if (/(instock|available|lieferbar|verfügbar|disponibil)/.test(raw) && !/(notavailable|unavailable|nichtlieferbar|nichtverfügbar)/.test(raw)) return 'in_stock';
  if (/(outofstock|soldout|unavailable|notavailable|nichtlieferbar|nichtverfügbar|ausverkauft)/.test(raw)) return 'out_of_stock';
  if (/(preorder|pre-order|vorbestell)/.test(raw)) return 'preorder';
  if (/(backorder|back-order|nachbestell)/.test(raw)) return 'backorder';
  return 'unknown';
}

function explicitProductStatus(item) {
  const value = firstValue(item, [
    'availability','product.availability','product.offers.availability','offer.availability',
    'product.status','offer.status'
  ]) || structuredValue(item, ['availability','itemAvailability','status']);
  return normalizeAvailability(value);
}

function normalizeResult(item) {
  const price = explicitPrice(item);
  const productUrl = explicitProductUrl(item);
  const hasStructuredProduct = Boolean(item?.product || item?.product_cluster || structuredCandidates(item).length);
  return {
    title: cleanText(item?.title, 300),
    url: productUrl,
    productUrl,
    description: cleanText(item?.description, 1000),
    image: explicitImage(item),
    price,
    currency: explicitCurrency(item, price),
    merchant: explicitMerchant(item),
    productStatus: explicitProductStatus(item),
    productCandidate: hasStructuredProduct || Boolean(price),
    age: item?.age || null,
    language: item?.language || null,
    familyFriendly: item?.family_friendly !== false
  };
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);
    if (request.method === 'OPTIONS') {
      if (!originAllowed(request, env)) return new Response(null, { status: 403, headers: cors });
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405, cors);

    const url = new URL(request.url);
    if (url.pathname === '/health') {
      if (!originAllowed(request, env)) return json({ error: 'origin_not_allowed' }, 403, cors);
      return json({ ok: true, service: 'fundblick-brave-search', keyConfigured: Boolean(env.BRAVE_SEARCH_API_KEY) }, 200, cors);
    }
    if (url.pathname !== '/search') return json({ error: 'not_found' }, 404, cors);
    if (!originAllowed(request, env)) return json({ error: 'origin_not_allowed' }, 403, cors);

    const query = cleanQuery(url.searchParams.get('q'));
    if (!query || query.length < MIN_QUERY_LENGTH) return json({ error: 'invalid_query' }, 400, cors);
    if (!env.BRAVE_SEARCH_API_KEY) return json({ error: 'server_not_configured' }, 503, cors);

    const requestedCount = Number(url.searchParams.get('count') || DEFAULT_COUNT);
    const count = Math.max(1, Math.min(MAX_COUNT, Number.isFinite(requestedCount) ? requestedCount : DEFAULT_COUNT));
    const country = String(url.searchParams.get('country') || 'DE').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2) || 'DE';
    const searchLang = String(url.searchParams.get('lang') || 'de').toLowerCase().replace(/[^a-z-]/g, '').slice(0, 8) || 'de';

    const braveUrl = new URL(BRAVE_ENDPOINT);
    braveUrl.searchParams.set('q', query);
    braveUrl.searchParams.set('count', String(count));
    braveUrl.searchParams.set('country', country);
    braveUrl.searchParams.set('search_lang', searchLang);
    braveUrl.searchParams.set('safesearch', 'moderate');
    braveUrl.searchParams.set('extra_snippets', 'true');

    let upstream;
    try {
      upstream = await fetch(braveUrl, {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': env.BRAVE_SEARCH_API_KEY
        }
      });
    } catch (_) {
      return json({ error: 'upstream_unreachable' }, 502, cors);
    }

    if (!upstream.ok) return json({ error: 'upstream_error', status: upstream.status }, upstream.status === 429 ? 429 : 502, cors);

    let payload;
    try { payload = await upstream.json(); }
    catch (_) { return json({ error: 'upstream_invalid_response' }, 502, cors); }

    const results = Array.isArray(payload?.web?.results)
      ? payload.web.results.filter(item => item?.family_friendly !== false).map(normalizeResult).filter(item => item.title && item.url)
      : [];
    return json({ query, count: results.length, results }, 200, cors);
  }
};
