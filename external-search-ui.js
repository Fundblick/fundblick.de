'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.FundBlickExternalSearchUI = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  function safeHttpUrl(value) {
    try {
      const url = new URL(String(value || ''));
      return /^https?:$/.test(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  }

  function render(container, state = {}) {
    if (!container) return;
    container.replaceChildren();
    container.hidden = false;

    const heading = document.createElement('h2');
    heading.className = 'external-results-title';
    heading.textContent = 'Weitere Ergebnisse aus dem Web';
    container.appendChild(heading);

    if (state.loading) {
      const status = document.createElement('p');
      status.className = 'external-results-status';
      status.setAttribute('role', 'status');
      status.textContent = 'Weitere Ergebnisse werden gesucht …';
      container.appendChild(status);
      return;
    }

    const results = Array.isArray(state.results) ? state.results : [];
    if (state.error || !results.length) {
      const status = document.createElement('p');
      status.className = 'external-results-status';
      status.setAttribute('role', 'status');
      status.textContent = state.error ? 'Die Websuche ist momentan nicht verfügbar.' : 'Keine weiteren Web-Ergebnisse gefunden.';
      container.appendChild(status);
      return;
    }

    const list = document.createElement('div');
    list.className = 'external-results-list';
    for (const item of results) {
      const href = safeHttpUrl(item?.url);
      if (!href) continue;
      const article = document.createElement('article');
      article.className = 'external-result-card';
      const title = document.createElement('h3');
      const link = document.createElement('a');
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = String(item.title || href);
      title.appendChild(link);
      article.appendChild(title);
      if (item.description) {
        const description = document.createElement('p');
        description.textContent = String(item.description);
        article.appendChild(description);
      }
      const source = document.createElement('small');
      source.textContent = 'Web-Ergebnis';
      article.appendChild(source);
      list.appendChild(article);
    }
    container.appendChild(list);
  }

  function hide(container) {
    if (!container) return;
    container.replaceChildren();
    container.hidden = true;
  }

  return Object.freeze({ render, hide, safeHttpUrl });
});
