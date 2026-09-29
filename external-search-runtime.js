'use strict';

(function () {
  const policy = window.FundBlickExternalSearchPolicy;
  const client = window.FundBlickExternalSearchClient;
  const ui = window.FundBlickExternalSearchUI;
  const intentEngine = window.FundBlickUniversalSearchIntent;
  if (!policy || !client || !ui) return;

  const container = document.getElementById('external-results');
  const cards = document.getElementById('cards');
  const summary = document.getElementById('summary');
  if (!container || !cards) return;

  const endpoint = String(document.documentElement.dataset.externalSearchEndpoint || '').trim();
  const enabled = document.documentElement.dataset.externalSearchEnabled === 'true';
  let sequence = 0;
  let localSearchSettled = false;
  let timer = null;
  let lastLocalSignature = '';

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
    return policy.shouldUseExternalSearch({
      query: q,
      localResults,
      externalEnabled: true
    });
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
    if (!localSearchSettled || !q) {
      ui.hide(container);
      return;
    }

    if (!shouldSupplement(q, visibleLocalCount(), intent)) {
      ui.hide(container);
      return;
    }

    ui.render(container, { loading: true, intent });
    const result = await client.search({
      endpoint,
      query: q,
      language: intent?.searchLanguage || language(),
      country: 'DE'
    });
    if (current !== sequence) return;

    if (query() !== q || !shouldSupplement(q, visibleLocalCount(), intent)) {
      ui.hide(container);
      return;
    }

    if (!result.ok) {
      ui.render(container, { error: true, intent });
      return;
    }

    let results = result.results;
    try { results = intentEngine?.rankResults?.(results, intent) || results; }
    catch {}
    ui.render(container, { results, intent });
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
    ui.hide(container);
    schedule();
  });
  observer.observe(cards, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class'] });

  window.addEventListener('fundblick:search-rendered', markSettled);

  if (summary) {
    const summaryObserver = new MutationObserver(() => {
      const value = String(summary.textContent || '').trim();
      if (value && !/werden geladen|loading/i.test(value)) {
        summaryObserver.disconnect();
        markSettled();
      }
    });
    summaryObserver.observe(summary, { childList: true, subtree: true, characterData: true });
  }

  window.addEventListener('pageshow', () => {
    sequence += 1;
    localSearchSettled = false;
    lastLocalSignature = '';
    ui.hide(container);
    setTimeout(() => {
      const value = String(summary?.textContent || '').trim();
      if (value && !/werden geladen|loading/i.test(value)) markSettled();
    }, 0);
  }, { once: true });
})();
