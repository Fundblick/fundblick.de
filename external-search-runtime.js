'use strict';

(function () {
  const policy = window.FundBlickExternalSearchPolicy;
  const client = window.FundBlickExternalSearchClient;
  const ui = window.FundBlickExternalSearchUI;
  const intentEngine = window.FundBlickUniversalSearchIntent;
  const priceConfidence = window.FundBlickExternalPriceConfidence;
  if (!policy || !client || !ui) return;

  const container = document.getElementById('external-results');
  const cards = document.getElementById('cards');
  const summary = document.getElementById('summary');
  if (!container || !cards) return;

  const endpoint = String(document.documentElement.dataset.externalSearchEndpoint || '').trim();
  const enabled = document.documentElement.dataset.externalSearchEnabled === 'true';
  const PAGE_SIZE = 20;
  const MAX_OFFSET = 9;
  let sequence = 0;
  let localSearchSettled = false;
  let timer = null;
  let lastLocalSignature = '';
  let accumulatedResults = [];
  let nextOffset = 1;
  let moreResultsAvailable = false;
  let loadingMore = false;
  let activeQuery = '';
  let activeIntent = null;
  let scrollObserver = null;

  function query() {
    const params = new URLSearchParams(location.search);
    return policy.normalizeQuery(params.get('rawq') || params.get('q'));
  }

  function language() {
    return document.documentElement.lang || 'de';
  }

  function intentFor(q) {
    try { return intentEngine?.analyze?.(q, language()) || null; }
    catch { return null; }
  }

  function visibleLocalCount() {
    return cards.querySelectorAll('.product-card:not([hidden])').length;
  }

  function localSignature() {
    const items = Array.from(cards.querySelectorAll('.product-card:not([hidden])'));
    return items.map((card, index) => `${index}:${String(card.textContent || '').replace(/\s+/g, ' ').trim()}`).join('\u0001');
  }

  function shouldSupplement(q, localResults = visibleLocalCount(), intent = intentFor(q)) {
    if (!enabled || !endpoint || !policy.validQuery(q)) return false;
    if (intent?.enrichWeb) return true;
    return policy.shouldUseExternalSearch({ query:q, localResults, externalEnabled:true });
  }

  function mergeUnique(existing, incoming) {
    const out = [];
    const seen = new Set();
    for (const item of [...(Array.isArray(existing)?existing:[]), ...(Array.isArray(incoming)?incoming:[])]) {
      const key = String(item?.url || item?.productUrl || '').replace(/#.*$/, '').replace(/\/$/, '');
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }
    return out;
  }

  function prepareResults(items, intent) {
    let results = Array.isArray(items) ? items : [];
    try { results = priceConfidence?.annotate?.(results) || results; } catch {}
    try { results = intentEngine?.rankResults?.(results, intent) || results; } catch {}
    return results;
  }

  function disconnectScrollObserver() {
    if (scrollObserver) scrollObserver.disconnect();
    scrollObserver = null;
  }

  function armInfiniteScroll() {
    disconnectScrollObserver();
    if (!moreResultsAvailable || nextOffset > MAX_OFFSET || loadingMore) return;
    const sentinel = document.createElement('div');
    sentinel.className = 'external-results-sentinel';
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.minHeight = '1px';
    container.appendChild(sentinel);
    scrollObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) loadMore();
    }, { rootMargin:'900px 0px' });
    scrollObserver.observe(sentinel);
  }

  function renderAccumulated() {
    ui.render(container, { results:prepareResults(accumulatedResults, activeIntent), intent:activeIntent });
    armInfiniteScroll();
  }

  async function loadMore() {
    if (loadingMore || !moreResultsAvailable || nextOffset > MAX_OFFSET || !activeQuery) return;
    loadingMore = true;
    disconnectScrollObserver();
    const current = sequence;
    const offset = nextOffset;
    const result = await client.search({
      endpoint,
      query: activeQuery,
      language: activeIntent?.searchLanguage || language(),
      country: 'DE',
      count: PAGE_SIZE,
      offset
    });
    loadingMore = false;
    if (current !== sequence || query() !== activeQuery) return;
    if (!result.ok) {
      moreResultsAvailable = false;
      renderAccumulated();
      return;
    }
    accumulatedResults = mergeUnique(accumulatedResults, result.results);
    nextOffset = offset + 1;
    moreResultsAvailable = result.moreResultsAvailable === true && nextOffset <= MAX_OFFSET;
    renderAccumulated();
  }

  function resetExternalState() {
    disconnectScrollObserver();
    accumulatedResults = [];
    nextOffset = 1;
    moreResultsAvailable = false;
    loadingMore = false;
    activeQuery = '';
    activeIntent = null;
  }

  function markSettled() {
    localSearchSettled = true;
    lastLocalSignature = localSignature();
    schedule(0);
  }

  async function evaluate() {
    const current = ++sequence;
    const q = query();
    const intent = intentFor(q);
    resetExternalState();
    if (!localSearchSettled || !q) {
      ui.hide(container);
      return;
    }

    if (!shouldSupplement(q, visibleLocalCount(), intent)) {
      ui.hide(container);
      return;
    }

    activeQuery = q;
    activeIntent = intent;
    ui.render(container, { loading:true, intent });
    const result = await client.search({
      endpoint,
      query:q,
      language:intent?.searchLanguage || language(),
      country:'DE',
      count:PAGE_SIZE,
      offset:0
    });
    if (current !== sequence) return;

    if (query() !== q || !shouldSupplement(q, visibleLocalCount(), intent)) {
      resetExternalState();
      ui.hide(container);
      return;
    }

    if (!result.ok) {
      ui.render(container, { error:true, intent });
      return;
    }

    accumulatedResults = mergeUnique([], result.results);
    moreResultsAvailable = result.moreResultsAvailable === true;
    nextOffset = 1;
    renderAccumulated();
  }

  function schedule(delay = 150) {
    clearTimeout(timer);
    timer = setTimeout(evaluate, delay);
  }

  const observer = new MutationObserver(() => {
    if (!localSearchSettled) return;
    const nextSignature = localSignature();
    if (nextSignature === lastLocalSignature) return;
    lastLocalSignature = nextSignature;
    sequence += 1;
    resetExternalState();
    ui.hide(container);
    schedule();
  });
  observer.observe(cards, { childList:true, subtree:true, attributes:true, attributeFilter:['hidden','class'] });

  window.addEventListener('fundblick:search-rendered', markSettled);

  if (summary) {
    const summaryObserver = new MutationObserver(() => {
      const value = String(summary.textContent || '').trim();
      if (value && !/werden geladen|loading/i.test(value)) {
        summaryObserver.disconnect();
        markSettled();
      }
    });
    summaryObserver.observe(summary, { childList:true, subtree:true, characterData:true });
  }

  window.addEventListener('pageshow', () => {
    sequence += 1;
    localSearchSettled = false;
    lastLocalSignature = '';
    resetExternalState();
    ui.hide(container);
    setTimeout(() => {
      const value = String(summary?.textContent || '').trim();
      if (value && !/werden geladen|loading/i.test(value)) markSettled();
    }, 0);
  }, { once:true });
})();
