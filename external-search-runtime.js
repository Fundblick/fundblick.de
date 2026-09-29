'use strict';

(function () {
  const policy = window.FundBlickExternalSearchPolicy;
  const client = window.FundBlickExternalSearchClient;
  const ui = window.FundBlickExternalSearchUI;
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

  function query() {
    return policy.normalizeQuery(new URLSearchParams(location.search).get('q'));
  }

  function visibleLocalCount() {
    return cards.querySelectorAll('.product-card:not([hidden])').length;
  }

  function markSettled() {
    localSearchSettled = true;
    schedule(0);
  }

  async function evaluate() {
    const current = ++sequence;
    const q = query();
    if (!localSearchSettled || !q) {
      ui.hide(container);
      return;
    }

    const localResults = visibleLocalCount();
    const useExternal = policy.shouldUseExternalSearch({
      query: q,
      localResults,
      externalEnabled: enabled && Boolean(endpoint)
    });

    if (!useExternal) {
      ui.hide(container);
      return;
    }

    ui.render(container, { loading: true });
    const result = await client.search({
      endpoint,
      query: q,
      language: document.documentElement.lang || 'de',
      country: 'DE'
    });
    if (current !== sequence) return;
    ui.render(container, result.ok ? { results: result.results } : { error: true });
  }

  function schedule(delay = 150) {
    clearTimeout(timer);
    timer = setTimeout(evaluate, delay);
  }

  const observer = new MutationObserver(() => {
    if (localSearchSettled) schedule();
  });
  observer.observe(cards, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class'] });

  window.addEventListener('fundblick:search-rendered', markSettled);

  // Compatibility fallback for the existing search implementation if it does not
  // emit the explicit event yet: wait until its loading summary changes.
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

  // Never evaluate immediately on pageshow: doing so could spend a Brave request
  // before the local catalogue has finished rendering.
  window.addEventListener('pageshow', () => {
    localSearchSettled = false;
    ui.hide(container);
  }, { once: true });
})();
