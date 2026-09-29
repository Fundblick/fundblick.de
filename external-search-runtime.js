'use strict';

(function () {
  const policy = window.FundBlickExternalSearchPolicy;
  const client = window.FundBlickExternalSearchClient;
  const ui = window.FundBlickExternalSearchUI;
  if (!policy || !client || !ui) return;

  const container = document.getElementById('external-results');
  const cards = document.getElementById('cards');
  if (!container || !cards) return;

  const endpoint = String(document.documentElement.dataset.externalSearchEndpoint || '').trim();
  const enabled = document.documentElement.dataset.externalSearchEnabled === 'true';
  let sequence = 0;

  function query() {
    return policy.normalizeQuery(new URLSearchParams(location.search).get('q'));
  }

  function visibleLocalCount() {
    return cards.querySelectorAll('.product-card:not([hidden])').length;
  }

  async function evaluate() {
    const current = ++sequence;
    const q = query();
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

  const observer = new MutationObserver(() => {
    clearTimeout(observer.timer);
    observer.timer = setTimeout(evaluate, 100);
  });

  observer.observe(cards, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class'] });
  window.addEventListener('fundblick:search-rendered', evaluate);
  window.addEventListener('pageshow', evaluate, { once: true });
})();
