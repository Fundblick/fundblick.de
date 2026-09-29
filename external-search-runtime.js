'use strict';

(function () {
  const policy = window.FundBlickExternalSearchPolicy;
  const client = window.FundBlickExternalSearchClient;
  const ui = window.FundBlickExternalSearchUI;
  const intentEngine = window.FundBlickUniversalSearchIntent;
  const priceConfidence = window.FundBlickExternalPriceConfidence;
  const intentQuery = window.FundBlickIntentQuery;
  if (!policy || !client || !ui) return;

  const container = document.getElementById('external-results');
  const cards = document.getElementById('cards');
  const summary = document.getElementById('summary');
  if (!container || !cards) return;

  const endpoint = String(document.documentElement.dataset.externalSearchEndpoint || '').trim();
  const enabled = document.documentElement.dataset.externalSearchEnabled === 'true';
  const PAGE_SIZE = 20;
  const MAX_OFFSET = 9;
  const MIN_INITIAL_PRICED_PRODUCTS = 10;
  const LOCAL_CARD_SELECTOR = '.product:not([hidden]), .product-card:not([hidden])';
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

  function explicitView() {
    const value = new URLSearchParams(location.search).get('intentView') || 'offers';
    return ['offers','info','video','local'].includes(value) ? value : 'offers';
  }

  function webRequested() {
    return new URLSearchParams(location.search).get('web') === '1';
  }

  function explicitLocalRequested() {
    return explicitView() === 'local' && webRequested();
  }

  function intentFor(q) {
    try {
      const base=intentEngine?.analyze?.(q, language()) || null;
      return base ? Object.freeze({ ...base, explicitView:explicitView() }) : null;
    } catch { return null; }
  }

  function externalQuery() {
    try {
      return intentQuery?.refine?.(
        activeQuery,
        activeIntent?.explicitView || 'offers',
        activeIntent?.searchLanguage || language()
      ) || activeQuery;
    } catch { return activeQuery; }
  }

  function visibleLocalCards() {
    return Array.from(cards.querySelectorAll(LOCAL_CARD_SELECTOR)).filter(card => {
      if (card.hidden) return false;
      const style = window.getComputedStyle ? window.getComputedStyle(card) : null;
      return !style || (style.display !== 'none' && style.visibility !== 'hidden');
    });
  }

  function visibleLocalCount() {
    return visibleLocalCards().length;
  }

  function localSignature() {
    return visibleLocalCards().map((card, index) => `${index}:${String(card.textContent || '').replace(/\s+/g, ' ').trim()}`).join('\u0001');
  }

  function canUseExternalSearch(q, localResults = visibleLocalCount()) {
    if (!enabled || !endpoint || !policy.validQuery(q)) return false;
    if (explicitLocalRequested()) return true;
    if (localResults > 0) return false;
    return webRequested();
  }

  function gateCopy() {
    const lang=String(language()).toLowerCase().split('-')[0];
    const copies={
      de:{title:'Aktuell keine Produkte vorhanden.',body:'Möchtest du stattdessen Ergebnisse aus dem World Wide Web sehen?',button:'Im World Wide Web suchen'},
      en:{title:'No products currently available.',body:'Would you like to see results from the World Wide Web instead?',button:'Search the World Wide Web'},
      ru:{title:'Сейчас товаров нет.',body:'Показать вместо этого результаты из интернета?',button:'Искать в интернете'},
      ro:{title:'Momentan nu sunt produse disponibile.',body:'Vrei să vezi în schimb rezultate de pe internet?',button:'Caută pe internet'},
      tr:{title:'Şu anda ürün bulunmuyor.',body:'Bunun yerine internet sonuçlarını görmek ister misin?',button:'İnternette ara'}
    };
    return copies[lang]||copies.en;
  }

  function renderWebGate() {
    disconnectScrollObserver();
    container.replaceChildren();
    container.hidden=false;
    const t=gateCopy();
    const box=document.createElement('div');
    box.className='external-search-gate';
    const title=document.createElement('h2');
    title.className='external-results-title';
    title.textContent=t.title;
    box.appendChild(title);
    const body=document.createElement('p');
    body.className='external-results-status';
    body.textContent=t.body;
    box.appendChild(body);
    const button=document.createElement('button');
    button.type='button';
    button.className='external-search-gate-button';
    button.textContent=t.button;
    button.addEventListener('click',()=>{
      const params=new URLSearchParams(location.search);
      params.set('web','1');
      history.replaceState(null,'',`${location.pathname}?${params.toString()}`);
      schedule(0);
    });
    box.appendChild(button);
    container.appendChild(box);
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

  function trustedPricedProductCount(items, intent) {
    const prepared = prepareResults(items, intent);
    return prepared.filter(item => {
      const type = String(item?.resultType || '');
      const trusted = intentEngine?.hasTrustedPrice?.(item) === true;
      return type === 'product' && trusted;
    }).length;
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

  async function requestPage(offset) {
    return client.search({
      endpoint,
      query:externalQuery(),
      language:activeIntent?.searchLanguage || language(),
      country:'DE',
      count:PAGE_SIZE,
      offset
    });
  }

  async function loadMore() {
    if (loadingMore || !moreResultsAvailable || nextOffset > MAX_OFFSET || !activeQuery) return;
    loadingMore = true;
    disconnectScrollObserver();
    const current = sequence;
    const offset = nextOffset;
    const result = await requestPage(offset);
    loadingMore = false;
    if (current !== sequence || query() !== activeQuery || (!explicitLocalRequested() && visibleLocalCount() > 0) || !webRequested()) return;
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

  async function prefetchPricedProducts(current) {
    if (activeIntent?.explicitView && activeIntent.explicitView !== 'offers') return true;
    while (
      current === sequence &&
      moreResultsAvailable &&
      nextOffset <= MAX_OFFSET &&
      trustedPricedProductCount(accumulatedResults, activeIntent) < MIN_INITIAL_PRICED_PRODUCTS
    ) {
      const offset = nextOffset;
      const result = await requestPage(offset);
      if (current !== sequence || query() !== activeQuery || (!explicitLocalRequested() && visibleLocalCount() > 0) || !webRequested()) return false;
      if (!result.ok) {
        moreResultsAvailable = false;
        break;
      }
      accumulatedResults = mergeUnique(accumulatedResults, result.results);
      nextOffset = offset + 1;
      moreResultsAvailable = result.moreResultsAvailable === true && nextOffset <= MAX_OFFSET;
    }
    return true;
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

    const localResults=visibleLocalCount();
    const localMode=explicitLocalRequested();
    if (localResults > 0 && !localMode) {
      ui.hide(container);
      return;
    }

    if (!webRequested()) {
      if(localResults===0)renderWebGate();else ui.hide(container);
      return;
    }

    if (!canUseExternalSearch(q, localResults)) {
      ui.hide(container);
      return;
    }

    activeQuery = q;
    activeIntent = intent;
    ui.render(container, { loading:true, intent });
    const result = await requestPage(0);
    if (current !== sequence) return;

    if (query() !== q || (!explicitLocalRequested() && visibleLocalCount() > 0) || !webRequested()) {
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

    const stillCurrent = await prefetchPricedProducts(current);
    if (!stillCurrent || current !== sequence) return;
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
  observer.observe(cards, { childList:true, subtree:true, attributes:true, attributeFilter:['hidden','class','style'] });

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
