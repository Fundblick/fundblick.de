'use strict';

(function (root, factory) {
  const api = factory(root);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.FundBlickSearchDemandAnalytics = api;
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  const policy = root?.FundBlickExternalSearchPolicy || (typeof require === 'function' ? require('./external-search-policy.js') : null);

  function coarseDay(value = new Date()) {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
  }

  function event(input = {}) {
    const query = policy?.normalizeQuery ? policy.normalizeQuery(input.query) : String(input.query || '').trim().slice(0, 120);
    if (!query || query.length < 2) return null;
    const localRaw = Number(input.localResults);
    const localResults = Number.isFinite(localRaw) ? Math.max(0, Math.floor(localRaw)) : 0;
    return Object.freeze({
      query,
      day: coarseDay(input.at),
      localResults,
      externalFallback: Boolean(input.externalFallback)
    });
  }

  function aggregate(events = []) {
    const map = new Map();
    for (const raw of events) {
      const item = event(raw);
      if (!item) continue;
      const key = `${item.day}\u0000${item.query.toLocaleLowerCase()}\u0000${item.localResults}\u0000${item.externalFallback ? 1 : 0}`;
      const current = map.get(key);
      if (current) current.count += 1;
      else map.set(key, { ...item, count: 1 });
    }
    return Array.from(map.values());
  }

  return Object.freeze({ coarseDay, event, aggregate });
});
