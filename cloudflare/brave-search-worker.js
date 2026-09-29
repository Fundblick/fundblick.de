'use strict';

const BRAVE_ENDPOINT = 'https://api.search.brave.com/res/v1/web/search';
const DEFAULT_COUNT = 10;
const MAX_COUNT = 20;

const json = (body, status = 200, extraHeaders = {}) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    ...extraHeaders
  }
});

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const configured = String(env.ALLOWED_ORIGIN || 'https://fundblick.de').trim();
  const allowed = configured.split(',').map(v => v.trim()).filter(Boolean);
  const value = allowed.includes(origin) ? origin : allowed[0] || 'https://fundblick.de';
  return {
    'access-control-allow-origin': value,
    'access-control-allow-methods': 'GET, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'vary': 'Origin'
  };
}

function cleanQuery(value) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
}

function normalizeResult(item) {
  return {
    title: String(item?.title || ''),
    url: String(item?.url || ''),
    description: String(item?.description || ''),
    age: item?.age || null,
    language: item?.language || null,
    familyFriendly: item?.family_friendly !== false
  };
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405, cors);

    const url = new URL(request.url);
    if (url.pathname === '/health') {
      return json({ ok: true, service: 'fundblick-brave-search', keyConfigured: Boolean(env.BRAVE_SEARCH_API_KEY) }, 200, cors);
    }
    if (url.pathname !== '/search') return json({ error: 'not_found' }, 404, cors);

    const query = cleanQuery(url.searchParams.get('q'));
    if (!query) return json({ error: 'missing_query' }, 400, cors);
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

    if (!upstream.ok) {
      return json({ error: 'upstream_error', status: upstream.status }, upstream.status === 429 ? 429 : 502, cors);
    }

    const payload = await upstream.json();
    const results = Array.isArray(payload?.web?.results) ? payload.web.results.map(normalizeResult) : [];
    return json({ query, count: results.length, results }, 200, cors);
  }
};
